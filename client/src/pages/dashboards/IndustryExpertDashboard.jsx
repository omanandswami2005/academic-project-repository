import { useMemo, useState } from 'react'
import {
  Activity,
  Briefcase,
  Calendar,
  Download,
  Eye,
  FileText,
  LayoutGrid,
  Search,
  User
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import './IndustryExpertDashboard.css'

const branchFilters = ['All', 'CSE', 'CSBS', 'IT', 'Mechanical', 'Electrical', 'Civil', 'A&R']
const techFilters = ['All', 'AI', 'ML', 'IoT', 'AR/VR', 'Cloud', 'Data']
const yearFilters = ['All', '2024', '2023', '2022']
const categoryFilters = ['All', 'Smart Systems', 'Analytics', 'Product Design', 'Experience']
const completionBrackets = [
  { id: 'all', label: 'Any' },
  { id: '0-50', label: '0 - 50%' },
  { id: '50-80', label: '50 - 80%' },
  { id: '80-100', label: '80 - 100%' }
]

const projectCatalog = [
  {
    id: 1,
    title: 'Predictive Maintenance Grid',
    student: 'Vikram Nair',
    roll: 'RSCOE-EE-011',
    branch: 'Electrical',
    year: '2024',
    domain: 'AI + IoT',
    category: 'Smart Systems',
    technology: 'AI',
    progress: 82,
    innovationScore: 9.1,
    status: 'On Track',
    description: 'Proactive maintenance console predicting feeder faults from live SCADA telemetry.',
    problem: 'Manual logging leads to reactive maintenance and prolonged outages.',
    techStack: ['Python', 'TensorFlow', 'Azure IoT Edge'],
    team: [
      { name: 'Vikram Nair', role: 'Lead Engineer' },
      { name: 'Shreya Tawde', role: 'Data Analyst' }
    ],
    documents: ['Synopsis.pdf', 'ArchitectureDeck.pptx', 'Firmware.zip'],
    timeline: [
      { label: 'Topic Approval', status: 'completed', date: 'Jan 05' },
      { label: 'Prototype', status: 'completed', date: 'Jan 24' },
      { label: 'Pilot Run', status: 'current', date: 'Feb 08' },
      { label: 'Field Trials', status: 'upcoming', date: 'Mar 14' },
      { label: 'Handover', status: 'upcoming', date: 'Apr 10' }
    ],
    featured: true
  },
  {
    id: 2,
    title: 'Immersive Heritage Walkthrough',
    student: 'Riya Bhosale',
    roll: 'RSCOE-AR-006',
    branch: 'A&R',
    year: '2024',
    domain: 'AR/VR Experience',
    category: 'Experience',
    technology: 'AR/VR',
    progress: 74,
    innovationScore: 8.6,
    status: 'On Track',
    description: 'Story-led AR tour narrating campus heritage with multilingual captions.',
    problem: 'Visitors miss contextual narratives during physical tours.',
    techStack: ['Unity', 'Blender', 'Azure Spatial Anchors'],
    team: [
      { name: 'Riya Bhosale', role: 'Experience Designer' },
      { name: 'Kabir Patil', role: '3D Artist' }
    ],
    documents: ['ExperienceFlow.pdf', 'Storyboard.pptx'],
    timeline: [
      { label: 'Research', status: 'completed', date: 'Jan 04' },
      { label: 'Assets', status: 'completed', date: 'Jan 21' },
      { label: 'Interactions', status: 'current', date: 'Feb 06' },
      { label: 'Testing', status: 'upcoming', date: 'Mar 05' },
      { label: 'Launch', status: 'upcoming', date: 'Apr 02' }
    ],
    featured: true
  },
  {
    id: 3,
    title: 'Supply Chain Intelligence Hub',
    student: 'Maitri Deshmukh',
    roll: 'RSCOE-CSBS-014',
    branch: 'CSBS',
    year: '2024',
    domain: 'Data Analytics',
    category: 'Analytics',
    technology: 'ML',
    progress: 67,
    innovationScore: 8.2,
    status: 'On Track',
    description: 'Predictive dashboard forecasting SKU depletion and supplier delays.',
    problem: 'Procurement teams rely on stale spreadsheets for ordering decisions.',
    techStack: ['PowerBI', 'Python', 'Snowflake'],
    team: [{ name: 'Maitri Deshmukh', role: 'Data Storyteller' }],
    documents: ['BusinessCase.pdf', 'ModelCard.docx'],
    timeline: [
      { label: 'Discovery', status: 'completed', date: 'Jan 03' },
      { label: 'Data Cleaning', status: 'completed', date: 'Jan 18' },
      { label: 'Modeling', status: 'current', date: 'Feb 04' },
      { label: 'Pilot', status: 'upcoming', date: 'Mar 02' },
      { label: 'Rollout', status: 'upcoming', date: 'Apr 05' }
    ],
    featured: false
  },
  {
    id: 4,
    title: 'Adaptive Suspension Prototype',
    student: 'Neha Wagh',
    roll: 'RSCOE-MECH-004',
    branch: 'Mechanical',
    year: '2024',
    domain: 'Product Design',
    category: 'Product Design',
    technology: 'Product',
    progress: 58,
    innovationScore: 7.9,
    status: 'Behind',
    description: 'Lightweight suspension that tunes damping based on live load signatures.',
    problem: 'Race vehicles lose time between stages adjusting suspension manually.',
    techStack: ['ANSYS', 'SolidWorks', 'MATLAB'],
    team: [
      { name: 'Neha Wagh', role: 'Design Lead' },
      { name: 'Rohit Mane', role: 'Simulation Engineer' }
    ],
    documents: ['StressPlots.pdf', 'PrototypePhotos.zip'],
    timeline: [
      { label: 'Concept', status: 'completed', date: 'Jan 09' },
      { label: 'CAD', status: 'completed', date: 'Jan 29' },
      { label: 'Fabrication', status: 'current', date: 'Feb 12' },
      { label: 'Track Tests', status: 'upcoming', date: 'Mar 18' },
      { label: 'OEM Review', status: 'upcoming', date: 'Apr 12' }
    ],
    featured: false
  }
]

const evaluationTemplate = {
  feedback: '',
  innovation: 8,
  feasibility: 7,
  hireability: 8
}

const heroStats = [
  { id: 'hs1', label: 'Projects Reviewed', value: '32', detail: '+4 this week' },
  { id: 'hs2', label: 'Featured Projects', value: '8', detail: 'High innovation' },
  { id: 'hs3', label: 'Pending Responses', value: '5', detail: 'Awaiting expert input' }
]

const IndustryExpertDashboard = () => {
  const [filters, setFilters] = useState({
    branch: 'All',
    technology: 'All',
    completion: 'all',
    year: 'All',
    category: 'All'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [evaluation, setEvaluation] = useState(evaluationTemplate)

  const filteredProjects = useMemo(() => {
    return projectCatalog.filter(project => {
      const branchOk = filters.branch === 'All' || project.branch === filters.branch
      const techOk = filters.technology === 'All' || project.technology === filters.technology
      const yearOk = filters.year === 'All' || project.year === filters.year
      const categoryOk = filters.category === 'All' || project.category === filters.category
      const completionOk =
        filters.completion === 'all' ||
        (filters.completion === '0-50' && project.progress <= 50) ||
        (filters.completion === '50-80' && project.progress > 50 && project.progress <= 80) ||
        (filters.completion === '80-100' && project.progress > 80)
      const searchOk =
        !searchTerm.trim() ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.roll.toLowerCase().includes(searchTerm.toLowerCase())

      return branchOk && techOk && yearOk && categoryOk && completionOk && searchOk
    })
  }, [filters, searchTerm])

  const featuredProjects = projectCatalog.filter(project => project.featured)

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const openProject = (project) => {
    setSelectedProject(project)
    setEvaluation(evaluationTemplate)
  }

  const closeProject = () => setSelectedProject(null)

  const updateEvaluation = (field, value) => {
    setEvaluation(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout
      pageTitle="Industry Expert Review"
      pageDescription="Browse curated student projects, inspect artifacts, and leave structured feedback."
    >
      <div className="expert-dashboard">
        <section className="expert-hero card fade-up">
          <div className="hero-intro">
            <p>Industry Overview</p>
            <h2>Stay ahead of the most promising RSCOE projects</h2>
            <span>Filters and featured picks refresh in real time.</span>
          </div>
          <div className="hero-grid">
            {heroStats.map(stat => (
              <div key={stat.id} className="hero-metric">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
                <small>{stat.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="filter-panel card fade-up">
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search students, projects, roll numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-grid">
              <label>
                Branch
                <select value={filters.branch} onChange={(e) => handleFilterChange('branch', e.target.value)}>
                  {branchFilters.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Technology
                <select value={filters.technology} onChange={(e) => handleFilterChange('technology', e.target.value)}>
                  {techFilters.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Completion
                <select value={filters.completion} onChange={(e) => handleFilterChange('completion', e.target.value)}>
                  {completionBrackets.map(bracket => (
                    <option key={bracket.id} value={bracket.id}>
                      {bracket.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Year
                <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}>
                  {yearFilters.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Category
                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                  {categoryFilters.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="featured-section fade-up">
          <div className="section-heading">
            <h3>Featured for Review</h3>
            <p>High-impact ideas curated for industry eyes</p>
          </div>
          <div className="featured-grid">
            {featuredProjects.map(project => (
              <button key={project.id} type="button" className="featured-card" onClick={() => openProject(project)}>
                <div className="featured-thumb" />
                <div className="featured-body">
                  <div className="featured-top">
                    <span className="badge">{project.category}</span>
                    <span className="score-chip">Innovation {project.innovationScore}</span>
                  </div>
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <div className="featured-meta">
                    <span>{project.student}</span>
                    <span>{project.branch} • {project.year}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="projects-section fade-up">
          <div className="section-heading">
            <h3>All Projects</h3>
            <p>{filteredProjects.length} projects match your filters</p>
          </div>
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-head">
                  <div>
                    <h4>{project.title}</h4>
                    <span>{project.student} • {project.roll}</span>
                  </div>
                  <span className={`status-chip ${project.status.toLowerCase().replace(' ', '-')}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  <span>{project.branch}</span>
                  <span>{project.domain}</span>
                  <span>{project.category}</span>
                </div>
                <div className="project-footer">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span>{project.progress}%</span>
                  <button type="button" onClick={() => openProject(project)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="empty-state">
                <LayoutGrid size={24} />
                <p>No projects match those filters. Try broadening your search.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedProject && (
        <div className="expert-modal">
          <div className="modal-card">
            <button type="button" className="close-btn" onClick={closeProject}>
              ×
            </button>
            <header className="modal-header">
              <div>
                <p>{selectedProject.branch} • {selectedProject.category}</p>
                <h2>{selectedProject.title}</h2>
              </div>
              <span className="score-chip">Progress {selectedProject.progress}%</span>
            </header>
            <div className="modal-grid">
              <div className="modal-column">
                <div className="modal-card-block">
                  <h4>Project Snapshot</h4>
                  <p>{selectedProject.description}</p>
                  <div className="info-grid">
                    <div>
                      <span>Student</span>
                      <strong>{selectedProject.student}</strong>
                    </div>
                    <div>
                      <span>Roll No</span>
                      <strong>{selectedProject.roll}</strong>
                    </div>
                    <div>
                      <span>Domain</span>
                      <strong>{selectedProject.domain}</strong>
                    </div>
                    <div>
                      <span>Year</span>
                      <strong>{selectedProject.year}</strong>
                    </div>
                  </div>
                </div>
                <div className="modal-card-block">
                  <h4>Problem Statement</h4>
                  <p>{selectedProject.problem}</p>
                </div>
                <div className="modal-card-block">
                  <h4>Timeline</h4>
                  <div className="timeline">
                    {selectedProject.timeline.map(item => (
                      <div key={item.label} className={`timeline-node ${item.status}`}>
                        <div className="dot" />
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.date || 'Pending'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-card-block">
                  <h4>Documents</h4>
                  <div className="document-list">
                    {selectedProject.documents.map(doc => (
                      <button key={doc} type="button">
                        <FileText size={16} />
                        {doc}
                        <Download size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-column">
                <div className="modal-card-block">
                  <h4>Team</h4>
                  <ul>
                    {selectedProject.team.map(member => (
                      <li key={member.name}>
                        <User size={16} />
                        <div>
                          <strong>{member.name}</strong>
                          <span>{member.role}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-card-block">
                  <h4>Tech Stack</h4>
                  <div className="tag-row">
                    {selectedProject.techStack.map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-card-block">
                  <h4>Expert Evaluation</h4>
                  <textarea
                    rows="3"
                    placeholder="Share comments for the student team..."
                    value={evaluation.feedback}
                    onChange={(e) => updateEvaluation('feedback', e.target.value)}
                  />
                  <label>
                    Innovation ({evaluation.innovation})
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evaluation.innovation}
                      onChange={(e) => updateEvaluation('innovation', Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Feasibility ({evaluation.feasibility})
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evaluation.feasibility}
                      onChange={(e) => updateEvaluation('feasibility', Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Hireability ({evaluation.hireability})
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evaluation.hireability}
                      onChange={(e) => updateEvaluation('hireability', Number(e.target.value))}
                    />
                  </label>
                  <button type="button" className="primary-btn">
                    Submit Evaluation
                  </button>
                </div>
                <div className="modal-card-block">
                  <h4>Progress Trend</h4>
                  <div className="mini-chart">
                    <Activity size={42} />
                    <div>
                      <strong>Consistency 86%</strong>
                      <span>Stable output past 3 sprints</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default IndustryExpertDashboard

