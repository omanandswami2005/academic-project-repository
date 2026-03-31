import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Moon, Sun } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import './LoginPage.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      toast.success('Reset link sent! Check your email.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <button type="button" className="theme-toggle-floating" onClick={toggleTheme} aria-label="Toggle theme">
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="auth-container">
        <button className="auth-back" onClick={() => navigate('/role-selection?action=login')}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={15} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-link">
          <p>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/role-selection?action=login') }}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

