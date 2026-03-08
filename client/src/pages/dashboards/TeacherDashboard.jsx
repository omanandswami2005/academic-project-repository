import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Bell,
  LogOut,
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

const studentsData = [
  {
    id: 1,
    roll: 'RSCOE-CSE-001',
    name: 'Aarav Patil',
    branch: 'CSE',
    projectTitle: 'AI-Powered Mentorship Platform',
    domain: 'Artificial Intelligence',
    guide: 'Prof. Meera Kulkarni',
    progress: 78,
    status: 'On Track',
    latestUpdate: 'Prototype API integrated with student portal',
    description: 'Smart mentoring suite that pairs students and mentors using AI recommendations.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 05' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 18' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 05' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 01' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 10' }
    ],
    documents: [
      { name: 'Synopsis.pdf', type: 'pdf', size: '1.2 MB' },
      { name: 'UI-Mockups.ppt', type: 'ppt', size: '4.8 MB' },
      { name: 'Model-Diagram.png', type: 'image', size: '760 KB' },
      { name: 'Sprint2-Code.zip', type: 'zip', size: '9.4 MB' }
    ],
    discussion: [
      { author: 'Prof. Kulkarni', message: 'Please tighten the evaluation metrics.', time: 'Jan 24, 09:40 AM' },
      { author: 'Aarav Patil', message: 'Updated confusion matrix with new dataset.', time: 'Jan 25, 02:10 PM' }
    ],
    rubric: { technical: 8, innovation: 8, documentation: 7, presentation: 7, completion: 6 }
  },
  {
    id: 2,
    roll: 'RSCOE-CSBS-014',
    name: 'Maitri Deshmukh',
    branch: 'CSBS',
    projectTitle: 'Predictive Supply Chain Dashboard',
    domain: 'Data Analytics',
    guide: 'Prof. Viraj Rao',
    progress: 62,
    status: 'Pending Review',
    latestUpdate: 'Cleaned three months of warehouse data',
    description: 'Business intelligence dashboard that forecasts inventory burn rate and supplier delays.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 03' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 15' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 08' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 05' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 12' }
    ],
    documents: [
      { name: 'Requirement-Spec.pdf', type: 'pdf', size: '980 KB' },
      { name: 'ArchitectureDeck.ppt', type: 'ppt', size: '3.1 MB' },
      { name: 'DataModel.png', type: 'image', size: '540 KB' },
      { name: 'Sprint1.zip', type: 'zip', size: '7.8 MB' }
    ],
    discussion: [
      { author: 'Prof. Rao', message: 'Add SKU wise anomaly detection to backlog.', time: 'Jan 27, 11:20 AM' }
    ],
    rubric: { technical: 7, innovation: 6, documentation: 8, presentation: 7, completion: 6 }
  },
  {
    id: 3,
    roll: 'RSCOE-IT-009',
    name: 'Ishaan Kulkarni',
    branch: 'IT',
    projectTitle: 'IoT Safety Mesh',
    domain: 'Internet of Things',
    guide: 'Prof. Neeta More',
    progress: 54,
    status: 'Needs Attention',
    latestUpdate: 'Sensor calibration pending for lab test',
    description: 'Industrial IoT mesh that monitors shop-floor safety and notifies supervisors in real time.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 06' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 16' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 10' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 08' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 15' }
    ],
    documents: [
      { name: 'HardwarePlan.pdf', type: 'pdf', size: '1.5 MB' },
      { name: 'NetworkFlow.ppt', type: 'ppt', size: '2.2 MB' },
      { name: 'SensorLayout.png', type: 'image', size: '640 KB' },
      { name: 'Firmware.zip', type: 'zip', size: '5.9 MB' }
    ],
    discussion: [
      { author: 'Prof. More', message: 'Attach calibration logs before next review.', time: 'Jan 29, 04:05 PM' }
    ],
    rubric: { technical: 6, innovation: 7, documentation: 6, presentation: 6, completion: 5 }
  },
  {
    id: 4,
    roll: 'RSCOE-MECH-004',
    name: 'Neha Wagh',
    branch: 'Mechanical',
    projectTitle: 'Lightweight Suspension Prototype',
    domain: 'Product Design',
    guide: 'Prof. Aadesh Kale',
    progress: 69,
    status: 'On Track',
    latestUpdate: '3D printed v2 arms ready for stress testing',
    description: 'Redesigned suspension assembly aimed at lowering weight without compromising safety.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 08' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 19' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 07' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 03' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 11' }
    ],
    documents: [
      { name: 'CAD-Dossier.pdf', type: 'pdf', size: '2.6 MB' },
      { name: 'MaterialStudy.ppt', type: 'ppt', size: '5.1 MB' },
      { name: 'StressPlot.png', type: 'image', size: '890 KB' },
      { name: 'Prototype.zip', type: 'zip', size: '12.4 MB' }
    ],
    discussion: [
      { author: 'Prof. Kale', message: 'Share updated FEA screenshots with annotations.', time: 'Jan 28, 03:15 PM' },
      { author: 'Neha Wagh', message: 'Uploaded FEA batch with legend overlays.', time: 'Jan 29, 08:55 PM' }
    ],
    rubric: { technical: 8, innovation: 7, documentation: 7, presentation: 6, completion: 7 }
  },
  {
    id: 5,
    roll: 'RSCOE-CIV-002',
    name: 'Samar Khot',
    branch: 'Civil',
    projectTitle: 'Smart Water Distribution Model',
    domain: 'Smart Cities',
    guide: 'Prof. Gayatri Torne',
    progress: 58,
    status: 'Pending Review',
    latestUpdate: 'Hydraulic simulation calibrated for ward C',
    description: 'Digital twin for monitoring city water lines with anomaly alerts and zone pressure logs.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 04' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 17' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 09' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 06' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 14' }
    ],
    documents: [
      { name: 'HydraulicModel.pdf', type: 'pdf', size: '2.1 MB' },
      { name: 'NetworkLayout.png', type: 'image', size: '710 KB' },
      { name: 'DashboardFlow.ppt', type: 'ppt', size: '3.6 MB' },
      { name: 'SimulationLogs.zip', type: 'zip', size: '10.8 MB' }
    ],
    discussion: [
      { author: 'Prof. Torne', message: 'Need leakage forecasting charts for council review.', time: 'Jan 30, 01:05 PM' }
    ],
    rubric: { technical: 7, innovation: 6, documentation: 7, presentation: 7, completion: 5 }
  },
  {
    id: 6,
    roll: 'RSCOE-AR-006',
    name: 'Riya Bhosale',
    branch: 'A&R',
    projectTitle: 'Immersive Heritage Walkthrough',
    domain: 'AR/VR Experience',
    guide: 'Prof. Sneha Joshi',
    progress: 73,
    status: 'On Track',
    latestUpdate: 'Scene lighting optimised for headset build',
    description: 'Augmented reality experience that narrates campus heritage with guided storytelling.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 07' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 18' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 06' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 04' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 09' }
    ],
    documents: [
      { name: 'ExperienceFlow.pdf', type: 'pdf', size: '1.6 MB' },
      { name: 'Storyboard.ppt', type: 'ppt', size: '6.2 MB' },
      { name: 'ScenePreview.png', type: 'image', size: '820 KB' },
      { name: 'BuildAssets.zip', type: 'zip', size: '11.3 MB' }
    ],
    discussion: [
      { author: 'Prof. Joshi', message: 'Add accessibility narration track for each scene.', time: 'Jan 26, 10:30 AM' }
    ],
    rubric: { technical: 7, innovation: 9, documentation: 7, presentation: 8, completion: 6 }
  },
  {
    id: 7,
    roll: 'RSCOE-EE-011',
    name: 'Vikram Nair',
    branch: 'Electrical',
    projectTitle: 'Grid Fault Prediction Console',
    domain: 'Power Systems',
    guide: 'Prof. Dilip Pawar',
    progress: 51,
    status: 'Needs Attention',
    latestUpdate: 'SCADA dataset ingestion behind schedule',
    description: 'Fault analytics console that predicts feeder breakdowns using historical SCADA logs.',
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 09' },
      { label: 'Synopsis', status: 'completed', date: 'Jan 21' },
      { label: 'Mid-term Review', status: 'current', date: 'Feb 11' },
      { label: 'Implementation', status: 'upcoming', date: 'Mar 09' },
      { label: 'Final Review', status: 'upcoming', date: 'Apr 16' }
    ],
    documents: [
      { name: 'SystemSpec.pdf', type: 'pdf', size: '1.9 MB' },
      { name: 'SignalFlow.ppt', type: 'ppt', size: '2.9 MB' },
      { name: 'Dashboard.png', type: 'image', size: '680 KB' },
      { name: 'Dataset.zip', type: 'zip', size: '8.7 MB' }
    ],
    discussion: [
      { author: 'Prof. Pawar', message: 'Share plan for realtime alert push to field engineers.', time: 'Jan 31, 06:45 PM' }
    ],
    rubric: { technical: 6, innovation: 6, documentation: 6, presentation: 5, completion: 4 }
  }
]

