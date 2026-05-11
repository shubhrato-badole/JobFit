import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import express from "express"
import db from "../database.js"
import { inputValidation, LoginSchema, RegisterSchema } from "../middleware/inputValidation.js"
import Authorization from "../middleware/authmiddelware.js"
import RateLimit from "../middleware/RateLimit.js"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { hashToken , generateToken  } from "../middleware/token.js"
import {verifyEmail , resendEmail , verifyEmailForgotPassword} from "../controllers/ authController.js"
import {sendEmailResetPassword ,sendVerificationEmail } from "../services/sendemail.js"


const router = express.Router();

const cookies_options = ({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
})


const cookies_options_refreshToken = ({
  httpOnly: true,
  secure: true,
  sameSite:'none',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})


router.post("/register", RateLimit, inputValidation(RegisterSchema), async (req, res) => {
  const { name, email, password } = req.body;

  if(!email || !name || !password){
    return res.status(400).json({
      error: 'All fields required '
    })
  }

  try {
    const existing = await db.query("SELECT * FROM users WHERE email= $1", [email.toLowerCase().trim()])

   


    if (existing?.rows.length > 0) { 
      const user = existing.rows[0];

       if(!user?.is_verified){

         const verifyToken = generateToken();
          const hashedToken = hashToken(verifyToken)
           const tokenExpiry = new Date(Date.now () + 24 * 60 * 60 * 1000)


           try{
     await db.query(
            `
            UPDATE users
            SET 
        
            verify_token = $1,
                verify_token_expiry = $2,
                password = $3
            WHERE id = $4
            `,
            [hashedToken, tokenExpiry, password ,user.id]
          );

          await sendVerificationEmail( user , verifyToken )

  }catch (emailErr) {
            console.error(
              "Verification resend email failed:",
              emailErr
            );

            return res.status(500).json({
              error:
                "Could not send verification email. Please try again.",
            });
          }
  

        return res.status(200).json({
          message:"Account already exists but is not verified. Verification email resent.",
          needsVerification: true,
          email:  existing?.rows[0]?.email,

        })
       }  
      return res.status(409).json({ error: 'Email already in use' })
    }


    const hasedpasswrod = await bcrypt.hash(password, 10)

    const verifyToken = generateToken()
    const hashedToken = hashToken(verifyToken)
    const tokenExpiry = new Date(Date.now () + 24 * 60 * 60 * 1000)


    const { rows } = await db.query(`INSERT INTO users (email , name , password
     , verify_token, verify_token_expiry )
       VALUES  ($1, $2 ,$3 ,$4, $5)  RETURNING id, name, email, role, is_verified, created_at`
      , [email.toLowerCase().trim(), name.trim(), hasedpasswrod, hashedToken, tokenExpiry])
    
          const user = rows[0]

    await sendVerificationEmail( user , verifyToken ).catch(err => {
  console.error("Email failed:", err);
});

  
        res.status(201).json({
      message:    'Account created. Please verify your email.',
      needsVerification: true,
      email:      user.email,
    })

    
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }

})








// forgot password 


router.post("/forgot-password", RateLimit , async (req, res) =>{
  const {email} = req.body

  
  if(!email || !email.trim()){
     return res.status(400).json({ error: 'Email is required' })
  }

  try{
  const {rows} = await db.query(`SELECT * FROM users WHERE email=$1` , [email.toLowerCase().trim()])

  if(rows.length === 0){
return res.json({
        message: 'If that email exists, a reset link has been sent.'
      })
  }

   const user = rows[0]
   

    const verifyToken = generateToken()
    const hashedToken = hashToken(verifyToken)
    const tokenExpiry = new Date(Date.now () + 60 * 60 * 1000)
 

await db.query(
      `UPDATE users
       SET verify_token = $1, verify_token_expiry = $2
       WHERE id = $3`,
      [hashedToken, tokenExpiry, user.id]
    )
 
try {
  await sendEmailResetPassword(user, verifyToken);
} catch (err) {
  console.error("EMAIL ERROR:", err);
}

res.json({ message: 'If that email exists, a reset link has been sent.' })
  }catch(err){
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }

} )


