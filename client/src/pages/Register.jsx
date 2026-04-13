import {React ,  useState }from "react"
import { Link,   useNavigate  } from "react-router-dom"
import {useAuth} from "./AuthContext"
import API from "../components/Api"


const Register = () => {

const navigate = useNavigate();
const {Login} = useAuth();
const [user , setUser] = useState({
    name : "",
    email : "",
    password: "",
});
const [error , seterror] = useState();
const [Loading , setLoading] = useState(false);


const handleChange = (e) =>{
   setUser(prev => ({
                ...prev,
                [e.target.name]: e.target.value
            }))
            setServerError('')

}

const handleSubmit = async (e) => {
  e.preventDefault()
        setLoading(true)

try {
    const {data} = await API.post("api/auth/register" , user)
     Login(data.user)
      navigate('/onboarding')
} catch (err){
    // Backend sends specific messages like:
      // "Email already in use"
      // "Password must be at least 8 characters"
      seterror(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
}
}



return (

<div>
    <div>
           <div>
            <p>job <span>fit</span></p>
            <h1>Create your account</h1>
            <p>Start analyzing jobs in under 2 minutes</p>
           </div>

           <div className="bg-white rounded-2xl border border-gray-200 p-7">
 
          {/* Google OAuth */}
          <a
            href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.68 3.68 0 01-1.6 2.42v2h2.59c1.52-1.4 2.38-3.46 2.38-5.88z" fill="#4285F4"/>
              <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.8 4.8 0 01-7.15-2.52H.96v2.07A8 8 0 008 16z" fill="#34A853"/>
              <path d="M3.56 9.54A4.82 4.82 0 013.31 8c0-.54.09-1.06.25-1.54V4.39H.96A8.01 8.01 0 000 8c0 1.3.31 2.52.96 3.61l2.6-2.07z" fill="#FBBC05"/>
              <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.96 4.39l2.6 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
 
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          </div>
 
               {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onClick= {handleSubmit}>
          <div>
            <label > Full name </label>
            <input type="text" 
              name ="name "
             placeholder="job fit"
             onChange={handleChange} 
            />
          </div>
          <div>
           <lable>Email adress</lable>
           <input type="email"
                 name ="email"
                 placeholder="example@gmail.com"
                 onChnage={handleChange}
            />
          </div>
          <div 
          type ="password"
          name = "password"
          placeholder="Minimum 8 character"
          onChnage={handleChange}
          >
          </div>

          <button type="submit">
             {Loading
                            ? <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                                </svg>
                                Logging in...
                            </>
                            : 'Login'
                        }
          </button>
          </form>
        
        <div>
          <p>By creating an account you agree to our 
            <a href="#">Terms</a>   and
           <a href="#"> Privacy Policy</a>  </p>

           <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Login
          </Link>
        </p>
       </div>
    </div>

</div>
)

}

export default Register;