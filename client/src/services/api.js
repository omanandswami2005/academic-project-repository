import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.clear();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ─── Auth API ───
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
    logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    updatePassword: (data) => api.patch('/auth/update-password', data),
};

// ─── User API ───
export const userAPI = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data) => api.patch('/users/me', data),
    getUserById: (id) => api.get(`/users/${id}`),
};

// ─── Project API ───
export const projectAPI = {
    create: (formData) =>
        api.post('/projects', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getAll: (params) => api.get('/projects', { params }),
    getById: (id) => api.get(`/projects/${id}`),
    update: (id, data) => api.patch(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
    updatePhase: (id, data) => api.patch(`/projects/${id}/phase`, data),
    updatePhases: (id, phases) => api.patch(`/projects/${id}/phases`, { phases }),
    getByStudent: (studentId) => api.get(`/projects/student/${studentId}`),
    search: (params) => api.get('/projects/search', { params }),
    // FR3/33: Fork
    fork: (id) => api.post(`/projects/${id}/fork`),
    // FR7: Group invitations
    invite: (id, data) => api.post(`/projects/${id}/invite`, data),
    getMyInvitations: () => api.get('/projects/invitations/me'),
    respondInvite: (id, action) => api.patch(`/projects/invitations/${id}`, { action }),
    // FR9: Mentor request
    requestMentor: (id, mentorId) => api.patch(`/projects/${id}/mentor`, { mentorId }),
    respondMentor: (id, action) => api.patch(`/projects/${id}/mentor/respond`, { action }),
    // FR13: Deadlines
    setDeadlines: (id, deadlines) => api.patch(`/projects/${id}/deadlines`, { deadlines }),
    // FR15: Overdue
    getOverdue: (params) => api.get('/projects/overdue', { params }),
};

// ─── Student API ───
export const studentAPI = {
    getAll: () => api.get('/students'),
    getByBranch: (branch) => api.get(`/students/branch/${branch}`),
    getSkills: (id) => api.get(`/students/${id}/skills`),
};

// ─── Feedback API ───
export const feedbackAPI = {
    create: (data) => api.post('/feedback', data),
    getByProject: (projectId) => api.get(`/feedback/project/${projectId}`),
};

// ─── Notification API ───
export const notificationAPI = {
    getAll: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
};

// ─── Analytics API ───
export const analyticsAPI = {
    getSkillRadar: (userId) => api.get(`/analytics/skills/${userId}`),
    getDepartmentStats: (branch) => api.get(`/analytics/department/${branch}`),
    getTopStudents: (params) => api.get('/analytics/top-students', { params }),
};

// ─── File API ───
export const fileAPI = {
    upload: (formData) =>
        api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getUrl: (key) => api.get(`/files/${key}`),
    delete: (key) => api.delete(`/files/${key}`),
};

// ─── Portfolio API ───
export const portfolioAPI = {
    get: (userId) => api.get(`/portfolio/${userId}`),
};

// ─── Report API ───
export const reportAPI = {
    department: (branch) => api.get(`/reports/department/${branch}`),
    student: (id) => api.get(`/reports/student/${id}`),
};

export default api;
