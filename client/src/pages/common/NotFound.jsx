import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, ArrowLeft } from 'lucide-react'

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
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <div style={{
                fontSize: '7rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #4169E1, #6c63ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
            }}>
                404
            </div>
            <h1 style={{ fontSize: '1.75rem', color: '#1e293b', margin: 0 }}>
                Page Not Found
            </h1>
            <p style={{ color: '#64748b', maxWidth: '360px', margin: 0 }}>
                The page you're looking for doesn't exist or you don't have access to it.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', borderRadius: '10px',
                        border: '2px solid #4169E1', background: 'transparent',
                        color: '#4169E1', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
                    }}
                >
                    <ArrowLeft size={18} /> Go Back
                </button>
                <button
                    onClick={goHome}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', borderRadius: '10px',
                        border: 'none', background: 'linear-gradient(135deg, #4169E1, #6c63ff)',
                        color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem',
                    }}
                >
                    <Home size={18} /> Go Home
                </button>
            </div>
        </div>
    )
}

export default NotFound
