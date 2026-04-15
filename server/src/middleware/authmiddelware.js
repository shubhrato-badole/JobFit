import jwt from "jsonwebtoken"
import axios from "axios"
import db from "../database"


 export const Authorization = async (res , req, next) =>{

const {acesstoken , refreshtoken} = req.cookies;

     if(!acesstoken){
   return res.status(401).json({
    error: 'Not authenticated'
   })
     }
      try{
    const decoded = jwt.verify( acesstoken ,process.env.JWT_SECRET)
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
        const decoded = jwt.verify(refreshtoken , process.env.JWT_SECRET)
        const user = decoded.user
        
        const result = await db.query("SELECT FROM user WHERE id= $1 ," [user.userID])
        const savedRefreshtoken = result.row[0].refreshtoken
        
        if(refreshtoken !== savedRefreshtoken){
         return res.status(401).json({
             error: 'Not authenticated'
         })
        }
        
        const acesstoken = jwt.sign({ userID : result.id , email:result.eamil },
             process.env.JWT_SECRET,
             {expiresIn: '1h'}
        )                 
    

       res.cookie("acesstoken" , acesstoken ,{
        httpOnly:true,
        secure:true,
         sameSite: "lax",
        })
        req.user = result.row[0]?.id;
        next();

      } catch(err){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })

      }
   } 
 


} 


