import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Code, Database, Wrench, Building, Palette, Zap } from 'lucide-react'
import './BranchSelection.css'

const BranchSelection = () => {
  const navigate = useNavigate()

  const branches = [
    { id: 'cse', name: 'CSE', icon: Code, color: '#3b82f6' },
    { id: 'csbs', name: 'CSBS', icon: Database, color: '#8b5cf6' },
    { id: 'it', name: 'IT', icon: Code, color: '#06b6d4' },
    { id: 'mechanical', name: 'Mechanical', icon: Wrench, color: '#f59e0b' },
    { id: 'civil', name: 'Civil', icon: Building, color: '#10b981' },
    { id: 'ar', name: 'A&R', icon: Palette, color: '#ec4899' },
    { id: 'electrical', name: 'Electrical', icon: Zap, color: '#ef4444' }
  ]

  const handleBranchSelect = (branch) => {
    localStorage.setItem('selectedBranch', branch.name)
    navigate('/teacher', { state: { branch: branch.name } })
  }

  return (
    <div className="branch-selection-page">
      <div className="branch-container">
        <button className="back-button" onClick={() => navigate('/teacher')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="branch-header">
          <h1>Select Branch</h1>
          <p>Choose a branch to view and manage projects</p>
        </div>

        <div className="branches-grid">
          {branches.map((branch) => {
            const Icon = branch.icon
            return (
              <div
                key={branch.id}
                className="branch-card glow-effect neumorphic"
                onClick={() => handleBranchSelect(branch)}
              >
                <div className="branch-icon" style={{ color: branch.color }}>
                  <Icon size={48} />
                </div>
                <h2 className="branch-name">{branch.name}</h2>
                <p className="branch-subtitle">Manage {branch.name} projects</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BranchSelection

