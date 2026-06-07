
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "../pages/AuthContext"



const Navbar = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate();
  const location = useLocation();
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const desktopMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const [mobileMenu, setMobileMenu] = useState(false)


  const Activelocation = (path) => location.pathname.startsWith(path)
  const pathname = location.pathname;



  const HandleLogout = async () => {
    await logout();
    navigate("/")

  }


  const handleProfileClick = () => {
    navigate("/profile")
    setDesktopOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target)) {
        setDesktopOpen(false)
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileOpen(false)
      }

    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])



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




  if (user) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 overflow-visible">
        <div className="w-full h-16 flex  items-center px-4 md:px-8 gap-4 overflow-visible">
          <Link to="/" className="text-gray-900 text-xl font-semibold">Job<span
            className="text-blue-600">Fit </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 flex-1">
            {appLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm ${Activelocation(link.path)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >{link.label}</Link>

            ))
            }
          </div>
          
          <div>

              <Link
                to="/admin/stats"
                className={`px-4 py-2 rounded-lg text-sm border border-gray-300 bg-gray-100 ${Activelocation("/admin/stats")
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >Admin</Link>
            
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative" ref={desktopMenuRef}
            >
              <button
                type="button"
                onClick={() => setDesktopOpen(prev => !prev)} className={`text-sm text-gray-600 font-semibold bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200  `}>{initials}</button>


              {desktopOpen && <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                <button
                  type="button"
                  onClick={handleProfileClick} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition ease-out duration-100
              ${desktopOpen
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


          <div className="md:hidden ml-auto flex items-center gap-4">
            <div className="relative" ref={mobileMenuRef} >
              <button
                type="button"
                onClick={() => setMobileOpen(prev => !prev)}
                className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center"
              >
                {initials}
              </button>
              {mobileOpen && (<div
                className={`absolute right-0 top-12 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top-left ${mobileOpen
                    ? "opacity-100 scale-100 visible"
                    : "opacity-0 scale-95 invisible"
                  }`}
              >

                <button
                  type="button"
                  onClick={() => {
                    handleProfileClick()
                    setMobileOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </button>

              </div>)}

            </div>


            <button
              onClick={() => setMobileMenu(prev => !prev)}
              className="md:hidden text-2xl "
            >
              ☰
            </button>
          </div>



        </div>
        {mobileMenu && (

          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">

            {appLinks.map(link => (

              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenu(false)}
                className={`block px-4 py-3 rounded-lg text-sm ${Activelocation(link.path)
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </Link>

            ))}

            <button
              type="button"
              onClick={HandleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-100 rounded-lg"
            >
              Logout
            </button>

          </div>

        )}

      </nav>
    )
  }

  return (

    <nav className="sticky flex top-0 z-50 bg-white border-b border-gray-200">
      <div className=" w-full flex items-center justify-between md:justify-start px-4 md:px-10 h-20 gap-6">
        <Link to="/" className="text-gray-900 text-xl font-semibold">Job<span className="text-blue-600">Fit</span></Link>
        <div className="hidden md:flex  items-center gap-6 flex-1">
          <div className="hidden md:flex  items-center gap-6 flex-1">
            <a href={pathname === "/login" ? "/" : "#how"} className="text-sm text-gray-500 hover:text-gray-900">
              How it works
            </a>

            <a href={pathname === "/login" ? "/" : "#features"} className="text-sm text-gray-500 hover:text-gray-900">
              Features
            </a>

            <a href={pathname === "/login" ? "/" : "#faq"} className="text-sm text-gray-500 hover:text-gray-900">
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
        <button
          onClick={() => setMobileMenu(prev => !prev)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>
      {mobileMenu && (

        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">

          <div className="flex flex-col px-6 py-6 space-y-5">
            <a href="#how" className=" text-base font-medium text-gray-700 hover:text-black transition">
              How it works
            </a>

            <a href="#features" className=" text-base font-medium text-gray-700 hover:text-black transition">
              Features
            </a>

            <a href="#faq" className=" text-base font-medium text-gray-700 hover:text-black transition">
              FAQ
            </a>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                className="w-full text-center border 
             border-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="w-full text-center border border-gray-300 py-3
               rounded-xl text-sm font-medium hover:bg-gray-100 transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>

      )}
    </nav>
  )
}

export default Navbar