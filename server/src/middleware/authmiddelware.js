import jwt from "jsonwebtoken"
import db from "../database.js"


const cookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
   path: '/',
}

const refreshTokenCookieOptions = {
  ...cookiesOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}


 const Authorization = async (req , res , next) =>{

const {accessToken , refreshToken} = req.cookies || {};


     if(!accessToken && !refreshToken){
   return res.status(401).json({
    error: 'Not authenticated'
   })
     }

      try{
    const decoded = jwt.verify( accessToken ,process.env.JWT_SECRET_ACESSTOKEN)
    req.user = decoded; //email and userID
      return next()

      }catch (err) {
    // Access token expired or invalid – try refresh token
  }

      
    
           if(!refreshToken){
           return res.status(401).json({
            success: false,
            error: 'Not authenticated'
          })   
         }

     try{
        const decoded = jwt.verify(refreshToken , process.env.JWT_SECRET_REFRESHTOKEN)
        
        const result = await db.query("SELECT * FROM users WHERE id= $1 "  ,[decoded.id])
        const user = result.rows[0]
        
        if(!user || user.refreshtoken  !== refreshToken){
         await db.query("UPDATE users SET refreshtoken = NULL WHERE id = $1", [decoded.id])
         res.clearCookie("accessToken" , cookiesOptions)
        res.clearCookie("refreshToken" , refreshTokenCookieOptions)
      return res.status(401).json({ error: 'Session invalid. Please log in again.' })
        }
        



        const newaccessToken = jwt.sign({ id : user.id , email:user.email },
             process.env.JWT_SECRET_ACESSTOKEN,
             {expiresIn: '30m'}
        )                 
    


         const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_REFRESHTOKEN,
      { expiresIn: '7d' }
    )

    await db.query("UPDATE users SET refreshtoken = $1 WHERE id = $2", [newRefreshToken, user.id])
     
     res.cookie("accessToken", newaccessToken, cookiesOptions)
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)

        req.user = {id: user.id,
        email: user.email,
         }; 
       return next();

      } catch(err){
        console.error('Refresh token error:', err)
    res.clearCookie("accessToken" , cookiesOptions)
    res.clearCookie("refreshToken" , refreshTokenCookieOptions)
    return res.status(401).json({ error: 'Session expired. Please log in again.' })

      }
   
 


} 

 export default Authorization;
