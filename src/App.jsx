import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RoleSelection from './pages/RoleSelection'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import IndustryExpertDashboard from './pages/IndustryExpertDashboard'
import BranchSelection from './pages/BranchSelection'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'
import HomeDashboard from './pages/HomeDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

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

