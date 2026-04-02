import re

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'r') as f:
    content = f.read()

old_analytics = """              <div className="analytics-grid">
                <div className="analytics-tile">
                  <div className="analytics-icon"><CheckSquare size={18} /></div>
                  <div>
                    <p>Phase completion</p>
                    <strong>{completion}%</strong>
                    <small>overall</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><Folder size={18} /></div>
                  <div>
                    <p>Total projects</p>
                    <strong>{myProjects.length}</strong>
                    <small>uploaded</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><BarChart3 size={18} /></div>
                  <div>
                    <p>Total stars</p>
                    <strong>{myProjects.reduce((sum, p) => sum + (p.stars || 0), 0)}</strong>
                    <small>earned</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><MessageSquare size={18} /></div>
                  <div>
                    <p>Feedback received</p>
                    <strong>{feedbackData.length}</strong>
                    <small>reviews</small>
                  </div>
                </div>
              </div>"""

new_analytics = """              <div className="analytics-grid">
                <div className="analytics-tile">
                  <div className="analytics-icon"><Folder size={18} /></div>
                  <div>
                    <p>Total Projects</p>
                    <strong>{myProjects.length}</strong>
                    <small>uploaded</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><CheckSquare size={18} /></div>
                  <div>
                    <p>Approved</p>
                    <strong>{myProjects.filter(p => p.status === 'approved').length}</strong>
                    <small>projects</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><BarChart3 size={18} /></div>
                  <div>
                    <p>Under Review</p>
                    <strong>{myProjects.filter(p => p.status === 'under_review').length}</strong>
                    <small>projects</small>
                  </div>
                </div>
                <div className="analytics-tile">
                  <div className="analytics-icon"><MessageSquare size={18} /></div>
                  <div>
                    <p>Pending</p>
                    <strong>{myProjects.filter(p => p.status === 'pending').length}</strong>
                    <small>projects</small>
                  </div>
                </div>
              </div>"""

content = content.replace(old_analytics, new_analytics)

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'w') as f:
    f.write(content)
