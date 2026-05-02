import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import express from "express"
import db from "../database.js"
import { inputValidation, LoginSchema, RegisterSchema } from "../middleware/inputValidation.js"
import Authorization from "../middleware/authmiddelware.js"
import RateLimit from "../middleware/RateLimit.js"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"

const router = express.Router();

const cookies_options = ({
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
})


const cookies_options_refreshToken = ({
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})


router.post("/register", RateLimit, inputValidation(RegisterSchema), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await db.query("SELECT * FROM users WHERE email= $1", [email.toLowerCase().trim()])

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' })
    }


    const hasedpasswrod = await bcrypt.hash(password, 10)
    const { rows } = await db.query("INSERT INTO users (email , name , password) VALUES  ($1, $2 ,$3)  RETURNING id , name , email , role , created_at"
      , [email.toLowerCase().trim(), name.trim(), hasedpasswrod])
    const user = rows[0]

    const accessToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )

    const refreshtoken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )

    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshtoken, user.id])


    res.cookie("accessToken", accessToken, cookies_options)
    res.cookie("refreshtoken", refreshtoken, cookies_options_refreshToken)

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
        hasResume: user.resume_text ? true : false
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }

})



router.post("/login", RateLimit, inputValidation(LoginSchema), async (req, res) => {
  const { email, password } = req.body;

  const existing = await db.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase().trim()])

  if (existing.rows.length === 0) {
    return res.status(401).json({
      error: "user does not exist"
    })
  }
  try {
    const user = existing.rows[0]

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }


    const accessToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )

    const refreshtoken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )
    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshtoken, user.id])


    res.cookie("accessToken", accessToken, cookies_options)
    res.cookie("refreshtoken", refreshtoken, cookies_options_refreshToken)

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    console.error("REGISTER ERROR:", err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  }

})


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


router.post("/logout", async  (req, res) => {
  const { refreshtoken } = req.cookies;
  if (refreshtoken) {
    // Remove the token from the database
    await db.query("UPDATE users SET refreshtoken = NULL WHERE refreshtoken = $1", [refreshtoken]);
  }
  res.clearCookie("accessToken")
  res.clearCookie("refreshtoken")
  res.json({
    message: 'Logged out successfully'
  })

})





passport.use(new GoogleStrategy({


  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL

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
        (email ,name, password) VALUES( $1, $2 , $3) RETURNING id, name,
         email, role, created_at` , [email.toLowerCase() , name.trim(), 'GOOGLE_OAUTH_NO_PASSWORD'])

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
  (req, res) => {
    const user = req.user

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )

    const refreshtoken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )

    // Set httpOnly cookie
    res.cookie('accessToken', accessToken,
      cookies_options
    )

    res.cookie('refreshtoken', refreshtoken,
      cookies_options_refreshToken
    )
   
    // Redirect to frontend — onboarding if new user, dashboard if returning
    if (user.isNewUser) {
      return res.redirect(`${process.env.CLIENT_URL}/onboarding`)
    }else {
      res.redirect(`${process.env.CLIENT_URL}/dashboard`)
    }

  }
)





export default router;