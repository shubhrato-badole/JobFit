import jwt from "jsonwebtoken"
import db from "../database.js"



 const Authorization = async (req , res , next) =>{

const {accessToken , refreshtoken} = req.cookies;

     if(!accessToken && !refreshtoken){
   return res.status(401).json({
    error: 'Not authenticated'
   })
     }

      try{
    const decoded = jwt.verify( accessToken ,process.env.JWT_SECRET_ACESSTOKEN)
    req.user = decoded; //email and userID
    next()



      }catch(err){
    
           if(!refreshtoken){
           return res.status(401).json({
            success: false,
            error: 'Not authenticated'
          })   
         }

     try{
        const decoded = jwt.verify(refreshtoken , process.env.JWT_SECRET_REFRESHTOKEN)
        
        const result = await db.query("SELECT * FROM users WHERE id= $1 "  ,[decoded.id])
        const user = result.rows[0]
        
        if(!user || user.refreshtoken  !== refreshtoken){
         return res.status(401).json({
             error: 'Not authenticated'
         })
        }
        
        const newaccessToken = jwt.sign({ id : user.id , email:user.email },
             process.env.JWT_SECRET_ACESSTOKEN,
             {expiresIn: '30m'}
        )                 
    

       res.cookie("accessToken" , newaccessToken ,{
        httpOnly:true,
        secure:false,
         sameSite: "lax",
        maxAge: 30 * 60 * 1000
        })
        req.user = {id: user.id,
        email: user.email,
         }; 
        next();

      } catch(err){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })

      }
   } 
 


} 

 export default Authorization;
