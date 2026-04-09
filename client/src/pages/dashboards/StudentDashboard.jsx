import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  MessageSquare,
  CheckCircle,
  CheckSquare,
  Activity,
  BookOpen,
  Star,
  Edit,
  Trash2,
  Save,
  X,
  Folder,
  FolderOpen,
  BarChart3,
  Mail,
  GitFork,
  UserPlus,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import './StudentDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AppSidebar from '../../components/layout/AppSidebar'
import Button from '../../components/ui/Button'
import DocPreview from '../../components/ui/DocPreview'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, feedbackAPI, userAPI, categoryAPI, analyticsAPI } from '../../services/api'
import { useDebounce } from '../../utils/useDebounce'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'
import { formatDateIST } from '../../utils/date'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'



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
  const [selectedMentor, setSelectedMentor] = useState('')
  const [mentorRequesting, setMentorRequesting] = useState(false)

  // FR3/33: Fork / browse
  const [publicProjects, setPublicProjects] = useState([])
  const [forking, setForking] = useState(null)

  // NEW: Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false)

  // NEW: Collapsible projects + search
  const [expandedProjects, setExpandedProjects] = useState({})
  const [projectSearch, setProjectSearch] = useState('')
  const debouncedProjectSearch = useDebounce(projectSearch, 300)

  // NEW: Multi-project Kanban
  const [selectedKanbanProject, setSelectedKanbanProject] = useState(null)

  // NEW: Kanban batch save (debounce)
  const kanbanTimer = useRef(null)
  const pendingPhasesRef = useRef(null)

  // NEW: Doc preview
  const [previewFile, setPreviewFile] = useState(null)

  // NEW: Custom phase CRUD
  const [newPhaseName, setNewPhaseName] = useState('')
  const [renamingPhase, setRenamingPhase] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  // NEW: Phase file upload
  const [phaseFileInputs, setPhaseFileInputs] = useState({})
  const [uploadingPhaseFile, setUploadingPhaseFile] = useState(null)

  // Category & semester for project creation
  const [categories, setCategories] = useState([])
  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [projectSemester, setProjectSemester] = useState('')

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

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
        const { data } = await userAPI.getTeachers()
        setTeachers(data.teachers || [])
      } catch { /* ignore */ }
    }
    const fetchPublicProjects = async () => {
      try {
        const { data } = await projectAPI.getAll({ visibility: 'public', status: 'approved' })
        setPublicProjects((data.projects || []).filter(p => p.studentId !== user.id))
      } catch { /* ignore */ }
    }
    const fetchCategories = async () => {
      try {
        const { data } = await categoryAPI.getAll()
        setCategories(data.categories || [])
      } catch { /* ignore */ }
    }
    fetchInvitations()
    fetchTeachers()
    fetchPublicProjects()
    fetchCategories()
  }, [user])

  // Fetch analytics when section is active
  useEffect(() => {
    if (activeSection !== 'analytics' || !user || analyticsData) return
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true)
      try {
        const { data } = await analyticsAPI.getStudentSummary(user.id)
        setAnalyticsData(data)
      } catch { /* non-critical */ }
      finally { setAnalyticsLoading(false) }
    }
    fetchAnalytics()
  }, [activeSection, user])

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

  // Toggle project expand/collapse
  const toggleProjectExpand = (projectId) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  // Filtered projects for search
  const filteredProjects = useMemo(() => {
    if (!debouncedProjectSearch.trim()) return myProjects
    const q = debouncedProjectSearch.toLowerCase()
    return myProjects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.domainTags || []).some(t => t.toLowerCase().includes(q))
    )
  }, [myProjects, debouncedProjectSearch])

  // ── Kanban: selected project
  const kanbanProject = useMemo(() => {
    if (myProjects.length === 0) return null
    if (selectedKanbanProject) return myProjects.find(p => p.id === selectedKanbanProject) || myProjects[0]
    return myProjects[0]
  }, [myProjects, selectedKanbanProject])

  // ── Kanban batch save (debounced) ──
  const flushKanbanChanges = useCallback(async () => {
    const pending = pendingPhasesRef.current
    if (!pending) return
    pendingPhasesRef.current = null
    try {
      await projectAPI.updatePhases(pending.projectId, pending.phases)
    } catch {
      toast.error('Failed to save board changes')
      fetchMyProjects()
    }
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (kanbanTimer.current) clearTimeout(kanbanTimer.current) }
  }, [])

  // ── Custom phase CRUD ──
  const handleCreatePhase = async (projectId) => {
    if (!newPhaseName.trim()) return
    try {
      await projectAPI.createPhase(projectId, newPhaseName.trim())
      toast.success('Phase created!')
      setNewPhaseName('')
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create phase')
    }
  }

  const handleRenamePhase = async (projectId, phaseId) => {
    if (!renameValue.trim()) return
    try {
      await projectAPI.renamePhase(projectId, phaseId, renameValue.trim())
      toast.success('Phase renamed!')
      setRenamingPhase(null)
      setRenameValue('')
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rename phase')
    }
  }

  const handleDeletePhase = async (projectId, phaseId, phaseName) => {
    if (!window.confirm(`Delete phase "${phaseName}"? This will also remove all files uploaded to this phase. This action cannot be undone.`)) return
    try {
      await projectAPI.deletePhase(projectId, phaseId)
      toast.success('Phase deleted!')
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete phase')
    }
  }

  // ── Phase file upload ──
  const handlePhaseFileUpload = async (projectId, phaseId) => {
    const files = phaseFileInputs[phaseId]
    if (!files || files.length === 0) return
    setUploadingPhaseFile(phaseId)
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    try {
      await projectAPI.uploadPhaseFile(projectId, phaseId, formData)
      toast.success('Files uploaded to phase!')
      setPhaseFileInputs(prev => ({ ...prev, [phaseId]: null }))
      fetchMyProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload phase files')
    } finally {
      setUploadingPhaseFile(null)
    }
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
      if (selectedCategory) {
        formData.append('categoryId', selectedCategory.id)
      }
      if (projectSemester) {
        formData.append('semester', projectSemester)
      }

      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      await projectAPI.create(formData)

      setUploadSuccess(true)
      toast.success('Project uploaded successfully!')
      setProjectForm({ projectName: '', description: '', domainTags: '', visibility: 'public' })
      setSelectedFiles([])
      setSelectedCategory(null)
      setCategorySearch('')
      setProjectSemester('')
      setShowUploadModal(false)

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

  // ── Drag & Drop handler for Kanban (batched) ──
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return
    if (!kanbanProject) return

    const phaseNumber = Number(draggableId)
    const phases = [...(kanbanProject.phases || [])]
    const phaseIdx = phases.findIndex(p => p.phaseNumber === phaseNumber)
    if (phaseIdx === -1) return

    const targetColumn = destination.droppableId
    const updatedPhase = { ...phases[phaseIdx] }

    if (targetColumn === 'done') {
      updatedPhase.completed = true
      updatedPhase.completedAt = new Date().toISOString()
    } else if (targetColumn === 'inProgress') {
      updatedPhase.completed = false
      updatedPhase.completedAt = null
      if (!updatedPhase.description) updatedPhase.description = 'In progress'
    } else {
      updatedPhase.completed = false
      updatedPhase.completedAt = null
      updatedPhase.description = ''
    }

    phases[phaseIdx] = updatedPhase

    // Optimistic local update
    setMyProjects(prev => prev.map(p =>
      p.id === kanbanProject.id ? { ...p, phases } : p
    ))

    // Queue for batch save
    pendingPhasesRef.current = { projectId: kanbanProject.id, phases }
    if (kanbanTimer.current) clearTimeout(kanbanTimer.current)
    kanbanTimer.current = setTimeout(flushKanbanChanges, 1500)
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
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'invitations', label: 'Invitations', icon: Mail, badge: invitations.length },
            { id: 'browse', label: 'Browse & Fork', icon: GitFork },
            { id: 'progress', label: 'Progress', icon: FileText },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: Activity },
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
                  <p>{kanbanProject ? `${(kanbanProject.phases || []).filter(p => p.completed).length} / ${(kanbanProject.phases || []).length} phases done` : 'No projects yet'}</p>
                </div>
                {myProjects.length > 1 && (
                  <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '200px' }}
                    value={selectedKanbanProject || ''}
                    onChange={(e) => setSelectedKanbanProject(Number(e.target.value))}
                  >
                    {myProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                )}
              </div>
              {kanbanProject ? (() => {
                const phases = kanbanProject.phases || []
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
                                          <small className="kanban-card-date">{formatDateIST(phase.completedAt)}</small>
                                        )}
                                        {/* Phase files on kanban card */}
                                        {(() => {
                                          const phaseFiles = (kanbanProject.files || []).filter(f => f.phaseId === phase.id)
                                          return phaseFiles.length > 0 ? (
                                            <div className="kanban-card-files">
                                              {phaseFiles.map(f => (
                                                <button key={f.id} type="button" className="kanban-file-btn" onClick={() => setPreviewFile(f)} title={f.originalName}>
                                                  <Eye size={11} /> {f.originalName.length > 18 ? f.originalName.slice(0, 18) + '…' : f.originalName}
                                                </button>
                                              ))}
                                            </div>
                                          ) : null
                                        })()}
                                        <div className="kanban-card-actions">
                                          {col.id !== 'done' && (
                                            <button type="button" className="kanban-action-btn" onClick={() => startEditingPhase(kanbanProject.id, phase.phaseNumber)}>
                                              <Edit size={13} /> {phase.description ? 'Edit' : 'Add Details'}
                                            </button>
                                          )}
                                          {col.id !== 'done' && (
                                            <button type="button" className="kanban-action-btn done" onClick={() => togglePhase(kanbanProject.id, phase.phaseNumber)}>
                                              <CheckCircle size={13} /> Mark Done
                                            </button>
                                          )}
                                          {col.id === 'done' && (
                                            <button type="button" className="kanban-action-btn undo" onClick={() => togglePhase(kanbanProject.id, phase.phaseNumber)}>
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

          {activeSection === 'projects' && (
            <section className="card upload-center" id="projects">
              <div className="section-header">
                <div>
                  <h3>My Projects</h3>
                  <p>Manage your projects, phases, and files</p>
                </div>
                <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowUploadModal(true)}>
                  New Project
                </Button>
              </div>

              {/* Search bar */}
              {myProjects.length > 1 && (
                <div className="project-search-bar">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search projects by name, description, or tag…"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              {/* Upload modal */}
              {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                  <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>Upload New Project</h3>
                      <button type="button" className="btn-icon" onClick={() => setShowUploadModal(false)}><X size={18} /></button>
                    </div>
                    {uploadSuccess && (
                      <div className="success-message">
                        <CheckCircle size={18} />
                        Project uploaded successfully!
                      </div>
                    )}
                    <form className="project-upload-form" onSubmit={handleProjectSubmit}>
                      <div className="form-group">
                        <label htmlFor="project-name">Project Name <span className="required">*</span></label>
                        <input type="text" id="project-name" className="form-input" placeholder="Enter your project name" value={projectForm.projectName} onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="project-description">Project Description <span className="required">*</span></label>
                        <textarea id="project-description" className="form-textarea" rows="4" placeholder="Describe your project…" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="project-tags">Domain Tags (comma separated)</label>
                        <input type="text" id="project-tags" className="form-input" placeholder="e.g. React, Machine Learning" value={projectForm.domainTags} onChange={(e) => setProjectForm({ ...projectForm, domainTags: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Project Category</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Search categories..."
                            value={selectedCategory ? selectedCategory.name : categorySearch}
                            onChange={(e) => { setCategorySearch(e.target.value); setSelectedCategory(null); setShowCategoryDropdown(true) }}
                            onFocus={() => setShowCategoryDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                          />
                          {showCategoryDropdown && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '6px', maxHeight: '160px', overflowY: 'auto', zIndex: 10 }}>
                              {categories
                                .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                .map(c => (
                                  <div key={c.id} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem', borderBottom: '1px solid var(--border-subtle)' }}
                                    onMouseDown={() => { setSelectedCategory(c); setCategorySearch(''); setShowCategoryDropdown(false) }}>
                                    {c.name} {c.branch && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({c.branch})</span>}
                                  </div>
                                ))}
                              {categories.filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                                <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No categories found</div>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedCategory && (
                          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ padding: '2px 8px', background: 'var(--accent-subtle)', borderRadius: '12px', fontSize: '0.75rem' }}>{selectedCategory.name}</span>
                            <button type="button" onClick={() => setSelectedCategory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem' }}>×</button>
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="project-semester">Semester</label>
                        <select id="project-semester" className="form-input" value={projectSemester} onChange={(e) => setProjectSemester(e.target.value)}>
                          <option value="">Select semester (optional)</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="project-files">Upload Files</label>
                        <div className="file-upload-wrapper">
                          <input type="file" id="project-files" className="file-input" multiple onChange={handleFileChange} />
                          <label htmlFor="project-files" className="file-upload-label"><Upload size={18} /> Choose Files</label>
                        </div>
                        {selectedFiles.length > 0 && (
                          <div className="selected-files">
                            <p className="files-header">Selected ({selectedFiles.length}):</p>
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="file-item">
                                <FileText size={16} />
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">{formatFileSize(file.size)}</span>
                                <button type="button" className="remove-file-btn" onClick={() => removeFile(index)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button type="submit" variant="primary" fullWidth disabled={uploading} loading={uploading} icon={!uploading ? <Upload size={16} /> : undefined}>
                        {uploading ? 'Uploading…' : 'Upload Project'}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!projectsLoading && myProjects.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '16px' }}>
                  <Folder size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                  <h4 style={{ marginBottom: '8px' }}>No projects yet</h4>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Upload your first project to get started.</p>
                  <Button variant="primary" onClick={() => setShowUploadModal(true)}>Create Project</Button>
                </div>
              )}

              {/* Loading skeleton */}
              {projectsLoading && myProjects.length === 0 && (
                <div className="my-projects-section">
                  {[1, 2].map(i => (
                    <div key={i} className="project-item" style={{ animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ height: '24px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', width: '40%', marginBottom: '12px' }} />
                      <div style={{ height: '16px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', width: '80%' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Collapsible project cards */}
              {!projectsLoading && filteredProjects.length > 0 && (
                <div className="my-projects-section">
                  <div className="projects-list">
                    {filteredProjects.map(project => {
                      const phases = project.phases || []
                      const stars = project.stars || 0
                      const isExpanded = expandedProjects[project.id]
                      const projectFiles = project.files || []

                      return (
                        <div key={project.id} className="project-item">
                          {/* Collapsible header */}
                          <div className="project-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => toggleProjectExpand(project.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              <div>
                                {editingProject === project.id ? (
                                  <input className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} onClick={e => e.stopPropagation()} />
                                ) : (
                                  <h5>{project.title}</h5>
                                )}
                                {renderStars(stars)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                              <span className={`status-chip ${project.status}`}>{project.status.replace('_', ' ')}</span>
                              <Button variant="ghost" size="sm" onClick={() => editingProject === project.id ? setEditingProject(null) : startEditingProject(project)} aria-label="Edit project"><Edit size={16} /></Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project.id)} aria-label="Delete project"><Trash2 size={16} /></Button>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="project-expanded-content">
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
                                <small>Uploaded: {formatDateIST(project.createdAt)}</small>
                                <small>ID: {project.uniqueProjectId}</small>
                              </div>

                              {/* FR7: Invite member */}
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '12px 0', flexWrap: 'wrap' }}>
                                <input type="email" className="form-input" placeholder="Invite by email…" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ flex: 1, minWidth: '200px' }} />
                                <Button variant="outline" size="sm" icon={<UserPlus size={14} />} disabled={inviting} loading={inviting} onClick={() => handleInviteMember(project.id)}>Invite</Button>
                              </div>

                              {/* FR9: Mentor request — teacher dropdown */}
                              {(!project.mentorId || project.mentorStatus === 'none') && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                                  <select className="form-input" style={{ flex: 1, minWidth: '200px' }} value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)}>
                                    <option value="">Select a teacher as mentor…</option>
                                    {teachers.map(t => (
                                      <option key={t.id} value={t.id}>{t.username} — {t.email} ({t.branch || 'N/A'})</option>
                                    ))}
                                  </select>
                                  <Button variant="outline" size="sm" icon={<BookOpen size={14} />} onClick={() => { if (selectedMentor) handleRequestMentor(project.id, parseInt(selectedMentor)) }} disabled={!selectedMentor || mentorRequesting} loading={mentorRequesting}>
                                    Request Mentor
                                  </Button>
                                </div>
                              )}
                              {project.mentorStatus === 'requested' && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Mentor request pending…
                                </p>
                              )}
                              {project.mentorStatus === 'accepted' && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--success, #10b981)', marginBottom: '12px' }}>
                                  <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Mentor assigned
                                </p>
                              )}

                              {project.forkedFromId && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                  <GitFork size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Forked from project #{project.forkedFromId}
                                </p>
                              )}

                              {/* Project-level files (uploaded at creation, no phase) */}
                              {(() => {
                                const generalFiles = projectFiles.filter(f => !f.phaseId)
                                return generalFiles.length > 0 ? (
                                  <div style={{ marginBottom: '16px' }}>
                                    <h5 style={{ margin: '0 0 8px', fontSize: '0.875rem' }}>Project Files</h5>
                                    <div className="phase-files">
                                      {generalFiles.map(f => (
                                        <div key={f.id} className="phase-file-item">
                                          <FileText size={14} />
                                          <span>{f.originalName}</span>
                                          <span className="file-size">{formatFileSize(f.fileSize)}</span>
                                          <button type="button" className="kanban-action-btn" onClick={() => setPreviewFile(f)} title="Preview"><Eye size={13} /></button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null
                              })()}

                              {/* Phases section */}
                              <div className="phases-section">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                  <h5 className="phases-title" style={{ margin: 0 }}>Project Phases</h5>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{phases.filter(p => p.completed).length}/{phases.length} phases complete — {Math.round((phases.filter(p => p.completed).length / Math.max(phases.length, 1)) * 100)}%</span>
                                </div>

                                {/* Progress bar */}
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                                  {phases.map(phase => (
                                    <div key={`bar-${phase.phaseNumber}`} style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: phase.completed ? 'var(--accent, #4F46E5)' : 'var(--border-primary, #e5e7eb)' }} />
                                  ))}
                                </div>

                                {/* Custom phase creation */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                                  <input type="text" className="form-input" placeholder="New phase name…" value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} style={{ flex: 1 }} />
                                  <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => handleCreatePhase(project.id)} disabled={!newPhaseName.trim()}>Add Phase</Button>
                                </div>

                                <div className="phases-list">
                                  {phases.map(phase => {
                                    const isEditing = editingPhase === `${project.id}-${phase.phaseNumber}`
                                    const phaseFiles = projectFiles.filter(f => f.phaseId === phase.id)

                                    return (
                                      <div key={phase.phaseNumber} className={`phase-item ${phase.completed ? 'completed' : ''}`}>
                                        <div className="phase-header">
                                          <label className="phase-checkbox">
                                            <input type="checkbox" checked={phase.completed} onChange={() => togglePhase(project.id, phase.phaseNumber)} />
                                            {renamingPhase === `${project.id}-${phase.phaseNumber}` ? (
                                              <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                <input type="text" className="form-input" style={{ padding: '2px 6px', fontSize: '0.8125rem', width: '150px' }} value={renameValue} onChange={e => setRenameValue(e.target.value)} onClick={e => e.stopPropagation()} />
                                                <button type="button" className="kanban-action-btn done" onClick={() => handleRenamePhase(project.id, phase.id)}><Save size={12} /></button>
                                                <button type="button" className="kanban-action-btn" onClick={() => setRenamingPhase(null)}><X size={12} /></button>
                                              </span>
                                            ) : (
                                              <span className="phase-name">{phase.phaseName}</span>
                                            )}
                                          </label>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {phase.completed && phase.completedAt && (
                                              <small className="phase-date">Completed: {formatDateIST(phase.completedAt)}</small>
                                            )}
                                            {phase.deadline && !phase.completed && (
                                              <small style={{ color: new Date(phase.deadline) < new Date() ? 'var(--error, #ef4444)' : 'var(--text-muted)', fontWeight: new Date(phase.deadline) < new Date() ? 600 : 400 }}>
                                                {new Date(phase.deadline) < new Date() ? (
                                                  <><AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Overdue</>
                                                ) : (
                                                  <><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> Due: {formatDateIST(phase.deadline)}</>
                                                )}
                                              </small>
                                            )}
                                            <button type="button" className="kanban-action-btn" title="Rename" onClick={() => { setRenamingPhase(`${project.id}-${phase.phaseNumber}`); setRenameValue(phase.phaseName) }}><Edit size={12} /></button>
                                            <button type="button" className="kanban-action-btn undo" title="Delete phase" onClick={() => handleDeletePhase(project.id, phase.id, phase.phaseName)}><Trash2 size={12} /></button>
                                          </div>
                                        </div>

                                        {isEditing ? (
                                          <div className="phase-edit">
                                            <textarea className="phase-description-input" rows="2" placeholder="Add description or notes for this phase…" value={phaseDescription} onChange={(e) => setPhaseDescription(e.target.value)} />
                                            <div className="phase-edit-actions">
                                              <button type="button" className="save-btn" onClick={() => savePhaseDescription(project.id, phase.phaseNumber)}><Save size={14} /> Save</button>
                                              <button type="button" className="cancel-btn" onClick={cancelEditing}><X size={14} /> Cancel</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="phase-description">
                                            {phase.description ? <p>{phase.description}</p> : <p className="no-description">No description added</p>}
                                            <button type="button" className="edit-phase-btn" onClick={() => startEditingPhase(project.id, phase.phaseNumber)}>
                                              <Edit size={14} /> {phase.description ? 'Edit' : 'Add'} Description
                                            </button>
                                          </div>
                                        )}

                                        {/* Phase files */}
                                        {phaseFiles.length > 0 && (
                                          <div className="phase-files">
                                            {phaseFiles.map(f => (
                                              <div key={f.id} className="phase-file-item">
                                                <FileText size={14} />
                                                <span>{f.originalName}</span>
                                                <span className="file-size">{formatFileSize(f.fileSize)}</span>
                                                <button type="button" className="kanban-action-btn" onClick={() => setPreviewFile(f)} title="Preview"><Eye size={13} /></button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Upload file to phase */}
                                        <div className="phase-file-upload" style={{ marginTop: '6px' }}>
                                          <input type="file" multiple onChange={e => setPhaseFileInputs(prev => ({ ...prev, [phase.id]: Array.from(e.target.files) }))} style={{ fontSize: '0.75rem' }} disabled={uploadingPhaseFile === phase.id} />
                                          {phaseFileInputs[phase.id]?.length > 0 && (
                                            <Button variant="outline" size="sm" style={{ marginTop: '4px' }} icon={<Upload size={12} />} onClick={() => handlePhaseFileUpload(project.id, phase.id)} loading={uploadingPhaseFile === phase.id} disabled={uploadingPhaseFile === phase.id}>
                                              {uploadingPhaseFile === phase.id ? 'Uploading…' : `Upload ${phaseFileInputs[phase.id].length} file(s)`}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Doc preview overlay */}
              {previewFile && <DocPreview file={previewFile} onClose={() => setPreviewFile(null)} />}
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
                        <small>{phase.completed && phase.completedAt ? formatDateIST(phase.completedAt) : 'Pending'}</small>
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
                          <small>{formatDateIST(entry.createdAt)}</small>
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
                  <p>Comprehensive project insights and statistics</p>
                </div>
              </div>

              {analyticsLoading ? (
                <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Loading analytics…</p>
              ) : (
                <>
                  {/* Summary tiles */}
                  <div className="analytics-grid">
                    <div className="analytics-tile">
                      <div className="analytics-icon"><Folder size={18} /></div>
                      <div>
                        <p>Total Projects</p>
                        <strong>{analyticsData?.totalProjects ?? myProjects.length}</strong>
                      </div>
                    </div>
                    <div className="analytics-tile">
                      <div className="analytics-icon"><CheckSquare size={18} /></div>
                      <div>
                        <p>Approved</p>
                        <strong>{myProjects.filter(p => p.status === 'approved').length}</strong>
                      </div>
                    </div>
                    <div className="analytics-tile">
                      <div className="analytics-icon"><Star size={18} /></div>
                      <div>
                        <p>Total Stars</p>
                        <strong>{analyticsData?.totalStars ?? 0}</strong>
                      </div>
                    </div>
                    <div className="analytics-tile">
                      <div className="analytics-icon"><FileText size={18} /></div>
                      <div>
                        <p>Files Uploaded</p>
                        <strong>{analyticsData?.totalFiles ?? 0}</strong>
                      </div>
                    </div>
                    <div className="analytics-tile">
                      <div className="analytics-icon"><CheckCircle size={18} /></div>
                      <div>
                        <p>Phase Completion</p>
                        <strong>{analyticsData?.phaseCompletionRate ?? 0}%</strong>
                      </div>
                    </div>
                    <div className="analytics-tile">
                      <div className="analytics-icon"><MessageSquare size={18} /></div>
                      <div>
                        <p>Feedback Received</p>
                        <strong>{analyticsData?.totalFeedback ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Charts row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
                    {/* Status distribution pie chart */}
                    {analyticsData?.statusDistribution?.length > 0 && (
                      <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>Project Status Distribution</h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={analyticsData.statusDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {analyticsData.statusDistribution.map((_, idx) => (
                                <Cell key={idx} fill={['#4F46E5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Domain distribution bar chart */}
                    {analyticsData?.domainDistribution?.length > 0 && (
                      <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>Domain Distribution</h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={analyticsData.domainDistribution} layout="vertical" margin={{ left: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

        </main>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard

