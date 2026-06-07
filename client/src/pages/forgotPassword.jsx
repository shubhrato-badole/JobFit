import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../components/Api"



const ResetPassword = () => {

    const navigate = useNavigate()
    const [searchParam] = useSearchParams()

    const token = searchParam.get("token");


    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newPwd , setNewPwd] = useState('')
    const [confirmPwd , setconfirmPwd] = useState('')
    const [resetPwd , setResetPwd] = useState(false)


    useEffect(() => {
        const verifyToken = async () => {
            if (!token) return
            setStatus('verifying')
            try {
               await API.post(`/api/auth/verify-password?token=${token}`)
                setStatus('verified')
            } catch (err) {
            setError(err.response?.data?.message || 'Verification failed')
            setStatus('idle')

            }
        }
        verifyToken()
    }, [token])


    const handleEmail = async (e) => {
         e.preventDefault();

        if (!email) {
            setError('Email not found. Please register again.');
            return;
        }
            setLoading(true)

        try {
            await API.post('/api/auth/forgot-password', { email: email })
            setStatus('sent')
            setError('')
        } catch(err) {
            setError(err.response?.data?.error || 'Failed to resend. Try again.')
        }finally {
           setLoading(false);
}
    }


const handleResetPwd = async (e) =>{
     e.preventDefault();
   
    if(!newPwd || !confirmPwd){
     setError('Both password fields are required')
     return;
    } 
     if( newPwd !== confirmPwd){
        setError('Passwords must match')  
          return;
     }  

     setLoading(true)
     setError('')

     try{
       await API.post("/api/auth/reset-password" ,{ newPassword:newPwd , token:token})
    setResetPwd(true)
       setTimeout(() => {
       navigate("/login")
        }, 2000)
     }catch(err){
    setError(err.response?.data?.error || 'Failed to resend. Try again.')

     }finally {
  setLoading(false);
}

}



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

            <Link to="/" className="text-lg text-gray-900 font-semibold tracking-tight mb-8">Job<span className="text-blue-600">Fit</span></Link>



            {status === 'idle' &&
                <div className="w-full max-w-sm">
                    <div className="text-center mb-7">
                        <h1 className="text-xl font-semibold text-gray-900 mb-1">Forgot your password?</h1>
                        <p className="text-sm text-gray-500">Enter your email and we'll send you a reset link.</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-7">

                        {error && (
                            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleEmail} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                                    placeholder="Example@email.com"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                                        </svg>
                                        Sending...
                                    </>
                                    : 'Send reset link'
                                }
                            </button>
                        </form>
                    </div>

                    <p className="text-sm text-gray-500 text-center mt-5">
                        Remember your password?{' '}
                        <Link to="/login" className="text-gray-900 font-medium hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            }



            {status === 'sent' &&
                <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-7 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                            <path d="M3 7l10 7 10-7M3 7v14a1 1 0 001 1h18a1 1 0 001-1V7M3 7a1 1 0 011-1h18a1 1 0 011 1"
                                stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className="text-base font-semibold text-gray-900 mb-2">Check your email</h1>
                    <p className="text-sm text-gray-500 mb-1">We sent a reset link to</p>
                    <p className="text-sm font-semibold text-gray-900 mb-5">{email}</p>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5 text-left">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            The link expires in <span className="font-medium text-gray-700">1 hour</span>.
                            Check your spam folder if you don't see it.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="block w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium text-center rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Back to login
                    </Link>
                    <button
                    type="button"
                        onClick={() => { setStatus('idle'); setEmail('') }}
                        className="w-full py-2 text-gray-400 text-xs mt-2 hover:text-gray-600 transition-colors"
                    >
                        Try a different email
                    </button>
                </div>

            }



            {status === 'verifying' &&
                <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="animate-spin w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#dbeafe" strokeWidth="3" />
                            <path d="M12 2a10 10 0 0110 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h1 className="text-base font-semibold text-gray-900 mb-2">Verifying your email</h1>
                    <p className="text-sm text-gray-500">Just a moment...</p>

                </div>
            }


            {status === 'verified' &&

                <div className="w-full max-w-sm">
                    <div className="text-center mb-7">
                    <h1 className="text-gray font-semibold text-xl mb-1">Set new password</h1>
                    <p className="text-gray-500 text-sm"> Choose a strong password for your account.</p>
                     </div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-7 ">
                      <form onSubmit={ handleResetPwd }>
                        <div className="mb-4">
                         <label className="block text-xs font-medium text-gray-700 mb-1.5">New password</label>
                        <input 
                        onChange={(e) => {setNewPwd(e.target.value) , setError('')}}
                        type="password" 
                        placeholder="Minimum 8 characters" 
                        minLength={8}
                         required
                        value={newPwd}
                        className="w-full px-3 py-2.5
                         border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none"/> 
                        </div>
                         <div className="mb-5">
                     <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm new password</label>
                        <input type="password" 
                        onChange={(e) => {setconfirmPwd(e.target.value) , setError('')}}
                        placeholder="Repeat your new password" 
                        value={confirmPwd}
                        className="w-full px-3 py-2.5
                         border border-gray-200 rounded-xl text-sm placeholder-gray-400 outline-none"/>                        
                        </div>

                          {error &&  
                          <div className="text-sm text-red-500 font-semibold px-3 py-2 
                          rounded-lg border border-red-200 bg-red-50 mb-3 text-center">
                          {error}
                          </div> }
                          
                          {resetPwd ? (
                    <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 text-left">
                      ✓ Password reset successful — you can now log in with your new password.
                    </div>
                    ) : null}
                     

                       {!resetPwd ?  (            
                       <button type="submit"
                       disabled={loading}
                        className=" w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors 
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                        justify-center gap-2"> {loading ? 'Resetting password...' : 'Reset password' }
                        </button>
                       ) : (<Link to={"/login"}className=" w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"> 

                              Login
                            </Link>
                       ) }
                      </form>
                     
                    </div>
                </div>}


               

        </div>
    )
}



export default ResetPassword;