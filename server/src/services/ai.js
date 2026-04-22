  const callAi = async (prompt) => {
    try{
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

console.log("AI FULL RESPONSE:", JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No candidates returned from AI");
    }
 const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
 
 if (!text) {
      throw new Error("AI returned empty text");
    }

    return text;
  }catch (err) {
    console.error("AI ERROR:", err.message);
    return "";
  }

}

export default callAi;