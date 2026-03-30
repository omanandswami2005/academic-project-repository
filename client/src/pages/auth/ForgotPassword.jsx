import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import './LoginPage.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await authAPI.forgotPassword(email)
      setMessage(response.data.message || 'If an account with that email exists, a password reset link has been sent.')
      toast.success('Reset link sent! Check your email.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred. Please try again.')
      toast.error(error.response?.data?.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="login-title">Forgot Password</h1>
          <p className="login-subtitle">Enter your email address and we'll send you a link to reset your password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input neumorphic-inset"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className={`message ${message.includes('error') || message.includes('Error') ? 'error' : 'success'}`} style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: message.includes('error') || message.includes('Error') ? '#fee' : '#efe',
              color: message.includes('error') || message.includes('Error') ? '#c33' : '#3c3',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-button glow-effect"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="login-footer">
          <p>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/role-selection?action=login') }}>Sign In</a></p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

