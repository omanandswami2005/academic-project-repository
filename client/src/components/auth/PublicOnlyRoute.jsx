import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DASHBOARD_MAP = {
    student: '/home',
    teacher: '/home',
    expert: '/home',
    admin: '/home',
};

/**
 * Wraps public-only pages (landing, login, signup, role-selection).
 * While the auth context is initialising (checking stored JWT), a full-screen
 * spinner is shown so the public page never flashes. Once loaded, already-
 * authenticated users are redirected to their dashboard automatically.
 */
export default function PublicOnlyRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--bg-root, #fff)',
            }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    if (user) {
        const destination = DASHBOARD_MAP[user.role] || '/home';
        return <Navigate to={destination} replace />;
    }

    return children;
}
