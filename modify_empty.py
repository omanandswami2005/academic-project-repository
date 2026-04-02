import re

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'r') as f:
    content = f.read()

empty_state_code = """
              {!projectsLoading && myProjects.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-secondary, #f9fafb)', borderRadius: '8px', marginTop: '16px' }}>
                  <Folder size={48} style={{ color: 'var(--text-muted, gray)', margin: '0 auto 16px' }} />
                  <h4 style={{ marginBottom: '8px' }}>No projects yet</h4>
                  <p style={{ color: 'var(--text-muted, gray)', marginBottom: '16px' }}>You haven't uploaded any projects. Upload one above to get started.</p>
                  <Button variant="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Upload a Project</Button>
                </div>
              )}
"""

content = content.replace("</form>", "</form>\n" + empty_state_code)

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'w') as f:
    f.write(content)
