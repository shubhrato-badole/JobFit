import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../components/Api"
import AiChat from "./AiChatBot";

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
    role:    jobData.title   || '',
    jobDesc: jobData.jobDesc || ''
  })

  const [error,     setError]     = useState('');
  const [status,    setStatus]    = useState('ideal');
  const [Result,    setResult]    = useState(null);
  const [saved,     setSaved]     = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.company.trim())          return setError('Company name is required')
    if (!form.role.trim())             return setError('Job title is required')
    if (form.jobDesc.trim().length < 50)
      return setError('Job description is too short — paste the full JD')

    setStatus('uploading')
    setError('')
    setResult(null)
    setSaved(false)
    setActiveTab('analysis')

    try {
      const { data } = await API.post("/api/ai/analyze", form)
      setResult({
        matchScore:   data.matchScore,
        missingSkill: data.missingSkills || [],
        strengths:    data.strengths     || [],
        suggestion:   data.suggestions   || []
      })
      setStatus('done')
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
      setStatus('error')
    }
  }

  const handleReAnalyzing = () => {
    setError('')
    setForm({ company: '', role: '', jobDesc: '' })
    setResult(null)
    setSaved(false)
    setStatus('ideal')
    setActiveTab('analysis')
  }

  const handleSave = async () => {
    setSaved(true)
    try {
      await API.post("/api/ai/tracker", {
        ...form,
        matchScore:   Result.matchScore,
        missingSkills: Result.missingSkill,
        strengths:    Result.strengths,
        suggestions:  Result.suggestion
      })
    } catch (err) {
      console.log(err)
      setError("Failed to save job")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-white">

        {/* Header */}
        <div className="mb-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Analyze a job</h2>
          <p className="text-sm text-gray-500">Paste any job description and get your AI match score instantly.</p>
        </div>

        {/* ── INPUT FORM ───────────────────────────────────── */}
        {status !== 'done' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  onChange={handleChange}
                  value={form.company}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <input
                  type="text"
                  name="role"
                  placeholder="Frontend Developer"
                  onChange={handleChange}
                  value={form.role}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Job description</label>
              <textarea
                name="jobDesc"
                placeholder="Paste the full job description here..."
                onChange={handleChange}
                value={form.jobDesc}
                rows={8}
                className="border border-gray-200 w-full rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.jobDesc.length} characters
                {form.jobDesc.length > 0 && form.jobDesc.length < 50 && (
                  <span className="text-amber-500"> — paste more of the JD for accurate results</span>
                )}
              </p>
            </div>

            {error && (
              <div className="text-red-500 text-center text-xs bg-red-50 border border-red-100 rounded-lg px-2 py-1 mt-2">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === 'uploading'}
              className="bg-gray-900 w-full text-white text-sm font-medium px-5 py-2 rounded-xl my-4 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'uploading' ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
                  </svg>
                  Analyzing — usually takes 3-4 seconds...
                </>
              ) : 'Analyze match'}
            </button>
          </div>
        )}

        {/* ── RESULTS ──────────────────────────────────────── */}
        {status === 'done' && Result && (
          <div>

            {/* Score card — always visible above tabs */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-5 flex items-center gap-5">
              <div>
                <p className="text-xs text-gray-600 mb-2">Match score</p>
                <span className={`text-5xl font-semibold tabular-nums ${scoreColor(Result?.matchScore)}`}>
                  {Result?.matchScore}
                </span>
                <span className="text-xl text-gray-500 ml-1">/100</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {form.role} at {form.company}
                </p>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      Result?.matchScore >= 75 ? 'bg-green-500' :
                      Result?.matchScore >= 50 ? 'bg-amber-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${Result?.matchScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {Result?.matchScore >= 75 ? 'Strong match — apply with confidence' :
                   Result?.matchScore >= 50 ? 'Decent match — close some skill gaps first' :
                   'Focus on improving these key skills before applying'}
                </p>
              </div>
            </div>

            {/* Underline tabs */}
            <div className="flex border-b border-gray-200 mb-5">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'analysis'
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Analysis
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'chat'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                💬 Chat with AI
              </button>
            </div>

            {/* ── ANALYSIS TAB ─────────────────────────────── */}
            {activeTab === 'analysis' && (
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Missing skills */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                      Missing skills
                    </p>
                    {Result?.missingSkill?.length === 0
                      ? <p className="text-xs text-gray-400">No critical gaps found</p>
                      : <div className="flex flex-wrap gap-1.5">
                          {(Result?.missingSkill || []).map(s => (
                            <span key={s} className="text-xs text-red-600 border border-red-100 font-medium bg-red-50 px-2.5 py-1 rounded-xl">
                              {s}
                            </span>
                          ))}
                        </div>
                    }
                  </div>

                  {/* Strengths */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                      Your strengths
                    </p>
                    {Result?.strengths?.length === 0
                      ? <p className="text-xs text-gray-400">No matches found</p>
                      : <div className="flex flex-wrap gap-1.5">
                          {Result?.strengths?.map(s => (
                            <span key={s} className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-xl font-medium border border-green-100">
                              {s}
                            </span>
                          ))}
                        </div>
                    }
                  </div>
                </div>

                {/* How to improve */}
                <div className="bg-white border border-gray-200 p-5 rounded-xl mb-5">
                  <p className="mb-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    How to improve
                  </p>
                  <div className="space-y-3">
                    {Result?.suggestion?.map((s, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                        <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                {error && (
                  <div className="text-red-500 text-center text-xs bg-red-50 border border-red-100 rounded-lg px-2 py-1 mb-3">
                    {error}
                  </div>
                )}

                {saved ? (
                  <div className="text-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium mb-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l4 4 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Saved to tracker as Applied
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/tracker')}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        View tracker
                      </button>
                      <button
                        onClick={handleReAnalyzing}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Analyze another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Save to tracker
                    </button>
                    <button
                      onClick={handleReAnalyzing}
                      className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Analyze another
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── CHAT TAB ─────────────────────────────────── */}
            {activeTab === 'chat' && (
              <div>
                <AiChat
                  jobDesc={form.jobDesc}
                  analysisResult={Result}
                />

                {/* Save buttons also in chat tab */}
                <div className="flex gap-3 mt-5">
                  {saved ? (
                    <>
                      <button
                        onClick={() => navigate('/tracker')}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        View tracker
                      </button>
                      <button
                        onClick={handleReAnalyzing}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        Analyze another
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Save to tracker
                      </button>
                      <button
                        onClick={handleReAnalyzing}
                        className="flex-1 text-sm bg-gray-900 px-3 py-2 rounded-xl text-white font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Analyze another
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Uses your uploaded resume · AI-powered by Gemini
        </p>

      </div>
    </div>
  )
}

export default Analysze;