import express from "express"
import bcrypt from "bcrypt"
import Authorization from "../middleware/authmiddelware.js"
import db from "../database.js"


const router = express.Router();



router.get("/" ,  Authorization  , async (req , res ) => {
      
    try{
    const {rows} = await db.query(`SELECT id, name, email ,
         created_at , resume_text , role , target_roles, resume_uploaded_at 
        FROM users WHERE id=$1`, [req.user.id])
      
       if(!rows[0]){
        return res.status(404).json({ error: 'User not found' })
       }
      const user = rows[0]
   

        const totalJobs = await db.query("SELECT COUNT(*) AS total FROM applications WHERE user_id =$1",[req.user.id])

       
       


    return res.json({
        user: {
         id:user.id,
        name: user.name,
        email: user.email,
        hasResume: !!user.resume_text,
        resumeUploadedAt: user. resume_uploaded_at,
        createdAt: user.created_at,
        targetRoles: user.target_roles,
        total: Number(totalJobs.rows[0].total)
        }
       
        
    })
     
    }catch(err){
        return res.status(500).json(err)
    }
})



router.patch("/change"  , Authorization  , async (req , res ) => {
       const {name , email} = req.body
       if(!name?.trim() || !email?.trim()){
        return res.status(400).json({error: 'Provide name or email to update'})
       }

      try{
        if (email?.trim()) {
        const existing = await db.query("SELECT id FROM users WHERE email=$1 AND id != $2 " , [email?.trim(), req.user.id])
          
          if(existing.rows.length > 0){
            return res.status(409).json({
                error: 'Email already in use by another account'
            })
          }
        }
   
        const {rows} = await db.query(`UPDATE users SET email=COALESCE(NULLIF($1, ''), 
            email),   name=COALESCE(NULLIF($2, ''), name) WHERE id= $3  
            RETURNING id, name, email`, [email?.toLowerCase().trim() || '',name?.trim() || '', req.user.id])
       
   res.json({
      message: 'Profile updated',
      user: rows[0],
    }) 
      }catch(err){
         console.error('Update profile error:', err)
    res.status(500).json({ error: 'Server error' })

      }

})

router.patch("/password" , Authorization , async (req , res) => {
    const {currentPassword , newPassword} = req.body


    if(!currentPassword?.trim() || !newPassword?.trim() ){
     return res.status(400).json({ error: 'Both current and new password are required' })
    }

if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }


    try{
        const {rows}  = await db.query("SELECT password FROM users WHERE id=$1", [req.user.id])
       
    const user = rows[0]

    if (user.password === 'GOOGLE_OAUTH_NO_PASSWORD') {
      return res.status(400).json({
        error: 'Your account uses Google sign-in. Password change is not available.'
      })
    }

    const passwordValid =  await bcrypt.compare(currentPassword , user.password);
       if (!passwordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const hashPassword = await bcrypt.hash( newPassword, 10)

    await db.query("UPDATE users SET password = $1 WHERE id=$2", [hashPassword , req.user.id])

     res.json({ message: 'Password updated successfully' })


    }catch(err){
      console.error('Change password error:', err)
      res.status(500).json({ error: 'Server error' })
    }

})

router.delete("/delete" , Authorization , async (req , res) => {

try{
    await db.query("DELETE FROM users WHERE id=$1" ,[ req.user.id])
    res.clearCookie('accessToken');
    res.clearCookie('refreshtoken');

    res.json({ message: 'Account deleted' })
}catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Server error' })
  }

})

export default router