
import express from 'express'
import db from '../database.js'
import Authorization from '../middleware/authmiddelware.js'

const router  = express.Router()
const callGemini = async (contents) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_CHATBOT_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.3 },
      }),
    }
  )
  const data = await res.json()
  if (data.error) {
    console.log(data.error)
    console.log(data.error.message)
    const status = data.error.code
    if (status === 429) {
      throw new Error('AI is busy right now. Please wait a moment and try again.')
    }
    throw new Error(data.error.message)
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}


router.post('/', Authorization, async (req, res) => {
  const { message, history = [], jobDesc, analysisResult } = req.body

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  try {
   
    const { rows } = await db.query(
      'SELECT resume_text FROM users WHERE id = $1',
      [req.user.id]
    )

    const resumeText = rows[0]?.resume_text
    if (!resumeText) {
      return res.status(400).json({
        error: 'Please upload your resume first before using chat.'
      })
    }
const shortResume = resumeText.slice(0, 1000)

    const systemPrompt = `You are a career coach inside JobFit. You have already analyzed this candidate's resume against a job description.

Here is everything you know:

=== CANDIDATE RESUME ===
${shortResume}

=== JOB DESCRIPTION ===
${jobDesc || 'Not provided'}

=== ANALYSIS RESULT ===
Match Score: ${analysisResult?.match_score ?? 'N/A'}/100
Strengths: ${JSON.stringify(analysisResult?.strengths ?? [])}
Missing Skills: ${JSON.stringify(analysisResult?.missing_skills ?? [])}
Suggestions: ${analysisResult?.suggestions ?? 'None'}

=== YOUR RULES ===
1. Answer questions about this specific resume and job only
2. Also answer general career questions — salary, learning paths, interview tips
3. Be direct and specific. No vague advice.
4. Keep answers under 4 lines.
5. If asked to rewrite something, do it immediately.
6. Talk like a friendly senior developer, not a corporate bot.
7. Use numbers and specifics where possible.`

    
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'Got it. I have read the resume and analysis. Ask me anything.' }]
      },
     
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
    
      {
        role: 'user',
        parts: [{ text: message.trim() }]
      }
    ]

     const reply = await callGemini(contents)
     return res.json({ reply })

   

  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'AI chat failed. Please try again.' })
  }
})

export default router