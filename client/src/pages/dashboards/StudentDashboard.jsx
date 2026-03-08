import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Upload,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  TrendingUp,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Folder,
  CheckSquare,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  User,
  Mail,
  Phone,
  School,
  BookOpen,
  ExternalLink,
  Star,
  Edit,
  Save,
  X
} from 'lucide-react'
import './StudentDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'

const summaryInfo = {
  title: 'Smart Lab Automation Platform',
  guide: 'Dr. Rekha Jadhav',
  domain: 'IoT • Web App',
  status: 'In Review',
  statusTone: 'review',
  completion: 68,
  description: 'Unified dashboard that automates lab slot booking, device control and live analytics.'
}

const initialTasks = [
  { id: 't1', title: 'Literature Review', due: 'Feb 04', priority: 'High' },
  { id: 't2', title: 'Problem Statement', due: 'Feb 06', priority: 'High' },
  { id: 't3', title: 'Methodology', due: 'Feb 10', priority: 'Medium' },
  { id: 't4', title: 'Implementation', due: 'Mar 05', priority: 'Medium' },
  { id: 't5', title: 'Testing', due: 'Mar 18', priority: 'Medium' },
  { id: 't6', title: 'Final Report', due: 'Apr 05', priority: 'High' },
  { id: 't7', title: 'PPT Preparation', due: 'Apr 08', priority: 'Low' }
]

const documentLibrary = [
  { id: 'd1', label: 'Synopsis (PDF)', status: 'Uploaded', updated: 'Jan 15', type: 'pdf' },
  { id: 'd2', label: 'SRS Document', status: 'Uploaded', updated: 'Jan 29', type: 'doc' },
  { id: 'd3', label: 'Final Report', status: 'Pending', updated: null, type: 'doc' },
  { id: 'd4', label: 'Research Papers', status: 'Shared', updated: 'Jan 22', type: 'pdf' },
  { id: 'd5', label: 'Presentation Deck', status: 'Draft', updated: 'Feb 01', type: 'ppt' },
  { id: 'd6', label: 'Code Bundle', status: 'Uploaded', updated: 'Jan 31', type: 'zip' },
  { id: 'd7', label: 'Screenshots', status: 'Uploaded', updated: 'Jan 30', type: 'img' }
]

const progressMilestones = [
  { id: 'm1', label: 'Topic Approval', status: 'completed', date: 'Jan 02' },
  { id: 'm2', label: 'Synopsis', status: 'completed', date: 'Jan 18' },
  { id: 'm3', label: 'Mid-term Review', status: 'current', date: 'Feb 12' },
  { id: 'm4', label: 'Implementation', status: 'upcoming', date: 'Mar 08' },
  { id: 'm5', label: 'Final Submission', status: 'upcoming', date: 'Apr 10' }
]

const activityFeed = [
  { id: 'a1', text: 'Uploaded SRS v2 document', time: '2 hours ago' },
  { id: 'a2', text: 'Marked Methodology task as complete', time: 'Yesterday' },
  { id: 'a3', text: 'Received guide feedback on API design', time: 'Jan 30' }
]

const feedbackThread = [
  {
    id: 'c1',
    author: 'Dr. Rekha Jadhav',
    role: 'Guide',
    timestamp: 'Jan 28 • 09:45 AM',
    message: 'Add fallback routine for manual override when sensors go offline.'
  },
  {
    id: 'c2',
    author: 'Aarav Patil',
    role: 'Student',
    timestamp: 'Jan 28 • 01:05 PM',
    message: 'Working on a watchdog script; will attach logs with next commit.'
  },
  {
    id: 'c3',
    author: 'Dr. Rekha Jadhav',
    role: 'Guide',
    timestamp: 'Jan 29 • 10:20 AM',
    message: 'Great. Please share a short video of the updated workflow by Friday.'
  }
]

const analyticsSnapshot = [
  { id: 'an1', label: 'Task completion', value: 72, unit: '% complete', icon: CheckSquare },
  { id: 'an2', label: 'Docs uploaded', value: 6, unit: '/ 9 required', icon: Folder },
  { id: 'an3', label: 'Weekly progress', value: 12, unit: '+12% vs last week', icon: BarChart3 },
  { id: 'an4', label: 'Pending items', value: 3, unit: 'tasks to finish', icon: PieChart }
]

const profileInfo = {
  name: 'Aarav Patil',
  email: 'aarav.patil@rscoe.edu',
  phone: '+91 98765 43210',
  branch: 'Computer Science',
  year: 'Final Year',
  bio: 'IoT enthusiast building automation suites for smarter labs.'
}

