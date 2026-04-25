import react from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../Components/Api"
import { useAuth } from "../pages/AuthContext"





const Dashboard = () => {
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

const {name} = useAuth().user || {}



useEffect(()=>{
  const GetData = async() =>{
    try{
   const {data} = await API.get("/api/dashboard/user")
   setData(data)
   console.log(data)
    }catch(err){
      setError('Could not load dashboard data')
    } finally{
      setLoading(false)
    }
  }
  GetData()
},[])

 const { stats, missingSkill, recentJobs } = data
 

const hour = new Date().getHours()
 const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'


  return (
   <div className="max-w-7xl mx-auto px-6 py-8 ">

  <div className="mb-10">
    <h1 className="text-2xl text-gray-900 font-semibold ">{greeting}, {name}</h1>
    <p> {stats?.total === 0 ? "You have no applications waiting for updates" : 
    `You have ${stats?.total} applications waiting for updates`}</p>
   </div>



<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 ">

 { [
  { n : stats?.total  , l: 'total applied'   },
  { n : stats?.interview  , l: 'interviews'  },
  { n : stats?.avgScore , l: 'Avg match score' },
  { n : stats?.offer  ,   l: 'Offers Keep going'  },
].map(s  => (
  <div key={s.l} className=" w-full bg-gray-50 p-3 rounded-xl border border-gray-100 "> 
     <div className="text-xl font-semibold text-gray-900 ">{s.n}</div>
      <div className="text-xs text-gray-500 mt-1">{s.l}</div>
  </div>
))}
  
</div>

<div className="grid grid-cols-2 gap-4 ">
   <div className=" bg-white border border-gray-200 rounded-2xl p-5" >
    <div className="flex items-center justify-between mb-4">
    <h2>Recent applications</h2>
     <Link to="/tracker" className="text-xs text-blue-600 hover:underline">View all</Link>
    </div>

{recentJobs?.length=== 0 ? ( <p>no application yet</p> ) : 
     ( <div>

            {recentJobs?.map(j => (
            <div key={j} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
             <p >{j.company}</p>
             <p>{j.role}</p>
             </div>
               {j?.match_score && (
                    <span className="text-xs font-medium text-gray-600 shrink-0">
                      {j.match_score}%
                    </span>
                  )}
                   <span className="">{j.status}</span>
            </div>
    ))}
    </div>
 )}






   </div>
    <div className="bg-white border border-gray-200 rounded-2xl p-5"  ></div>
    </div>
</div>
  )
  
  
}
export default Dashboard;