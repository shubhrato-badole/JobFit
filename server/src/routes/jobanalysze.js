import express from "express"
import db from "../database.js"
import Authorization from "../middleware/authmiddelware.js"
import callAi from "../services/ai.js"

const router = express.Router();

router.post("/analyze", Authorization , async (req , res) =>{

const {company , role , jobDesc} =req.body

 if(!company|| !role || !jobDesc ){
     return res.status(400).json({ error: 'Company, role and job description are required' })
 }

 if(jobDesc.trim().length < 50){
 return res.status(400).json({ error: 'Job description is too short' })
 }
  try{
    const userResult = await db.query("SELECT resume_text FROM users WHERE id=$1", [req.user.id]);

     const resumeText = userResult.rows[0]?.resume_text
  

     if(!resumeText || resumeText.trim().length === 0){
        return res.status(400).json({
        error: 'Please upload your resume first before analyzing jobs'
      })
     }

    

 const prompt = `You are a resume analysis expert. Compare this resume against the job description.
 
RESUME:
${resumeText}
 
JOB DESCRIPTION:
${jobDesc}
 
Return ONLY valid JSON with no markdown, no backticks, no explanation:
{
  "matchScore": <number 0-100>,
  "missingSkills": [<array of specific skills from JD that are missing in resume>],
  "strengths": [<array of skills from resume that match the JD>],
  "suggestions": [<array of 3 specific actionable improvements>]
}`

const raw = await  callAi(prompt)
const cleaned = raw.replace(/```json|```/g, '').trim()

let result;

try {
  result = JSON.parse(cleaned);
} catch (err) {
  console.error("AI RAW:", raw);
  return res.status(500).json({ error: "Invalid AI response" });
}
    

    if (
      typeof result.matchScore !== 'number' ||
      !Array.isArray(result.missingSkills) ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.suggestions)
    ) {
      return res.status(500).json({ error: 'AI response was incomplete. Please try again.' })
    }

  

       res.json({
      matchScore:    result.matchScore,
      missingSkills: result.missingSkills,
      strengths:     result.strengths,
      suggestions:   result.suggestions,
    })

}catch(err){
     console.error("ANALYZE ERROR:", err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})



router.post("/tracker" , Authorization , async(req ,res )=>{

 const { company, role, jobDesc, matchScore, missingSkills, strengths, suggestions } = req.body;

if (!company || !role || !jobDesc) {
    return res.status(400).json({ error: "Missing required fields" });
  }
 
try{
const { rows } = await db.query(`INSERT INTO applications  (user_id ,company , role, job_desc, match_score ,missing_skills , strengths , suggestions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 )
       RETURNING id`,[ 
        req.user.id,
        company.trim(),
        role.trim(),
        jobDesc.trim(),
        matchScore,
        JSON.stringify(missingSkills),
        JSON.stringify(strengths),
        suggestions.join('\n'),
      ])

      res.json({
      message: "Saved successfully",
      id: rows[0].id,
    });
    }catch(err){
   console.error("TRACKER ERROR:", err);
    res.status(500).json({ error: "Failed to save job" });
    }
})

export default router

