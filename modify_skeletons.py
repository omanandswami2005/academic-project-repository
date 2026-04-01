import re

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'r') as f:
    content = f.read()

# Add a loading state for projects
content = content.replace("const [myProjects, setMyProjects] = useState([])", "const [myProjects, setMyProjects] = useState([])\n  const [projectsLoading, setProjectsLoading] = useState(true)")
content = content.replace("const { data } = await projectAPI.getByStudent(user.id)", "setProjectsLoading(true)\n      const { data } = await projectAPI.getByStudent(user.id)")
content = content.replace("setFeedbackData(fbRes.data?.feedback || [])\n        } catch { /* no feedback yet */ }\n      }", "setFeedbackData(fbRes.data?.feedback || [])\n        } catch { /* no feedback yet */ }\n      }\n      setProjectsLoading(false)")
content = content.replace("} catch (error) {\n      console.error('Error fetching projects:', error)", "} catch (error) {\n      console.error('Error fetching projects:', error)\n      setProjectsLoading(false)")

skeleton_code = """
              {projectsLoading && myProjects.length === 0 && (
                <div className="my-projects-section">
                  <h4>My Uploaded Projects</h4>
                  <div className="projects-list">
                    {[1, 2].map(i => (
                      <div key={i} className="project-item" style={{ animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-secondary, #f9fafb)' }}>
                        <div style={{ height: '24px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '40%', marginBottom: '12px' }} />
                        <div style={{ height: '16px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '80%', marginBottom: '8px' }} />
                        <div style={{ height: '16px', backgroundColor: 'var(--border-subtle, #e5e7eb)', borderRadius: '4px', width: '60%' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
"""

content = content.replace("{myProjects.length > 0 && (", skeleton_code + "\n              {!projectsLoading && myProjects.length > 0 && (")

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'w') as f:
    f.write(content)
