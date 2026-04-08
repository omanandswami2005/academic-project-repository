import { Routes, Route } from 'react-router-dom'
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
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute'
import NotFound from './pages/common/NotFound'

function App() {
  return (
    <Routes>
      {/* Public routes — redirect to dashboard if already authenticated */}
      <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
      <Route path="/role-selection" element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup/:role" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
      {/* forgot/reset-password are intentionally always accessible */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/branches" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><BranchSelection /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/expert" element={<ProtectedRoute allowedRoles={['expert']}><IndustryExpertDashboard /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'expert', 'admin']}><HomeDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'expert', 'admin']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute allowedRoles={['student', 'teacher', 'expert', 'admin']}><HelpPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
