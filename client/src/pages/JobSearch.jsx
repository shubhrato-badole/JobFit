import API from "../components/Api";
import { useEffect } from "react";
import { useState, } from "react";
import { useNavigate } from "react-router-dom";








const JobCard = ({ job, onSave, savedIds }) => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const alreadySaved = savedIds.includes(String(job.id))



  const handleAnalyze = () => {
    navigate('/analyze', {
      state: {
        company: job.company,
        title: job.title,
        jobDesc: job.jobDesc,
      }
    })
  }

  const handleSave = async () => {
    if (alreadySaved) return
    setSaving(true)
    try {
      const { data } = await API.post(`/api/jobs/saved`, {
        title: job.title,
        company: job.company,
        location: job.location,
        jobUrl: job.applyUrl,
        jobDescription: job.jobDesc,

      })
      onSave(job.id)
    } catch (err) {
      if (err.response?.status === 409) onSave(job.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className=" border rounded-xl p-4 py-2.5 border-gray-200 ">
      <div className="flex items-start gap-3 mb-3">

        {job.logo ?
          <img src={job.logo} alt={job.company} className="w-9 h-9 rounded-xl border border-gray-200 shrink-0 " />
          : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-sm font-semibold text-gray-400">
            {job.company?.[0]} </div>}


        <div className="flex-1 min-w-0 ">
          <h3 className="text-sm text-gray-900 font-semibold truncate  ">{job.title}</h3>
          <p className="text-xs text-gray-500 truncate">{job.company}</p>
        </div>

      </div>


      <div className="flex flex-wrap gap-2 mb-4 ">
        {job.location &&
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1a3 3 0 013 3c0 2-3 6-3 6S2.5 6 2.5 4a3 3 0 013-3z" stroke="#9ca3af" strokeWidth="1" strokeLinejoin="round" />
              <circle cx="5.5" cy="4" r="1" fill="#9ca3af" />
            </svg> {job.location}
          </span>}


        {job.isRemote &&
          <span className="text-xs text-gray-500 
             bg-gray-50 border border-gray-100 
             rounded-xl px-2 py-0.5">
            remote</span>}


        {job.type &&
          <span className="text-xs text-gray-500 
             bg-gray-50 border border-gray-100 
             rounded-xl px-2 py-0.5">{job.type}
          </span>}

        {job.minSalary && job.maxSalary &&
          <span className="text-xs text-gray-500"> {job.salaryPeriod === 'YEAR' ? `₹${Math.round(job.minSalary / 100000)}–${Math.round(job.maxSalary / 100000)} LPA`
            : `$${job.minSalary}–${job.maxSalary}`} </span>}
      </div>


      <div>
        {job.jobDesc &&
          <p className="text-xs text-gray-500 "> {job.jobDesc.slice(0, 160)}... </p>}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={handleAnalyze} className="text-white  text-xs font-semibold bg-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-700 transiction-color ">
          Analyze match →
        </button>
        <button onClick={handleSave}
          disabled={saving || alreadySaved}
          className={`text-xs font-semibold  px-3 py-1.5 rounded-xl transition-colors hover:bg-gray-200 ${alreadySaved ? 'bg-green-100 border border-green-300 text-green-500 ' : `bg-gray-100 border border-gray-300 text-gray-500`} `}>
          {alreadySaved ? '✓ Saved' : saving ? 'saving...' : 'save'}
        </button>

        <a href={job.applyUrl} className="text-xs bg-white border rounded-xl border-gray-300 px-2 py-1 hover:bg-gray-50"> Apply ↗</a>

      </div>






    </div>
  )




}








const Jobsearch = () => {

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState([]);



  useEffect(() => {
    if (jobs.length > 0 || searched) {
      sessionStorage.setItem('jobSearch_jobs', JSON.stringify(jobs));
      sessionStorage.setItem('jobSearch_query', query);
      sessionStorage.setItem('jobSearch_location', location);
      sessionStorage.setItem('jobSearch_searched', searched ? 'true' : 'false');
    }
  }, [jobs, query, location, searched]);


  useEffect(() => {
    const savedQuery = sessionStorage.getItem('jobSearch_query');
    const savedLocation = sessionStorage.getItem('jobSearch_location');
    const savedSearched = sessionStorage.getItem('jobSearch_searched');
    const savedJobs = sessionStorage.getItem('jobSearch_jobs');

    if (savedQuery) setQuery(savedQuery);
    if (savedLocation) setLocation(savedLocation)
    if (savedJobs && savedSearched === 'true') {
      setSearched(true)
      setJobs(JSON.parse(savedJobs))
    }
  }, []);







  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const { data } = await API.get('/api/jobs/saved')
        const ids = data.jobs.map(job => job.id)
        setSavedIds(ids)
      } catch (err) {
        console.error(err)
      }
    }

    fetchSaved()
  }, [])






  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return setError("Please enter a job title or keyword")

    setError('')
    setLoading(true)
    setSearched(true)

    try {
      const param = new URLSearchParams()
      param.append('q', query.trim())
      if (location.trim()) param.append('location', location.trim())

      const { data } = await API.get(`/api/jobs/search?${param}`)
      setJobs(data?.jobs || [])

      if (data.jobs?.length === 0) {
        setError('No jobs found. Try a different search term or location.')
      }

    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Failed to fetch jobs. Please try again.')
      setJobs([])
    }

    finally {
      setLoading(false)
    }
  }

  const handleSave = (id) => {
    setSavedIds(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="text-xl text-gray-900 font-semibold mb-1">Job Search</h1>
        <p className="text-sm text-gray-600 ">Search real listings from LinkedIn, Indeed and Glassdoor. Click Analyze to instantly check your match.</p>
      </div>
      <div>
        <form onSubmit={handleSearch} className="border bg-white border-gray-200 px-6 py-5 rounded-2xl">
          <div className="flex gap-3 ">
            <div className="flex-1">
              <label className=" block text-sm text-gray-900 font-medium mb-1.5">Job title or skill</label>
              <input
                className=" w-full text-sm text-gray-400 bg-gray-50 px-3 py-2.5 border border-gray-300 rounded-xl
         text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                type="text"
                placeholder="React developer, Full stack, Node.js..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError('') }}
                required />
            </div>

            <div className="w-48">
              <label className="text-sm text-gray-900 font-medium m-4">Location (optional)</label>
              <input
                className=" w-full text-sm tex-gray-400 bg-gray-50 px-3 py-2.5 border border-gray-300 rounded-xl
         text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                type="text"
                placeholder="Mumbai, Remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>


            <div className="flex items-end">
              <button
                disabled={loading}
                className=" flex items-center gap-2 mt-5 justify-content
        px-6 py-2.5 text-sm text-white rounded-xl 
        font-semibold bg-gray-900
        hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        whitespace-nowrap"
                type="submit"
              >
                {loading ? <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg> Searching...</>
                  : 'Search jobs'}
              </button>
            </div>
          </div>


          <div className="flex flex-wrap gap-3 mt-5">
            <span className="text-xs text-gray-400 py-1">Quick search:</span>

            {['React developer', 'Full stack Node',
              'Frontend engineer', 'JavaScript developer'].map((item => (
                <button type="button" key={item} onClick={() => { setQuery(item); setError('') }}
                  className="text-xs text-gray-900 px-3 py-1 border border-gray-300 rounded-xl
  hover:bg-gray-500  hover:text-white transition-colors ">
                  {item}</button>
              )))}
          </div>


        </form>
      </div>



      {error && (<div >
        <p className="text-xs mt-5 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100 ">{error}</p>
      </div>)}


      {searched && !loading && jobs.length > 0 && (
        <p className="text-sm text-gray-600 font-medium my-5 ">
          Found <span>{jobs.length}</span> jobs for {query}
          {location ? ` in ${location}` : ''}
        </p>
      )}
      <div>

        {!loading && !searched && (
          <div className="text-center py-16 mt-10">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#9ca3af" strokeWidth="1.5" />
                <path d="M16.5 16.5L21 21" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-sm text-gray-900 font-semibold mb-1.5"> search for jobs</h2>
            <p className="text-sm text-gray-400 mb-1  max-w-sm mx-auto">  Type a role or skill above.
              Click Analyze on any result to instantly see your match score.</p>
          </div>
        )}

        {loading && (
          <div className=" grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-white  border border-gray-200 rounded-lg p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div >

                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-gray-100 rounded-full w-20" />
                  <div className="h-5 bg-gray-100 rounded-full w-16" />
                </div>
                <div>
                  <div className="h-3 bg-gray-100 rounded mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
                    <div className="w-16 h-8 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>


      <div>
        {!loading && jobs.length > 0 &&
          (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSave={handleSave}
                  savedIds={savedIds}
                />

              ))}
            </div>
          )}





      </div>
    </div>

  )
}

export default Jobsearch;


