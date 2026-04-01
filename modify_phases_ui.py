import re

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'r') as f:
    content = f.read()

old_phases = """                          <div className="phases-section">
                            <h5 className="phases-title">Project Phases</h5>
                            <div className="phases-list">
                              {phases.map(phase => {
                                const isEditing = editingPhase === `${project.id}-${phase.phaseNumber}`

                                return (
                                  <div key={phase.phaseNumber} className={`phase-item ${phase.completed ? 'completed' : ''}`}>
                                    <div className="phase-header">
                                      <label className="phase-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={phase.completed}
                                          onChange={() => togglePhase(project.id, phase.phaseNumber)}
                                        />
                                        <span className="phase-name">{phase.phaseName}</span>
                                      </label>
                                      {phase.completed && phase.completedAt && (
                                        <small className="phase-date">
                                          Completed: {new Date(phase.completedAt).toLocaleDateString()}
                                        </small>
                                      )}
                                    </div>"""

new_phases = """                          <div className="phases-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <h5 className="phases-title" style={{ margin: 0 }}>Project Phases</h5>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{phases.filter(p => p.completed).length}/{phases.length} phases complete — {Math.round((phases.filter(p => p.completed).length / Math.max(phases.length, 1)) * 100)}%</span>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                              {phases.map(phase => (
                                <div key={`bar-${phase.phaseNumber}`} style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: phase.completed ? 'var(--accent, #4F46E5)' : 'var(--border-primary, #e5e7eb)' }} />
                              ))}
                            </div>

                            <div className="phases-list">
                              {phases.map(phase => {
                                const isEditing = editingPhase === `${project.id}-${phase.phaseNumber}`

                                return (
                                  <div key={phase.phaseNumber} className={`phase-item ${phase.completed ? 'completed' : ''}`}>
                                    <div className="phase-header">
                                      <label className="phase-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={phase.completed}
                                          onChange={() => togglePhase(project.id, phase.phaseNumber)}
                                        />
                                        <span className="phase-name">{phase.phaseName}</span>
                                      </label>
                                      {phase.completed && phase.completedAt && (
                                        <small className="phase-date">
                                          Completed: {new Date(phase.completedAt).toLocaleDateString()}
                                        </small>
                                      )}
                                    </div>"""

content = content.replace(old_phases, new_phases)

with open('client/src/pages/dashboards/StudentDashboard.jsx', 'w') as f:
    f.write(content)
