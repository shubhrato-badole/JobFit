import { React, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../Components/Api"




const scoreColor = (s) =>
  s >= 75 ? 'text-green-600' :
    s >= 50 ? 'text-amber-600' :
      'text-red-500'

const Analysze = () => {

  const navigate = useNavigate();
  const location = useLocation();


  const jobData = location.state || {}
  const [form, setForm] = useState({
    company: jobData.company || '',
    role: jobData.role || '',
    jobDesc: jobData.jobDesc || ''

  })

  const [error, setError] = useState('');
  const [status, setStatus] = useState('ideal');
  const [Result, setResult] = useState({
  matchScore: 0,
  missingSkill: [],
  strengths: [],
  suggestion: []
});
  const [saved, setSaved] = useState(false);

  const handleChnage = (e) => {
    setForm(prev => 
      ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.company.trim()) return setError('Company name is required')
    if (!form.role.trim()) return setError('Job title is required')
    if (form.jobDesc.trim().length < 50)
      return setError('Job description is too short — paste the full JD')

    setStatus('uploading')
    setError('')
    setResult(null)
    setSaved(false)


    try {
      const { data } = await API.post("/api/ai/analyze", form)
      setResult( {matchScore: data.matchScore,
  missingSkill: data.missingSkills || [],
  strengths: data.strengths       || [],
  suggestion: data.suggestions    ||[]
})
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
      setStatus('error')
    }
  }

  const hnadleReAnalyzing = () => {
    setError('')
    setForm({ company: '', role: '', jobDesc: '' })
    setResult(null)
    setSaved('false')
    setStatus('ideal')

  }
   const handleSave = () =>{
    setSaved(true)
   }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 ">  {/* main div for screen */}

      <div className="bg-white ">
        {/* div for card */}
        <div className="mb-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-1 ">Analyze a job</h2>
          <p className="text-sm text-gray-500">Paste any job description and get your AI match score instantly.</p>
        </div>

        {status !== 'done' &&

          <div className="bg-white border border-gray-200 rounded-2xl p-6" >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div >
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
                <input type="text"
                  name="company"
                  placeholder="compnay"
                  onChange={handleChnage}
                  value={form.company}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <input type="text"
                  name="role"
                  placeholder="Frontend Developer"
                  onChange={handleChnage}
                  value={form.role}
                  className=" w-full placeholder-gray-400 
         text-xs border border-gray-200 text-gray-900 
          px-5 py-3 rounded-xl font-medium outline-none focus:border-blue-400 transition-colors"/>
              </div>

            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job description</label>
              <textarea
                name="jobDesc"
                placeholder="Paste the full job description here..."
                onChange={handleChnage}
                value={form.jobDesc}
                rows={8}
                className="border border-gray-200 w-full rounded-xl px-4 py-2" />

              <p className="text-xs text-gray-400 mt-1">
              {form.jobDesc.length} characters
              {form.jobDesc.length > 0 && form.jobDesc.length < 50 && (
                <span className="text-amber-500"> — paste more of the JD for accurate results</span>
              )}
            </p>

            </div>
            {error &&
              <div className=""> {error}</div>}

            <button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="bg-gray-900 w-full text-white text-sm font-medium px-5 py-2 rounded-xl my-4
             hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" >
              {status === 'uploading' ? (

                <div className="flex gap-5">
                  <>
                    <svg className="animate-spin  w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                    </svg>
                    Analyzing — usually takes 3-4 seconds...
                  </>
                </div>) : 'Analyze match'}
            </button>


          </div>
        }


        {status === 'done' && (
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4 flex items-center gap-5">
              <div >
                <p className="text-xs text-gray-600 mb-2">Match score </p>
                <span className={`text-5xl font-semibold tabular-nums ${scoreColor(Result?.matchScore)}`}>{75}</span>
                <span className="text-xl text-gray-500 ml-1">/100</span>

              </div>


              <div className="flex-1">
                <p className=" text-sm font-medium text-gray-900 mb-2 "> {form.role} at {form.company}  </p>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">

                  <div
                    className={`h-full rounded-full transition-all duration-700 ${Result?.matchScore >= 75 ? 'bg-green-500' :
                        Result?.matchScore >= 50 ? 'bg-amber-400' :
                          'bg-red-400'
                      }`}
                    style={{ width: `${Result?.matchScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {Result?.matchScore >= 75 ? 'Strong match — apply with confidence' :
                    Result?.matchScore >= 50 ? 'Decent match — close some skill gaps first' :
                      'Weak match — significant skills missing'}
                </p>
              </div>
            </div>




            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 ">
                <p className=" text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">MISSING SKILLS</p>
                {Result?.missingSkill?.length === 0 ? <p className="text-xs text-gray-400">No critical gaps found</p>
                  :
                  <div className="flex flex-wrap gap-1.5">
                    {Result?.missingSkill?.map(s => (
                      <div key={s} className="text-xs text-red-600 border border-red-100 font-medium bg-red-100 px-2.5 py-1 rounded-xl ">{s}
                      </div>
                    ))} </div>}
              </div>


              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className=" text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">YOUR STRENGTHS</p>
                {Result?.strengths?.length === 0 ? 'No matches found' :
                  <div className="flex flex-wrap gap-1.5">
                    {Result?.strengths?.map(s => (
                      <div className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-xl fotn-medium border border-green-100" key={s}>{s}</div>
                    ))}
                  </div>
                }

              </div>
            </div>



            <div className="bg-white border border-gray-200 p-5 rounded-xl mb-5">
              <p className="mb-4 text-sm text-gray-400 font-medium uppercase tracking-wide">HOW TO IMPROVE</p>
              {Result?.suggestion?.map((s, i) => (
                <div className="flex gap-2 text-sm text-gray-600 leading-relaxed" key={i}><span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 shrink-0 mt-0.5">{i + 1}</span>{s}</div>
              ))}
            </div>

            {error &&
              <div> {error}</div>}

            {saved ?
              <div className="text-center bg-gray-200 px-5 py-3 rounded-xl">
                <div className="inline-flex items-center justify- gap-2 px-5 py-3 bg-green-50 border border-green-200 rounded-sm text-xl text-green-700 font-medium mb-3 ">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l4 4 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved to tracker as Applied
                </div>

                <div className="flex gap-3">
                  <button className="bg-gray-900 flex-1 px-5 py-3 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors "
                    onClick={() => navigate('/tracker')}>View tracker</button>
                  <button onClick={hnadleReAnalyzing}
                  className="flex-1 bg-gray-900 px-5 py-3 text-white 
                  font-medium rounded-xl hover:bg-gray-700 transition-colors"
                  >Analyze another</button>
                </div>
              </div>
              :
              <div className="flex gap-3">
                <button   onClick={handleSave}
                className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold 
  hover:bg-gray-700 transition-colors "> Save to tracker</button>
                <button onClick={hnadleReAnalyzing}
                 className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold 
   hover:bg-gray-700 transition-colors">Analyze another</button>

              </div>}
          </div>)}




        <p className="text-xs text-gray-600 text-center mt-4">
          Uses your uploaded resume · AI-powered by Gemini
        </p>

      </div>     {/* div for card */}




    </div> /* main div for screen */



  )

}



export default Analysze;



