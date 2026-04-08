import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  MessageSquare,
  CheckCircle,
  CheckSquare,
  Activity,
  BookOpen,
  ExternalLink,
  Star,
  Edit,
  Trash2,
  Save,
  X,
  Folder,
  BarChart3,
  Mail,
  GitFork,
  UserPlus,
  Clock,
  AlertTriangle
} from 'lucide-react'
import './StudentDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AppSidebar from '../../components/layout/AppSidebar'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, feedbackAPI, studentAPI } from '../../services/api'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
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
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [editingPhase, setEditingPhase] = useState(null)
  const [phaseDescription, setPhaseDescription] = useState('')
  const [feedbackData, setFeedbackData] = useState([])

  // FR7: Group invitations
  const [invitations, setInvitations] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  // FR9: Mentor request
  const [teachers, setTeachers] = useState([])
  const [mentorRequesting, setMentorRequesting] = useState(false)

  // FR3/33: Fork / browse
  const [publicProjects, setPublicProjects] = useState([])
  const [forking, setForking] = useState(null)

  // Fetch student's projects
  const fetchMyProjects = async () => {
    if (!user) return
    try {
      setProjectsLoading(true)
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
      setProjectsLoading(false)
    } catch {
      toast.error('Failed to load projects.')
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProjects()
  }, [user])

  // Fetch invitations, teachers, and forkable projects
  useEffect(() => {
    if (!user) return
    const fetchInvitations = async () => {
      try {
        const { data } = await projectAPI.getMyInvitations()
        setInvitations(data.invitations || [])
      } catch { /* ignore */ }
    }
    const fetchTeachers = async () => {
      try {
        const { data } = await studentAPI.getAll()
        // teachers are fetched separately - use the users list if available
      } catch { /* ignore */ }
    }
    const fetchPublicProjects = async () => {
      try {
        const { data } = await projectAPI.getAll({ visibility: 'public', status: 'approved' })
        setPublicProjects((data.projects || []).filter(p => p.studentId !== user.id))
      } catch { /* ignore */ }
    }
    fetchInvitations()
    fetchPublicProjects()
  }, [user])

  // FR7: Invite a member by email
  const handleInviteMember = async (projectId) => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await projectAPI.invite(projectId, { email: inviteEmail.trim() })
      toast.success('Invitation sent!')
      setInviteEmail('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  // FR7: Respond to invitation
  const handleRespondInvite = async (inviteId, action) => {
    try {
      await projectAPI.respondInvite(inviteId, action)
      toast.success(`Invitation ${action}ed!`)
      setInvitations(prev => prev.filter(i => i.id !== inviteId))
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} invitation`)
    }
  }

  // FR9: Request mentor
  const handleRequestMentor = async (projectId, mentorId) => {
    setMentorRequesting(true)
    try {
      await projectAPI.requestMentor(projectId, mentorId)
      toast.success('Mentor request sent!')
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request mentor')
    } finally {
      setMentorRequesting(false)
    }
  }

  // FR3/33: Fork a project
  const handleForkProject = async (projectId) => {
    setForking(projectId)
    try {
      await projectAPI.fork(projectId)
      toast.success('Project forked successfully!')
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fork project')
    } finally {
      setForking(null)
    }
  }

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

  // Delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId)
        toast.success('Project deleted successfully')
        fetchMyProjects()
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  // State for inline editing project
  const [editingProject, setEditingProject] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', domainTags: '' })

  const startEditingProject = (project) => {
    setEditingProject(project.id)
    setEditForm({
      title: project.title,
      description: project.description,
      domainTags: project.domainTags ? project.domainTags.join(', ') : ''
    })
  }

  const saveProjectEdit = async (projectId) => {
    try {
      await projectAPI.update(projectId, {
        title: editForm.title,
        description: editForm.description,
        domainTags: editForm.domainTags.split(',').map(t => t.trim()).filter(Boolean)
      })
      toast.success('Project updated successfully')
      setEditingProject(null)
      fetchMyProjects()
    } catch (error) {
      toast.error('Failed to update project')
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

  // ── Drag & Drop handler for Kanban ──
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return
    if (myProjects.length === 0) return

    const project = myProjects[0]
    const phaseNumber = Number(draggableId)
    const phase = (project.phases || []).find(p => p.phaseNumber === phaseNumber)
    if (!phase) return

    const targetColumn = destination.droppableId // 'todo' | 'inProgress' | 'done'

    if (targetColumn === 'done') {
      // Mark completed
      updateProjectPhase(project.id, phaseNumber, true, phase.description || '')
    } else if (targetColumn === 'inProgress') {
      // Uncomplete if was done, set description placeholder if empty
      updateProjectPhase(project.id, phaseNumber, false, phase.description || 'In progress')
    } else {
      // Move to todo — uncomplete and clear description
      updateProjectPhase(project.id, phaseNumber, false, '')
    }
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
      onLogout={handleLogout}
    >
      <div className="student-dashboard">
        <AppSidebar
          items={[
            { id: 'tasks', label: 'Task Board', icon: CheckSquare },
            { id: 'uploads', label: 'Uploads', icon: Upload },
            { id: 'invitations', label: 'Invitations', icon: Mail, badge: invitations.length },
            { id: 'browse', label: 'Browse & Fork', icon: GitFork },
            { id: 'progress', label: 'Progress', icon: FileText },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'skills', label: 'Skill Development', icon: BookOpen },
          ]}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          username={user?.username || user?.name}
          role="Student"
          onLogout={handleLogout}
        />

        <main className="dashboard-main">
          <div className="page-heading">
            <h1>Student Command Center</h1>
            <p>Track submissions, progress, analytics, and profile from one place.</p>
          </div>

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

                const columns = [
                  { id: 'todo', title: 'To Do', dotClass: 'kanban-dot--todo', items: todo },
                  { id: 'inProgress', title: 'In Progress', dotClass: 'kanban-dot--progress', items: inProgress },
                  { id: 'done', title: 'Done', dotClass: 'kanban-dot--done', items: done },
                ]

                return (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="kanban-board">
                      {columns.map(col => (
                        <Droppable key={col.id} droppableId={col.id}>
                          {(provided, snapshot) => (
                            <div
                              className={`kanban-column kanban-${col.id === 'inProgress' ? 'progress' : col.id}${snapshot.isDraggingOver ? ' kanban-column--over' : ''}`}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              <div className="kanban-column-header">
                                <span className={`kanban-dot ${col.dotClass}`} />
                                <h4>{col.title}</h4>
                                <span className="kanban-count">{col.items.length}</span>
                              </div>
                              <div className="kanban-cards">
                                {col.items.map((phase, index) => (
                                  <Draggable key={String(phase.phaseNumber)} draggableId={String(phase.phaseNumber)} index={index}>
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        className={`kanban-card${col.id === 'done' ? ' kanban-card--done' : ''}${dragSnapshot.isDragging ? ' kanban-card--dragging' : ''}`}
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                      >
                                        <div className="kanban-card-top">
                                          <span className="kanban-card-title">{phase.phaseName}</span>
                                          <span className={`priority ${col.id === 'done' ? 'low' : col.id === 'inProgress' ? 'medium' : 'high'}`}>
                                            {col.id === 'done' ? 'Done' : col.id === 'inProgress' ? 'Working' : 'Pending'}
                                          </span>
                                        </div>
                                        <p className="kanban-card-desc">{phase.description || 'No description'}</p>
                                        {col.id === 'done' && phase.completedAt && (
                                          <small className="kanban-card-date">{new Date(phase.completedAt).toLocaleDateString()}</small>
                                        )}
                                        <div className="kanban-card-actions">
                                          {col.id !== 'done' && (
                                            <button type="button" className="kanban-action-btn" onClick={() => startEditingPhase(myProjects[0].id, phase.phaseNumber)}>
                                              <Edit size={13} /> {phase.description ? 'Edit' : 'Add Details'}
                                            </button>
                                          )}
                                          {col.id !== 'done' && (
                                            <button type="button" className="kanban-action-btn done" onClick={() => togglePhase(myProjects[0].id, phase.phaseNumber)}>
                                              <CheckCircle size={13} /> Mark Done
                                            </button>
                                          )}
                                          {col.id === 'done' && (
                                            <button type="button" className="kanban-action-btn undo" onClick={() => togglePhase(myProjects[0].id, phase.phaseNumber)}>
                                              <X size={13} /> Undo
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {col.items.length === 0 && (
                                  <p className="kanban-empty">
                                    {col.id === 'todo' ? 'No tasks in backlog' : col.id === 'inProgress' ? 'Nothing in progress' : 'Nothing completed yet'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </DragDropContext>
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

              {!projectsLoading && myProjects.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-secondary, #f9fafb)', borderRadius: '8px', marginTop: '16px' }}>
                  <Folder size={48} style={{ color: 'var(--text-muted, gray)', margin: '0 auto 16px' }} />
                  <h4 style={{ marginBottom: '8px' }}>No projects yet</h4>
                  <p style={{ color: 'var(--text-muted, gray)', marginBottom: '16px' }}>You haven't uploaded any projects. Upload one above to get started.</p>
                  <Button variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Upload a Project</Button>
                </div>
              )}



              {projectsLoading && myProjects.length === 0 && (
                <div className="my-projects-section">
                  <h4>My Uploaded Projects</h4>
                  <div className="projects-list">
                    {[1, 2].map(i => (
                      <div key={i} className="project-item" style={{ animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-secondary, #f9fafb)' }}>
                        <div style={{ height: '24px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '40%', marginBottom: '12px' }} />
                        <div style={{ height: '16px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '80%', marginBottom: '8px' }} />
                        <div style={{ height: '16px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '60%' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!projectsLoading && myProjects.length > 0 && (
                <div className="my-projects-section">
                  <h4>My Uploaded Projects</h4>
                  <div className="projects-list">
                    {myProjects.map(project => {
                      const phases = project.phases || []
                      const stars = project.stars || 0

                      return (
                        <div key={project.id} className="project-item">
                          <div className="project-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              {editingProject === project.id ? (
                                <input className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                              ) : (
                                <h5>{project.title}</h5>
                              )}
                              {renderStars(stars)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`status-chip ${project.status}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => editingProject === project.id ? setEditingProject(null) : startEditingProject(project)} aria-label="Edit project">
                                <Edit size={16} />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project.id)} aria-label="Delete project">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          {editingProject === project.id ? (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                              <textarea className="form-textarea" rows="3" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                              <input className="form-input" style={{ marginTop: '8px' }} placeholder="Domain Tags (comma separated)" value={editForm.domainTags} onChange={e => setEditForm({ ...editForm, domainTags: e.target.value })} />
                              <Button variant="primary" size="sm" style={{ marginTop: '8px' }} onClick={() => saveProjectEdit(project.id)}>Save Changes</Button>
                            </div>
                          ) : (
                            <p className="project-description">{project.description}</p>
                          )}
                          <div className="project-meta">
                            <small>Uploaded: {new Date(project.createdAt).toLocaleDateString()}</small>
                            <small>ID: {project.uniqueProjectId}</small>
                          </div>

                          {/* FR7: Invite member */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                            <input
                              type="email"
                              className="form-input"
                              placeholder="Invite by email..."
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              style={{ flex: 1, minWidth: '200px' }}
                            />
                            <Button variant="outline" size="sm" icon={<UserPlus size={14} />} disabled={inviting} loading={inviting} onClick={() => handleInviteMember(project.id)}>
                              Invite
                            </Button>
                          </div>

                          {/* FR9: Mentor request */}
                          {(!project.mentorId || project.mentorStatus === 'none') && (
                            <div style={{ marginBottom: '12px' }}>
                              <Button variant="outline" size="sm" icon={<BookOpen size={14} />} onClick={() => {
                                const mentorIdStr = prompt('Enter teacher user ID to request as mentor:')
                                if (mentorIdStr) handleRequestMentor(project.id, parseInt(mentorIdStr))
                              }} disabled={mentorRequesting} loading={mentorRequesting}>
                                Request Mentor
                              </Button>
                            </div>
                          )}
                          {project.mentorStatus === 'requested' && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                              <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Mentor request pending...
                            </p>
                          )}
                          {project.mentorStatus === 'accepted' && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--success, #10b981)', marginBottom: '12px' }}>
                              <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Mentor assigned
                            </p>
                          )}

                          {/* FR3/33: Forked from info */}
                          {project.forkedFromId && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                              <GitFork size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Forked from project #{project.forkedFromId}
                            </p>
                          )}

                          <div className="phases-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <h5 className="phases-title" style={{ margin: 0 }}>Project Phases</h5>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{phases.filter(p => p.completed).length}/{phases.length} phases complete — {Math.round((phases.filter(p => p.completed).length / Math.max(phases.length, 1)) * 100)}%</span>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                              {phases.map(phase => (
                                <div key={`bar-${phase.phaseNumber}`} style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: phase.completed ? 'var(--accent, #4F46E5)' : 'var(--border-primary, #e5e7eb)' }} />
                              ))}
                            </div>

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
                                      {phase.deadline && !phase.completed && (
                                        <small style={{ color: new Date(phase.deadline) < new Date() ? 'var(--error, #ef4444)' : 'var(--text-muted)', fontWeight: new Date(phase.deadline) < new Date() ? 600 : 400 }}>
                                          {new Date(phase.deadline) < new Date() ? (
                                            <><AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Overdue</>
                                          ) : (
                                            <><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Due: {new Date(phase.deadline).toLocaleDateString()}</>
                                          )}
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

          {activeSection === 'invitations' && (
            <section className="card" id="invitations">
              <div className="section-header">
                <div>
                  <h3>Group Invitations</h3>
                  <p>Pending invitations to join project groups</p>
                </div>
              </div>
              {invitations.length === 0 ? (
                <p className="empty-state">No pending invitations.</p>
              ) : (
                <div className="invitations-list">
                  {invitations.map(inv => (
                    <div key={inv.id} className="invitation-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div>
                        <strong>{inv.projectTitle}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          Invited by {inv.ownerName} · {inv.projectDescription?.substring(0, 80)}...
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Button variant="primary" size="sm" onClick={() => handleRespondInvite(inv.id, 'accept')}>Accept</Button>
                        <Button variant="danger" size="sm" onClick={() => handleRespondInvite(inv.id, 'decline')}>Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeSection === 'browse' && (
            <section className="card" id="browse">
              <div className="section-header">
                <div>
                  <h3>Browse & Fork Projects</h3>
                  <p>Explore approved public projects and fork them to continue the work</p>
                </div>
              </div>
              {publicProjects.length === 0 ? (
                <p className="empty-state">No public approved projects available to fork.</p>
              ) : (
                <div className="projects-list">
                  {publicProjects.map(project => (
                    <div key={project.id} className="project-item" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h5>{project.title}</h5>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                            by {project.studentName} · {project.studentBranch}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={forking === project.id}
                          loading={forking === project.id}
                          icon={<GitFork size={14} />}
                          onClick={() => handleForkProject(project.id)}
                        >
                          Fork
                        </Button>
                      </div>
                      <p className="project-description">{project.description?.substring(0, 200)}</p>
                      <div className="project-meta">
                        <small>{(project.domainTags || []).join(', ')}</small>
                        <small>★ {project.stars || 0}</small>
                      </div>
                    </div>
                  ))}
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
                  <div className="analytics-icon"><Folder size={18} /></div>
                  <div>
                    <p>Total Projects</p>
                    <strong>{myProjects.length}</strong>
                    <small>uploaded</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><CheckSquare size={18} /></div>
                  <div>
                    <p>Approved</p>
                    <strong>{myProjects.filter(p => p.status === 'approved').length}</strong>
                    <small>projects</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><BarChart3 size={18} /></div>
                  <div>
                    <p>Under Review</p>
                    <strong>{myProjects.filter(p => p.status === 'under_review').length}</strong>
                    <small>projects</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><MessageSquare size={18} /></div>
                  <div>
                    <p>Pending</p>
                    <strong>{myProjects.filter(p => p.status === 'pending').length}</strong>
                    <small>projects</small>
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

