import {Link} from "react-router-dom"
import { useAuth } from "../pages/AuthContext"

const Footer = ()=>{
    const {user} = useAuth();
if (user) return null;

return (
<footer className="bg-white border-t border-gray-100">
     <div className="w-full px-8 py-12">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
        <div className="grid-span-2 md:grid-span-1">
            <div className="text-lg text-gray-900 mb-4 font-semibold tracking-tight">
                Job<span className="text-blue-600">Fit</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">AI-powered job matching that tells you exactly how to get hired.</p>
        </div>


        <div className=" grid-span-2 md:grid-span-1">
            
            <p className="text-gray-400 text-sm tracking-wider mb-3  ">PRODUCT</p>
            <div className="flex flex-col gap-2">
             <a href="#features" className="text-gray-600 text-sm  ">Features </a>
              <a href="#how" className="text-gray-600 text-sm  ">How it works</a>
              <Link to= "/register"className="text-gray-600 text-sm  ">
               Get started
                </Link>
           </div>
        </div>

         <div className="grid-span-2 md:grid-span-1 "> 
            <p className="text-gray-400 text-sm tracking-wider mb-3 " >RESOURCES</p>
            <div className="flex flex-col gap-3">
                <a href="#"  className="text-sm text-gray-600">Blog</a>
                <a href="#" className="text-sm text-gray-600">Resume tips</a>
                <a href="#faq" className="text-sm text-gray-600">FAQ</a>
            </div>
         </div>


        <div className="grid-span-2 md:grid-span-1 "> 
            <p className="text-gray-400 text-sm tracking-wider mb-3 " >LEGAL
</p>
            <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-gray-600">Privacy policy</a>
                <a href="#" className="text-sm text-gray-600">Terms of service </a>
                <a href="#" className="text-sm text-gray-600">
Contact</a>
            </div>
         </div>
    </div>
    </div>


    <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 border-t border-gray-200 px-7 py-10">
        <p className="text-xs text-gray-400 ">© {new Date().getFullYear()} JobFit. Built with React, Node.js &amp; Gemini AI.</p>
    <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-400">All systems operational</span>
          </div>
    </div>
</footer>


)
}


export default Footer