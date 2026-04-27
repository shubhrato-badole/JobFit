import react from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../components/Api"
import { useAuth } from "../pages/AuthContext"



const statusColors = {
  APPLIED: 'bg-green-100 text-green-700 border-green-100',
  INTERVIEW: 'bg-blue-100 text-blue-700 border-blue-100',
  OFFER: 'bg-purple-100 text-purple-700 border-purple-100',
  REJECTED: 'bg-red-100 text-red-600 border-red-100',
}

const Dashboard = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user } = useAuth() || {}
 console.log(user)


  useEffect(() => {
    const GetData = async () => {
      try {
        const { data } = await API.get("/api/dashboard/user")
        setData(data)
        console.log(data)
        
      } catch (err) {
        setError('Could not load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    GetData()
  }, [])

  const { stats, missingSkill, recentJobs } = data


  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
      hour < 17 ? 'Good afternoon' :
        'Good evening'

if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 ">

      <div className="mb-10">
        <h1 className="text-2xl text-gray-900 font-semibold ">{greeting}, {user?.name}</h1>
        <p className="text-sm mt-1 text-gray-500 "> {stats?.total === 0 ? "You have no applications waiting for updates" :
          `You have ${stats?.total} applications waiting for updates`}</p>
      </div>


  {!user?.hasResume && 
  <div className="bg-amber-50 brder border-amber-200 rounded-lg rounded-xl px-5 py-4 flex items-center justify-between mb-7">
    <div>
    <p className="text-sm text-amber-800 font-semibold">Resume not uploaded yet</p>
    <p className="text-sm text-amber-800 font-semibold">Upload your resume to start analyzing jobs</p>
    </div>
    <Link  to="/onboarding" className="bg-amber-700  rounded-lg  text-white text-sm font-semibold  px-4 py-2 hover:bg-amber-800 transition-colors shrink-0 "> Upload now</Link>
  </div> 
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 ">

        {[
          { n: stats?.total, l: 'total applied' },
          { n: stats?.interview, l: 'interviews' },
          { n: stats?.avgScore ? `${stats.avgScore}%` : '0', l: 'Avg match score' },
          { n: stats?.offer, l: 'Offers Keep going' },
        ].map(s => (
          <div key={s.l} className=" w-full bg-gray-50 p-3 rounded-xl border border-gray-100 ">
            <div className="text-xl font-semibold text-gray-900 ">{s.n}</div>
            <div className="text-xs text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}

      </div>




      <div className="grid grid-cols-2 gap-4 ">
        <div className=" bg-white border border-gray-200 rounded-2xl p-5" >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-gray-900 font-semibold truncate ">Recent applications</h2>
            <Link to="/tracker" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>



    

          {recentJobs?.length === 0 ? (<p className="text-sm text-gray-500">No application yet</p>) :
            (<div>

              {recentJobs?.map(j => (
               
                <div key={j} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium truncate ">{j.company}</p>
                    <p className="text-xs text-gray-500 truncate">{j.role}</p>
                  </div>
                  {j.match_score && (
                    <span className="text-xs font-medium text-gray-600 shrink-0">
                      {j.match_score}%
                      
                    </span>
                  ) 
                }

                  <span className={`text-sm font-medium  px-2 py-0.5  rounded-full border border-green-100
                    ${statusColors[j.status]}`}>{j.status.charAt(0) + j.status.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
            )}
               
        </div>





        <div className="bg-white border border-gray-200 rounded-2xl p-5"  >
          <div className=" mb-4 flex items-center justify-between ">
            <h2 className="text-sm text-gray-900 font-semibold">Your top skill gaps</h2>
            <span className="text-xs text-gray-400">across all analyzed jobs</span>
          </div>
          <div>
            {missingSkill?.length === 0 ? (<div>
              <p className="text-sm text-gray-400 mb-1">No data yet</p>
              <p className="text-xs text-gray-400">Skill gaps appear after you analyze jobs</p>
                  </div>
                ) : (
                  <div>
                    {missingSkill?.map((s,i) => (
                      <div key={i} className="flex items-center gap-6 mb-3">
                        <p className="text-xs text-gray-500 w-24 shrink-0 truncate">{s.skill}</p>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full"
                          style={{width: `${(s.count / missingSkill[0]?.count) * 100}%`}}></div>
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right shrink-0">{s.count} job{s.count > 1 ?'s':''}</span>
                      </div>
                    ))}
                  </div>)}
                  <div className=" border-t border-gray-200 mt-4 pt-4 flex items-center gap-3">
                    <div>
                    <div className="bg-gray-100 h-20 w-20 border border-gray-200 flex flex-col rounded-full flex items-center justify-center shrink-0">
                        <span className="text-lg text-gray-700 font-semibold">{stats?.avgScore}%</span>
                        <span className="text-xs text-gray-500">Avg score</span>
                    </div>
                   
                    </div>
                    <div>
                      {user?.hasResume ? (
                        <div>
                      <p className="text-sm text-gray-900 font-semibold ">Focus on {missingSkill?.[0]?.skill}</p>
                      <p className="text-xs text-gray-500  mt-0.5">
                        It appears missing in {missingSkill?.[0]?.count} times of your {stats?.total} job{ stats?.total > 1 ? 's' : ''}</p>
                     </div> ) : (
                        <p className="text-xs text-gray-400 ">Upload your resume to get insights</p>
                      )} 
                    </div>
                  </div>
          </div>
        </div>

      </div>

 <div className="flex gap-3 mt-7  items-center">
        <Link
          to="/analyze"
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
        >
          Analyze a job →
        </Link>
        <Link
          to="/tracker"
          className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
        >
          View tracker
        </Link>
        <Link
          to="/jobs"
          className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
        >
          Search jobs
        </Link>
      </div>
 


    </div>
  )


}
export default Dashboard;