const reviewQueueData = [
  {
    id: 'rq1',
    icon: UploadCloud,
    iconBg: 'rgba(65, 105, 225, 0.12)',
    iconColor: '#4169E1',
    category: 'New Upload',
    student: 'Aarav Patil',
    branch: 'CSE',
    projectTitle: 'AI-Powered Mentorship Platform',
    detail: 'Prototype build uploaded for validation',
    due: 'Review by today',
    timeAgo: '5 mins ago',
    priority: 'High'
  },
  {
    id: 'rq2',
    icon: FileText,
    iconBg: 'rgba(139, 92, 246, 0.12)',
    iconColor: '#8b5cf6',
    category: 'Pending Document',
    student: 'Maitri Deshmukh',
    branch: 'CSBS',
    projectTitle: 'Predictive Supply Chain Dashboard',
    detail: 'Business case PDF awaiting approval',
    due: 'Due tomorrow',
    timeAgo: '32 mins ago',
    priority: 'Medium'
  },
  {
    id: 'rq3',
    icon: Clock,
    iconBg: 'rgba(251, 191, 36, 0.12)',
    iconColor: '#fbbf24',
    category: 'Approval',
    student: 'Neha Wagh',
    branch: 'Mechanical',
    projectTitle: 'Lightweight Suspension Prototype',
    detail: 'Stress test screenshots ready for sign-off',
    due: '3 days left',
    timeAgo: '1 hr ago',
    priority: 'Low'
  },
  {
    id: 'rq4',
    icon: BookOpen,
    iconBg: 'rgba(16, 185, 129, 0.12)',
    iconColor: '#10b981',
    category: 'Progress Update',
    student: 'Riya Bhosale',
    branch: 'A&R',
    projectTitle: 'Immersive Heritage Walkthrough',
    detail: 'Scene lighting revisions shared',
    due: 'Next review slot',
    timeAgo: '2 hrs ago',
    priority: 'Low'
  },
  {
    id: 'rq5',
    icon: UploadCloud,
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    category: 'New Upload',
    student: 'Vikram Nair',
    branch: 'Electrical',
    projectTitle: 'Grid Fault Prediction Console',
    detail: 'SCADA ingestion logs attached',
    due: 'Needs acknowledgement',
    timeAgo: '10 mins ago',
    priority: 'High'
  }
]

