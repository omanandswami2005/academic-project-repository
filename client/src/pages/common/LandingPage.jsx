import { useNavigate } from 'react-router-dom'
import { ArrowRight, Moon, Sun, BarChart2, Users, FolderOpen, Shield, Zap, GitBranch } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './LandingPage.css'

const features = [
  {
    icon: FolderOpen,
    title: 'Project Repository',
    desc: 'Students upload, track, and manage academic projects with phase-wise milestones.'
  },
  {
    icon: Users,
    title: 'Role-based Dashboards',
    desc: 'Dedicated interfaces for students, teachers, and industry experts.'
  },
  {
    icon: BarChart2,
    title: 'Analytics & Insights',
    desc: 'Skill radar, department stats, and leaderboards to track performance.'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'JWT authentication, encrypted passwords, and cloud file storage.'
  },
  {
    icon: GitBranch,
    title: 'Branch-wise Tracking',
    desc: 'Teachers monitor student progress across departments in real time.'
  },
  {
    icon: Zap,
    title: 'Real-time Feedback',
    desc: 'Rubric-based evaluations and discussion threads on every project.'
  }
]

const LandingPage = () => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="landing-page">
      <header className="landing-nav">
        <span className="landing-logo">APRS</span>
        <div className="landing-nav-actions">
          <button
            type="button"
            className="btn btn-icon theme-toggle-nav"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/role-selection?action=signup')}>
            Get Started
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-badge">Academic Project Repository System</div>
        <h1 className="hero-title">
          Manage academic projects<br />
          <span className="hero-accent">with clarity.</span>
        </h1>
        <p className="hero-subtitle">
          A centralized platform for RSCOE to track student projects, evaluate progress,
          and bridge the gap between academic work and industry standards.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/role-selection?action=signup')}>
            Get Started
            <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
            Log in
          </button>
        </div>
      </section>

      <section className="landing-features">
        <div className="features-grid">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">
                  <Icon size={20} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <p>Rajarshi Shahu College of Engineering, Pune</p>
      </footer>
    </div>
  )
}

export default LandingPage
