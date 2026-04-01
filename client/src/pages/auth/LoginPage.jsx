import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import './LoginPage.css'

const LoginPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const roleTitles = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    expert: 'Expert Login'
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

  return (
    <div className="auth-page">
      <div className="auth-top-bar">
        <button type="button" className="theme-toggle-nav" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="auth-container">
        <button className="auth-back" onClick={() => navigate('/role-selection?action=login')}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="auth-header">
          <h1>{roleTitles[role] || 'Login'}</h1>
          <p>Enter your credentials to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={15} />
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={15} />
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="forgot-link">
            <button type="button" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </button>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-link">
          <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/signup/${role}`) }}>Sign up</a></p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage