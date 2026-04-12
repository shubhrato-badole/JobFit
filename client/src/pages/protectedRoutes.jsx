import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Children } from 'react';

const ProtectedRoute = ({children}) =>{
    const {user , loading} = useAuth();

    if (loading) {
        return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
    }
    
    return user ? Children : <Navigate to="/login" replace />
}

export default ProtectedRoute