router.post("/verify-password" , verifyEmailForgotPassword)

// reset password 

router.post("/reset-password" , async (req, res ) =>{
  const {newPassword , token } = req.body
  
  

  if(!newPassword || !token ) {
  return res.status(400).json({ error: "Password and token are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  try {
  const hashedToken = hashToken(token)

  const {rows} = await db.query(`SELECT * FROM users WHERE verify_token = $1 
     AND verify_token_expiry > NOW() ` ,[hashedToken])


 if (rows.length === 0) {
      return res.status(400).json({
        error: 'Reset link is invalid or has expired. Please request a new one.'
      })
    }

   const userId = rows[0].id


   const hashedPassword =  await bcrypt.hash(newPassword , 10 )

   await db.query(`UPDATE users SET password=$1 , 
      verify_token        = NULL,
     verify_token_expiry = NULL,
     refreshtoken=NULL
     WHERE id= $2`,[hashedPassword, userId])

     res.clearCookie('accessToken')
     res.clearCookie('refreshToken')

      res.json({ message: 'Password reset successfully. Please log in with your new password.' })

   } catch(err){
     console.error('Reset password error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
   }
})





// email verification 




router.post('/verify-email', verifyEmail)
router.post('/resend-verification' , resendEmail)














//login 


router.post("/login", RateLimit, inputValidation(LoginSchema), async (req, res) => {
 
   try {
  const { email, password } = req.body;

  const existing = await db.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase().trim()])

  if (existing.rows.length === 0) {
    return res.status(401).json({
      error: "user does not exist"
    })
  }

    const user = existing.rows[0]

    if (!user.is_verified) {
    return res.status(403).json({
      error:             'Please verify your email before logging in.',
      needsVerification: true,
      email:             user.email,
    })
  }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }


    const accessToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )

    const refreshToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )
    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshToken, user.id])


    res.cookie("accessToken", accessToken, cookies_options)
    res.cookie("refreshToken", refreshToken, cookies_options_refreshToken)

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        hasResume: !!user.resume_text
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    console.error("REGISTER ERROR:", err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }

})





// for protected route 





router.get("/me", Authorization, async (req, res) => {

  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id=$1", [req.user.id])
    const user = rows[0]


    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResume: !!user.resume_text,
        createdAt: user.created_at,
      }
    })

  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Server error' })
  }


})


//  logout 


router.post("/logout", async  (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    // Remove the token from the database
    await db.query("UPDATE users SET refreshtoken = NULL WHERE refreshtoken = $1", [refreshToken]);
  }
  res.clearCookie("accessToken")
  res.clearCookie("refreshToken")
  res.json({
    message: 'Logged out successfully'
  })

})



   // google login aouth 
console.log("Google strategy loaded")
console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID)
console.log("CALLBACK:", process.env.GOOGLE_CALLBACK_URL)

passport.use(new GoogleStrategy({


  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:process.env.GOOGLE_CALLBACK_URL,
  

},

  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const name = profile.displayName



      const existing = await db.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()])

      if (existing.rows.length > 0) {
         const user = existing.rows[0];
        return done(null, {
          ...user ,
         isNewUser: false
        });
      }

      const { rows } = await db.query(`INSERT INTO users 
        (email ,name, password, is_verified) VALUES( $1, $2 , $3 ,$4) RETURNING id, name,
         email, role, created_at` , [email.toLowerCase() , name.trim(), 'GOOGLE_OAUTH_NO_PASSWORD', true])

      return done(null, {
        ...rows[0],
        isNewUser: true
      })

    } catch (err) {
      return done(err, null)
    }
  }
))


router.get("/google",
  passport.authenticate
    ("google", {
      scope: ['profile', 'email'],
      session: false
    })
)



router.get("/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`
  }),
  async (req, res) => {
    const user = req.user

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )

    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshToken, user.id])
    // Set httpOnly cookie
    res.cookie('accessToken', accessToken,
      cookies_options
    )

    res.cookie('refreshToken', refreshToken,
      cookies_options_refreshToken
    )

    
   console.log(refreshToken)
   console.log(accessToken)

    if (user.isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/onboarding`)
      
    }else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    }

  }
)



     



export default router;






    