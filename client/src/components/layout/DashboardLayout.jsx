import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  HelpCircle,
  Home,
  LayoutGrid,
  LogOut,
  Moon,
  Search,
  Sun,
  User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationAPI } from '../../services/api'
import './DashboardLayout.css'

const DashboardLayout = ({ pageTitle, pageDescription, onLogout, children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('rscoe-theme') === 'dark')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch real notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 })
      setNotifications(data.notifications || [])
    } catch {
      // Silently fail if notifications endpoint not ready
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const baseSegment = location.pathname.split('/')[1] || ''
  const dashboardSegments = ['teacher', 'student', 'expert']

  useEffect(() => {
    if (dashboardSegments.includes(baseSegment)) {
      localStorage.setItem('rscoe-last-dashboard', `/${baseSegment}`)
    }
  }, [baseSegment])

  const storedDashboard = localStorage.getItem('rscoe-last-dashboard') || '/student'
  const projectsPath = dashboardSegments.includes(baseSegment) ? `/${baseSegment}` : storedDashboard

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'projects', label: 'Projects', icon: LayoutGrid, path: projectsPath },
    { id: 'notifications', label: 'Notifications', icon: Bell, action: () => setShowNotifications(prev => !prev) },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'help', label: 'Help', icon: HelpCircle, path: '/help' }
  ]

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode)
    localStorage.setItem('rscoe-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const handleNav = (link) => {
    if (link.action) {
      link.action()
      return
    }
    navigate(link.path)
    setShowNotifications(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    alert(`Searching for "${searchTerm}" across students, projects, and documents.`)
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }
    await logout()
    navigate('/')
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'dark' : ''}`}>
      <header className="global-nav">
        <div className="global-nav-left">
          <div className="logo">RSCOE</div>
          {user && (
            <div className="user-greeting" style={{ marginLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
            </div>
          )}
          <form className="global-search" onSubmit={handleSearch}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search students, projects, documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        <div className="global-nav-right">
          <div className="nav-links">
            {navLinks.map(link => {
              const Icon = link.icon
              const isActive = link.path ? location.pathname.startsWith(link.path) : false
              return (
                <button
                  key={link.id}
                  type="button"
                  className={`nav-pill ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(link)}
                >
                  <Icon size={16} />
                  {link.label}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDarkMode(prev => !prev)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button type="button" className="nav-pill danger" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
          {showNotifications && (
            <div className="global-notifications">
              {notifications.length === 0 ? (
                <div className="notification-row">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map(item => (
                  <div key={item.id} className="notification-row">
                    <p>{item.message}</p>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </header>
      <div className="layout-content">
        {(pageTitle || pageDescription) && (
          <div className="layout-heading">
            {pageTitle && <h1>{pageTitle}</h1>}
            {pageDescription && <p>{pageDescription}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout

