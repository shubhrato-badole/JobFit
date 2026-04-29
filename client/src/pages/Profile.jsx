import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"
import API from "../components/Api"

const Profile = () => {

  const navigate =useNavigate()

  const [profile, setProfile] = useState([])
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth();

  // changing name and email 

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  // cahnging password 

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [savingPwd, SetSavingPwd] = useState(false)



  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)



  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data } = await API.get("/api/profile")
        setProfile(data.user)
        setName(data.user.name)
        setEmail(data.user.eamil)
      } catch (err) {

      } finally {
        setLoading(false)
      }
    }
  })


  const handleProfileChanges = async (e) => {
    e.preventDefault()
    setSaveErr('')
    setSaving(true)
    setSaveMsg('')
    try {
      const { data } = await API.patch(`api/profile/change`, { name, email })
      setProfile(prev => ({ ...prev, name: data.user.name, email: data.user.email }))
      setSaveMsg('Profile updated successfully')

    } catch (err) {
      setSaveErr(err.response?.data?.error || '')
    } finally {
      setSaveErr(false)
    }


  }


  const handlePwdChange = async (e) => {
    e.preventDefault()
    SetSavingPwd(true)
    setPwdErr('')
    setPwdMsg('')

    try {
      const { data } = await API.patch(`/api/profile/password`, {
        currentPssword: curPwd,
        newPssword: newPwd
      })
      setPwdMsg('Password changed successfully')
      setCurPwd('')
      setNewPwd('')

    } catch (err) {
      setPwdErr(err.response?.data?.error || 'Password change failed')
    } finally {
      SetSavingPwd(false)

    }
  }



  const handleDelete = async () => {
    setDeleting(true)

    try {
      const { data } = await API.delete(`/api/profile/delete`)
      await logout()
      Navigate("/")
    } catch {
      setDeleting(false)
      setShowDelete(false)
    }
  }


const formatData = (date) =>{
   if(!date) return '' ;
   new Date(date).toLocaleDateString("en-IN" , {
    day: "numeric",
    month: "short",
    year:"numeric"
   })
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 ">
      <div className="gap-1 mb-7">
        <h1 className="text-gray-900 text-2xl font-semibold mb-1">Profile & settings</h1>
        <p className="text-sm text-gray-500">Manage your account details and preferences</p>
      </div>


      {/* // proifle deltail card  */}



      <div className="flex items-center gap-4 border border-gray-200 rounded-2xl bg-white p-5 mb-5  ">
        <div className="w-14 h-14 bg-blue-50 rounded-full 
       text-blue-700 border border-blue-200 flex items-center justify-center font-semibold text-xl shrink-0 ">
          {profile?.name?.[0]?.toUpperCase()} S
        </div>
        <div className="flex-1 flex-col ">
          <p className="text-lg text-gray-900 font-semibold truncate">{profile.name}</p>
          <p className="text-sm text-gray-500 truncate">{profile.eamil}</p>
          <p className="text-sm text-gray-400">member since {formatData(profile.created_at)}</p>
        </div>
        <div className=" text-right shrink-0">
          <p className="text-2xl text-gray-900 font-semibold ">{profile.total}</p>
          <p className="text-xs text-gray-400">applications</p>
        </div>
      </div>



      {/* // the resume reuploaded section  */}
      <div className="border border-gray-200 bg-white rounded-2xl p-5 mb-5">
        <h2 className="text-sm text-gray-900 font-semibold mb-4 ">Resume</h2>
       
        {profile?.hasresume ?
          <div className="flex gap-3 items-center ">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5 6.5-6.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <div className="flex-1 items-center" >
              <p className="text-sm text-gray-900 font-semibold">Resume uploaded</p>
              <p className="text-xs text-gray-500 ">1 apr 2026 </p>
            </div>
           <button onClick={()=> navigate("/onboarding")}
            className="text-xs text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
             Re-upload
           </button>
           </div>

          : <div className="flex gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v5M7 9v1" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <div className="flex-1 flex-col">
            <p className="text-sm text-gray-900 font-semibold">No resume uploaded</p>
            <p className="text-xs text-gray-500">Upload your resume to start analyzing jobs</p>
            </div>

           <button onClick={()=> navigate("/onboarding")}
            className="text-xs text-white border border-gray-200 bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
             Upload Now
           </button>


           </div>
              }
             {profile?.targetRoles &&  
             <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">AI recommended roles</p>
                <div className="flex flex-wrap gap-2">
                 {profile?.targetRoles?.map((t ,i) => (
                 <span key={i} className=" text-xs px-2.5 py-1 rounded-xl bg-blue 
                 text-blue-600 border border-blue-blue-200 font-medium">
                      {profile?.targetRoles}
                </span>
                  
                 ))}
                 </div>
              </div>  }
          </div>  

           
          <div className="border border-gray-200 bg-white rounded-2xl p-5 mb-5  ">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Edit profile</h2>
            <form onSubmit={handleProfileChanges} className="space-y-4">
            <div>
              <label className=" block text-sm text-gray-700 mb-1.5"> Full Name </label>
              <input 
              onChange={(e)=>  { setName(e.target.value); setSaveMsg(''); setSaveErr('') }}
              type="text" value={name} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl 
              text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors"/>
            </div>
            <div>
               <label className=" block text-sm text-gray-700 mb-1.5"> Email address </label>
              <input 
              onChange={(e)=>  { setEmail(e.target.value); setSaveMsg(''); setSaveErr('') }}
              type="text" value={email} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl 
              text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors"/>
            </div>

                {saveMsg && (
            <div className="px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
              {saveMsg}
            </div>
          )}
          {saveErr && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {saveErr}
            </div>
          )}


              <button onClick={()=> navigate("/onbording")}
                disabled={saving || (name === profile?.name && email === profile?.email)}
            className="text-sm text-white border border-gray-200 bg-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
            { saving ? 'Saving...' : 'Save changes'}
           </button>

               </form>
          </div>
          
           <div className="border border-gray-200 bg-white rounded-2xl p-5 mb-5  ">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">password</h2>
            <form onSubmit={handlePwdChange} className="space-y-4">
            <div>
              <label className=" block text-sm text-gray-700 mb-1.5"> Current password</label>
              <input 
              onChange={(e)=>  { setCurPwd(e.target.value); setPwdMsg(''); setPwdErr('') }}
              type="text" value={curPwd} required
              placeholder="Your current password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl 
              text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors"/>
            </div>
            <div>
               <label className=" block text-sm text-gray-700 mb-1.5"> New password</label>
              <input 
              onChange={(e)=>  { setNewPwd(e.target.value); setPwdMsg(''); setPwdErr('') }}
              type="text" value={newPwd} required
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl 
              text-sm text-gray-900 outline-none focus:border-blue-400 transition-colors"/>
            </div>

             {pwdMsg && (
            <div className="px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
              {pwdMsg}
            </div>
          )}
          {pwdErr && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {pwdErr}
            </div>
          )}

              <button  type="submit"
                  disabled={savingPwd || !curPwd || !newPwd}
            className="text-sm text-white border border-gray-200 bg-gray-900 px-5 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">
            { saving ? 'Updating...' : 'Update password'}
           </button>

               </form>
          </div>
          
           <div className="border border-red-100 bg-white rounded-2xl p-5 mb-5 ">
                  <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
                  <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                 
               {!showDelete ?
                 <button onClick={ () => setShowDelete(true)}
                  className="text-sm font-medium text-red-600 border border-red-200 bg-red-50 px-8 py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                  Delete account
                 </button>

                :
                 <div className="border border-red-200 bg-red-50 rounded-2xl p-5   ">
                  <p className=" text-xs font-medium text-red-600 mb-3">Are you sure? This will permanently delete your account, resume, and all applications.</p>
                   <div className="gap-3 flex">
                    <button onClick={handleDelete} className="text-sm font-medium text-white border border-red-200 bg-red-600 px-8 py-2.5 rounded-lg hover:bg-red-500 transition-colors">
                      {deleting ? 'Deleting...'   : 'Yes, delete my account'}
                     
                    </button>
                     <button onClick={() => setShowDelete(false)}
                      className="text-sm border border-gray-300 px-5 py-2.5 rounded-lg" >Cancel</button>
                     </div>
                 </div> }
            
           
           </div>

      </div>
      

  )
}
export default Profile;