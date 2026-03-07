import DashboardLayout from '../components/DashboardLayout'
import './HomeDashboard.css'

const quickStats = [
  { label: 'Active Projects', value: 54, sub: 'across all branches' },
  { label: 'Reviews Scheduled', value: 12, sub: 'this week' },
  { label: 'Pending Uploads', value: 8, sub: 'require attention' }
]

const reminders = [
  { title: 'Mid-term evaluation', time: 'CSE • Feb 12, 11:00 AM' },
  { title: 'Industry roundtable', time: 'CSBS • Feb 14, 04:30 PM' },
  { title: 'Final synopsis freeze', time: 'All branches • Feb 18, 06:00 PM' }
]

const HomeDashboard = () => (
  <DashboardLayout
    pageTitle="RSCOE Workspace Overview"
    pageDescription="Unified snapshot for teachers, students, and experts."
  >
    <div className="home-grid">
      <section className="home-card stats-card">
        <h3>Quick Stats</h3>
        <div className="stats-row">
          {quickStats.map((item) => (
            <div key={item.label} className="stat-pill">
              <strong>{item.value}</strong>
              <p>{item.label}</p>
              <span>{item.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-card">
        <h3>Upcoming Reminders</h3>
        <ul className="reminder-list">
          {reminders.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-card">
        <h3>Platform Tips</h3>
        <p>Use the left navigation to jump into role dashboards. Notifications, profile, and help live in the global header.</p>
        <p>Dark mode is available next to the bell icon—perfect for late-night reviews.</p>
      </section>
    </div>
  </DashboardLayout>
)

export default HomeDashboard

