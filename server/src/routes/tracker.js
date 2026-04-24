import express, { application } from "express"
import Authorization from "../middleware/authmiddelware.js"
import db from "../database.js"


const router = express.Router()
const VALID_STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']

router.get("/" , Authorization , async (req , res) =>{

    try{
        const {rows} = await db.query("SELECT * FROM applications WHERE user_id = $1" , [req.user.id])
        res.status(200).json({application: rows})
         
        if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
     } catch(err){
        return res.status(500).json({ error: 'Internal server error' })
     }
    

})

router.patch('/:id' , Authorization , async (req , res) =>{
     const {id }= req.params
     const {status} = req.body


     if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    })
  }

     try{
        const {rows}  = await  db.query("UPDATE applications SET status =$1 WHERE id =$2 AND user_id =$3 RETURNING *" , [status , id , req.user.id])
   
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
        res.json({application: rows[0]})
     }catch(err){
        return res.status(500).json({ error: 'Internal server error' })
     }

})



router.delete('/:id' , Authorization , async (req , res) =>{

const {id} = req.params

try{

    const {rows} = await db.query ("DELETE FROM application where id =$1 and user_id =$2 RETURNING *" , [id , req.user.id])
    
     if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.json({message: "Application deleted successfully" , application: rows[0]})
}catch(err){
     return res.status(500).json({ error: 'Internal server error' })
}
})


export default router