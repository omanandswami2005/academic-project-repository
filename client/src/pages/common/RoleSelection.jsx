import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, User, Briefcase, ArrowLeft, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './RoleSelection.css'

const RoleSelection = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isDark, toggleTheme } = useTheme()
  const action = searchParams.get('action') || 'login'

  const roleCards = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Upload projects, track progress, and receive feedback'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      icon: User,
      description: 'Manage projects, review submissions, and provide guidance'
    },
    {
      id: 'expert',
      title: 'Industry Expert',
      icon: Briefcase,
      description: 'View and evaluate student projects across all branches'
    }
  ]

  const handleRoleSelect = (roleId) => {
    if (action === 'signup') {
      navigate(`/signup/${roleId}`)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="selection-page">
      <div className="auth-top-bar">
        <button type="button" className="theme-toggle-nav" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="selection-container">
        <button className="selection-back" onClick={() => navigate('/')}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="selection-header">
          <h1>{action === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p>{action === 'signup' ? 'Select your role to get started' : 'Select your role to continue'}</p>
        </div>

        <div className="selection-grid">
          {roleCards.map((role) => {
            const Icon = role.icon
            return (
              <button
                key={role.id}
                className="selection-card"
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="selection-card-icon">
                  <Icon size={32} />
                </div>
                <h2>{role.title}</h2>
                <p>{role.description}</p>
                <span className="selection-card-arrow">&rarr;</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection

