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
  User,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { notificationAPI } from '../../services/api'
import './DashboardLayout.css'

const DashboardLayout = ({ onLogout, children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 })
      setNotifications(data.notifications || [])
    } catch {
      // silently fail
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
  }

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }
    await logout()
    navigate('/')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="app-shell">
      <header className="global-nav">
        <div className="global-nav-left">
          <button className="logo" type="button" onClick={() => navigate('/home')}>APRS</button>
          <form className="global-search" onSubmit={handleSearch}>
            <Search size={15} />
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
        <div className="global-nav-right">
          <nav className="nav-links">
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
                  <Icon size={15} />
                  <span className="nav-pill-label">{link.label}</span>
                  {link.id === 'notifications' && unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                  )}
                </button>
              )
            })}
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className="btn-icon theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button type="button" className="btn-icon logout-btn" onClick={handleLogout} aria-label="Logout">
              <LogOut size={16} />
            </button>
          </div>
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button type="button" className="btn-icon" onClick={() => setShowNotifications(false)}>
                  <X size={14} />
                </button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="notifications-empty">No notifications yet</p>
                ) : (
                  notifications.map(item => (
                    <div key={item.id} className={`notification-item ${item.read ? '' : 'unread'}`}>
                      <p>{item.message}</p>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="app-body">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout

