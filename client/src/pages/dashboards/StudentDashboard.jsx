import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  MessageSquare,
  LogOut,
  CheckCircle,
  Clock,
  Folder,
  CheckSquare,
  BarChart3,
  Activity,
  BookOpen,
  ExternalLink,
  Star,
  Edit,
  Save,
  X
} from 'lucide-react'
import './StudentDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, feedbackAPI } from '../../services/api'
import toast from 'react-hot-toast'



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
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('tasks')
  const [completion, setCompletion] = useState(0)
  const [notes, setNotes] = useState('')

  // Project upload state
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: '',
    domainTags: '',
    visibility: 'public',
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [myProjects, setMyProjects] = useState([])
  const [editingPhase, setEditingPhase] = useState(null)
  const [phaseDescription, setPhaseDescription] = useState('')
  const [feedbackData, setFeedbackData] = useState([])

  // Fetch student's projects
  const fetchMyProjects = async () => {
    if (!user) return
    try {
      const { data } = await projectAPI.getByStudent(user.id)
      setMyProjects(data.projects || [])
      // Calculate overall completion from phases
      if (data.projects?.length > 0) {
        const project = data.projects[0]
        const phases = project.phases || []
        const completedPhases = phases.filter(p => p.completed).length
        setCompletion(Math.round((completedPhases / Math.max(phases.length, 1)) * 100))
      }
      // Fetch feedback for first project
      if (data.projects?.length > 0) {
        try {
          const fbRes = await feedbackAPI.getByProject(data.projects[0].id)
          setFeedbackData(fbRes.data?.feedback || [])
        } catch { /* no feedback yet */ }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    fetchMyProjects()
  }, [user])

  const handleSectionChange = (section) => {
    setActiveSection(section)
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
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
      toast.error('User information not found. Please login again.')
      navigate('/')
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append('title', projectForm.projectName)
      formData.append('description', projectForm.description)
      if (projectForm.domainTags) {
        formData.append('domainTags', JSON.stringify(projectForm.domainTags.split(',').map(t => t.trim()).filter(Boolean)))
      }
      formData.append('visibility', projectForm.visibility || 'public')

      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      await projectAPI.create(formData)

      setUploadSuccess(true)
      toast.success('Project uploaded successfully!')
      setProjectForm({ projectName: '', description: '', domainTags: '', visibility: 'public' })
      setSelectedFiles([])
      const fileInput = document.getElementById('project-files')
      if (fileInput) fileInput.value = ''

      fetchMyProjects()
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload project.'
      toast.error(errorMessage)
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

  // Update project phase — server expects { phase: "<number>", completed, description }
  const updateProjectPhase = async (projectId, phaseNumber, completed, description = '') => {
    try {
      await projectAPI.updatePhase(projectId, { phase: String(phaseNumber), completed, description })
      fetchMyProjects()
      setEditingPhase(null)
      setPhaseDescription('')
    } catch (error) {
      console.error('Error updating phase:', error)
      toast.error(error.response?.data?.message || 'Failed to update phase.')
    }
  }

  // Toggle phase completion
  const togglePhase = (projectId, phaseNumber) => {
    const project = myProjects.find(p => p.id === projectId)
    if (!project) return

    const phases = project.phases || []
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    if (!phase) return

    updateProjectPhase(projectId, phaseNumber, !phase.completed, phase.description || '')
  }

  // Start editing phase description
  const startEditingPhase = (projectId, phaseNumber) => {
    const project = myProjects.find(p => p.id === projectId)
    if (!project) return

    const phases = project.phases || []
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    if (!phase) return

    setEditingPhase(`${projectId}-${phaseNumber}`)
    setPhaseDescription(phase.description || '')
  }

  // Save phase description
  const savePhaseDescription = (projectId, phaseNumber) => {
    const project = myProjects.find(p => p.id === projectId)
    if (!project) return

    const phases = project.phases || []
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    if (!phase) return

    updateProjectPhase(projectId, phaseNumber, phase.completed, phaseDescription)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingPhase(null)
    setPhaseDescription('')
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
          </nav>
          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="dashboard-main">

          {activeSection === 'tasks' && (
            <section className="card task-board" id="tasks">
              <div className="section-header">
                <div>
                  <h3>Kanban Board</h3>
                  <p>{myProjects.length > 0 ? `${(myProjects[0].phases || []).filter(p => p.completed).length} / ${(myProjects[0].phases || []).length} phases done` : 'No projects yet'}</p>
                </div>
              </div>
              {myProjects.length > 0 ? (() => {
                const phases = myProjects[0].phases || []
                const todo = phases.filter(p => !p.completed && !p.description)
                const inProgress = phases.filter(p => !p.completed && p.description)
                const done = phases.filter(p => p.completed)
                return (
                  <div className="kanban-board">
                    <div className="kanban-column kanban-todo">
                      <div className="kanban-column-header">
                        <span className="kanban-dot kanban-dot--todo" />
                        <h4>To Do</h4>
                        <span className="kanban-count">{todo.length}</span>
                      </div>
                      <div className="kanban-cards">
                        {todo.map(phase => (
                          <div key={phase.phaseNumber} className="kanban-card">
                            <div className="kanban-card-top">
                              <span className="kanban-card-title">{phase.phaseName}</span>
                              <span className="priority high">Pending</span>
                            </div>
                            <p className="kanban-card-desc">{phase.description || 'No description'}</p>
                            <div className="kanban-card-actions">
                              <button type="button" className="kanban-action-btn" onClick={() => startEditingPhase(myProjects[0].id, phase.phaseNumber)}>
                                <Edit size={13} /> Add Details
                              </button>
                              <button type="button" className="kanban-action-btn done" onClick={() => togglePhase(myProjects[0].id, phase.phaseNumber)}>
                                <CheckCircle size={13} /> Mark Done
                              </button>
                            </div>
                          </div>
                        ))}
                        {todo.length === 0 && <p className="kanban-empty">No tasks in backlog</p>}
                      </div>
                    </div>
                    <div className="kanban-column kanban-progress">
                      <div className="kanban-column-header">
                        <span className="kanban-dot kanban-dot--progress" />
                        <h4>In Progress</h4>
                        <span className="kanban-count">{inProgress.length}</span>
                      </div>
                      <div className="kanban-cards">
                        {inProgress.map(phase => (
                          <div key={phase.phaseNumber} className="kanban-card">
                            <div className="kanban-card-top">
                              <span className="kanban-card-title">{phase.phaseName}</span>
                              <span className="priority medium">Working</span>
                            </div>
                            <p className="kanban-card-desc">{phase.description}</p>
                            <div className="kanban-card-actions">
                              <button type="button" className="kanban-action-btn" onClick={() => startEditingPhase(myProjects[0].id, phase.phaseNumber)}>
                                <Edit size={13} /> Edit
                              </button>
                              <button type="button" className="kanban-action-btn done" onClick={() => togglePhase(myProjects[0].id, phase.phaseNumber)}>
                                <CheckCircle size={13} /> Mark Done
                              </button>
                            </div>
                          </div>
                        ))}
                        {inProgress.length === 0 && <p className="kanban-empty">Nothing in progress</p>}
                      </div>
                    </div>
                    <div className="kanban-column kanban-done">
                      <div className="kanban-column-header">
                        <span className="kanban-dot kanban-dot--done" />
                        <h4>Done</h4>
                        <span className="kanban-count">{done.length}</span>
                      </div>
                      <div className="kanban-cards">
                        {done.map(phase => (
                          <div key={phase.phaseNumber} className="kanban-card kanban-card--done">
                            <div className="kanban-card-top">
                              <span className="kanban-card-title">{phase.phaseName}</span>
                              <span className="priority low">Done</span>
                            </div>
                            <p className="kanban-card-desc">{phase.description || 'Completed'}</p>
                            {phase.completedAt && (
                              <small className="kanban-card-date">{new Date(phase.completedAt).toLocaleDateString()}</small>
                            )}
                            <div className="kanban-card-actions">
                              <button type="button" className="kanban-action-btn undo" onClick={() => togglePhase(myProjects[0].id, phase.phaseNumber)}>
                                <X size={13} /> Undo
                              </button>
                            </div>
                          </div>
                        ))}
                        {done.length === 0 && <p className="kanban-empty">Nothing completed yet</p>}
                      </div>
                    </div>
                  </div>
                )
              })() : (
                <p className="empty-state">Upload a project to see your Kanban board.</p>
              )}

              {/* Phase editing modal inline */}
              {editingPhase && (
                <div className="phase-edit-inline card">
                  <h4>Edit Phase Description</h4>
                  <textarea
                    className="phase-description-input"
                    rows="3"
                    placeholder="Add description or notes for this phase..."
                    value={phaseDescription}
                    onChange={(e) => setPhaseDescription(e.target.value)}
                  />
                  <div className="phase-edit-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Save size={14} />}
                      onClick={() => {
                        const [projId, phaseNum] = editingPhase.split('-')
                        savePhaseDescription(projId, Number(phaseNum))
                      }}
                    >
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
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

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={uploading}
                  loading={uploading}
                  icon={!uploading ? <Upload size={16} /> : undefined}
                >
                  {uploading ? 'Uploading...' : 'Upload Project'}
                </Button>
              </form>

              {myProjects.length > 0 && (
                <div className="my-projects-section">
                  <h4>My Uploaded Projects</h4>
                  <div className="projects-list">
                    {myProjects.map(project => {
                      const phases = project.phases || []
                      const stars = project.stars || 0

                      return (
                        <div key={project.id} className="project-item">
                          <div className="project-item-header">
                            <div>
                              <h5>{project.title}</h5>
                              {renderStars(stars)}
                            </div>
                            <span className={`status-chip ${project.status}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="project-description">{project.description}</p>
                          <div className="project-meta">
                            <small>Uploaded: {new Date(project.createdAt).toLocaleDateString()}</small>
                            <small>ID: {project.uniqueProjectId}</small>
                          </div>

                          <div className="phases-section">
                            <h5 className="phases-title">Project Phases</h5>
                            <div className="phases-list">
                              {phases.map(phase => {
                                const isEditing = editingPhase === `${project.id}-${phase.phaseNumber}`

                                return (
                                  <div key={phase.phaseNumber} className={`phase-item ${phase.completed ? 'completed' : ''}`}>
                                    <div className="phase-header">
                                      <label className="phase-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={phase.completed}
                                          onChange={() => togglePhase(project.id, phase.phaseNumber)}
                                        />
                                        <span className="phase-name">{phase.phaseName}</span>
                                      </label>
                                      {phase.completed && phase.completedAt && (
                                        <small className="phase-date">
                                          Completed: {new Date(phase.completedAt).toLocaleDateString()}
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
                                            onClick={() => savePhaseDescription(project.id, phase.phaseNumber)}
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
                                        {phase.description ? (
                                          <p>{phase.description}</p>
                                        ) : (
                                          <p className="no-description">No description added</p>
                                        )}
                                        <button
                                          type="button"
                                          className="edit-phase-btn"
                                          onClick={() => startEditingPhase(project.id, phase.phaseNumber)}
                                        >
                                          <Edit size={14} />
                                          {phase.description ? 'Edit' : 'Add'} Description
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
                    <h3>Progress Overview</h3>
                    <p>Overall project completion based on phases</p>
                  </div>
                </div>
                <div className="slider-container">
                  <div className="slider-labels">
                    <span>0%</span>
                    <strong>{completion}%</strong>
                    <span>100%</span>
                  </div>
                  <div style={{ background: '#e0e0e0', borderRadius: 8, height: 16, overflow: 'hidden' }}>
                    <div style={{ width: `${completion}%`, background: 'var(--primary, #4F46E5)', height: '100%', borderRadius: 8, transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>

              <div className="card timeline-card">
                <h3>Phase Timeline</h3>
                <div className="timeline-horizontal">
                  {myProjects.length > 0 ? (
                    (myProjects[0].phases || []).map(phase => (
                      <div key={phase.phaseNumber} className={`timeline-node ${phase.completed ? 'completed' : 'upcoming'}`}>
                        <span className="dot"></span>
                        <p>{phase.phaseName}</p>
                        <small>{phase.completed && phase.completedAt ? new Date(phase.completedAt).toLocaleDateString() : 'Pending'}</small>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No project phases to display.</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3>Project Summary</h3>
                <ul className="activity-list">
                  <li>
                    <p>Total projects: {myProjects.length}</p>
                  </li>
                  {myProjects.map(p => (
                    <li key={p.id}>
                      <p>{p.title} — {p.status.replace('_', ' ')}</p>
                      <small>{(p.phases || []).filter(ph => ph.completed).length}/{(p.phases || []).length} phases complete</small>
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
                  <p>Feedback from reviewers on your projects</p>
                </div>
              </div>
              <div className="feedback-thread">
                {feedbackData.length > 0 ? (
                  feedbackData.map(entry => (
                    <div key={entry.id} className="feedback-entry">
                      <div className="avatar">{(entry.reviewerName || 'R')[0]}</div>
                      <div>
                        <div className="entry-header">
                          <strong>{entry.reviewerName || 'Reviewer'}</strong>
                          <span>{entry.reviewerRole || 'Teacher'}</span>
                          <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div className="rating-display">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < entry.rating ? '#FFD700' : 'none'} stroke={i < entry.rating ? '#FFD700' : '#ccc'} />
                          ))}
                        </div>
                        {entry.comment && <p>{entry.comment}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No feedback received yet. Your teacher will review your project soon.</p>
                )}
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
                <div className="analytics-tile">
                  <div className="analytics-icon"><CheckSquare size={18} /></div>
                  <div>
                    <p>Phase completion</p>
                    <strong>{completion}%</strong>
                    <small>overall</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><Folder size={18} /></div>
                  <div>
                    <p>Total projects</p>
                    <strong>{myProjects.length}</strong>
                    <small>uploaded</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><BarChart3 size={18} /></div>
                  <div>
                    <p>Total stars</p>
                    <strong>{myProjects.reduce((sum, p) => sum + (p.stars || 0), 0)}</strong>
                    <small>earned</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><MessageSquare size={18} /></div>
                  <div>
                    <p>Feedback received</p>
                    <strong>{feedbackData.length}</strong>
                    <small>reviews</small>
                  </div>
                </div>
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

        </main>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard

