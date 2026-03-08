import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/common/LandingPage'
import RoleSelection from './pages/common/RoleSelection'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import TeacherDashboard from './pages/dashboards/TeacherDashboard'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import IndustryExpertDashboard from './pages/dashboards/IndustryExpertDashboard'
import BranchSelection from './pages/common/BranchSelection'
import ProfilePage from './pages/common/ProfilePage'
import HelpPage from './pages/common/HelpPage'
import HomeDashboard from './pages/dashboards/HomeDashboard'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/signup/:role" element={<SignupPage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/branches" element={<BranchSelection />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/expert" element={<IndustryExpertDashboard />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
