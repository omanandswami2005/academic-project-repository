import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Code, Database, Wrench, Building, Palette, Zap } from 'lucide-react'
import './BranchSelection.css'

const BranchSelection = () => {
  const navigate = useNavigate()

  const branches = [
    { id: 'cse', name: 'CSE', icon: Code },
    { id: 'csbs', name: 'CSBS', icon: Database },
    { id: 'it', name: 'IT', icon: Code },
    { id: 'mechanical', name: 'Mechanical', icon: Wrench },
    { id: 'civil', name: 'Civil', icon: Building },
    { id: 'ar', name: 'A&R', icon: Palette },
    { id: 'electrical', name: 'Electrical', icon: Zap }
  ]

  const handleBranchSelect = (branch) => {
    localStorage.setItem('selectedBranch', branch.name)
    navigate('/teacher', { state: { branch: branch.name } })
  }

  return (
    <div className="selection-page">
      <div className="selection-container" style={{ maxWidth: '900px' }}>
        <button className="selection-back" onClick={() => navigate('/teacher')}>
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>

        <div className="selection-header">
          <h1>Select Branch</h1>
          <p>Choose a branch to view and manage projects</p>
        </div>

        <div className="branch-grid">
          {branches.map((branch) => {
            const Icon = branch.icon
            return (
              <button
                key={branch.id}
                className="selection-card"
                onClick={() => handleBranchSelect(branch)}
              >
                <div className="selection-card-icon">
                  <Icon size={28} />
                </div>
                <h2>{branch.name}</h2>
                <p>Manage {branch.name} projects</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BranchSelection

