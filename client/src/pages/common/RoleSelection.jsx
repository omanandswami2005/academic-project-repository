import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, User, Briefcase, ArrowLeft } from 'lucide-react'
import './RoleSelection.css'

const RoleSelection = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || 'login'

  const roleCards = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Upload projects, track progress, and receive feedback',
      color: '#4169E1'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      icon: User,
      description: 'Manage projects, review submissions, and provide guidance',
      color: '#4169E1'
    },
    {
      id: 'expert',
      title: 'Industry Expert',
      icon: Briefcase,
      description: 'View and evaluate student projects across all branches',
      color: '#4169E1'
    }
  ]

  const handleRoleSelect = (roleId) => {
    if (action === 'signup') {
      navigate(`/signup/${roleId}`)
    } else {
      navigate(`/login/${roleId}`)
    }
  }

  return (
    <div className="role-selection-page">
      <div className="background-pattern"></div>
      <div className="role-selection-container glassmorphism neumorphic">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="role-selection-header">
          <h1 className="role-selection-title">
            {action === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="role-selection-subtitle">
            {action === 'signup' 
              ? 'Select your role to get started' 
              : 'Select your role to continue'}
          </p>
        </div>

        <div className="role-cards-container">
          {roleCards.map((role, index) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                className="role-card glow-effect neumorphic"
                onClick={() => handleRoleSelect(role.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="role-card-icon" style={{ color: role.color }}>
                  <Icon size={48} />
                </div>
                <h2 className="role-card-title">{role.title}</h2>
                <p className="role-card-description">{role.description}</p>
                <div className="role-card-arrow">→</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RoleSelection

