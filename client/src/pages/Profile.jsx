import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"
import API from "../components/Api"

const Profile = () => {

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




if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

return(
<div className="max-w-2xl mx-auto px-6 py-8 ">
  <div className="gap-1 mb-7">
    <h1>Profile & setting</h1> 
    <p>Manage your account details and preferences</p>    
  </div>

 

</div>
)
}
export default Profile;