const skillResources = [
  {
    id: 's1',
    skill: 'Data Structures & Algorithms (DSA)',
    channel: 'CodeHelp',
    link: 'https://www.youtube.com/@CodeHelp',
    description: 'Comprehensive DSA tutorials and problem-solving strategies'
  },
  {
    id: 's2',
    skill: 'Web Development',
    channel: 'Traversy Media',
    link: 'https://www.youtube.com/@TraversyMedia',
    description: 'Full-stack web development tutorials and projects'
  },
  {
    id: 's3',
    skill: 'Machine Learning',
    channel: '3Blue1Brown',
    link: 'https://www.youtube.com/@3blue1brown',
    description: 'Visual explanations of machine learning concepts'
  },
  {
    id: 's4',
    skill: 'React.js',
    channel: 'Code with Harry',
    link: 'https://www.youtube.com/@CodeWithHarry',
    description: 'React.js tutorials and modern web development'
  },
  {
    id: 's5',
    skill: 'Python Programming',
    channel: 'Corey Schafer',
    link: 'https://www.youtube.com/@coreyms',
    description: 'Python programming tutorials and best practices'
  },
  {
    id: 's6',
    skill: 'System Design',
    channel: 'Gaurav Sen',
    link: 'https://www.youtube.com/@gkcs',
    description: 'System design interviews and architecture patterns'
  },
  {
    id: 's7',
    skill: 'JavaScript',
    channel: 'Akshay Saini',
    link: 'https://www.youtube.com/@akshaymarch7',
    description: 'JavaScript fundamentals and advanced concepts'
  },
  {
    id: 's8',
    skill: 'DevOps',
    channel: 'Kunal Kushwaha',
    link: 'https://www.youtube.com/@kunalkushwaha',
    description: 'DevOps, cloud computing, and open source contributions'
  }
]

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')
  const [completion, setCompletion] = useState(summaryInfo.completion)
  const [notes, setNotes] = useState('')
  const [taskState, setTaskState] = useState(() =>
    initialTasks.reduce((acc, task) => {
      acc[task.id] = task.id === 't1' || task.id === 't2'
      return acc
    }, {})
  )

  // Project upload state
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [myProjects, setMyProjects] = useState([])
  const [user, setUser] = useState(null)
  const [editingPhase, setEditingPhase] = useState(null)
  const [phaseDescription, setPhaseDescription] = useState('')

  const completedTasks = initialTasks.filter(task => taskState[task.id]).length

  // Get user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchMyProjects(parsedUser.id)
    }
  }, [])

  // Fetch student's projects
  const fetchMyProjects = async (studentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/student/${studentId}`)
      if (response.data.projects) {
        setMyProjects(response.data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleTaskToggle = (taskId) => {
    setTaskState(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleLogout = () => navigate('/')

  const handleFileUpload = (label) => {
    alert(`Upload flow for ${label} would trigger here.`)
  }

  const handleProgressUpdate = () => {
    alert(`Progress updated to ${completion}%`)
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  // Handle project form submission
  const handleProjectSubmit = async (e) => {
    e.preventDefault()

    if (!projectForm.projectName || !projectForm.description) {
      alert('Please fill in all required fields')
      return
    }

    if (!user) {
      alert('User information not found. Please login again.')
      navigate('/')
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('studentId', user.id)
      formData.append('studentName', user.username)
      formData.append('studentEmail', user.email)
      formData.append('projectName', projectForm.projectName)
      formData.append('description', projectForm.description)

      // Append all selected files
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const response = await axios.post('http://localhost:5000/api/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.status === 201) {
        setUploadSuccess(true)
        setProjectForm({ projectName: '', description: '' })
        setSelectedFiles([])
        // Reset file input
        const fileInput = document.getElementById('project-files')
        if (fileInput) fileInput.value = ''

        // Refresh projects list
        fetchMyProjects(user.id)

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload project. Please try again.'
      alert(errorMessage)
      setUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Update project phase
  const updateProjectPhase = async (projectId, phase, completed, description = '') => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/projects/${projectId}/phase`,
        { phase, completed, description }
      )

      if (response.status === 200) {
        // Refresh projects list
        if (user) {
          fetchMyProjects(user.id)
        }
        setEditingPhase(null)
        setPhaseDescription('')
      }
    } catch (error) {
      console.error('Error updating phase:', error)
      alert(error.response?.data?.message || 'Failed to update phase. Please try again.')
    }
  }

  // Toggle phase completion
  const togglePhase = (projectId, phase) => {
    const project = myProjects.find(p => p._id === projectId)
    if (!project) return

    const phasesObj = project.phases || {}
    const currentPhase = phasesObj[phase] || { completed: false, description: '' }
    const newCompleted = !currentPhase.completed
    updateProjectPhase(projectId, phase, newCompleted, currentPhase.description || '')
  }

  // Start editing phase description
  const startEditingPhase = (projectId, phase) => {
    const project = myProjects.find(p => p._id === projectId)
    if (!project) return

    const phasesObj = project.phases || {}
    const phaseData = phasesObj[phase] || { completed: false, description: '' }
    setEditingPhase(`${projectId}-${phase}`)
    setPhaseDescription(phaseData.description || '')
  }

  // Save phase description
  const savePhaseDescription = (projectId, phase) => {
    const project = myProjects.find(p => p._id === projectId)
    if (!project) return

    const phasesObj = project.phases || {}
    const phaseData = phasesObj[phase] || { completed: false, description: '' }
    updateProjectPhase(projectId, phase, phaseData.completed, phaseDescription)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingPhase(null)
    setPhaseDescription('')
  }

  // Get phase display name
  const getPhaseName = (phase) => {
    const phaseNames = {
      phase1_idea: 'Phase 1: Publishing Idea',
      phase2_research_paper: 'Phase 2: Publishing Research Paper',
      phase3_building_prototype: 'Phase 3: Building Prototype',
      phase4_completing_prototype: 'Phase 4: Completing Prototype',
      phase5_completing_model: 'Phase 5: Completing Model',
      phase6_final_submission: 'Phase 6: Final Submission'
    }
    return phaseNames[phase] || phase
  }

  // Render stars
  const renderStars = (stars) => {
    const totalStars = 6
    return (
      <div className="stars-container">
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            size={20}
            className={index < stars ? 'star-filled' : 'star-empty'}
            fill={index < stars ? '#FFD700' : 'none'}
            stroke={index < stars ? '#FFD700' : '#ccc'}
          />
        ))}
        <span className="stars-count">{stars} / {totalStars}</span>
      </div>
    )
  }

  return (
    <DashboardLayout
      pageTitle="Student Command Center"
      pageDescription="Track submissions, progress, analytics, and profile from one place."
      onLogout={handleLogout}
    >
      <div className="student-dashboard">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>RSCOE</h2>
            <p>Student Workspace</p>
          </div>
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => handleSectionChange('overview')}
            >
              <TrendingUp size={18} />
              Overview
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => handleSectionChange('tasks')}
            >
              <CheckSquare size={18} />
              Task Board
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'uploads' ? 'active' : ''}`}
              onClick={() => handleSectionChange('uploads')}
            >
              <Upload size={18} />
              Uploads
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
              onClick={() => handleSectionChange('progress')}
            >
              <FileText size={18} />
              Progress
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'feedback' ? 'active' : ''}`}
              onClick={() => handleSectionChange('feedback')}
            >
              <MessageSquare size={18} />
              Feedback
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => handleSectionChange('analytics')}
            >
              <Activity size={18} />
              Analytics
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`}
              onClick={() => handleSectionChange('skills')}
            >
              <BookOpen size={18} />
              Skill Development
            </button>
            <button
              type="button"
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleSectionChange('profile')}
            >
              <User size={18} />
              Profile
            </button>
          </nav>
          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="dashboard-main">

          {activeSection === 'overview' && (
            <section className="summary-card" id="overview">
              <div>
                <p className="summary-label">Project Title</p>
                <h2>{summaryInfo.title}</h2>
                <div className="summary-meta">
                  <span>{summaryInfo.domain}</span>
                  <span>Guide • {summaryInfo.guide}</span>
                </div>
                <p className="summary-desc">{summaryInfo.description}</p>
                <span className={`status-chip ${summaryInfo.statusTone}`}>{summaryInfo.status}</span>
              </div>
              <div className="progress-ring" style={{ '--progress': `${completion}%` }}>
                <div className="progress-ring-inner">
                  <strong>{completion}%</strong>
                  <small>Complete</small>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'tasks' && (
            <section className="card task-board" id="tasks">
              <div className="section-header">
                <div>
                  <h3>Checklist</h3>
                  <p>{completedTasks} / {initialTasks.length} tasks done</p>
                </div>
              </div>
              <div className="task-list">
                {initialTasks.map(task => (
                  <label key={task.id} className="task-card">
                    <input
                      type="checkbox"
                      checked={taskState[task.id]}
                      onChange={() => handleTaskToggle(task.id)}
                    />
                    <div>
                      <p>{task.title}</p>
                      <small><Calendar size={12} /> Due {task.due}</small>
                    </div>
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'uploads' && (
            <section className="card upload-center" id="uploads">
              <div className="section-header">
                <div>
                  <h3>Project Upload Center</h3>
                  <p>Upload your project with details and files</p>
                </div>
              </div>

              {uploadSuccess && (
                <div className="success-message">
                  <CheckCircle size={18} />
                  Project uploaded successfully! Your teacher can now view it.
                </div>
              )}

              <form className="project-upload-form" onSubmit={handleProjectSubmit}>
                <div className="form-group">
                  <label htmlFor="project-name">
                    Project Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    className="form-input"
                    placeholder="Enter your project name"
                    value={projectForm.projectName}
                    onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-description">
                    Project Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="project-description"
                    className="form-textarea"
                    rows="5"
                    placeholder="Describe your project, its features, technologies used, etc."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-files">
                    Upload Files (PDF, Images, Code, Documents, etc.)
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="project-files"
                      className="file-input"
                      multiple
                      onChange={handleFileChange}
                    />
                    <label htmlFor="project-files" className="file-upload-label">
                      <Upload size={18} />
                      Choose Files
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <p className="files-header">Selected Files ({selectedFiles.length}):</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <FileText size={16} />
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="primary-btn submit-project-btn"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Clock size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload Project
                    </>
                  )}
                </button>
              </form>

              {myProjects.length > 0 && (
                <div className="my-projects-section">
                  <h4>My Uploaded Projects</h4>
                  <div className="projects-list">
                    {myProjects.map(project => {
                      const phases = [
                        'phase1_idea',
                        'phase2_research_paper',
                        'phase3_building_prototype',
                        'phase4_completing_prototype',
                        'phase5_completing_model',
                        'phase6_final_submission'
                      ]
                      const stars = project.stars || 0

                      return (
                        <div key={project._id} className="project-item">
                          <div className="project-item-header">
                            <div>
                              <h5>{project.projectName}</h5>
                              {renderStars(stars)}
                            </div>
                            <span className={`status-chip ${project.status}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="project-description">{project.description}</p>
                          <div className="project-meta">
                            <small>Uploaded: {new Date(project.uploadedAt).toLocaleDateString()}</small>
                            <small>Files: {project.files.length}</small>
                          </div>

                          <div className="phases-section">
                            <h5 className="phases-title">Project Phases</h5>
                            <div className="phases-list">
                              {phases.map(phase => {
                                // Ensure phases object exists and has the phase
                                const phasesObj = project.phases || {}
                                const phaseData = phasesObj[phase] || { completed: false, description: '', completedAt: null }
                                const isEditing = editingPhase === `${project._id}-${phase}`

                                return (
                                  <div key={phase} className={`phase-item ${phaseData.completed ? 'completed' : ''}`}>
                                    <div className="phase-header">
                                      <label className="phase-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={phaseData.completed}
                                          onChange={() => togglePhase(project._id, phase)}
                                        />
                                        <span className="phase-name">{getPhaseName(phase)}</span>
                                      </label>
                                      {phaseData.completed && phaseData.completedAt && (
                                        <small className="phase-date">
                                          Completed: {new Date(phaseData.completedAt).toLocaleDateString()}
                                        </small>
                                      )}
                                    </div>

                                    {isEditing ? (
                                      <div className="phase-edit">
                                        <textarea
                                          className="phase-description-input"
                                          rows="2"
                                          placeholder="Add description or notes for this phase..."
                                          value={phaseDescription}
                                          onChange={(e) => setPhaseDescription(e.target.value)}
                                        />
                                        <div className="phase-edit-actions">
                                          <button
                                            type="button"
                                            className="save-btn"
                                            onClick={() => savePhaseDescription(project._id, phase)}
                                          >
                                            <Save size={14} />
                                            Save
                                          </button>
                                          <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={cancelEditing}
                                          >
                                            <X size={14} />
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="phase-description">
                                        {phaseData.description ? (
                                          <p>{phaseData.description}</p>
                                        ) : (
                                          <p className="no-description">No description added</p>
                                        )}
                                        <button
                                          type="button"
                                          className="edit-phase-btn"
                                          onClick={() => startEditingPhase(project._id, phase)}
                                        >
                                          <Edit size={14} />
                                          {phaseData.description ? 'Edit' : 'Add'} Description
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'progress' && (
            <section className="progress-grid" id="progress">
              <div className="card">
                <div className="section-header">
                  <div>
                    <h3>Progress Tracking</h3>
                    <p>Update completion and leave a note</p>
                  </div>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={completion}
                    onChange={(e) => setCompletion(Number(e.target.value))}
                  />
                  <div className="slider-labels">
                    <span>0%</span>
                    <strong>{completion}%</strong>
                    <span>100%</span>
                  </div>
                </div>
                <textarea
                  rows="3"
                  placeholder="What changed since the last update?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <button className="primary-btn" type="button" onClick={handleProgressUpdate}>
                  Save Update
                </button>
              </div>

              <div className="card timeline-card">
                <h3>Milestones</h3>
                <div className="timeline-horizontal">
                  {progressMilestones.map(milestone => (
                    <div key={milestone.id} className={`timeline-node ${milestone.status}`}>
                      <span className="dot"></span>
                      <p>{milestone.label}</p>
                      <small>{milestone.date}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Recent Activity</h3>
                <ul className="activity-list">
                  {activityFeed.map(item => (
                    <li key={item.id}>
                      <p>{item.text}</p>
                      <small>{item.time}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {activeSection === 'feedback' && (
            <section className="card feedback-card" id="feedback">
              <div className="section-header">
                <div>
                  <h3>Teacher Feedback</h3>
                  <p>Conversation log with your guide</p>
                </div>
              </div>
              <div className="feedback-thread">
                {feedbackThread.map(entry => (
                  <div key={entry.id} className="feedback-entry">
                    <div className="avatar">{entry.author[0]}</div>
                    <div>
                      <div className="entry-header">
                        <strong>{entry.author}</strong>
                        <span>{entry.role}</span>
                        <small>{entry.timestamp}</small>
                      </div>
                      <p>{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'analytics' && (
            <section className="card analytics-card" id="analytics">
              <div className="section-header">
                <div>
                  <h3>Analytics</h3>
                  <p>Quick glance at project health</p>
                </div>
              </div>
              <div className="analytics-grid">
                {analyticsSnapshot.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="analytics-tile">
                      <div className="analytics-icon">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p>{item.label}</p>
                        <strong>{item.value}</strong>
                        <small>{item.unit}</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {activeSection === 'skills' && (
            <section className="card skills-card" id="skills">
              <div className="section-header">
                <div>
                  <h3>Skill Development Resources</h3>
                  <p>Best YouTube channels for technical skill enhancement</p>
                </div>
              </div>
              <div className="skills-grid">
                {skillResources.map(resource => (
                  <div key={resource.id} className="skill-card">
                    <div className="skill-header">
                      <BookOpen size={20} className="skill-icon" />
                      <h4>{resource.skill}</h4>
                    </div>
                    <p className="skill-description">{resource.description}</p>
                    <div className="skill-footer">
                      <span className="skill-channel">{resource.channel}</span>
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="skill-link"
                      >
                        Visit Channel
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="card profile-card" id="profile">
              <div className="section-header">
                <div>
                  <h3>Profile Settings</h3>
                  <p>Collaborators see the info below</p>
                </div>
              </div>
              <div className="profile-grid">
                <div className="profile-photo">
                  <div className="avatar">{profileInfo.name[0]}</div>
                  <button className="ghost-btn" type="button">Change photo</button>
                </div>
                <form className="profile-form">
                  <label>
                    Name
                    <input type="text" defaultValue={profileInfo.name} />
                  </label>
                  <label>
                    Email
                    <div className="input-icon">
                      <Mail size={16} />
                      <input type="email" defaultValue={profileInfo.email} />
                    </div>
                  </label>
                  <label>
                    Contact
                    <div className="input-icon">
                      <Phone size={16} />
                      <input type="tel" defaultValue={profileInfo.phone} />
                    </div>
                  </label>
                  <label>
                    Bio
                    <textarea rows="3" defaultValue={profileInfo.bio}></textarea>
                  </label>
                  <div className="profile-meta">
                    <label>
                      Branch
                      <div className="input-icon disabled">
                        <School size={16} />
                        <input type="text" value={profileInfo.branch} disabled />
                      </div>
                    </label>
                    <label>
                      Year
                      <div className="input-icon disabled">
                        <User size={16} />
                        <input type="text" value={profileInfo.year} disabled />
                      </div>
                    </label>
                  </div>
                  <button className="primary-btn" type="button">Save changes</button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard

