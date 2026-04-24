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
  const [status, setStatus] = useState(app.status)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleStatusChange = async (newStatus) => {
    setSaving(true)
    try {
      await API.patch(`/api/tracker/${app.id}`, { status: newStatus })
      setStatus(newStatus)
      onStatusChange(app.id, newStatus)
    } catch {

    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this application?')) return
    setDeleting(true)
    try {
      await API.delete(`/api/tracker/${app.id}`)
      onDelete(app.id)
      onClose()
    } catch {

    } finally {
      setDeleting()
    }
  }
   const missing = typeof app.missing_skills === 'string'
      ? JSON.parse(app.missing_skills) : (app.missing_skills || [])
   const strengths = typeof app.strengths === 'string'
     ? JSON.parse(app.strengths) : (app.styrengths || [])
     const suggestions = typeof app.suggestions ? 
      app.suggestions?.split('\n').filter(Boolean) :[]
       

  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4"
           style={{ background: 'rgba(0,0,0,0.4)' }}
           onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div  className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
              <h1  className="text-lg font-semibold text-gray-900">{app.company}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{app.role}</p>
              </div>
              <button onClick={onClose}className=" w-7 h-7 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"> ✕
                 </button>
            </div>
            <div className="p-5 space-y-5">
              <div  className="flex items-center gap-4">
                {app.match_score &&(
                
                 <div className="bg-gray-50 text-center px-4 py-3 rounded-xl border border-gray-400">
                 <div className="text-2xl  font-semibold text-gray-900">{app.match_score}</div>
                 <div className="text-xs text-gray-400">match %</div>
                 </div> 
              )}
              <div className="flex-1 ">
                <p className="text-xs font-medium text-gray-500 mb-2">Update status</p>
                 <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(col =>(
                    <button key={col.key}
                    onClick={() => handleStatusChange(col.key)}
                       disabled={saving}
                       className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      status === col.key
                        ? statusColors[col.key]:'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}  >
                      {col.label}
                    </button>
                  ))}

                 </div>
              </div>
              </div>
              {missing.length > 0 &&  
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2"> Missing Skills</p>
                <div className="flex flex-wrap gap-1.5">
                {missing.map(s =>(
                  <span key={s} className="text-xs text-red-600  rounded-xl px-2.5 py-1 bg-red-50 border border-red-100">{s}</span>
                ))}
                </div>
              </div> }

              {strengths.length > 0 && 
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">strengths</p>
                <div className="flex flex-wrap gap-1.5">
                {strengths.map(s => (
                  <span key={s} className="text-xs text-green-600 border bg-green-50 rounded-xl px-2.5 py-1 border-green-100">{s}</span>
                ))}
                </div>
                </div> }
               {suggestions && 
               <div>
                <p>suggestions</p>
                <div className="space-y-2"></div>
                {suggestions.map ((s , i) => (
                  <div key={s} className="flex gap-2.5 text-sm text-gray-600 leading-relaxed"> 
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 shrink-0 mt-0.5">
                    {i + 1}</span>{s}</div>
                ))}
                </div> }

          
              <div className="pt-2 border-t border-gray-100">
                <button onClick={handleDelete}
                disabled={deleting} className="text-sm text-red-500 bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl hover:text-red-700 transition-colors"> 
                {deleting ? 'Deleting...' : 'Delete this application'}</button>
              </div>
                </div>
        </div>

    </div>
  )

}






const Tracker = () => {

  const [app, setApp] = useState([
  ])

  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)


  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data } = await API.get("api/tracker")
        setApp(data.application)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApp()
  },[])

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

      {app.length > 0 && 

      <div className="grid grid-cols-1 md-grd-cols-2 grid-cols-4 gap-4 max-w-7xl mx-auto">
        {COLUMNS.map(col => (
          <div key={col.key} className="bg-gray-50 rounded-2xl p-3 min-h-48">
            <div className="flex items-center justify-between mb-3 px-1"> <span className={`text-sm font-semibold ${statusColors} `}>{col.label}</span>
              <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full"> {appByStatus(col.key).length}</span></div>



            {appByStatus(col.key).length === 0 ?
              <div className="text-center py-8 text-xs text-gray-400">Empty</div> :
              appByStatus(col.key).map(app => (
                <div key={app.id}
                  onClick={() => setSelected(app)}
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
      } 
      {selected &&
        <AppModal
        app={selected}
        onDelete={onDelete}
        onStatusChange={handleStatusChnages}
        onClose={() => setSelected(null)}

        />}


    </div>
  )
}

export default Tracker