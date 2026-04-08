import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import './LoginPage.css'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    try {
      await authAPI.resetPassword(token, formData.password)
      toast.success('Password reset successful! Redirecting...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may be invalid or expired.')
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
        <button className="auth-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={15} />
              New Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={15} />
              Confirm Password
            </label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-link">
          <p>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

