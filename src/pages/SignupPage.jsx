import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User, Hash, Building2, Calendar, Briefcase, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'; // 1. Added Axios Import
import './SignupPage.css'

const SignupPage = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', // This will be sent as 'username' to your server
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

  // 2. UPDATED HANDLE SUBMIT WITH AXIOS
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    try {
      // We map 'name' from your form to 'username' which your server expects
      const dataToSend = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: role, // Good practice to send the role too
        branch: formData.branch || null, // Include branch for students
      };

      const response = await axios.post('http://localhost:5000/signup', dataToSend);

      if (response.status === 201 || response.status === 200) {
        alert('Account created successfully!');
        navigate(`/login/${role}`);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.response?.data?.message || "Error signing up. Is the server running?");
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

          <button type="submit" className="signup-button glow-effect">
            Create Account
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