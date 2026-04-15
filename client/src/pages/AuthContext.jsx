import React from "react"
import{useState , useContext , createContext , useEffect} from "react"
import API from "../components/Api"



const AuthContext =createContext(null);

export const AuthProvider =   ({children}) => {
 const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
const checkAuth = async () => {
    try{
   const {data} = await API.get("/api/auth/me")
  setUser(data.user)
    } catch {
        setUser(null)
    }finally{
        setLoading(false)
    }
    checkAuth();
} 
  } , [])

const Login = (userData) => setUser(userData)

  const logout = async () =>{
    try{
await API.post("/api/auth/logout")} catch {}
setUser(null)
  }

  
return (
    <AuthContext.Provider value={{ user, loading, Login, logout }}>
      {children}
    </AuthContext.Provider>
  )


}
export const useAuth = () => useContext(AuthContext)
export default AuthContext