const announcementSeed = [
  {
    id: 1,
    title: 'Final Synopsis Submission',
    content: 'Upload your synopsis PDF by 6 Feb 6:00 PM. Late submissions move to the next review slot.',
    timestamp: 'Feb 02, 09:00 AM',
    audience: 'All Branches'
  },
  {
    id: 2,
    title: 'Mid-term Demo Rehearsal',
    content: 'Schedule rehearsal in the innovation lab before 10 Feb. Slots close once filled.',
    timestamp: 'Feb 01, 05:30 PM',
    audience: 'CSE & IT'
  }
]

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
  const branchFromState = location.state?.branch

  const [selectedBranch, setSelectedBranch] = useState(
    branchFromState || localStorage.getItem('selectedBranch') || ''
  )
  const [activeSection, setActiveSection] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [announcements, setAnnouncements] = useState(announcementSeed)
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
        const response = await axios.get(`http://localhost:5000/api/students/branch/${selectedBranch}`)
        if (response.data.students) {
          setRegisteredStudents(response.data.students)
          // Initialize discussion and rubric maps
          const newDiscussionMap = {}
          const newRubricScores = {}
          response.data.students.forEach(student => {
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
    // Refresh students every 30 seconds
    const interval = setInterval(fetchStudents, 30000)
    return () => clearInterval(interval)
  }, [selectedBranch])

  // Fetch uploaded projects from API (filtered by branch)
  useEffect(() => {
    const fetchProjects = async () => {
      if (!selectedBranch) return

      setLoadingProjects(true)
      try {
        const response = await axios.get('http://localhost:5000/api/projects')
        if (response.data.projects) {
          // Filter projects by students in the selected branch
          const studentsResponse = await axios.get(`http://localhost:5000/api/students/branch/${selectedBranch}`)
          const studentIds = studentsResponse.data.students.map(s => s.id)

          // Filter projects to only show those from students in selected branch
          const filteredProjects = response.data.projects.filter(project =>
            studentIds.includes(project.studentId.toString()) ||
            studentIds.includes(project.studentId._id?.toString())
          )
          setUploadedProjects(filteredProjects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
    // Refresh projects every 30 seconds
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [selectedBranch])

  // Update project status
  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/projects/${projectId}/status`, {
        status: newStatus
      })
      if (response.data.project) {
        setUploadedProjects(prev =>
          prev.map(p => p._id === projectId ? response.data.project : p)
        )
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update project status')
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
    // Use registered students from API, fallback to mock data if API fails
    return registeredStudents.length > 0 ? registeredStudents : studentsData.filter(student => student.branch === selectedBranch)
  }, [selectedBranch, registeredStudents])

  const reviewQueue = useMemo(() => {
    if (!selectedBranch) return []
    return reviewQueueData.filter(item => item.branch === selectedBranch)
  }, [selectedBranch])

  const suggestionsList = useMemo(() => {
    if (!searchTerm) return []
    return filteredStudents
      .filter(student => student.roll.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleLogout = () => {
    localStorage.removeItem('selectedBranch')
    navigate('/')
  }

  const handleBranchChange = () => {
    localStorage.removeItem('selectedBranch')
    navigate('/teacher/branches')
  }

  const handleSuggestionSelect = (student) => {
    setSelectedStudent(student)
    setSearchTerm(student.roll)
    setShowSuggestions(false)
  }

  const handleAddComment = () => {
    if (!selectedStudent || !commentDraft.trim()) return
    const newEntry = { author: 'You', message: commentDraft.trim(), time: formatNow() }
    setDiscussionMap(prev => ({
      ...prev,
      [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newEntry]
    }))
    setCommentDraft('')
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
        <aside className="sidebar neumorphic">
          <div className="sidebar-header">
            <h2>RSCOE</h2>
            <p>Teacher Portal</p>
          </div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              type="button"
              onClick={() => handleSectionChange('overview')}
            >
              <LayoutDashboard size={20} />
              Overview
            </button>
            <button
              className={`nav-item ${activeSection === 'students' ? 'active' : ''}`}
              type="button"
              onClick={() => handleSectionChange('students')}
            >
              <FileText size={20} />
              Student Tracker
            </button>
            <button
              className={`nav-item ${activeSection === 'reviews' ? 'active' : ''}`}
              type="button"
              onClick={() => handleSectionChange('reviews')}
            >
              <BookOpen size={20} />
              Review Queue
            </button>
            <button
              className={`nav-item ${activeSection === 'announcements' ? 'active' : ''}`}
              type="button"
              onClick={() => handleSectionChange('announcements')}
            >
              <Bell size={20} />
              Announcements
            </button>
            <button className="nav-item subtle" type="button" onClick={handleBranchChange}>
              <Building2 size={20} />
              Change Branch
            </button>
          </nav>
          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p className="headline">Teacher Control Center</p>
              <h1>Projects · {selectedBranch} Branch</h1>
            </div>
            <div className="branch-chip">
              <span>{selectedBranch} Branch</span>
              <button type="button" onClick={handleBranchChange}>
                Change
              </button>
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
                      <span className="suggestion-roll">{student.roll}</span>
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
                        <td>{student.roll || student.email}</td>
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
                  <div key={project._id} className="project-card">
                    <div className="project-card-header">
                      <div>
                        <h3>{project.projectName}</h3>
                        <p className="project-student">
                          <strong>{project.studentName}</strong> • {project.studentEmail}
                        </p>
                      </div>
                      <span className={`status-chip project-status ${project.status}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="project-description-text">{project.description}</p>
                    {project.files && project.files.length > 0 && (
                      <div className="project-files">
                        <p className="files-label">Files ({project.files.length}):</p>
                        <div className="files-list">
                          {project.files.map((file, index) => (
                            <div key={index} className="file-item">
                              <FileText size={16} />
                              <span className="file-name">{file.originalName}</span>
                              <a
                                href={`http://localhost:5000${file.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-link"
                                title="Download"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="project-card-footer">
                      <small className="upload-date">
                        Uploaded: {new Date(project.uploadedAt).toLocaleString()}
                      </small>
                      <div className="status-actions">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
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
                <button className="primary-btn" type="submit">
                  <Plus size={16} />
                  Post Update
                </button>
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
                    <p className="detail-roll">{selectedStudent.roll}</p>
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
                        <p className="label">Domain</p>
                        <p>{selectedStudent.domain}</p>
                      </div>
                      <div>
                        <p className="label">Guide</p>
                        <p>{selectedStudent.guide}</p>
                      </div>
                      <div>
                        <p className="label">Branch</p>
                        <p>{selectedStudent.branch}</p>
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
                      {selectedStudent.timeline.map(item => (
                        <div key={item.label} className={`timeline-node ${item.status}`}>
                          <span className="timeline-dot"></span>
                          <p>{item.label}</p>
                          <small>{item.date}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="documents-card">
                    <h3>Document Viewer</h3>
                    <div className="document-grid">
                      {selectedStudent.documents.map(doc => (
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
                      ))}
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
                      <button className="primary-btn" type="button" onClick={handleAddComment}>
                        <Send size={16} />
                        Send
                      </button>
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

