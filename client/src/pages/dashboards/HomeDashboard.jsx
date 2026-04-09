import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, notificationAPI } from '../../services/api'
import { FolderOpen, Clock, CheckCircle, Users, BookOpen, BarChart2, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import './HomeDashboard.css'

const CACHE_KEY = 'aprs_home_cache'
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return parsed.data
  } catch { return null }
}

const setCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })) } catch { /* ignore */ }
}

const roleLinks = {
  student: [
    { label: 'My Projects', path: '/student', icon: FolderOpen },
    { label: 'Task Board', path: '/student', icon: CheckCircle },
    { label: 'My Profile', path: '/profile', icon: Users },
  ],
  teacher: [
    { label: 'Review Projects', path: '/teacher', icon: FolderOpen },
    { label: 'Student Tracker', path: '/teacher', icon: Users },
    { label: 'Branch Overview', path: '/teacher/branches', icon: BarChart2 },
  ],
  expert: [
    { label: 'Project Catalog', path: '/expert#project-catalog', icon: BookOpen },
    { label: 'Top Students', path: '/expert#top-students', icon: Users },
    { label: 'My Profile', path: '/profile', icon: BarChart2 },
  ],
  admin: [
    { label: 'All Projects', path: '/home', icon: FolderOpen },
    { label: 'My Profile', path: '/profile', icon: Users },
  ],
}

const HomeDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projectStats, setProjectStats] = useState({ total: 0, pending: 0, approved: 0, inProgress: 0 })
  const [recentNotifs, setRecentNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    // Try cache first
    const cached = getCache()
    if (cached) {
      setProjectStats(cached.projectStats)
      setRecentNotifs(cached.recentNotifs)
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const [projRes, notifRes] = await Promise.all([
          projectAPI.getAll({ limit: 100 }),
          notificationAPI.getAll({ limit: 5 }),
        ])
        const all = projRes.data.projects || []
        const stats = {
          total: projRes.data.pagination?.total || all.length,
          pending: all.filter(p => p.status === 'pending').length,
          approved: all.filter(p => p.status === 'approved').length,
          inProgress: all.filter(p => p.status === 'in_progress').length,
        }
        const notifs = notifRes.data.notifications?.slice(0, 4) || []
        setProjectStats(stats)
        setRecentNotifs(notifs)
        setCache({ projectStats: stats, recentNotifs: notifs })
      } catch {
        toast.error('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const links = useMemo(() => roleLinks[user?.role] || roleLinks.student, [user?.role])

  const statCards = useMemo(() => [
    { label: 'Total Projects', value: projectStats.total, icon: FolderOpen },
    { label: 'Pending Review', value: projectStats.pending, icon: Clock },
    { label: 'Approved', value: projectStats.approved, icon: CheckCircle },
    { label: 'In Progress', value: projectStats.inProgress, icon: BarChart2 },
  ], [projectStats])

  return (
    <DashboardLayout>
      <main className="page-content">
        <div className="page-heading">
          <h1>Workspace Overview</h1>
          <p>{`Welcome back, ${user?.username || 'User'} — ${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} · ${user?.branch || ''}`}</p>
        </div>
        <div className="home-grid">

          <section className="home-card stats-card">
            <h3>Platform Overview</h3>
            <div className="stats-row">
              {statCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="stat-pill">
                  <Icon size={18} />
                  <strong>{loading ? '–' : value}</strong>
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="home-card">
            <h3>Quick Navigation</h3>
            <p className="home-muted" style={{ marginBottom: '0.75rem' }}>Jump to your most-used areas.</p>
            <div className="quick-links">
              {links.map(({ label, path, icon: Icon }) => (
                <button
                  key={label}
                  className="quick-link-btn"
                  onClick={() => navigate(path)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="home-card">
            <h3><Bell size={16} /> Recent Notifications</h3>
            {recentNotifs.length === 0 ? (
              <p className="home-muted" style={{ marginTop: '0.5rem' }}>
                {loading ? 'Loading…' : 'No notifications yet.'}
              </p>
            ) : (
              <ul className="notif-preview-list">
                {recentNotifs.map(n => (
                  <li key={n.id} className={`notif-preview-item${n.read ? '' : ' unread'}`}>
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-msg">{n.message}</span>
                  </li>
                ))}
              </ul>
            )}
            <button className="see-all-btn" onClick={() => navigate('/profile')}>
              View Profile & Settings →
            </button>
          </section>

          <section className="home-card">
            <h3>Tips</h3>
            <ul className="reminder-list">
              <li>Use the top navigation bar to switch sections.</li>
              <li>Dark mode toggle is next to the notification bell.</li>
              <li>Teachers can approve projects from the branch view.</li>
              <li>Students: mark phases complete as you progress.</li>
              <li>Industry experts can evaluate and score public projects.</li>
            </ul>
          </section>

        </div>
      </main>
    </DashboardLayout>
  )
}

export default HomeDashboard

