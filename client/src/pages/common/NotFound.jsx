import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, ArrowLeft } from 'lucide-react'
import './SupportPages.css'

const roleHome = {
    student: '/student',
    teacher: '/teacher',
    expert: '/expert',
    admin: '/home',
}

const NotFound = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const goHome = () => {
        if (user) {
            navigate(roleHome[user.role] || '/home')
        } else {
            navigate('/')
        }
    }

    return (
        <div className="not-found-page">
            <div className="not-found-code">404</div>
            <h1>Page Not Found</h1>
            <p>The page you're looking for doesn't exist or you don't have access to it.</p>
            <div className="not-found-actions">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Go Back
                </button>
                <button className="btn btn-primary" onClick={goHome}>
                    <Home size={18} /> Go Home
                </button>
            </div>
        </div>
    )
}

export default NotFound
