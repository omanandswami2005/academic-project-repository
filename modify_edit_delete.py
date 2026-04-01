import re

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'r') as f:
    content = f.read()

# Add Delete to imports
content = content.replace("Edit,", "Edit,\n  Trash2,")

# Add API handlers for delete and edit
handler_code = """  // Delete project
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId)
        toast.success('Project deleted successfully')
        fetchMyProjects()
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  // State for inline editing project
  const [editingProject, setEditingProject] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', domainTags: '' })

  const startEditingProject = (project) => {
    setEditingProject(project.id)
    setEditForm({
      title: project.title,
      description: project.description,
      domainTags: project.domainTags ? project.domainTags.join(', ') : ''
    })
  }

  const saveProjectEdit = async (projectId) => {
    try {
      await projectAPI.update(projectId, {
        title: editForm.title,
        description: editForm.description,
        domainTags: editForm.domainTags.split(',').map(t => t.trim()).filter(Boolean)
      })
      toast.success('Project updated successfully')
      setEditingProject(null)
      fetchMyProjects()
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  // Format file size"""

content = content.replace("  // Format file size", handler_code)

# Update Project Item UI to show edit/delete
old_project_item = """                          <div className="project-item-header">
                            <div>
                              <h5>{project.title}</h5>
                              {renderStars(stars)}
                            </div>
                            <span className={`status-chip ${project.status}`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="project-description">{project.description}</p>"""

new_project_item = """                          <div className="project-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              {editingProject === project.id ? (
                                <input className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                              ) : (
                                <h5>{project.title}</h5>
                              )}
                              {renderStars(stars)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`status-chip ${project.status}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => editingProject === project.id ? setEditingProject(null) : startEditingProject(project)} aria-label="Edit project">
                                <Edit size={16} />
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDeleteProject(project.id)} aria-label="Delete project">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          {editingProject === project.id ? (
                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                              <textarea className="form-textarea" rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                              <input className="form-input" style={{ marginTop: '8px' }} placeholder="Domain Tags (comma separated)" value={editForm.domainTags} onChange={e => setEditForm({...editForm, domainTags: e.target.value})} />
                              <Button variant="primary" size="sm" style={{ marginTop: '8px' }} onClick={() => saveProjectEdit(project.id)}>Save Changes</Button>
                            </div>
                          ) : (
                            <p className="project-description">{project.description}</p>
                          )}"""

content = content.replace(old_project_item, new_project_item)

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'w') as f:
    f.write(content)
