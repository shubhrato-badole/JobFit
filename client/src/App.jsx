import {BrowserRouter, Routes, Route,} from "react-router-dom"
import {AuthProvider, useAuth} from "./pages/AuthContext"
import ProtectedRoute from "./pages/protectedRoutes"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Onboarding from "./pages/Onboarding"
import Dashboard from "./pages/Dashboard"
import JobSearch from "./pages/JobSearch"
import Analysze from "./pages/Analysze"
import Tracker from "./pages/Tracker"
import Profile from "./pages/Profile"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import Saved from "./pages/saved"
import VerifyEmail from "./pages/verifyEmail"
import ResetPassword from "./pages/forgotPassword"




const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
)

const AppRoutes = () =>{
  const auth = useAuth();
  if (!auth) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
const {user} = useAuth();

return(
<Layout>
    <Routes>


      <Route path="/" element={ <Home /> }></Route>
      <Route path="/login" element={ user ? <Dashboard/> : <Login/> }></Route>
      <Route path="/register" element={user ?  <Dashboard/> :<Register/>}></Route>
      <Route path="/forgot-password" element={ <ResetPassword/>}> </Route>
     <Route path="/verify-email" element={ <VerifyEmail/>}> </Route>
      <Route path="/onboarding" element= {<ProtectedRoute> <Onboarding/> </ProtectedRoute> }/>
      <Route path="/Dashboard" element= {<ProtectedRoute> <Dashboard/> </ProtectedRoute> }/>
      <Route path="/Jobs" element= {<ProtectedRoute> <JobSearch/> </ProtectedRoute> }/>
      <Route path="/analyze" element= {<ProtectedRoute> <Analysze/> </ProtectedRoute> }/>
     <Route path="/Tracker" element= {<ProtectedRoute> <Tracker/> </ProtectedRoute> }/>
      <Route path="/Profile" element= {<ProtectedRoute> <Profile/> </ProtectedRoute> }/>
      <Route path="/saved" element= {<ProtectedRoute> <Saved/> </ProtectedRoute> }/>
    </Routes>
    </Layout>
)
}

 

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
)
 


export default App
 