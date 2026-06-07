import db from '../database.js'
import express from 'express'
import Authorization from '../middleware/authmiddelware.js'

const router = express.Router()

const adminOnly = async (req, res, next) => {
    const userId = req.user.id

    try {
        const result = await db.query(
            "SELECT role FROM users WHERE id = $1",
            [userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" })
        }

        if (result.rows[0].role !== 'admin') {
            return res.status(403).json({
                error: "Access denied. Admin only."
            })
        }

        next()
    } catch (err) {
        console.error("Database error:", err)
        res.status(500).json({ error: "Internal server error" })
    }
}

router.get('/stats', Authorization, adminOnly, async (req, res) => {
    try {
        const userCountResult = await db.query(
            "SELECT COUNT(*) FROM users"
        )

        const analysesResult = await db.query(
            "SELECT COUNT(*) AS total FROM applications"
        )

        const missingSkill = await db.query(`
            SELECT skill, COUNT(*) AS count
            FROM applications,
            jsonb_array_elements_text(missing_skills) AS skill
            WHERE missing_skills IS NOT NULL
            GROUP BY skill
            ORDER BY count DESC
            LIMIT 8
        `)

        const weekResult = await db.query(`
            SELECT COUNT(*) AS total
            FROM users
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `)

        const recentUsers = await db.query(`
            SELECT
                id,
                name,
                email,
                role,
                created_at,
                CASE
                    WHEN resume_text IS NOT NULL THEN true
                    ELSE false
                END AS has_resume
            FROM users
            ORDER BY created_at DESC
            LIMIT 10
        `)

        const resumeResult = await db.query(`
            SELECT COUNT(*) 
            FROM users
            WHERE resume_text IS NOT NULL
        `)

        res.json({
            stats: {
                totalUsers: parseInt(userCountResult.rows[0].count),
                totalAnalyses: parseInt(analysesResult.rows[0].total),
                newUsersThisWeek: parseInt(weekResult.rows[0].total),
                usersWithResume: parseInt(resumeResult.rows[0].count),
            },
            topMissingSkills: missingSkill.rows,
            recentUsers: recentUsers.rows,
        })

    } catch (err) {
        console.error("Database error:", err)
        res.status(500).json({
            error: err.message
        })
    }
})

export default router