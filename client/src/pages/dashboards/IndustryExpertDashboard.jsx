import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CheckCircle,
  Download,
  FileText,
  LayoutGrid,
  Search,
  Star,
  Trophy,
  User,
  X
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, feedbackAPI, analyticsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { formatDateIST } from '../../utils/date'
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

const evaluationTemplate = {
  feedback: '',
  innovation: 8,
  feasibility: 7,
  hireability: 8
}

const IndustryExpertDashboard = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
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
  const [apiProjects, setApiProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [domainFilter, setDomainFilter] = useState('')
  const [topStudents, setTopStudents] = useState([])
  const [loadingTopStudents, setLoadingTopStudents] = useState(false)
  const [deptBranch, setDeptBranch] = useState('CSE')
  const [deptStats, setDeptStats] = useState(null)
  const [loadingDeptStats, setLoadingDeptStats] = useState(false)
  const [projectPhases, setProjectPhases] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [evalSubmitted, setEvalSubmitted] = useState(false)

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true)
      try {
        const { data } = await projectAPI.getAll({ visibility: 'public', limit: 50 })
        setApiProjects(data.projects || [])
      } catch {
        // silently fail — loading state handles UI
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  // Fetch top students whenever domain filter changes
  useEffect(() => {
    const fetchTopStudents = async () => {
      setLoadingTopStudents(true)
      try {
        const params = domainFilter ? { domain: domainFilter, limit: 10 } : { limit: 10 }
        const { data } = await analyticsAPI.getTopStudents(params)
        setTopStudents(data.students || [])
      } catch {
        setTopStudents([])
      } finally {
        setLoadingTopStudents(false)
      }
    }
    fetchTopStudents()
  }, [domainFilter])

  // Fetch department stats whenever branch changes
  useEffect(() => {
    const fetchDeptStats = async () => {
      setLoadingDeptStats(true)
      try {
        const { data } = await analyticsAPI.getDepartmentStats(deptBranch)
        setDeptStats(data)
      } catch {
        setDeptStats(null)
      } finally {
        setLoadingDeptStats(false)
      }
    }
    fetchDeptStats()
  }, [deptBranch])

  // Scroll to section when navigated with hash (e.g. /expert#top-students)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [location.hash])

  // Map API projects to display format
  const allProjects = apiProjects.map(p => ({
    ...p,
    student: p.studentName || 'Student',
    roll: p.uniqueProjectId || '',
    branch: p.studentBranch || 'CSE',
    year: new Date(p.createdAt).getFullYear().toString(),
    domain: p.domainTags?.join(', ') || 'General',
    category: p.domainTags?.[0] || 'General',
    technology: p.domainTags?.[0] || 'General',
    progress: Math.round(((p.stars || 0) / 6) * 100),
    innovationScore: p.stars ? (p.stars * 1.5 + 1).toFixed(1) : '7.0',
    status: p.status === 'approved' ? 'On Track' : p.status === 'needs_revision' ? 'Behind' : 'On Track',
    description: p.description,
    problem: p.description,
    techStack: p.domainTags || [],
    team: [{ name: p.studentName || 'Student', role: 'Lead' }],
    documents: [],
    timeline: [],
    featured: (p.stars || 0) >= 3,
  }))

  const uniqueDomains = useMemo(() => {
    const set = new Set()
    apiProjects.forEach(p => (p.domainTags || []).forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [apiProjects])

  const heroStats = useMemo(() => {
    const reviewed = allProjects.filter(p => p.status === 'On Track').length
    const featured = allProjects.filter(p => p.featured).length
    const pending = allProjects.filter(p => p.status !== 'On Track' && p.status !== 'Behind').length
    return [
      { id: 'hs1', label: 'Projects Reviewed', value: String(reviewed), detail: `${allProjects.length} total` },
      { id: 'hs2', label: 'Featured Projects', value: String(featured), detail: 'High innovation' },
      { id: 'hs3', label: 'Pending Responses', value: String(pending), detail: 'Awaiting expert input' }
    ]
  }, [allProjects])

  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
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
  }, [filters, searchTerm, allProjects])

  const featuredProjects = allProjects.filter(project => project.featured)

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const openProject = async (project) => {
    setSelectedProject(project)
    setEvaluation(evaluationTemplate)
    setProjectPhases([])
    setEvalSubmitted(false)
    setLoadingDetail(true)
    try {
      const { data } = await projectAPI.getById(project.id)
      setProjectPhases(data.project?.phases || [])
    } catch {
      // phases not critical — silently ignore
    } finally {
      setLoadingDetail(false)
    }
  }

  const closeProject = () => {
    setSelectedProject(null)
    setEvalSubmitted(false)
  }

  const updateEvaluation = (field, value) => {
    setEvaluation(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <main className="page-content">
        <div className="page-heading">
          <h1>Industry Expert Review</h1>
          <p>Browse curated student projects, inspect artifacts, and leave structured feedback.</p>
        </div>
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

          <section className="projects-section fade-up" id="project-catalog">
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
                    <Button variant="secondary" size="sm" onClick={() => openProject(project)}>View Details</Button>
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

          {/* ── Top Students Leaderboard ── */}
          <section className="analytics-section card fade-up" id="top-students">
            <div className="analytics-header">
              <div className="section-heading">
                <h3><Trophy size={16} /> Top Students by Domain</h3>
                <p>Ranked by total stars earned across all projects</p>
              </div>
              <label className="analytics-filter-label">
                Domain
                <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)}>
                  <option value="">All Domains</option>
                  {uniqueDomains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            {loadingTopStudents ? (
              <p className="loading-text">Loading leaderboard...</p>
            ) : topStudents.length === 0 ? (
              <div className="empty-state">
                <User size={24} />
                <p>No students found{domainFilter ? ` for "${domainFilter}"` : ''}.</p>
              </div>
            ) : (
              <div className="student-leaderboard">
                {topStudents.map((s, i) => (
                  <div key={s.studentId} className="student-rank-card">
                    <span className={`rank-badge rank-${Math.min(i + 1, 4)}`}>{i + 1}</span>
                    <div className="rank-info">
                      <strong>{s.studentName}</strong>
                      <span>{s.branch || '—'} · {s.projectCount} project{s.projectCount !== 1 ? 's' : ''}</span>
                      <div className="rank-domain-tags">
                        {s.domains.slice(0, 3).map(d => <span key={d}>{d}</span>)}
                      </div>
                    </div>
                    <div className="rank-score">
                      <strong>{s.totalStars}</strong>
                      <span><Star size={12} /> stars</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Department Statistics Bar Chart ── */}
          <section className="analytics-section card fade-up">
            <div className="analytics-header">
              <div className="section-heading">
                <h3>Department Statistics</h3>
                <p>Project distribution and domain breakdown by branch</p>
              </div>
              <label className="analytics-filter-label">
                Branch
                <select value={deptBranch} onChange={e => setDeptBranch(e.target.value)}>
                  {branchFilters.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </label>
            </div>
            {loadingDeptStats ? (
              <p className="loading-text">Loading department data...</p>
            ) : deptStats ? (
              <>
                <div className="dept-summary">
                  <div className="dept-stat"><strong>{deptStats.totalStudents}</strong><span>Students</span></div>
                  <div className="dept-stat"><strong>{deptStats.totalProjects}</strong><span>Projects</span></div>
                  <div className="dept-stat"><strong>{deptStats.approvedProjects}</strong><span>Approved</span></div>
                  <div className="dept-stat"><strong>{deptStats.pendingProjects}</strong><span>Pending</span></div>
                  <div className="dept-stat"><strong>{deptStats.averageStars}</strong><span>Avg Stars</span></div>
                </div>
                {deptStats.domainDistribution && deptStats.domainDistribution.length > 0 ? (
                  <div className="dept-bar-chart">
                    <p className="chart-label">Domain Distribution</p>
                    {[...deptStats.domainDistribution]
                      .sort((a, b) => b.count - a.count)
                      .map(item => {
                        const max = Math.max(...deptStats.domainDistribution.map(d => d.count), 1)
                        const pct = Math.round((item.count / max) * 100)
                        return (
                          <div key={item.domain} className="bar-item">
                            <span className="bar-label">{item.domain}</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="bar-count">{item.count}</span>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className="loading-text">No domain data for {deptBranch} yet.</p>
                )}
              </>
            ) : (
              <div className="empty-state"><p>No data available for {deptBranch}.</p></div>
            )}
          </section>
        </div>

        {selectedProject && (
          <div className="expert-modal">
            <div className="modal-card">
              <Button type="button" variant="ghost" size="sm" aria-label="Close" onClick={closeProject} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <X size={16} />
              </Button>
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
                    {evalSubmitted ? (
                      <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        <CheckCircle size={40} style={{ color: 'var(--accent)', margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Evaluation Submitted!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>Your feedback has been saved successfully.</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Button variant="ghost" size="sm" onClick={() => { setEvalSubmitted(false); setEvaluation(evaluationTemplate) }}>Submit Another</Button>
                          <Button variant="secondary" size="sm" onClick={closeProject}>Close</Button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                        <Button variant="primary" size="sm" onClick={async () => {
                          if (!evaluation.feedback.trim()) {
                            toast.error('Please add feedback comments')
                            return
                          }
                          try {
                            const avgRating = Math.round((evaluation.innovation + evaluation.feasibility + evaluation.hireability) / 3) || 3
                            await feedbackAPI.create({
                              projectId: selectedProject.id,
                              rating: Math.min(5, Math.max(1, avgRating)),
                              comment: evaluation.feedback,
                              rubricScores: {
                                innovation: Number(evaluation.innovation),
                                feasibility: Number(evaluation.feasibility),
                                hireability: Number(evaluation.hireability),
                              }
                            })
                            toast.success('Evaluation submitted!')
                            setEvalSubmitted(true)
                          } catch (err) {
                            toast.error(err.response?.data?.message || 'Failed to submit evaluation')
                          }
                        }}>
                          Submit Evaluation
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="modal-card-block">
                    <h4>Project Phases</h4>
                    {loadingDetail ? (
                      <p className="loading-text">Loading phases...</p>
                    ) : (
                      <div className="phase-steps">
                        {projectPhases.length > 0 ? projectPhases.map((phase, i) => (
                          <div key={phase.id || i} className={`phase-step ${phase.completed ? 'done' : ''}`}>
                            <div className="phase-dot">{phase.completed ? '✓' : phase.phaseNumber || i + 1}</div>
                            <div className="phase-info">
                              <strong>{phase.phaseName}</strong>
                              {phase.completed && phase.completedAt && (
                                <span>{formatDateIST(phase.completedAt)}</span>
                              )}
                            </div>
                          </div>
                        )) : (
                          <p className="loading-text">No phase data available yet.</p>
                        )}
                      </div>
                    )}
                    <div className="phase-progress-bar">
                      <div
                        className="phase-progress-fill"
                        style={{
                          width: projectPhases.length > 0
                            ? `${Math.round((projectPhases.filter(p => p.completed).length / projectPhases.length) * 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                    <p className="phase-progress-text">
                      {projectPhases.filter(p => p.completed).length} / {projectPhases.length || 6} phases complete
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}

export default IndustryExpertDashboard

