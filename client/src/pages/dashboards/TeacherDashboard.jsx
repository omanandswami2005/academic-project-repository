import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Bell,
  Search,
  Filter,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Send,
  Plus,
  Image,
  Archive,
  UploadCloud,
  X,
  Calendar,
  BarChart3,
  Upload,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Tag
} from 'lucide-react'
import './TeacherDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AppSidebar from '../../components/layout/AppSidebar'
import Button from '../../components/ui/Button'
import DocPreview from '../../components/ui/DocPreview'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, projectAPI, feedbackAPI, analyticsAPI, reportAPI, categoryAPI } from '../../services/api'
import { useDebounce } from '../../utils/useDebounce'
import toast from 'react-hot-toast'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts'
import { formatDateIST } from '../../utils/date'

const rubricFields = [
  { key: 'technical', label: 'Technical Depth' },
  { key: 'innovation', label: 'Innovation' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'completion', label: 'Completion' }
]

const maxRubricScore = rubricFields.length * 10

const statusClassMap = {
  'On Track': 'on-track',
  'Pending Review': 'pending',
  'Needs Attention': 'at-risk'
}

const createRubricTemplate = () => ({
  technical: 7,
  innovation: 7,
  documentation: 7,
  presentation: 7,
  completion: 7
})

const formatNow = () =>
  new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const branchFromState = location.state?.branch

  const [selectedBranch, setSelectedBranch] = useState(
    branchFromState || localStorage.getItem('selectedBranch') || ''
  )
  const [activeSection, setActiveSection] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [announcements, setAnnouncements] = useState([])
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' })
  const [uploadedProjects, setUploadedProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [registeredStudents, setRegisteredStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [discussionMap, setDiscussionMap] = useState({})
  const [rubricScores, setRubricScores] = useState({})
  const [selectedStudentProjects, setSelectedStudentProjects] = useState([])
  const [selectedStudentFeedback, setSelectedStudentFeedback] = useState([])
  const [selectedStudentSkills, setSelectedStudentSkills] = useState([])
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false)

  // FR13: Deadline management
  const [deadlineProject, setDeadlineProject] = useState(null)
  const [deadlineForms, setDeadlineForms] = useState({})

  // FR15: Overdue alerts
  const [overduePhases, setOverduePhases] = useState([])

  // FR29: Reports
  const [departmentReport, setDepartmentReport] = useState(null)
  const [loadingReport, setLoadingReport] = useState(false)

  // FR9: Mentor requests (projects requesting this teacher)
  const [mentorRequests, setMentorRequests] = useState([])

  // Category management
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Pagination
  const [projectPage, setProjectPage] = useState(1)
  const projectsPerPage = 6

  // Phase-wise doc view
  const [expandedProjectDocs, setExpandedProjectDocs] = useState(null)
  const [projectPhaseData, setProjectPhaseData] = useState(null)
  const [loadingPhaseData, setLoadingPhaseData] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)

  // Analytics charts data
  const [statusDistribution, setStatusDistribution] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])

  // Mentor doc upload
  const [mentorUploadProject, setMentorUploadProject] = useState(null)
  const [mentorUploadPhase, setMentorUploadPhase] = useState('')
  const [mentorUploadFiles, setMentorUploadFiles] = useState([])
  const [uploadingMentorDocs, setUploadingMentorDocs] = useState(false)

  // Fetch registered students by branch from API
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedBranch) return

      setLoadingStudents(true)
      try {
        const { data } = await studentAPI.getByBranch(selectedBranch)
        if (data.students) {
          setRegisteredStudents(data.students)
          const newDiscussionMap = {}
          const newRubricScores = {}
          data.students.forEach(student => {
            newDiscussionMap[student.id] = []
            newRubricScores[student.id] = createRubricTemplate()
          })
          setDiscussionMap(newDiscussionMap)
          setRubricScores(newRubricScores)
        }
      } catch {
        toast.error('Failed to load students.')
        setRegisteredStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudents()
    const interval = setInterval(fetchStudents, 30000)
    return () => clearInterval(interval)
  }, [selectedBranch])

  // Fetch uploaded projects from API (filtered by branch)
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedBranch) return

      setLoadingProjects(true)
      try {
        const { data } = await projectAPI.getAll({ branch: selectedBranch })
        setUploadedProjects(data.projects || [])
      } catch {
        toast.error('Failed to load projects.')
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [selectedBranch])

  // Update project status
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const { data } = await projectAPI.updateStatus(projectId, newStatus)
      setUploadedProjects(prev =>
        prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
      )
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update project status')
    }
  }

  // FR15: Fetch overdue phases
  useEffect(() => {
    if (!selectedBranch) return
    const fetchOverdue = async () => {
      try {
        const { data } = await projectAPI.getOverdue()
        setOverduePhases(data.overdue || [])
      } catch { /* ignore */ }
    }
    fetchOverdue()
  }, [selectedBranch])

  // FR9: Fetch mentor requests for this teacher
  useEffect(() => {
    if (!user) return
    const fetchMentorRequests = async () => {
      try {
        const { data } = await projectAPI.getAll({})
        const requests = (data.projects || []).filter(p => p.mentorId === user.id && p.mentorStatus === 'requested')
        // we don't have mentorStatus in getAllProjects select, so we'll fetch individually
        // For now, use a simple approach
        setMentorRequests(requests)
      } catch { /* ignore */ }
    }
    fetchMentorRequests()
  }, [user])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoryAPI.getAll(selectedBranch ? { branch: selectedBranch } : {})
        setCategories(data.categories || [])
      } catch { /* ignore */ }
    }
    fetchCategories()
  }, [selectedBranch])

  // Fetch analytics charts data
  useEffect(() => {
    if (!selectedBranch) return
    const fetchCharts = async () => {
      try {
        const [statusRes, trendRes] = await Promise.all([
          analyticsAPI.getStatusDistribution({ branch: selectedBranch }),
          analyticsAPI.getMonthlyTrend({ branch: selectedBranch }),
        ])
        setStatusDistribution(statusRes.data?.distribution || [])
        setMonthlyTrend(trendRes.data?.trend || [])
      } catch { /* non-critical */ }
    }
    fetchCharts()
  }, [selectedBranch])

  // Create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await categoryAPI.create({ name: newCategoryName.trim(), branch: selectedBranch || null })
      toast.success('Category created!')
      setNewCategoryName('')
      const { data } = await categoryAPI.getAll(selectedBranch ? { branch: selectedBranch } : {})
      setCategories(data.categories || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await categoryAPI.delete(categoryId)
      toast.success('Category deleted')
      setCategories(prev => prev.filter(c => c.id !== categoryId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  // Fetch phase-wise docs for a project
  const handleViewProjectDocs = async (projectId) => {
    if (expandedProjectDocs === projectId) {
      setExpandedProjectDocs(null)
      setProjectPhaseData(null)
      return
    }
    setExpandedProjectDocs(projectId)
    setLoadingPhaseData(true)
    try {
      const { data } = await projectAPI.getById(projectId)
      setProjectPhaseData(data.project)
    } catch {
      toast.error('Failed to load project details')
    } finally {
      setLoadingPhaseData(false)
    }
  }

  // Mentor doc upload handler
  const handleMentorDocUpload = async () => {
    if (!mentorUploadProject || !mentorUploadPhase || mentorUploadFiles.length === 0) {
      toast.error('Select a phase and files to upload')
      return
    }
    setUploadingMentorDocs(true)
    try {
      const formData = new FormData()
      mentorUploadFiles.forEach(f => formData.append('files', f))
      await projectAPI.uploadPhaseFile(mentorUploadProject, mentorUploadPhase, formData)
      toast.success('Documents uploaded for student reference!')
      setMentorUploadFiles([])
      setMentorUploadPhase('')
      setMentorUploadProject(null)
      // Refresh phase data if viewing
      if (expandedProjectDocs) {
        const { data } = await projectAPI.getById(expandedProjectDocs)
        setProjectPhaseData(data.project)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload documents')
    } finally {
      setUploadingMentorDocs(false)
    }
  }

  // FR13: Set deadlines for a project
  const handleSetDeadlines = async (projectId) => {
    const deadlines = Object.entries(deadlineForms)
      .filter(([_, val]) => val)
      .map(([phaseNum, deadline]) => ({ phaseNumber: parseInt(phaseNum), deadline }))
    if (deadlines.length === 0) {
      toast.error('Set at least one deadline')
      return
    }
    try {
      await projectAPI.setDeadlines(projectId, deadlines)
      toast.success('Deadlines set successfully!')
      setDeadlineProject(null)
      setDeadlineForms({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set deadlines')
    }
  }

  // FR9: Respond to mentor request
  const handleMentorRespond = async (projectId, action) => {
    try {
      await projectAPI.respondMentor(projectId, action)
      toast.success(`Mentor request ${action}ed!`)
      setMentorRequests(prev => prev.filter(p => p.id !== projectId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond')
    }
  }

  // FR29: Fetch department report
  const handleFetchReport = async () => {
    setLoadingReport(true)
    try {
      const { data } = await reportAPI.department(selectedBranch)
      setDepartmentReport(data.report)
    } catch (error) {
      toast.error('Failed to load report')
    } finally {
      setLoadingReport(false)
    }
  }

  useEffect(() => {
    if (branchFromState) {
      setSelectedBranch(branchFromState)
      localStorage.setItem('selectedBranch', branchFromState)
    }
  }, [branchFromState])

  useEffect(() => {
    if (!selectedBranch) {
      navigate('/teacher/branches', { replace: true })
    }
  }, [selectedBranch, navigate])

  useEffect(() => {
    setCommentDraft('')
    setSelectedStudentProjects([])
    setSelectedStudentFeedback([])
    setSelectedStudentSkills([])
    if (!selectedStudent) return
    const fetchStudentDetail = async () => {
      setLoadingStudentDetail(true)
      try {
        const [projRes, skillRes] = await Promise.all([
          projectAPI.getByStudent(selectedStudent.id),
          analyticsAPI.getSkillRadar(selectedStudent.id),
        ])
        const projects = projRes.data?.projects || []
        setSelectedStudentProjects(projects)
        setSelectedStudentSkills(skillRes.data?.skills || [])
        if (projects.length > 0) {
          try {
            const fbRes = await feedbackAPI.getByProject(projects[0].id)
            setSelectedStudentFeedback(fbRes.data?.feedback || [])
          } catch { /* no feedback yet */ }
        }
      } catch { /* student detail is non-critical */ } finally {
        setLoadingStudentDetail(false)
      }
    }
    fetchStudentDetail()
  }, [selectedStudent])

  const filteredStudents = useMemo(() => {
    if (!selectedBranch) return []
    return registeredStudents
  }, [selectedBranch, registeredStudents])

  const reviewQueue = useMemo(() => {
    if (!selectedBranch) return []
    return uploadedProjects
      .filter(p => p.status === 'pending' || p.status === 'under_review')
      .map(p => ({
        id: p.id,
        icon: p.status === 'pending' ? UploadCloud : FileText,
        iconBg: p.status === 'pending' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(139, 92, 246, 0.12)',
        iconColor: p.status === 'pending' ? '#3b82f6' : '#8b5cf6',
        category: p.status === 'pending' ? 'New Upload' : 'Under Review',
        student: p.studentName || 'Unknown',
        branch: p.studentBranch || selectedBranch,
        projectTitle: p.title,
        detail: p.description ? p.description.substring(0, 60) + '...' : 'No description',
        due: p.status === 'pending' ? 'Needs review' : 'In review',
        timeAgo: formatDateIST(p.createdAt),
        priority: p.status === 'pending' ? 'High' : 'Medium',
      }))
  }, [selectedBranch, uploadedProjects])

  const suggestionsList = useMemo(() => {
    if (!debouncedSearchTerm) return []
    const term = debouncedSearchTerm.toLowerCase()
    return filteredStudents
      .filter(student =>
        (student.prn || student.roll || '').toLowerCase().includes(term) ||
        (student.name || '').toLowerCase().includes(term)
      )
      .slice(0, 5)
  }, [debouncedSearchTerm, filteredStudents])

  const overviewCards = useMemo(() => {
    const total = filteredStudents.length
    const avg = total ? Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / total) : 0
    const attention = filteredStudents.filter(student => student.status !== 'On Track').length
    return [
      { label: 'Active Students', value: total, icon: Users, accent: 'primary' },
      { label: 'Projects in Review', value: reviewQueue.length, icon: BookOpen, accent: 'violet' },
      { label: 'Needs Attention', value: attention, icon: Clock, accent: 'amber' },
      { label: 'Avg. Completion', value: `${avg}%`, icon: CheckCircle, accent: 'emerald' }
    ]
  }, [filteredStudents, reviewQueue])

  const handleSectionChange = (section) => {
    setActiveSection(section)
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('selectedBranch')
    await logout()
    navigate('/')
  }

  const handleBranchChange = () => {
    localStorage.removeItem('selectedBranch')
    navigate('/teacher/branches')
  }

  const handleSuggestionSelect = (student) => {
    setSelectedStudent(student)
    setSearchTerm(student.prn || student.roll || student.name)
    setShowSuggestions(false)
  }

  const handleAddComment = async () => {
    if (!selectedStudent || !commentDraft.trim()) return
    const newEntry = { author: 'You', message: commentDraft.trim(), time: formatNow() }
    setDiscussionMap(prev => ({
      ...prev,
      [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newEntry]
    }))
    setCommentDraft('')
    toast.success('Comment added')
  }

  const handleRubricChange = (studentId, field, value) => {
    setRubricScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || createRubricTemplate()),
        [field]: Number(value)
      }
    }))
  }

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault()
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert('Please enter a title and description')
      return
    }
    const payload = {
      id: Date.now(),
      title: announcementForm.title.trim(),
      content: announcementForm.content.trim(),
      timestamp: formatNow(),
      audience: `${selectedBranch} Students`
    }
    setAnnouncements(prev => [payload, ...prev])
    setAnnouncementForm({ title: '', content: '' })
  }

  const renderDocumentIcon = (type) => {
    const iconMap = {
      pdf: FileText,
      ppt: FileText,
      report: FileText,
      image: Image,
      zip: Archive
    }
    const DocIcon = iconMap[type] || FileText
    return <DocIcon size={28} />
  }

  if (!selectedBranch) {
    return null
  }

  const selectedDiscussion = selectedStudent ? discussionMap[selectedStudent.id] || [] : []
  const selectedRubric = selectedStudent ? rubricScores[selectedStudent.id] || createRubricTemplate() : createRubricTemplate()
  const rubricTotal = Object.values(selectedRubric).reduce((sum, value) => sum + Number(value || 0), 0)

  return (
    <DashboardLayout
      onLogout={handleLogout}
    >
      <div className="teacher-dashboard">
        <AppSidebar
          items={[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'students', label: 'Student Tracker', icon: FileText },
            { id: 'uploaded-projects', label: 'Projects', icon: FolderOpen },
            { id: 'categories', label: 'Categories', icon: Tag },
            { id: 'reviews', label: 'Review Queue', icon: BookOpen, badge: reviewQueue.length },
            { id: 'deadlines', label: 'Deadlines', icon: Calendar },
            { id: 'mentors', label: 'Mentor Requests', icon: Users, badge: mentorRequests.length },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'branch', label: 'Change Branch', icon: Building2, separator: false },
          ]}
          activeSection={activeSection}
          onSectionChange={(id) => {
            if (id === 'branch') { handleBranchChange(); return }
            if (id === 'reports' && !departmentReport) handleFetchReport()
            handleSectionChange(id)
          }}
          username={user?.username || user?.name}
          role={user?.role === 'admin' ? 'Admin' : 'Teacher'}
          onLogout={handleLogout}
        />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="headline">{user?.role === 'admin' ? 'Admin Control Center' : 'Teacher Control Center'}</p>
              <h1>Projects · {selectedBranch} Branch</h1>
            </div>
          </header>

          <section className="search-bar" id="search">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by roll number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              />
              {showSuggestions && suggestionsList.length > 0 && (
                <div className="search-suggestions">
                  {suggestionsList.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionSelect(student)
                      }}
                    >
                      <span className="suggestion-roll">{student.prn || student.roll || student.email}</span>
                      <span>{student.name}</span>
                      <span className="suggestion-status">{student.projectTitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="secondary" size="sm" aria-label="Toggle filter" onClick={() => { }}>
              <Filter size={18} />
            </Button>
          </section>

          <section className="insights-panel" id="overview">
            <div className="insight-grid">
              {overviewCards.map(card => {
                const Icon = card.icon
                return (
                  <div key={card.label} className={`insight-card accent-${card.accent}`}>
                    <div className="insight-icon">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="insight-label">{card.label}</p>
                      <p className="insight-value">{card.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="student-table-card" id="students">
            <div className="section-header">
              <div>
                <h2>Student List</h2>
                <p>Roll wise tracker for the {selectedBranch} branch</p>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student</th>
                    <th>Project Title</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStudents ? (
                    <tr>
                      <td colSpan="6" className="muted">
                        Loading students...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="muted">
                        No students registered for this branch yet.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.prn || student.roll || student.email}</td>
                        <td>{student.name}</td>
                        <td>{student.projectTitle}</td>
                        <td>
                          <div className="progress-track">
                            <div className="progress-track-fill" style={{ width: `${student.progress || 0}%` }}></div>
                          </div>
                          <span className="progress-value">{student.progress || 0}%</span>
                        </td>
                        <td>
                          <span className={`status-chip ${statusClassMap[student.status] || 'pending'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>View Project</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* FR15: Overdue Alerts */}
          {overduePhases.length > 0 && (
            <section className="overdue-alert-card" style={{ background: 'var(--error-subtle, #fef2f2)', border: '1px solid var(--error, #ef4444)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--error, #ef4444)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px' }}>
                <AlertTriangle size={18} /> Overdue Phase Alerts ({overduePhases.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overduePhases.slice(0, 5).map(o => (
                  <div key={o.phaseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.875rem' }}>{o.studentName}</strong>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{o.projectTitle} — {o.phaseName}</span>
                    </div>
                    <small style={{ color: 'var(--error, #ef4444)' }}>Due: {formatDateIST(o.deadline)}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FR13: Deadline Management */}
          <section className="student-table-card" id="deadlines" style={{ display: activeSection === 'deadlines' ? 'block' : 'none' }}>
            <div className="section-header">
              <div>
                <h2>Set Phase Deadlines</h2>
                <p>Select a project and assign deadlines to each phase</p>
              </div>
            </div>
            {uploadedProjects.length === 0 ? (
              <p className="muted">No projects available.</p>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {uploadedProjects.map(p => (
                    <Button
                      key={p.id}
                      variant={deadlineProject === p.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => { setDeadlineProject(p.id); setDeadlineForms({}) }}
                    >
                      {p.title}
                    </Button>
                  ))}
                </div>
                {deadlineProject && (() => {
                  const dp = uploadedProjects.find(p => p.id === deadlineProject)
                  const phases = projectPhaseData && projectPhaseData.id === deadlineProject ? projectPhaseData.phases || [] : []
                  const phaseNums = phases.length > 0 ? phases.map(p => p.phaseNumber) : [1, 2, 3, 4, 5, 6]
                  return (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ marginBottom: '12px' }}>Set Deadlines — {dp?.title || ''}</h4>
                      {phaseNums.map(phase => {
                        const phaseInfo = phases.find(p => p.phaseNumber === phase)
                        return (
                          <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ width: '220px', fontSize: '0.875rem' }}>Phase {phase}{phaseInfo ? `: ${phaseInfo.phaseName}` : ''}</span>
                            <input
                              type="date"
                              className="form-input"
                              style={{ flex: 1, maxWidth: '200px' }}
                              value={deadlineForms[phase] || ''}
                              onChange={(e) => setDeadlineForms(prev => ({ ...prev, [phase]: e.target.value }))}
                            />
                          </div>
                        )
                      })}
                      <Button variant="primary" size="sm" style={{ marginTop: '12px' }} icon={<Calendar size={14} />} onClick={() => handleSetDeadlines(deadlineProject)}>
                        Save Deadlines
                      </Button>
                    </div>
                  )
                })()}
              </div>
            )}
          </section>

          {/* FR9: Mentor Requests */}
          <section className="student-table-card" id="mentors" style={{ display: activeSection === 'mentors' ? 'block' : 'none' }}>
            <div className="section-header">
              <div>
                <h2>Mentor Requests</h2>
                <p>Students requesting you as their project mentor</p>
              </div>
            </div>
            {mentorRequests.length === 0 ? (
              <p className="muted">No pending mentor requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mentorRequests.map(project => (
                  <div key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <strong>{project.title}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        by {project.studentName} · {project.studentBranch}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="primary" size="sm" onClick={() => handleMentorRespond(project.id, 'accept')}>Accept</Button>
                      <Button variant="danger" size="sm" onClick={() => handleMentorRespond(project.id, 'decline')}>Decline</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FR29: Reports */}
          <section className="student-table-card" id="reports" style={{ display: activeSection === 'reports' ? 'block' : 'none' }}>
            <div className="section-header">
              <div>
                <h2>Department Report — {selectedBranch}</h2>
                <p>Project statistics and phase completion rates</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleFetchReport} loading={loadingReport}>
                Refresh
              </Button>
            </div>
            {departmentReport ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Students</p>
                    <strong style={{ fontSize: '1.5rem' }}>{departmentReport.totalStudents}</strong>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Projects</p>
                    <strong style={{ fontSize: '1.5rem' }}>{departmentReport.totalProjects}</strong>
                  </div>
                  {Object.entries(departmentReport.statusBreakdown || {}).map(([status, cnt]) => (
                    <div key={status} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{status.replace('_', ' ')}</p>
                      <strong style={{ fontSize: '1.5rem' }}>{cnt}</strong>
                    </div>
                  ))}
                </div>
                <h4 style={{ marginBottom: '8px' }}>Phase Completion Rates</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {(departmentReport.phaseCompletion || []).map(pc => (
                    <div key={pc.phase} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '180px', fontSize: '0.875rem' }}>{pc.phase}</span>
                      <div style={{ flex: 1, background: 'var(--border-primary)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${pc.rate}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, width: '50px', textAlign: 'right' }}>{pc.rate}%</span>
                    </div>
                  ))}
                </div>
                {Object.keys(departmentReport.domainDistribution || {}).length > 0 && (
                  <>
                    <h4 style={{ marginBottom: '8px' }}>Domain Distribution</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Object.entries(departmentReport.domainDistribution).map(([domain, cnt]) => (
                        <span key={domain} style={{ padding: '4px 12px', background: 'var(--accent-subtle)', borderRadius: '20px', fontSize: '0.8125rem' }}>
                          {domain}: {cnt}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {/* Analytics Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
                  {statusDistribution.length > 0 && (
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>Project Status Breakdown</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                            {statusDistribution.map((_, idx) => (
                              <Cell key={idx} fill={['#4F46E5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {monthlyTrend.length > 0 && (
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>Monthly Project Submissions</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="projects" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ) : loadingReport ? (
              <p className="muted">Loading report...</p>
            ) : (
              <p className="muted">Click Refresh to load the department report.</p>
            )}
          </section>

          <section className="uploaded-projects-section" id="uploaded-projects">
            <div className="section-header">
              <div>
                <h2>Uploaded Projects</h2>
                <p>Projects submitted by students</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setProjectPage(1) }} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: '0.8125rem' }}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            {loadingProjects ? (
              <div className="loading-message">Loading projects...</div>
            ) : uploadedProjects.length === 0 ? (
              <div className="empty-state">
                <UploadCloud size={48} />
                <p>No projects uploaded yet</p>
              </div>
            ) : (() => {
              const filtered = categoryFilter
                ? uploadedProjects.filter(p => String(p.categoryId) === String(categoryFilter))
                : uploadedProjects
              const totalPages = Math.ceil(filtered.length / projectsPerPage)
              const paginated = filtered.slice((projectPage - 1) * projectsPerPage, projectPage * projectsPerPage)
              return (
                <>
                  <div className="projects-grid">
                    {paginated.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-card-header">
                          <div>
                            <h3>{project.title}</h3>
                            <p className="project-student">
                              <strong>{project.uniqueProjectId}</strong>
                              {project.categoryId && categories.find(c => c.id === project.categoryId) && (
                                <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'var(--accent-subtle)', borderRadius: '12px', fontSize: '0.7rem' }}>
                                  {categories.find(c => c.id === project.categoryId)?.name}
                                </span>
                              )}
                            </p>
                          </div>
                          <span className={`status-chip project-status ${project.status}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="project-description-text">{project.description}</p>
                        <div className="project-card-footer">
                          <small className="upload-date">
                            Created: {formatDateIST(project.createdAt)}
                          </small>
                          <div className="status-actions">
                            <select
                              value={project.status}
                              onChange={(e) => handleStatusUpdate(project.id, e.target.value)}
                              className="status-select"
                            >
                              <option value="pending">Pending</option>
                              <option value="under_review">Under Review</option>
                              <option value="approved">Approved</option>
                              <option value="needs_revision">Needs Revision</option>
                            </select>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                              <Button variant="ghost" size="sm" onClick={() => handleViewProjectDocs(project.id)}>
                                <Eye size={14} /> {expandedProjectDocs === project.id ? 'Hide Docs' : 'Phase Docs'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setDeadlineProject(project.id); setDeadlineForms({}); setActiveSection('deadlines') }}>
                                <Calendar size={14} /> Deadlines
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setMentorUploadProject(project.id); setMentorUploadPhase(''); setMentorUploadFiles([]) }}>
                                <Upload size={14} /> Upload Docs
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Phase-wise document view */}
                        {expandedProjectDocs === project.id && (
                          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ marginBottom: '8px', fontSize: '0.875rem' }}>Phase-wise Documents</h4>
                            {loadingPhaseData ? (
                              <p className="muted">Loading phases...</p>
                            ) : projectPhaseData ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(projectPhaseData.phases || []).map(phase => {
                                  const phaseFiles = (projectPhaseData.files || []).filter(f => f.phaseId === phase.id)
                                  const generalFiles = phase.phaseNumber === 1 ? (projectPhaseData.files || []).filter(f => !f.phaseId) : []
                                  return (
                                    <div key={phase.id} style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: '0.8125rem' }}>Phase {phase.phaseNumber}: {phase.phaseName}</strong>
                                        <span style={{ fontSize: '0.75rem', color: phase.completed ? 'var(--success)' : 'var(--text-muted)' }}>
                                          {phase.completed ? '✓ Complete' : 'Pending'}
                                        </span>
                                      </div>
                                      {phase.deadline && <small style={{ color: 'var(--text-muted)' }}>Deadline: {formatDateIST(phase.deadline)}</small>}
                                      {(phaseFiles.length > 0 || generalFiles.length > 0) ? (
                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          {[...phaseFiles, ...generalFiles].map(f => (
                                            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                              <FileText size={14} />
                                              <span style={{ flex: 1 }}>{f.originalName}</span>
                                              <button type="button" onClick={() => setPreviewFile(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }} title="Preview">
                                                <Eye size={14} />
                                              </button>
                                              {f.uploadedBy && f.uploadedBy !== project.studentId && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontStyle: 'italic' }}>mentor</span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No files</p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Mentor doc upload modal */}
                        {mentorUploadProject === project.id && (
                          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <h4 style={{ fontSize: '0.875rem', margin: 0 }}>Upload Documents for Student Reference</h4>
                              <button type="button" onClick={() => setMentorUploadProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                              <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Select Phase</label>
                                <select value={mentorUploadPhase} onChange={e => setMentorUploadPhase(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-primary)', fontSize: '0.8125rem' }}>
                                  <option value="">Choose phase</option>
                                  {projectPhaseData && projectPhaseData.phases ? projectPhaseData.phases.map(ph => (
                                    <option key={ph.id} value={ph.id}>Phase {ph.phaseNumber}: {ph.phaseName}</option>
                                  )) : <option disabled>Load phase docs first</option>}
                                </select>
                              </div>
                              <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Files</label>
                                <input type="file" multiple onChange={e => setMentorUploadFiles(Array.from(e.target.files))} style={{ fontSize: '0.8125rem' }} />
                              </div>
                              <Button variant="primary" size="sm" onClick={handleMentorDocUpload} loading={uploadingMentorDocs} disabled={uploadingMentorDocs || !mentorUploadPhase || mentorUploadFiles.length === 0}>
                                <Upload size={14} /> Upload
                              </Button>
                            </div>
                            {mentorUploadFiles.length > 0 && (
                              <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {mentorUploadFiles.length} file(s) selected
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      <Button variant="ghost" size="sm" disabled={projectPage <= 1} onClick={() => setProjectPage(p => p - 1)}>
                        <ChevronLeft size={16} /> Previous
                      </Button>
                      <span style={{ fontSize: '0.875rem' }}>Page {projectPage} of {totalPages}</span>
                      <Button variant="ghost" size="sm" disabled={projectPage >= totalPages} onClick={() => setProjectPage(p => p + 1)}>
                        Next <ChevronRight size={16} />
                      </Button>
                    </div>
                  )}
                </>
              )
            })()}
          </section>

          {/* Category Management */}
          <section className="student-table-card" id="categories" style={{ display: activeSection === 'categories' ? 'block' : 'none' }}>
            <div className="section-header">
              <div>
                <h2>Project Categories</h2>
                <p>Create categories for students to classify their projects</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: '0.875rem' }}
              />
              <Button variant="primary" size="sm" onClick={handleCreateCategory}>
                <Plus size={14} /> Create
              </Button>
            </div>
            {categories.length === 0 ? (
              <p className="muted">No categories created yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <Tag size={14} />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{c.name}</span>
                    {c.branch && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({c.branch})</span>}
                    <small style={{ color: 'var(--text-muted)' }}>by {c.creatorName}</small>
                    <button type="button" onClick={() => handleDeleteCategory(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }} title="Delete">×</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="two-column" id="reviews">
            <div className="review-queue">
              <div className="section-header">
                <div>
                  <h2>Review Queue</h2>
                  <p>New uploads, pending documents, and approvals</p>
                </div>
              </div>
              {reviewQueue.length === 0 ? (
                <p className="muted">No queued reviews for this branch.</p>
              ) : (
                <div className="review-grid">
                  {reviewQueue.map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.id} className="review-card">
                        <div className="review-card-icon" style={{ background: item.iconBg, color: item.iconColor }}>
                          <Icon size={20} />
                        </div>
                        <div className="review-card-body">
                          <div className="review-top">
                            <span className="review-category">{item.category}</span>
                            <span className={`priority-chip priority-${item.priority.toLowerCase()}`}>
                              {item.priority === 'High' && <AlertTriangle size={14} />}
                              {item.priority}
                            </span>
                          </div>
                          <div className="review-info">
                            <strong>{item.student}</strong>
                            <span>{item.projectTitle}</span>
                            <p>{item.detail}</p>
                          </div>
                          <div className="review-meta">
                            <span>{item.due}</span>
                            <small>{item.timeAgo}</small>
                          </div>
                          <Button variant="ghost" size="sm">Open</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="announcements-panel" id="announcements">
              <div className="section-header">
                <div>
                  <h2>Announcements</h2>
                  <p>Share submission windows and review alerts</p>
                </div>
              </div>
              <form className="announcement-form" onSubmit={handleAnnouncementSubmit}>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  rows="3"
                  placeholder="Message"
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                />
                <Button variant="primary" size="sm" type="submit" icon={<Plus size={16} />}>
                  Post Update
                </Button>
              </form>
              <div className="announcement-list">
                {announcements.map(item => (
                  <div key={item.id} className="announcement-card">
                    <div className="announcement-meta">
                      <span className="audience-chip">{item.audience}</span>
                      <span className="announcement-time">{item.timestamp}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {selectedStudent && (
            <div className="student-detail-overlay">
              <div className="student-detail-card">
                <div className="detail-header">
                  <div>
                    <p className="detail-roll">{selectedStudent.prn || selectedStudent.roll || selectedStudent.email}</p>
                    <h2>{selectedStudent.name}</h2>
                    <p className="detail-desc">{selectedStudent.projectTitle}</p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label="Close" onClick={() => setSelectedStudent(null)}>
                    <X size={16} />
                  </Button>
                </div>

                <div className="detail-grid">
                  <div className="overview-card">
                    <h3>Project Overview</h3>
                    <div className="overview-meta">
                      <div>
                        <p className="label">Branch</p>
                        <p>{selectedStudent.branch}</p>
                      </div>
                      <div>
                        <p className="label">Year</p>
                        <p>{selectedStudent.year || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="label">Email</p>
                        <p>{selectedStudent.email}</p>
                      </div>
                      <div>
                        <p className="label">Status</p>
                        <p className={`status-chip ${statusClassMap[selectedStudent.status] || 'pending'}`}>
                          {selectedStudent.status}
                        </p>
                      </div>
                    </div>
                    <div className="progress-large">
                      <div className="progress-track">
                        <div className="progress-track-fill" style={{ width: `${selectedStudent.progress}%` }}></div>
                      </div>
                      <span>{selectedStudent.progress}% complete</span>
                    </div>
                    <p className="muted">{selectedStudent.latestUpdate}</p>
                  </div>

                  <div className="timeline-card">
                    <h3>Timeline</h3>
                    <div className="timeline-horizontal">
                      {selectedStudent.timeline ? selectedStudent.timeline.map(item => (
                        <div key={item.label} className={`timeline-node ${item.status}`}>
                          <span className="timeline-dot"></span>
                          <p>{item.label}</p>
                          <small>{item.date}</small>
                        </div>
                      )) : (
                        <p className="muted">Timeline data not available for this student.</p>
                      )}
                    </div>
                  </div>

                  <div className="documents-card">
                    <h3>Document Viewer</h3>
                    <div className="document-grid">
                      {selectedStudent.documents ? selectedStudent.documents.map(doc => (
                        <div key={doc.name} className="document-card">
                          <div className="document-icon">{renderDocumentIcon(doc.type)}</div>
                          <div>
                            <p>{doc.name}</p>
                            <small>{doc.size}</small>
                          </div>
                          <div className="doc-actions">
                            <button type="button" title="Preview">
                              <Eye size={16} />
                            </button>
                            <button type="button" title="Download">
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <p className="muted">No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="suggestion-card">
                    <h3>Teacher Suggestion Box</h3>
                    <div className="suggestion-list">
                      {selectedDiscussion.length === 0 ? (
                        <p className="muted">No comments logged yet.</p>
                      ) : (
                        selectedDiscussion.map((entry, index) => (
                          <div key={`${entry.author}-${index}`} className="suggestion-entry">
                            <div>
                              <strong>{entry.author}</strong>
                              <span>{entry.time}</span>
                            </div>
                            <p>{entry.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="suggestion-form">
                      <textarea
                        rows="3"
                        placeholder="Comment, suggest, or guide..."
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                      />
                      <Button variant="primary" size="sm" icon={<Send size={16} />} onClick={handleAddComment}>
                        Send
                      </Button>
                    </div>
                  </div>

                  <div className="rubric-card">
                    <h3>Previous Feedback</h3>
                    {loadingStudentDetail ? (
                      <p className="muted">Loading feedback...</p>
                    ) : selectedStudentFeedback.length === 0 ? (
                      <p className="muted">No feedback recorded for this student yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedStudentFeedback.map(fb => (
                          <div key={fb.id} style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '0.875rem' }}>{fb.reviewerName || 'Reviewer'}</strong>
                              <small style={{ color: 'var(--text-muted)' }}>{formatDateIST(fb.createdAt)}</small>
                            </div>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: i < fb.rating ? '#FFD700' : 'var(--border-primary)' }}>★</span>
                              ))}
                            </div>
                            {fb.comment && <p style={{ fontSize: '0.875rem', margin: 0 }}>{fb.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedStudentSkills.length > 0 && (
                    <div className="rubric-card">
                      <h3>Skill Radar</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={selectedStudentSkills.slice(0, 8)}>
                          <PolarGrid stroke="var(--border-primary)" />
                          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                          <Radar
                            name="Skills"
                            dataKey="value"
                            stroke="var(--accent)"
                            fill="var(--accent)"
                            fillOpacity={0.25}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {selectedStudentProjects.length > 0 && (
                    <div className="rubric-card">
                      <h3>Submitted Projects</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedStudentProjects.map(p => (
                          <div key={p.id} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{p.title}</p>
                              <small style={{ color: 'var(--text-muted)' }}>{(p.phases || []).filter(ph => ph.completed).length}/{(p.phases || []).length} phases</small>
                            </div>
                            <span className={`status-chip ${p.status}`} style={{ fontSize: '0.75rem' }}>{p.status.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rubric-card">
                    <h3>Rubric Evaluation</h3>
                    <div className="rubric-grid">
                      {rubricFields.map(field => (
                        <label key={field.key}>
                          <div className="rubric-row">
                            <span>{field.label}</span>
                            <span>{selectedRubric[field.key]}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={selectedRubric[field.key]}
                            onChange={(e) => handleRubricChange(selectedStudent.id, field.key, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="rubric-total">
                      <span>Total</span>
                      <strong>
                        {rubricTotal} / {maxRubricScore}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewFile && <DocPreview file={previewFile} onClose={() => setPreviewFile(null)} />}
        </main>
      </div>
    </DashboardLayout>
  )
}

export default TeacherDashboard

