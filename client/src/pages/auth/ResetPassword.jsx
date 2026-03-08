import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import './LoginPage.css'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`http://localhost:5000/reset-password/${token}`, {
        password: formData.password
      })

      if (response.status === 200) {
        setMessage('Password has been reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/role-selection?action=login')
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. The reset link may be invalid or expired.')
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
    <div className="login-page">
      <div className="background-pattern"></div>
      <div className="login-container glassmorphism neumorphic">
        <button className="back-button" onClick={() => navigate('/role-selection?action=login')}>
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="login-header">
          <h1 className="login-title">Reset Password</h1>
          <p className="login-subtitle">Enter your new password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              New Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input neumorphic-inset"
                placeholder="Enter your new password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={18} />
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className="form-input neumorphic-inset"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="message error" style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {message && (
            <div className="message success" style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#efe',
              color: '#3c3',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button glow-effect"
            disabled={loading || !token}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="login-footer">
          <p>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/role-selection?action=login') }}>Sign In</a></p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

