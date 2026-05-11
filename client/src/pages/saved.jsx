
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../components/Api"




const colors = [
    "bg-red-100 text-red-600 border-red-200",
    "bg-blue-100 text-blue-600 border-blue-200",
    "bg-green-100 text-green-600  border-green-200",
    "bg-yellow-100 text-yellow-700  border-yellow-200",
    "bg-purple-100 text-purple-600 border-purple-200",
    "bg-pink-100 text-pink-600  border-pink-200",
];

const getColor = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + hash * 31;
    }
    return colors[Math.abs(hash) % colors.length];
}



const SavedJobs = () => {

    const [jobs, setJobs] = useState([]);
    const [loading, setloading] = useState(false);
    const [error, setError] = useState('');
    const [deleting, setDelete] = useState(false)



 

    const navigate = useNavigate();



    useEffect(() => {
        const getjobs = async () => {
            setloading(true)
            setError('')
            try {
                const { data } = await API.get("/api/jobs/saved")
                setJobs(data.jobs)
                

            } catch (err) {
                setError(err.response?.data?.error || 'error accured while fetching data')

            } finally {
                setloading(false)

            }
        }
        getjobs();
    }, [])






    const deleteJobs = async (id) => {
        setDelete(true)

        try {
            const { data } = await API.delete(`/api/jobs/${id}`)
             setJobs(prev => prev.filter(a => a.id !== id))
            setError('')
        } catch (err) {
            setError(err.response?.data?.error || 'errro while deleting ')
        } finally {
            setDelete(false)
        }

    }

    const formatDate = (date) => {
        if (!date) return '';
        try{
        return new Date(date).toLocaleDateString("en-us", {
            month: "short",
            day: "numeric"
        })} catch{
            { return ''; }
        }
    }

    const handleAnalyze = (j) => {

        navigate('/analyze', {
            state: {
                company: j.company,
                title: j.title,
                jobDesc: j.job_desc
            }
        })
    }

    if (loading) {
  return <div className="min-h-screen flex items-center justify-center">Loading...</div>
}

    return (
        <div className="max-w-7xl mx-auto px-7 py-8 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-2xl text-gray-900 font-semibold ">Saved jobs</h1>
                    <p className=" text-sm text-gray-500 "> {jobs ? 'Jobs you book marked to analyze later' :
                        ' No saved jobs yet. Start exploring and bookmark jobs to see them here'}</p>

                </div>
                <div>
                    <Link to={"/Jobs"} className=" text-sm text-white 
        bg-gray-900 font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-700 ">Search more jobs</Link>
                </div>
            </div>


            {jobs ?
                <div>
                    <div>
                        {jobs?.map(j => (
                            <div key={j.id} className="w-full flex flex-col lg:flex-row 
                            lg:items-center lg:justify-between gap-5 border border-gray-300
                             px-4 sm:px-5 py-4 rounded-2xl mt-7 hover:shadow-sm transition">

                                <div className="flex gap-4 min-w-0">
                                    <div className={`h-12 w-12  border 
                  font-semibold flex items-center
                 justify-center rounded-xl ${getColor(j.company)} `}>
                                        {j.company?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h2 className="text-base sm:text-lg text-gray-900 font-semibold line-clamp-2 ">{j.title}</h2>

                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                            <p>{j.company}</p>

                                            {j.location &&
                                                <p>• {j.location}</p>
                                            }

                                            <p>• {formatDate(j.created_at)}</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                                    <button className="flex-1 sm:flex-none text-sm text-center text-white px-4 py-2.5 bg-gray-900 rounded-xl hover:bg-gray-700 transition" onClick={() => handleAnalyze(j)} >
                                        Analyze job →
                                    </button>

                                    <a className="flex-1 sm:flex-none text-sm text-center text-gray-600 border border-gray-300 rounded-xl px-4 py-2.5 hover:bg-gray-100 transition" href={j.source_url}>
                                        Apply  ↗
                                    </a>

                                    <button className="text-sm text-gray-500 border 
                                    border-gray-300 px-4 py-2.5 rounded-xl 
                                    hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition "
                                        onClick={() => deleteJobs(j.id)}>
                                        x
                                    </button>

                                </div>
                    
                            </div>

                        ))}

                    </div>
                </div>
                : <div className="flex flex-col items-center justify-center gap-1 p-20 mt-10">
                    <p className="text-sm text-gray-900 font-semibold"> No saved jobs yet</p>
                    <p className="text-xs text-gray-500 ">Start exploring jobs and save them to check your match score.</p>
                    <Link to={"/jobs"} className="text-sm text-white bg-gray-900 rounded-xl px-5 py-2 mt-2 hover:bg-gray-700 ">Search Jobs</Link>
                </div>}

            {jobs && !deleting ? <p className="text-xs text-gray-500 mt-4 text-center ">
                {jobs.length} saved job{jobs.length > 1 ? 's' : ''} • Click Analyze now to check your match score</p> : ''}

            {/* {error &&  <p className="text-xs text-red-600 bg-red-50 px-4 py-1.5 rounded-xl border border-red-200 font-semibold ">{error}</p>} */}

        </div>

    )



}

export default SavedJobs