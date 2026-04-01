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
  UploadCloud
} from 'lucide-react'
import './TeacherDashboard.css'
import DashboardLayout from '../../components/layout/DashboardLayout'
import AppSidebar from '../../components/layout/AppSidebar'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, projectAPI, feedbackAPI } from '../../services/api'
import toast from 'react-hot-toast'

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
      } catch (error) {
        console.error('Error fetching students:', error)
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
      } catch (error) {
        console.error('Error fetching projects:', error)
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
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update project status')
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
        timeAgo: new Date(p.createdAt).toLocaleDateString(),
        priority: p.status === 'pending' ? 'High' : 'Medium',
      }))
  }, [selectedBranch, uploadedProjects])

  const suggestionsList = useMemo(() => {
    if (!searchTerm) return []
    const term = searchTerm.toLowerCase()
    return filteredStudents
      .filter(student =>
        (student.prn || student.roll || '').toLowerCase().includes(term) ||
        (student.name || '').toLowerCase().includes(term)
      )
      .slice(0, 5)
  }, [searchTerm, filteredStudents])

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
      pageTitle="Teacher Control Center"
      pageDescription="Track all student projects, branches, and document reviews."
      onLogout={handleLogout}
    >
      <div className="teacher-dashboard">
        <AppSidebar
          items={[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'students', label: 'Student Tracker', icon: FileText },
            { id: 'reviews', label: 'Review Queue', icon: BookOpen },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'branch', label: 'Change Branch', icon: Building2, separator: false },
          ]}
          activeSection={activeSection}
          onSectionChange={(id) => {
            if (id === 'branch') { handleBranchChange(); return }
            handleSectionChange(id)
          }}
          username={user?.username || user?.name}
          role="Teacher"
          onLogout={handleLogout}
        />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="headline">Teacher Control Center</p>
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
            <button className="filter-button" type="button">
              <Filter size={18} />
            </button>
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
                          <button className="outlined-btn" type="button" onClick={() => setSelectedStudent(student)}>
                            View Project
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="uploaded-projects-section" id="uploaded-projects">
            <div className="section-header">
              <div>
                <h2>Uploaded Projects</h2>
                <p>Projects submitted by students</p>
              </div>
            </div>
            {loadingProjects ? (
              <div className="loading-message">Loading projects...</div>
            ) : uploadedProjects.length === 0 ? (
              <div className="empty-state">
                <UploadCloud size={48} />
                <p>No projects uploaded yet</p>
              </div>
            ) : (
              <div className="projects-grid">
                {uploadedProjects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-card-header">
                      <div>
                        <h3>{project.title}</h3>
                        <p className="project-student">
                          <strong>{project.uniqueProjectId}</strong>
                        </p>
                      </div>
                      <span className={`status-chip project-status ${project.status}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="project-description-text">{project.description}</p>
                    <div className="project-card-footer">
                      <small className="upload-date">
                        Created: {new Date(project.createdAt).toLocaleString()}
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
                      </div>
                    </div>
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
                          <button className="ghost-btn" type="button">
                            Open
                          </button>
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
                  <button className="close-detail" type="button" onClick={() => setSelectedStudent(null)}>
                    ×
                  </button>
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
        </main>
      </div>
    </DashboardLayout>
  )
}

export default TeacherDashboard

