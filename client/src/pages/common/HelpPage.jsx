import DashboardLayout from '../../components/layout/DashboardLayout'
import './SupportPages.css'

const helpArticles = [
  {
    title: 'How do I upload project artifacts?',
    content: 'Navigate to your dashboard → Upload Center. Drag and drop PDFs, PPTs, ZIPs, or choose files. Each upload auto-tags the latest version.'
  },
  {
    title: 'How do I track progress & milestones?',
    content: 'Use the Progress Tracking block in your dashboard. Update percentage, leave notes, and review the horizontal milestone timeline.'
  },
  {
    title: 'What roles exist on the platform?',
    content: 'Students submit work, Teachers review and grade, Industry Experts provide evaluations, and Admins oversee compliance.'
  },
  {
    title: 'Whom should I contact for escalations?',
    content: 'Ping your branch guide directly from the Teacher Feedback panel or email support@rscoe.edu for admin-level requests.'
  }
]

const HelpPage = () => (
  <DashboardLayout>
    <main className="page-content">
      <div className="page-heading">
        <h1>Help & FAQ</h1>
        <p>Quick answers to common questions across uploads, tracking, and communication.</p>
      </div>
      <div className="support-grid">
        <section className="support-card">
          <h3>Frequently Asked</h3>
          <div className="help-list">
            {helpArticles.map(item => (
              <article key={item.title} className="help-item">
                <strong>{item.title}</strong>
                <p>{item.content}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="support-card">
          <h3>Need more support?</h3>
          <p>Email <a href="mailto:support@rscoe.edu">support@rscoe.edu</a> or reach the Innovation cell.</p>
          <div className="help-item">
            <strong>Teacher Contact</strong>
            <p>Use the Feedback panel in your dashboard to notify guides or request a quick sync.</p>
          </div>
          <div className="help-item">
            <strong>Admin Escalation</strong>
            <p>Raise a ticket for login issues, project mapping, or data corrections.</p>
          </div>
        </section>
      </div>
    </main>
  </DashboardLayout>
)

export default HelpPage

