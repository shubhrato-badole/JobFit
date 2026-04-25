import express from "express"
import Authorization from "../middleware/authmiddelware.js"
import db from "../database.js"


const router = express.Router();




router.get("/user", Authorization, async (req, res) => {

    const userId = req.user.id


    try{
    const statusResult = await db.query(`SELECT status, COUNT(*) 
        as count FROM applications WHERE user_id= $1 GROUP BY status`,
        [userId])


    const statusCounts = {}

    statusResult.rows.forEach(r => {
        statusCounts[r.status] = parseInt(r.count)
    })

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
      console.log(total)

    const interview = statusCounts['INTERVIEW'] || 0
    const applied = statusCounts['APPLIED'] || 0
    const offer = statusCounts['OFFER'] || 0
    const rejected = statusCounts['REJECTED'] || 0


    const averageSccore = await db.query(` SELECT ROUND(AVG(match_score))
         as avg_score FROM applications WHERE user_id = $1
          AND match_score IS NOT NULL `, [userId])
    

    const avgScore = parseInt(averageSccore.rows[0]?.avg_score) || 3


    const missingSkill = await db.query(`SELECT skill, COUNT(*) as
     count FROM applications , jsonb_array_elements_text(missing_skills) AS skill
      WHERE user_id= $1  AND missing_skills IS NOT NULL GROUP BY skill 
     ORDER BY count DESC LIMIT 5 ` , [userId])

         

    const topMissingKills = missingSkill.rows.map(r => ({
        skill: r.skill,
        count: parseInt(r.count)
    }));
    console.log(topMissingKills)

    const recentJob = await db.query(`SELECT  id , company , role
     , match_score ,status , created_at  FROM applications
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5
      ` , [userId])



    res.json({
        stats: {
            total,
            interview,
            applied,
            offer,
            rejected,
            avgScore

        },
        missingSkill: topMissingKills,
        recentJobs: recentJob.rows
    
    })
} catch(err){
   console.error(err)
    return res.status(500).json({ error: 'Internal server error ' })

}

})

export default router

