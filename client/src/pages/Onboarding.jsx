import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import API from "../Components/Api"
import { useEffect } from "react";
import { useAuth } from "./AuthContext"



const ScoreRing = ({score}) =>{
    const safeScore = typeof score === 'number' ? score : 0;
  const color = score >=75 ? '#16a34a' :  score >= 50 ? '#d97706' : '#dc2626'
  const label = score >=75 ?' Strong resume' : score >=50 ?  'Decent resume' : 'Needs work'
return(
  <div className="flex flex-col items-center">
     <div className="relative w-24 h-24 mb-2">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
     </div>
     <span className="text-sm font-medium" style={{ color }}>{label}</span>
  </div>
)
}



const OnBoarding = () => {
  
const { refetchUser } = useAuth()
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [Dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('ideal');
  const [result, setResult] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);


useEffect(()=>{
  const checkExisting = async ()=>{
    try{
    const {data} = await API.get("/api/resume/status")
    if(data.hasResume && data.score !== null){
      setResult({
            score:       data.score,
            strong:      data.feedback?.strong      || [],
            improve:     data.feedback?.improve     || [],
            targetRoles: data.targetRoles || [],
          })
           setStatus('done')
    }
    }catch(err){

    } finally {
      setInitialLoading(false)
    }

  }
  checkExisting()
},[])




  const handleFile = (selected) => {
    if (!selected) return
    if (selected.type !== 'application/pdf') {
      setError("the file should be pdf")
      return
    }


    if (selected.size > 5 * 1024 * 1024) {
      setError("the file should be below 5mb")
      return
    }
    setFile(selected);
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false)
    handleFile(e.dataTransfer.files[0])

  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a PDF file first')
      return
    }
    setStatus('uploading')
    setError('')

    const formData = new FormData()
    formData.append('resume', file)


    try {
      const analyzeTimer = setTimeout(()=> setStatus('analyzing'), 1500)
      const {data} = await API.post("/api/resume/upload", formData, {
        headers: { "Content-Type": 'multipart/form-data' }
      })
      if (data.hasResume) {
      await refetchUser()   // <-- refresh user context
    }
    
      setStatus('done')
      setResult({
        score: data.score ,
        strong: data.strong || [],
        improve: data.improve || [],
        targetRoles: data.targetRoles || [],
      })
    }
    catch (err) {
      console.error("Upload error:", err)
      setStatus('error')
      setError(err.response?.data?.error || 'Upload failed. Please try again.')

    } finally{
       clearTimeout(analyzeTimer)
    }
  }

  if (initialLoading) {
  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}


  return (


    <div className=" min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-xl font-semibold tracking-tight mb-6">
        Job<span className="text-blue-600">Fit</span>
      </div>

        {status !== 'done' && 
      <div className="flex items-center gap-2 mb-10 ">
        {[
          { n: 1, label: 'Account', state: 'done' },
          { n: 2, label: 'Resume', state: 'active' },
          { n: 3, label: 'Analyze', state: 'pending' },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step.state === 'done' ? 'bg-gray-900 text-white' :
                step.state === 'active' ? 'bg-blue-600 text-white' :
                  'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>

                {step.state === 'done'
                  ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : step.n
                }
              </div>
              <span className="text-xs text-gray-400">{step.label}</span>
            </div>
            {i < 2 && (
              <div className={`w-10 h-px mb-4 ${step.state === 'done' ? 'bg-gray-900' : 'bg-gray-200'}`} />)}
          </div>
        ))}
      </div >
}


{status !== 'done' &&  <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">
    
     

      { status === 'uploading' &&
      ( <div> <h2>Uploading your resume</h2>
           <p className="mb-5">Extracting your skills and experience — this takes a few seconds.</p>
           
<div className="bg-gray-100 rounded-xl p-4  mb-5">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="1" width="10" height="12" rx="2" stroke="#6b7280" strokeWidth="1"/>
                  <path d="M4 5h6M4 7h6M4 9h4" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                {file?.name}
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }} />
              </div>
              <p className="text-xs text-gray-400">Extracting text from PDF...</p>
</div>
<button disabled className=" px-2.5 py-2  cursor-not-allowed rounded-xl bg-gray-800 text-white w-full font-semibold ">  Processing...</button>
       </div> ) }


