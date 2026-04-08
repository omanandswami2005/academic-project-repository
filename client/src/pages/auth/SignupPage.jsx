import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User, Hash, Building2, Calendar, Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { authAPI } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import './SignupPage.css'

const SignupPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    branch: '',
    year: ''
  })

  const branches = ['CSE', 'CSBS', 'IT', 'Mechanical', 'Civil', 'A&R', 'Electrical']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

  const roleTitles = {
    student: 'Student Signup',
    teacher: 'Teacher Signup',
    expert: 'Expert Signup'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        branch: formData.branch || undefined,
        prn: formData.rollNo || undefined,
        year: formData.year || undefined,
      }

      await authAPI.signup(dataToSend)
      toast.success('Account created successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error signing up. Please try again.')
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

      <div className="auth-container signup">
        <button className="auth-back" onClick={() => navigate('/role-selection?action=signup')}>
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="auth-header">
          <h1>{roleTitles[role] || 'Sign Up'}</h1>
          <p>Create your account to get started</p>
        </div>

        <form className="auth-form signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={15} />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={15} />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {role === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="rollNo" className="form-label">
                  <Hash size={15} />
                  Roll Number / PRN
                </label>
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  className="form-input"
                  placeholder="Enter your roll number"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><Building2 size={15} /> Branch</label>
                  <select name="branch" className="form-input" onChange={handleChange} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={15} /> Year</label>
                  <select name="year" className="form-input" onChange={handleChange} required>
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label"><Lock size={15} /> Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
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
            <label className="form-label"><Lock size={15} /> Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
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

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Sign in</a></p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage