
import { Link , useLocation, useNavigate} from "react-router-dom"
import { useState , useRef, useEffect } from "react"
import {useAuth} from "../pages/AuthContext"



const Navebar = ()=>{
const {logout , user} = useAuth()
const navigate = useNavigate();
const location = useLocation();
const [open , setopen] = useState(false)
 const menuRef = useRef(null)

const Activelocation = (path) => location.pathname.startsWith(path)
const pathname = location.pathname;



const HandleLogout = async () =>{
    await logout();
    navigate("/")

}


const handleProfileClick=() => {
        navigate("/profile")
        setopen(false)
      }

useEffect(()=>{
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
        setopen(false)
      }
    }
      document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  
} , [])



  const appLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/jobs', label: 'Job search' },
    { path: '/analyze', label: 'Analyze' },
    { path: '/tracker', label: 'Tracker' },
    { path: '/saved', label: 'Saved' },
  ]



  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';




if (user){
    return(
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
<div className="w-full h-16 flex  items-center px-8 gap-4">
   <Link to= "/" className="text-gray-900 text-xl font-semibold">Job<span 
   className="text-blue-600">Fit </span>
   </Link>

<div className="flex items-center gap-2 flex-1">
   {appLinks.map(link => (
    <Link 
    key={link.path} 
    to = {link.path}
    className={`px-4 py-2 rounded-lg text-sm ${
                  Activelocation(link.path)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
    >{link.label}</Link>

   ))
   }
   </div>

   <div className="flex items-center gap-3">
    <div className="relative" ref={menuRef} 
            >
    <button 
     type="button"
    onClick={()=> setopen(prev => !prev)} className={`text-sm text-gray-600 font-semibold bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200  `}>{initials}</button>
      
     
      {open &&     <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
        <button 
        type="button"
        onClick={handleProfileClick} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition ease-out duration-100
              ${
    open
      ? "opacity-100 scale-100"
      : "opacity-0 scale-95 pointer-events-none"
  }`} >Profile</button>    </div>
}
      </div>


 <button type="button"
              onClick={HandleLogout}
              className="px-4 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded-full"
            >
              Logout
            </button>
   </div>
</div>
</nav>
   ) 
}

return (

    <nav className="sticky flex top-0 z-50 bg-white border-b border-gray-200">
   <div className=" w-full flex items-center px-10 h-20 gap-6">
    <Link to="/" className="text-gray-900 text-xl font-semibold">Job<span className="text-blue-600">Fit</span></Link>
   <div className="flex items-center gap-6 flex-1">
<div className="flex items-center gap-6 flex-1">
          <a href= { pathname === "/login"? "/" : "#how"} className="text-sm text-gray-500 hover:text-gray-900">
            How it works
          </a>
          
          <a href={ pathname === "/login"? "/" :"#features"} className="text-sm text-gray-500 hover:text-gray-900">
            Features
          </a>
        
          <a href={ pathname === "/login"? "/" :"#faq" }className="text-sm text-gray-500 hover:text-gray-900">
            FAQ
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 border border-gray-200 text-sm text-gray-700 rounded-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg"
          >
            Get started
          </Link>
        </div>

   </div>
   </div>
    </nav>
)
}
export default Navebar