import express from "express"
import Authorization from "../middleware/authmiddelware.js"
import Upload from "../middleware/multer.js"
import fs from "fs"
import callAi from "../services/ai.js"
import db from "../database.js"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfparse = require("pdf-parse");

const router = express.Router()

const analyszeResume = async (resumeText) =>{
    const prompt = `You are an expert resume reviewer. Analyze this resume carefully.
 
RESUME:
${resumeText}
 
Return ONLY valid JSON — no markdown, no backticks, no explanation whatsoever:
{
  "score": <number 0-100 overall quality>,
  "strong": [<3-5 strings — what is genuinely good about this resume>],
  "improve": [<3-5 strings — specific actionable fixes>],
  "targetRoles": [<exactly 3 job role titles this person should target>]
}`

const raw = await  callAi(prompt)
const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)    // conerting stiung into object 


if(
    typeof result.score !== 'number' ||
    !Array.isArray(result.strong) ||
    !Array.isArray(result.improve) ||
    !Array.isArray(result.targetRoles)
){throw new Error('Invalid AI response shape')}
   return result ;
}




router.post("/upload" , Authorization , Upload.single('resume'), async (req , res) =>{

    if(!req.file){
        return res.status(400).json({
            error: 'No file uploaded'
        })
    }
 
try{

       const parse = await pdfparse(req.file.buffer)
       const resumeText = parse.text.trim()

     if(!resumeText || resumeText.length < 50){
        return res.status(400).json({
             error: 'Could not extract text from this PDF. Make sure your resume has selectable text and is not a scanned image.'
        })
     }

    if (resumeText.length > 50000) {
  return res.status(400).json({
    error: 'Resume text exceeds maximum allowed length (50,000 characters). Please upload a shorter resume or remove unnecessary content.'
  })
}

     await db.query (`UPDATE users
       SET resume_text = $1, resume_uploaded_at = NOW()
       WHERE id = $2 `,[resumeText , req.user.id]
     )

     
       let aiResult = null
       let aiError = null

    try{
        aiResult = await analyszeResume(resumeText)
        await db.query(`UPDATE users SET resume_score =$1, 
        resume_feedback =$2 , target_roles =$3  WHERE id=$4`,
        [aiResult.score,
        JSON.stringify({ strong: aiResult.strong  , improve:aiResult.improve }),
        JSON.stringify(aiResult.targetRoles),
         req.user.id
        ])

    } catch(aiErr){
    console.error('AI resume analysis failed:', aiErr.message)
     aiError = 'AI analysis temporarily unavailable, we will retry later.'
    }

    res.json({
         message:     'Resume uploaded successfully',
          hasResume:   true,
         score:aiResult?.score ?? null,
          strong: aiResult?.strong ?? [] ,
         improve:aiResult?.improve ?? [],
         targetRoles: aiResult?.targetRoles ?? [],
         aiError: aiError, 
    })


    


} catch(err){
console.error('Resume upload error:', err)
    res.status(500).json({ error: 'Failed to process resume. Please try again.' })
}

} ) 

router.get("/status", Authorization, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT resume_score, resume_feedback, target_roles 
       FROM users WHERE id = $1`,
      [req.user.id]
    )

    const user = result.rows[0]

    res.json({
      hasResume: !!user,
      score: user?.resume_score ?? null,
      feedback: user?.resume_feedback ?? {},
      targetRoles: user?.target_roles ?? []
    })

  } catch (err) {
    console.error("Status error:", err)
    res.status(500).json({ error: "Failed to fetch status" })
  }
})


export default router ;