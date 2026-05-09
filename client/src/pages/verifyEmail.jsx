import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../components/Api"
import { useLocation } from 'react-router-dom';
import { useAuth } from "./AuthContext";


const VerifyEmail = () => {

  const location = useLocation();
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()


  const token = searchParams.get('token')
  const { refetch } = useAuth();


  //
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(0)


  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);




  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])



  useEffect(() => {

    const verifyToken = async () => {
      if (!token) {
        setStatus('idle')
        return

      }
      setStatus('verifying')
      try {
        const { data } = await API.post(`/api/auth/verify-email?token=${token}`)
        if (data.verified) {
        setTimeout(() => refetch(), 500);
        }
        setStatus('success')
      }
      catch (err) {
        setError(err.response?.data?.message || 'Verification failed')
        setStatus('idle')
      }
    }
    verifyToken()
  }, [token , refetch])




  const handleResend = async () => {

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setResending(true)
    setError('')
    setResent(false)
    try {


      await API.post('/api/auth/resend-verification', { email: email })
      setResent(true)
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend. Try again.')
    } finally {
      setResending(false)
    }

  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      <Link to="/" className="text-lg text-gray-900 font-semibold tracking-tight mb-8">Job<span className="text-blue-600">Fit</span></Link>





      {status === 'idle' &&
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-7 text-center">

          {/* Envelope icon with pulse dot */}
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M3 7l10 7 10-7M3 7v14a1 1 0 001 1h18a1 1 0 001-1V7M3 7a1 1 0 011-1h18a1 1 0 011 1"
                  stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </span>
          </div>

          <h1 className="text-base font-semibold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-1">We sent a verification link to</p>
          <p className="text-sm font-semibold text-gray-900 mb-5">{email ? email : "your registered email"}</p>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-left">
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                <circle cx="7" cy="7" r="6" stroke="#3b82f6" strokeWidth="1" />
                <path d="M7 4.5v3M7 9v.5" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                Click the link in the email to activate your account. The link expires in 24 hours.
              </p>
            </div>
          </div>



          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-left">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-400 mb-4">
            Didn't get it? Check your spam folder first.
          </p>

          <button
            onClick={() =>  setStatus('resend') }
            disabled={resending || countdown > 0}
            className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >


            Resend verification email

          </button>

          <button
            onClick={() => navigate('/register')}
            className="w-full py-2 text-gray-400 text-xs hover:text-gray-600 transition-colors"
          >
            Wrong email? Go back to register
          </button>

        </div>

      }




      {status === 'success' &&
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 13l6 6 10-10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900 mb-2">Email verified!</h1>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Your account is now active. Let's get started by uploading your resume.
          </p>
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5 text-left">
            <div className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="#16a34a" strokeWidth="1" />
                <path d="M4 6.5l2 2 3.5-3.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-green-700 font-medium">{email || 'your email'} verified successfully</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Go to dashboard →
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




      {status === 'resend' && (
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 text-center">

          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M3 7l10 7 10-7M3 7v12a1 1 0 001 1h18a1 1 0 001-1V7M3 7a1 1 0 011-1h18a1 1 0 011 1" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="19" cy="19" r="6" fill="#16a34a" />
              <path d="M3 7l10 7 10-7M3 7v12a1 1 0 001 1h18a1 1 0 001-1V7M3 7a1 1 0 011-1h18a1 1 0 011 1" 
                 stroke="#3b82f6" 
                 strokeWidth="1.5" 
                 strokeLinecap="round" 
                />
            </svg>
          </div>

          <h1 className="text-base font-semibold text-gray-900 mb-2">Email sent again</h1>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            A new verification link has been sent to your email.
          </p>

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-left">
            <p className="text-xs text-amber-700 leading-relaxed">
              💡 Still not seeing it? Check your spam or junk folder and mark it as "not spam."
            </p>
          </div>

          <form onSubmit={handleResend}>

            <div className="mb-4">
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


            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-left">
                {error}
              </div>
            )}

            {resent ? (
              <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 text-left">
                ✓ Verification email sent — check your inbox
              </div>
            ) : null}

            <button
              type="submit"
              disabled={resending || countdown > 0}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Send verification email'}
            </button>
          </form>
          <p className="text-xs text-gray-400">
            Didn't get it? Check your spam folder first.
          </p>
        </div>
      )}

    </div>
  )







}

export default VerifyEmail