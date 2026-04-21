  const callAi = async (prompt) => {
    const res = await fetch (   
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,

    {
        method:'post',
        headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
  }
)
const data = await res.json();
 return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export default callAi;