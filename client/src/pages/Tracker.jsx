import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../Components/Api"
import axios from "axios"




const COLUMNS = [
  { key: 'APPLIED', label: 'Applied', color: 'border-green-300' },
  { key: 'INTERVIEW', label: 'Interview', color: 'border-blue-300' },
  { key: 'OFFER', label: 'Offer', color: 'border-purple-300' },
  { key: 'REJECTED', label: 'Rejected', color: 'border-red-300' },
]

const statusColors = {
  APPLIED: 'bg-green-50 text-green-700 border-green-200',
  INTERVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
  OFFER: 'bg-purple-50 text-purple-700 border-purple-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })


const AppModal = ({ app, onClose, onStatusChange, onDelete }) => {
      const [status, setStatus]   = useState(app.status)
      const [saving, setSaving]   = useState(false)
      const [deleting, setDeleting] = useState(false)

      const handleStatusChange = async (newStatus) => {
        setSaving(true)
        try{
           await API.patch(`/api/applications/${app.id}`, {status: newStatus})
           setStatus(newStatus)
           onStatusChange(app.id , newStatus)
        }catch{

        }finally{
          setSaving(false)
        }
      }

 const handleDelete = async () =>{  
  setDeleting(true)
try{
    await API.delete(`/api/applications/${app.id}`)
      onDelete(app.id)
}catch{

}finally{
  setDeleting()

}
      }
}



const Tracker = () => {

  const [app, setApp] = useState([
    { id: 1, company: "Google", role: "SDE", status: "APPLIED", match_score: 85 },
    { id: 2, company: "Amazon", role: "Backend", status: "INTERVIEW", match_score: 72 },
    { id: 3, company: "Microsoft", role: "Frontend", status: "OFFER", match_score: 90 },
    { id: 4, company: "Meta", role: "Full Stack", status: "REJECTED", match_score: 60 }
  ])

  const [loading, setLoading] = useState(false)
  const [selected, setSelectede] = useState(null)


  // useEffect(() => {
  //   const fetchApp = async () => {
  //     try {
  //       const { data } = await API.get("api/applications")
  //     } catch (err) {
  //       console.error(err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchApp()
  // },[])

  const handleStatusChnages = (id, newStatus) => {
    setApp(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }


  const onDelete = (id) => {
    setApp(prev => prev.filter(a => a.id !== id))
  }

  const appByStatus = (staus) =>
    app.filter(a => a.status === staus)


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }
  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-7 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl text-gray-900 font-semibold ">Application tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            {app.length === 0 ? 'No applications yet — analyze your first job below' :
              `${app.length} application${app.length !== 1 ? 's' : ''} tracked`}
          </p>
        </div>

        <Link to='/analyze'
          className="text-lg text-white font-semibld bg-gray-900 px-4 py-2
     rounded-xl hover:bg-gray-700 transition-colors">
          Analyze new job
        </Link>
      </div>



      {app.length === 0 && (
        <div className="max-w-sm mx-auto text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#9ca3af" strokeWidth="1.5" />
              <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#9ca3af" strokeWidth="1.5" />
              <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#9ca3af" strokeWidth="1.5" />
              <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="#9ca3af" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">No applications yet</h2>
          <p className="text-sm text-gray-400 mb-5">Analyze a job to add it here automatically</p>
          <Link
            to="/analyze"
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Analyze your first job →
          </Link>
        </div>
      )}

      {/* {app.length > 0 &&  */}

      <div className="grid grid-cols-1 md-grd-cols-2 grid-cols-4 gap-4 max-w-7xl mx-auto">
        {COLUMNS.map(col => (
          <div key={col.key} className="bg-gray-50 rounded-2xl p-3 min-h-48">
            <div className="flex items-center justify-between mb-3 px-1"> <span className="text-sm font-semibold text-gray-600">{col.label}</span>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full"> {appByStatus(col.key).length}</span></div>



            {appByStatus(col.key).length === 0 ?
              <div className="text-center py-8 text-xs text-gray-400">Empty</div> :
              appByStatus(col.key).map(app => (
                <div key={app.id}
                  onClick={() => setSelectede(app)}
                  className={` bg-white border-l-4 ${col.color} border border-gray-200 rounded-xl p-3 mb-2.5 cursor-pointer hover:border-gray-300 transition-colors `}>
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.company}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5 mb-2.5">{app.role}</p>
                  <div className="flex justify-between ">
                    <p className="text-xs font-medium text-gray-600">{app.match_score}% match</p>
                    <p className="text-xs text-gray-400">{formatDate(app.created_at)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        ))}
      </div>
      {/* } */}
{selected && 
<AppModal 

/>}


    </div>
  )
}

export default Tracker