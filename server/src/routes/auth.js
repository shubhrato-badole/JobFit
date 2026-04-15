import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import express from "express"
import db from "../database.js"
import {inputValidation , LoginSchema , RegisterSchema }from "../middleware/inputValidation.js"
import Authorization from "../middleware/authmiddelware.js"
import RateLimit from "../middleware/RateLimit.js"


const router = express.Router();

const cookies_options = ({
    httpOnly: true,
  secure:   false,
  sameSite: 'strict',
  maxAge:    30 * 60 * 1000,
})


const cookies_options_refreshToken= ({
    httpOnly: true,
  secure:  false,
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
})


 router.post("/register" , RateLimit ,inputValidation(RegisterSchema), async  (req , res) =>{
    const {name , email ,password} = req.body;

     try{ 
    const existing = await db.query("SELECT * FROM users WHERE email= $1" , [email.toLowerCase().trim()])

    if(existing.rows.length > 0){
        return res.status(409).json({error: 'Email already in use'})
    }

   
     const hasedpasswrod = await  bcrypt.hash(password , 10)
     const {rows} = await db.query("INSERT INTO users (email , name , password) VALUES  ($1, $2 ,$3)  RETURNING id , name , email , role , created_at" 
     ,[email.toLowerCase().trim() ,name.trim() , hasedpasswrod])
     const user = rows[0]

     const accessToken = jwt.sign({id: user.id , email: user.email},
        process.env.JWT_SECRET_ACESSTOKEN,
        {expiresIn : '30m'}
     )

     const refreshtoken = jwt.sign({id: user.id , email: user.email},
        process.env.JWT_SECRET_REFRESHTOKEN,
        {expiresIn : '7d'}
     )

     await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshtoken , user.id])


    res.cookie("accessToken" , accessToken , cookies_options)
    res.cookie("refreshtoken" , refreshtoken , cookies_options_refreshToken)

    res.status(201).json({
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.created_at,
      }
    })
    }catch(err){
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error. Please try again.' })
    }
    
})



router.post("/login" , RateLimit , inputValidation(LoginSchema), async (req , res) =>{
 const {email , password} = req.body;

 const existing = await db.query("SELECT * FROM users WHERE email=$1" , [email.toLowerCase().trim()])

if(existing.rows.length === 0){
    return res.status(401).json({
        error: "user does not exist"
    })
}
try {
    const user = existing.rows[0]

const passwordValid = await  bcrypt.compare(password , user.password)
 if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect email or password' })
    }


    const accessToken = jwt.sign({id: user.id , email: user.email},
        process.env.JWT_SECRET_ACESSTOKEN,
        {expiresIn : '30m'}
     )

     const refreshtoken = jwt.sign({id: user.id , email: user.email},
        process.env.JWT_SECRET_REFRESHTOKEN,
        {expiresIn : '7d'}
     )
      await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [refreshtoken , user.id])


     res.cookie("accessToken" , accessToken , cookies_options)

res.status(201).json({
      user: {
        id:        user.id,
        name:      user.name,
        email:     user.email,
        role:      user.role,
        createdAt: user.created_at,
      }
    })
    }catch(err){
    console.error('Register error:', err)
      console.error("REGISTER ERROR:", err) 
    res.status(500).json({ error: 'Server error. Please try again.' })
    }
    
} )


router.get("/me", Authorization , async  (req , res ) => {

try{
   const {rows} =  await db.query("SELECT * FROM users WHERE id=$1" , [req.user.id])
const user = rows[0]


if (!user) {
      res.clearCookie('accessToken')
      res.clearCookie('refreshtoken')
      return res.status(401).json({ error: 'User not found' })
    }
res.json({
      user: {
        id:             user.id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        hasResume:      !!user.resume_text,
        createdAt:      user.created_at,
      }
    })
 
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Server error' })
  }


})


router.post("/logout"  , (req, res) =>{
    res.clearCookie("accessToken")
    res.clearCookie("refreshtoken")
    res.json({
        message: 'Logged out successfully' 
    })

})

export default router ;