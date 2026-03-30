import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the user's appropriate dashboard
        const dashboardMap = {
            student: '/student',
            teacher: '/teacher',
            expert: '/expert',
            admin: '/teacher',
        };
        return <Navigate to={dashboardMap[user.role] || '/'} replace />;
    }

    return children;
}