{status === 'analyzing' &&  (
                <div>
              <div>
               <h1 className="text-xl text-gray-900 font-semibold mb-1 ">Analyzing your resume</h1>
                <p className="text-xs text-gray-500  mb-6 leading-relaxed">AI is reviewing your resume quality and finding the best roles for you...</p>
              </div> 
                <div className="flex flex-col items-center py-4">
            <div className="relative w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-40" />
              <div className="absolute inset-2 rounded-full border-4 border-blue-200 animate-ping opacity-40" style={{ animationDelay: '0.3s' }} />
              <div className="w-full h-full rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                <svg className="animate-spin w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                </svg>
            </div>
           </div>


            <div className="space-y-2 w-full">
              {[
                { label: 'Text extracted successfully', done: true  },
                { label: 'Running AI quality analysis', done: false },
                { label: 'Finding target roles for you', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-green-500' : 'bg-blue-100'
                  }`}>
                    {step.done
                      ? <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      : <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    }
                  </div>
                  <span className={step.done ? 'text-gray-700' : 'text-gray-400'}>{step.label}</span>
                </div>
              ))}
            </div>
           </div>
              </div>
            ) }



{status === 'ideal' &&
        <div >
          <div className="mb-8">
            <h2 className="text-[20px] font-semibold text-gray-900 mb-1 ">Upload your resume</h2>
            <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">We extract your skills and experience once. Every future job analysis uses this — no re-uploading needed.</p>
          </div>

          <div onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4
            ${ Dragging ? 'border-blue-400 bg-blue-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }  `}>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />


            {file ? <div>
              <div className=" w-10 h-10 rounded-lg flex flex-center bg-green-300 items-center justify-center
          mx-auto mb-3"><svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4 4 8-8" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg> </div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </ div> :
              <div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex flex-col justify-center items-center bg-gray-500
 mx-auto mb-3 ">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2v9M5 6l4-4 4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 13h12a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1a1 1 0 011-1z" stroke="#9ca3af" strokeWidth="1.5" />
                  </svg>
                </div>
                 
                <p className="text-xl font-semibold mb-0.5 text-gray-700">Drag and drop your resume here</p>
                <p className="text-sm"> or <span className="text-blue-600"> browse files</span> — PDF only, max 5MB</p>
              </div>}

 </div>
              
              
               <div className="flex gap-4 mb-4">
                {['PDF format only', 'Max 5MB', 'Text must be selectable'].map(data =>
                  <div key={data} className="flex gap-1.5 text-[13px] text-gray-400 ">
                    <span className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                     {data}
                  </div>
                )}
               </div>


            {error && <div className="text-sm bg-red-100 rounded-lg 
            text-center border border-red-200 px-3 py-2.5 mb-4 text-red-600">
                   {error}
            </div> }
          
          
          <button 
           onClick={handleSubmit}
           disabled={!file || status === 'uploading' || status === 'analyzing'}className="text-sm text-white font-semibold bg-gray-900 w-full px-4 py-2 rounded-xl
           hover:bg-gray-700 transition-colors   "> Upload resume→ </button>
          <p className="text-xs text-center mt-4 cursor-pointer hover:text-gray-600"> You can do this later —<span  onClick={() => navigate('/dashboard')}
           className="text-blue-600"> go to dashboard</span></p>
        
        </div>
}

</div> 
}
{/*   card div  */}



{status === 'done' && result && (
       <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
           <div className="flex items-center">
           <ScoreRing score={result?.score }  />

    
      <div className="flex flex-col justify-center ml-8">
                <h2 className="text-base font-semibold text-gray-900 mb-0.5 mx-">
                  {result?.score !== null ? 'Resume analyzed' : 'Resume uploaded'}
                </h2>
                <p className="text-sm text-gray-500">
                  {result?.score !== null
                    ? `You're now ready to analyze jobs based on your resume`
                    : 'Your resume has been saved. You can now analyze jobs.'}
                </p>
              </div>
           </div>
           </div>


          
             {result?.score !== null && (
               <div className="grid grid-cols-2 gap-4 mb-4"> 
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                     <div className="flex items-center gap-2 mb-3">
                       <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>

                    </div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">What is strong</p>
                  </div>
                   {result?.strong.length === 0 ?  <p className="text-xs text-gray-400">No data</p> : ( 
              <ul className="space-y-1.5">
                      {result?.strong.map((s , i)=> 
                      <li key={i} className="text-xs text-gray-600 gap-2 leading-relaxed"> 
                      <span className="text-green-500 shrink-0 mt-0.5">•</span> {s}</li> 
                      )}
             </ul>)}
              </div>
            

               <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5 2v4M5 7.5v.5" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold uppercase tracking-wide">What to improve</p>
                </div>
             {result?.improve.length === 0 ?  <p className="text-xs text-gray-400">No data</p> : 
             (
             <ul> {result?.improve.map((s,i)=>
              <li key={i} className="text-xs text-gray-600 gap-2 leading-relaxed"><span 
              className="text-amber-500 shrink-0 mt-0.5">•</span> {s}</li>
             )}</ul>
               ) } 
               </div>
      </div> )}


                {result?.targetRoles.length > 0 && ( 
                   <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Roles you should target
                  </p>

                   
                      <div className="flex flex-wrap gap-2">
                        {result?.targetRoles.map((s,i)=>
                          <span key={i} className=" text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg
                          px-3 py-1.5  font-medium">{s}</span>
                        )}
                      </div>
                </div> 
                )}

                <div className="flex gap-3">
                  <button  onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-900 py-3 rounded-xl text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
                    Go to dashboard →
                  </button>
                  <button  onClick={() => navigate('/analyze')}
                      className="flex-1 bg-gray-900 py-3 rounded-xl text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
                     Analyze a job
                  </button>
                </div>

                 <p className="text-center text-xs text-gray-400 mt-3">
                    Want to update your resume?{' '}
                    <span onClick={()=>{ setStatus('ideal'); setFile(null); setError(''); setResult(null)}
                    } className="text-blue-600 cursor-pointer hover:underline"> Upload a new one</span>
                 </p>

       </div>
)}

    </div> // main div 
  )






}

export default OnBoarding;