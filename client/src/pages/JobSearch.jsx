import Recat from "react";
import API from "../components/Api";
import { useState , } from "react";
import { useNavigate } from "react-router-dom";



const Jobsearch = () =>{
  const navigate = useNavigate();

  const [query , setQuery] = useState();
  const [location , setLocation] = useState();
  const [jobs , setJobs] = useState([]);
  const [error , setError] = useState('');
  const [loading , setLoading] = useState(false);
  const [searched , setSearched] = useState(false);
  const [selected , setSelected] = useState(null);


  const handleSearch = async (e) =>{
    e.preventDefault();
  if(!query.trim())  return setError("Please enter a job title or keyword")

    setError('')
    setLoading(true)
    setSearched(true)

    try{
      const param = new URLSearchParams({q:query.trim()})
      if(location.trim()) param.append('location', location.trim())


     const {data} =await  API.get(`/api/jobs/search?${param}`)
    setJobs(data.jobs)



      if (data.jobs?.length === 0) {
        setError('No jobs found. Try a different search term or location.')
      }

    }catch(err){
      setError(err.reponse?.data?.error || 'Failed to fetch jobs. Please try again.')
       setJobs([])
    }

    finally{
      setLoading(false)
    }
} 



return(
  <div className="max-w-5xl mx-auto px-6 py-8">
  <div className="mb-7">
       <h1 className="text-xl text-gray-900 font-semibold mb-1">Job Search</h1>
       <p className="text-sm text-gray-600 ">Search real listings from LinkedIn, Indeed and Glassdoor. Click Analyze to instantly check your match.</p>
  </div>
  <div>
    <form  onSubmit={handleSearch}>
      <div className="flex gap-3 ">
       <div className="flex-1">
        <label className=" block text-sm text-gray-900 font-medium mb-1.5">Job title or skill</label>
        <input 
         className=" w-full text-sm tex-gray-400 bg-gray-200 px-3 py-2.5 border border-gray-300 rounded-xl
         text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
        type="text" 
        placeholder="React developer, Full stack, Node.js..." 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
         required />
       </div>

       <div className="w-48">
        <label className="text-sm text-gray-900 font-medium m-4">Location</label>
        <input 
           className=" w-full text-sm tex-gray-400 bg-gray-200 px-3 py-2.5 border border-gray-300 rounded-xl
         text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
        type="text"
         placeholder="Location (optional)" 
         value={location} 
         onChange={(e) => setLocation(e.target.value) } 
          />
       </div>
       </div>
 
    <div className="flex items-end">
      <button 
       disabled={loading}
      className=" flex items-center gap-2 mt-5 justify-content
        px-6 py-2.5 tetx-sm text-white rounded-xl 
        font-semibold bg-gray-900
        hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        whitespace-nowrap"
      type="submit"
     >
        {loading ? <>
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/>
          </svg> Searching...</>
         : 'Search jobs'}
      </button>
        
    </div>
     </form>
  </div>


  <div className="flex flex-wrap gap-3 mt-4">
  <span className="text-xs text-gray-400 py-1">Quick search:</span>

 {['React developer', 'Full stack Node',
  'Frontend engineer', 'JavaScript developer'].map((item => (
  <button key={item} onClick={() => {setQuery(item); setTimeout(() => handleSearch(), 0)}}
  className="text-xs text-gray-900 px-3 py-1 border border-gray-300 rounded-xl
  hover:bg-gray-500  hover:text-white transition-colors ">
    {item}</button>
 )))}

  </div>

  {error && ( <div >
       <p className="text-xs mt-5 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100 ">{error}</p>
  </div> )}
  </div>
) 
}

export default Jobsearch;