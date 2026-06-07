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

    

}catch(err){
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });

}

})

export default router;
