import{ useContext , useEffect , useState  , createContext } from "react"
import API from "../Components/Api"



const AuthContext =createContext(null);

export const AuthProvider =   ({children}) => {
 const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

 
 const checkAuth = async () => {
    try{
   const {data} = await API.get("/api/auth/me")
  setUser(data.user)
    } catch {
        console.log("Auth check failed:", err)
        setUser(null)
    }finally{
        setLoading(false)
    }
    
} 
 
 
 
useEffect(() => {
checkAuth()
  } , [])

const Login = (userData) => setUser(userData)

  const logout = async () =>{
    try{
await API.post("/api/auth/logout")} catch {}
navigate("/")
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

