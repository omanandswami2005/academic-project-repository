import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios' // 1. Added Axios Import
import './LoginPage.css'

const LoginPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const roleTitles = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    expert: 'Industry Expert Login'
  }

  // 2. UPDATED HANDLE SUBMIT WITH BACKEND INTEGRATION
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Sending login request to the server with role verification
      const response = await axios.post('http://localhost:5000/login', {
        email: formData.email,
        password: formData.password,
        role: role // Send role for verification
      });

      if (response.status === 200) {
        // Save user data in browser memory so you stay logged in
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        
        alert('Login Successful!');

        // 3. Redirect based on user's actual role from database
        const userRole = userData.role || role; // Fallback to URL param if not in response
        if (userRole === 'student') {
          navigate('/student')
        } else if (userRole === 'teacher') {
          navigate('/teacher/branches')
        } else if (userRole === 'expert') {
          navigate('/expert')
        } else {
          navigate('/role-selection?action=login')
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
      // Show the specific error from the server (e.g., "User does not exist")
      alert(error.response?.data?.message || "Login failed. Check your connection.");
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

          <button type="submit" className="login-button glow-effect">
            Sign In
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