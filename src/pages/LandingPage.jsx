import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Users, TrendingUp, FileCheck } from 'lucide-react'
import './LandingPage.css'

const LandingPage = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/role-selection?action=login')
  }

  const handleSignUp = () => {
    navigate('/role-selection?action=signup')
  }

  return (
    <div className="landing-page">
      <div className="background-pattern"></div>
      <div className="landing-container">
        <div className="landing-header fade-in">
          <div className="logo-container">
            <div className="logo-icon">
              <Users size={48} />
            </div>
            <h1 className="landing-title">RSCOE</h1>
          </div>
          <p className="landing-tagline">Centralized Student Project Monitoring System</p>
        </div>

        <div className="illustration-container fade-in">
          <div className="illustration">
            <div className="illustration-item">
              <FileCheck size={64} />
            </div>
            <div className="illustration-item">
              <TrendingUp size={64} />
            </div>
            <div className="illustration-item">
              <Users size={64} />
            </div>
          </div>
        </div>
        
        <div className="auth-buttons-container fade-in">
          <button 
            className="auth-button login-button glow-effect neumorphic"
            onClick={handleLogin}
          >
            <LogIn size={24} />
            <span>Login</span>
          </button>
          <button 
            className="auth-button signup-button glow-effect neumorphic"
            onClick={handleSignUp}
          >
            <UserPlus size={24} />
            <span>Sign Up</span>
          </button>
        </div>
        
        <div className="landing-footer fade-in">
          <p>Rajarshi Shahu College of Engineering</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
