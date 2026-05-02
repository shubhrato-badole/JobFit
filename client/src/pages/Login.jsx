import React from "react"
import { useState  } from "react"
import { Link , useNavigate, useLocation} from "react-router-dom";
import { useAuth } from './AuthContext'
import axios  from 'axios'
import API from "../components/Api"


const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { Login } = useAuth();

    const [Form, setForm] = useState({
        email: "",
        password: "",

    })
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const from = location.state?.from?.pathname || '/dashboard'


    const handleChange = (e) => {

        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
        setServerError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await API.post("/api/auth/login", Form)
            Login(data.user)
            navigate(from)
        } catch (err) {
            setServerError(
                err.response?.data?.error || 'Login failed. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

const handleGoogleLogin = () => {
  window.location.href = "http://localhost:3000/api/auth/google"
}



return(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className=" w-full max-w-sm  ">
            <div className="text-center mb-5">
                <p className="text-xl text-gray-900 font-semibold tracking-tight">Job<span className="text-blue-600">Fit</span></p>
                <h1 className="text-xl font-semibold text-gray-900 mt-2 mb-1 ">welcome back </h1>
                <p  className="text-sm text-gray-600"> Login to continue your job search</p>
            </div>

        <div  className="bg-white rounded-2xl border border-gray-200 p-7">
 
            <button
            onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-5"
            >
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.68 3.68 0 01-1.6 2.42v2h2.59c1.52-1.4 2.38-3.46 2.38-5.88z" fill="#4285F4" />
                    <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.8 4.8 0 01-7.15-2.52H.96v2.07A8 8 0 008 16z" fill="#34A853" />
                    <path d="M3.56 9.54A4.82 4.82 0 013.31 8c0-.54.09-1.06.25-1.54V4.39H.96A8.01 8.01 0 000 8c0 1.3.31 2.52.96 3.61l2.6-2.07z" fill="#FBBC05" />
                    <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.96 4.39l2.6 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335" />
                </svg>
                Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            {serverError && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                    {serverError}
                </div>
            )}
    

           
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" >Email address</label>
                     
                        <input type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            value={Form.email}
                            onChange={handleChange} 
                             className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                             />
                            

                    </div>
                    <div  className="flex  items-center justify-between ">
                        <label className="text-sm font-medium text-gray-700">password</label>
                       <a href="#"  className="text-end text-sm text-blue-600 hover:underline">Forgot password </a>
                       </div>
                        <input type="password"
                            name="password"
                            placeholder="password"
                            value={Form.password}
                            onChange={handleChange} 
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                            />

                   
                    <button type="submit" className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" >

                        {loading
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
                        </div>
            
            <p className="text-sm text-gray-500 text-center mt-4">Don't have an account? {''}  <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Create one free
            </Link>
            </p>
        </div>
    </div>
)
}


export default Login;