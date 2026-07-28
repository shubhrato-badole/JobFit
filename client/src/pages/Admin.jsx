import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../pages/AuthContext'
import api from '../components/Api'




const StatCard = ({ label , value , sub , subColor}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
         <p className="text-xs text-gray-500 mb-1">{label}</p>
         <p className="text-2xl font-semibold text-gray-900">{value}</p>
         <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>

    </div>
)

     const SkillBar = ({ skill, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-28 shrink-0 truncate">{skill}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  )
}
 
const BAR_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400',
  'bg-blue-400', 'bg-purple-400', 'bg-green-400',
  'bg-pink-400', 'bg-indigo-400',
]

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const timeAgo = (d) => {
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}


function Admin(){
     const { user } = useAuth()
  const navigate  = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('overview')
  const [search,  setSearch]  = useState('')

    useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
      return
    }
    const fetchStats = async () => {
      try {
        const { data: res } = await api.get('/api/admin/stats')
        setData(res)
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/dashboard', { replace: true })
        } else {
          setError('Failed to load admin stats')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const filteredUsers = data?.recentUsers?.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) || []

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
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }
 
   const { stats, topMissingSkills, recentUsers } = data

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 sm:mb-10 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-500 font-medium">
              Admin Panel
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JobFit Dashboard</h1>
        </div>
        <p className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString('en-IN')}
        </p>
      </div>



<div className="flex gap-2 mb-6 overflow-x-auto pb-1 justify-center sm:justify-start">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'users',    label: 'Users table' },
          { key: 'skills',   label: 'Skill gaps' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
           className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-gray-900 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

        {tab === 'overview' && (
            <div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                     <StatCard
                     label="Total Users" 
                     value={stats?.totalUsers || 0}
                     sub={stats?.newUsersThisMonth || 0}
                     subColor="text-green-500"
                    />
                     <StatCard
              label="Total analyses"
              value={stats.totalAnalyses.toLocaleString()}
              sub="AI job analyses run"
            />

             <StatCard
              label="Resumes uploaded"
              value={stats.usersWithResume.toLocaleString()}
              sub={`${Math.round((stats.usersWithResume / stats.totalUsers) * 100)}% of users`}
            />
            <StatCard
              label="New this week"
              value={stats.newUsersThisWeek}
              sub="↑ growing"
              subColor="text-blue-600"
            />

                   </div>      
          

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
       <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Top missing skills platform-wide
              </h2>
              <div className="space-y-3">
                {topMissingSkills.slice(0, 6).map((s, i) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    count={parseInt(s.count)}
                    total={stats.totalUsers}
                    color={BAR_COLORS[i] || 'bg-gray-400'}
                  />
                ))}
              </div>
       </div>

       <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Recent Users
              </h2>
              {recentUsers.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3 mb-2">
                    <div className=" w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {timeAgo(u.created_at)}
                    </span>
                  </div>
                ))}
       </div>
       </div>
  </div>
        )}


{tab === 'users' && ( 
    <div>
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h1 className="text-lg font-semibold text-gray-900">All users ({stats.totalUsers}) </h1>
          <input type="text" 
          placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none w-full sm:w-56 placeholder-gray-400 focus:border-blue-400 transition-colors"
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead>
                    <tr>
                 <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Resume</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
                    </tr>
                </thead>
                <tbody>
                      {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        u.has_resume
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {u.has_resume ? 'Uploaded' : 'Missing'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
    </div>

)}

{tab === 'skills' && (
    <div>
        <h1 className="text-lg font-semibold text-gray-900 mb-1">Platform-wide skill gaps</h1>
        <p className="text-gray-500 text-sm mb-5 ">Most common missing skills across all {stats.totalUsers} users</p>

   

<div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   {topMissingSkills.map((s, i) =>{
     const pct = Math.round((parseInt(s.count) / stats.totalUsers) * 100)
     return(
     <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
         <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{s.skill}</span>
                    <span className="text-sm font-semibold text-gray-600">{s.count} users</span>
                  </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${BAR_COLORS[i] || 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{pct}% of all users missing this</p>
     </div>
  ) })}

</div>
 </div>

)}



     </div>

      

  )}


export default Admin