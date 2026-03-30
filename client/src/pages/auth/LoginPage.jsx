import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import './LoginPage.css'

const LoginPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const roleTitles = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    expert: 'Industry Expert Login'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await login(formData.email, formData.password, role)
      toast.success('Login Successful!')

      const userRole = data.user.role || role
      if (userRole === 'student') {
        navigate('/student')
      } else if (userRole === 'teacher') {
        navigate('/teacher/branches')
      } else if (userRole === 'expert') {
        navigate('/expert')
      } else {
        navigate('/home')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <div className="login-page">
      <div className="background-pattern"></div>
      <div className="login-container glassmorphism neumorphic">
        <button className="back-button" onClick={() => navigate('/role-selection?action=login')}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="login-header">
          <h1 className="login-title">{roleTitles[role] || 'Login'}</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email / ID
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className="form-input neumorphic-inset"
              placeholder="Enter your email or ID"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input neumorphic-inset"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-button glow-effect" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/role-selection?action=signup') }}>Sign Up</a></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage