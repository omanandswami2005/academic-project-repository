import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Listen for forced logout from the axios token-refresh interceptor
    useEffect(() => {
        const handleForcedLogout = () => {
            setUser(null);
            navigate('/');
        };
        window.addEventListener('auth:logout', handleForcedLogout);
        return () => window.removeEventListener('auth:logout', handleForcedLogout);
    }, [navigate]);

    // Auto-login: restore session from stored JWT on every mount
    useEffect(() => {
        const loadUser = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (!accessToken || !storedUser) {
                setLoading(false);
                return;
            }

            // Restore immediately so ProtectedRoutes don't flicker
            setUser(JSON.parse(storedUser));

            try {
                // Validate token + get fresh profile data from server
                const { data } = await userAPI.getProfile();
                const freshUser = data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            } catch (err) {
                if (err.response?.status === 401) {
                    // Token expired AND refresh failed (interceptor already tried)
                    localStorage.clear();
                    setUser(null);
                }
                // Network/server errors: keep the cached user so offline still works
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    }, []);

    const signup = useCallback(async (userData) => {
        const { data } = await authAPI.signup(userData);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authAPI.logout(refreshToken);
            }
        } catch (err) {
            // Ignore logout errors
        }
        localStorage.clear();
        setUser(null);
    }, []);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
