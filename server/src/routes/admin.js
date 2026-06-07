import db from '../db.js';
import express from 'express';
import Authorization from '../middleware/authmiddelware.js'

const router = express.Router();

const adminOnly = async (req, res, next ) => {
    const UserID = req.user.id
try {
    const result = await db.query("SELECT * FROM USERS WHERE ID = $1", [UserID])
    if (!result.rows[0].is_admin) {
        return res.status(403).json({ error: "Access denied. Admin only." });
    }
    next();
} catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
}
}

router.get('/stats', Authorization, adminOnly, async (req, res) => {

try{
    const userCountResult = await db.query("SELECT COUNT(*) FROM users");

      const missingSkill = await db.query(`SELECT skill, COUNT(*) as count FROM applications  jsonb_array_elements_text(missing_skills) AS skill
WHERE missing_skills IS NOT NULL GROUP BY skill
ORDER BY count DESC
LIMIT 8`)
 const weekResult = await db.query(`SELECT COUNT(*) AS total FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`)

const recentApplications = await db.query(`SELECT email, id , name , created_at, role FROM users ORDER BY created_at DESC
LIMIT 10 `)

const resumeResult = await db.query(`SELECT COUNT(*) FROM users WHERE resume_text IS NOT NULL`)

res.json({
  stats: {
    totalUsers: parseInt(userCountResult.rows[0].count),
    newUsersThisWeek: parseInt(weekResult.rows[0].total),
    usersWithResume: parseInt(resumeResult.rows[0].count),
  },
  topMissingSkills: missingSkill.rows,
  recentUsers: recentApplications.rows,
})

}catch(err){
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });

}
})

export default router;
