import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User, Hash, Building2, Calendar, Briefcase, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import './SignupPage.css'

const SignupPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
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
    year: '',
    teacherId: '',
    department: '',
    company: '',
    expertise: ''
  })

  const branches = ['CSE', 'CSBS', 'IT', 'Mechanical', 'Civil', 'A&R', 'Electrical']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

  const roleTitles = {
    student: 'Student Signup',
    teacher: 'Teacher Signup',
    expert: 'Industry Expert Signup'
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
      navigate(`/login/${role}`)
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
    <div className="signup-page">
      <div className="background-pattern"></div>
      <div className="signup-container glassmorphism neumorphic">
        <button className="back-button" onClick={() => navigate('/role-selection?action=signup')}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="signup-header">
          <h1 className="signup-title">{roleTitles[role] || 'Sign Up'}</h1>
          <p className="signup-subtitle">Create your account to get started</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={18} />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name" // Matches formData.name
              className="form-input neumorphic-inset"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input neumorphic-inset"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Specific Fields (Student) */}
          {role === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="rollNo" className="form-label">
                  <Hash size={18} />
                  Roll Number
                </label>
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  className="form-input neumorphic-inset"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label"><Building2 size={18} /> Branch</label>
                  <select name="branch" className="form-input neumorphic-inset" onChange={handleChange} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label"><Calendar size={18} /> Year</label>
                  <select name="year" className="form-input neumorphic-inset" onChange={handleChange} required>
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Password Fields */}
          <div className="form-group">
            <label className="form-label"><Lock size={18} /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input neumorphic-inset"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Lock size={18} /> Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input neumorphic-inset"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="signup-button glow-effect" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/login/${role}`) }}>Login</a></p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage;