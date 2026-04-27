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
  <div>
       <h1>Job Search</h1>
       <p>Search real listings from LinkedIn, Indeed and Glassdoor. Click Analyze to instantly check your match.</p>
  </div>
  </div>
)
}

export default Jobsearch;