import db from "../database.js"
import jwt from "jsonwebtoken"
import { hashToken , generateToken  } from "../middleware/token.js"
import { sendVerificationEmail } from "../services/sendemail.js"


const cookies_options = ({
  httpOnly: true,
  secure:  process.env.NODE_ENV === "production",
  sameSite: 'lax',
})


const cookies_options_refreshToken = ({
  httpOnly: true,
  secure:  process.env.NODE_ENV === "production",
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})



const verifyEmail = async (req , res ) => {
    const {token } = req.query
  
    if(!token){
      return res.status(400).json({ error: 'Token missing' })
    }

try{
    const hashedToken = hashToken(token)


    const {rows} = await db.query(`SELECT id , email , name FROM users WHERE verify_token= $1 
        AND verify_token_expiry > NOW() AND  is_verified=false LIMIT 1` , [hashedToken])

         if (rows.length === 0)  {
            return res.status(400).json({
        error: 'expired',
        message: 'Verification link is invalid or has already been used.'
      })
    }

    const user = rows[0]

  

    await db.query(
      `UPDATE users
       SET is_verified=true,
           verify_token=NULL,
           verify_token_expiry=NULL
       WHERE id=$1`,
      [user.id]
    )


    const accessToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_ACESSTOKEN,
      { expiresIn: '30m' }
    )


    const refreshToken = jwt.sign({ id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )

   
    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshToken, user.id]);

     res.cookie("accessToken", accessToken, cookies_options)
     res.cookie("refreshToken", refreshToken, cookies_options_refreshToken)

      res.json({
      message: 'Email verified successfully',
      verified: true,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
      }
    })



}catch(err){
  console.error('Verify email error:', err)
 res.status(500).json({ error: 'Server error. Please try again.' })
}


}




const resendEmail = async (req , res ) => {
    const {email} = req.body 


  
if(!email){
    return res.status(400).json({ error: 'Email is required' }) 
}

try{

 const {rows} = await db.query(`SELECT id, is_verified FROM users WHERE email = $1 `,[email.toLowerCase().trim()])

 

     if (rows.length === 0) {
  return res.status(400).json({ message: 'If that email exists, a new link has been sent.' });
}


const user = rows[0];

if(user.is_verified){
  return res.status(400).json({
    message: 'Email is already verified. Please login.'
  })
}

const verifyToken= generateToken()
const hashedToken = hashToken(verifyToken)
 const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

 await db.query(`UPDATE users SET  verify_token = $1, verify_token_expiry = $2
       WHERE id = $3`,[hashedToken , tokenExpiry, user.id] )

     await sendVerificationEmail(user, verifyToken).catch(err => {
  console.error("Resend email failed:", err);
});

        res.json({ message: 'Verification email sent. Check your inbox.' })
 }catch(err){
     console.error('Resend verification error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
  
 }

}


const verifyEmailForgotPassword = async (req , res ) => {
    const {token } = req.query

    if(!token){
      return res.status(400).json({ error: 'Token missing' })
    }

try{
    const hashedToken = hashToken(token)


    const {rows} = await db.query(`SELECT id , email , name FROM users WHERE verify_token= $1 
        AND verify_token_expiry > NOW() LIMIT 1` , [hashedToken])

         if (rows.length === 0)  {
            return res.status(400).json({
        error: 'expired',
        message: 'Verification link is invalid or has already been used.'
      })
    }

   res.json({ message: 'Token valid' });




}catch(err){
  console.error('Verify email error:', err)
 res.status(500).json({ error: 'Server error. Please try again.' })
}


}





export { verifyEmail, resendEmail , verifyEmailForgotPassword }