import{ useContext , useEffect , useState  , createContext } from "react"
import API from "../components/Api"



const AuthContext =createContext({
  user: null,
  loading: true,
  Login: () => {},
  logout: () => {},
  refetch: () => {},
});


export const AuthProvider =   ({children}) => {
 const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

 
 const checkAuth = async () => {
    try{
   const {data} = await API.get("/api/auth/me")
  setUser(data.user)
    } catch{
        console.log("Auth check failed:")
     
        setUser(null)
    }finally{
        setLoading(false)
    }
    
} 
 
 
 
useEffect(() => {
checkAuth()
  } , [])

const Login = async (userData) => {setUser(userData)
    await checkAuth()
}
  const logout = async () =>{
    try{
await API.post("/api/auth/logout")} catch{}
setUser(null)
  }

  
return (
    <AuthContext.Provider value={{ user, loading, Login, logout , refetch: checkAuth }}>
      {children}
    </AuthContext.Provider>
  )


}
export const useAuth = () => useContext(AuthContext)
export default AuthContext

