/**
 * API Client for Project Management System
 * communicates with Node.js backend
 */

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
    // Check if we're running locally
    const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('local');

    // For production, check environment variable first
    if (!isLocalhost) {
        // Priority order:
        // 1. window.PRODUCTION_API_URL (set by build process)
        // 2. Process environment (for Vercel/Netlify)
        // 3. Hardcoded fallback (replace with your URL)

        // Try to get from window object (set during build)
        if (typeof window !== 'undefined' && window.PRODUCTION_API_URL) {
            return window.PRODUCTION_API_URL;
        }

        // Fallback - REPLACE THIS URL with your actual Render backend
        return 'https://management-system-back-end.onrender.com/api';
    }

    return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Get stored token
    getToken() {
        return this.token || localStorage.getItem('token');
    }

    // Set token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // Clear token (logout)
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'حدث خطأ أثناء الطلب');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== Authentication ====================

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.token) {
            this.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    }

    async register(companyName, companyEmail, userName, userEmail, password, confirmPassword) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                company_name: companyName,
                company_email: companyEmail,
                user_name: userName,
                user_email: userEmail,
                password,
                confirm_password: confirmPassword
            })
        });

        if (response.success && response.token) {
            this.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    }

    logout() {
        this.clearToken();
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    // ==================== Projects ====================

    async getProjects() {
        return await this.request('/projects/list');
    }

    async getProject(projectId) {
        return await this.request(`/projects/get?project_id=${projectId}`);
    }

    async createProject(projectData) {
        return await this.request('/projects/create', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async updateProject(projectData) {
        return await this.request('/projects/update', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }

    async deleteProject(projectId) {
        return await this.request('/projects/delete', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId })
        });
    }

    async addMemberToProject(projectId, memberId, role) {
        return await this.request('/projects/add_member', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId, member_id: memberId, role })
        });
    }

    // ==================== Tasks ====================

    async getTasks(filters = {}) {
        const params = new URLSearchParams();
        if (filters.project_id) params.append('project_id', filters.project_id);
        if (filters.status) params.append('status', filters.status);

        const queryString = params.toString();
        return await this.request(`/tasks/list${queryString ? '?' + queryString : ''}`);
    }

    async getTask(taskId) {
        return await this.request(`/tasks/get?task_id=${taskId}`);
    }

    async createTask(taskData) {
        return await this.request('/tasks/create', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(taskData) {
        return await this.request('/tasks/update', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async deleteTask(taskId) {
        return await this.request('/tasks/delete', {
            method: 'POST',
            body: JSON.stringify({ task_id: taskId })
        });
    }

    async changeTaskStatus(taskId, status) {
        return await this.request('/tasks/change_status', {
            method: 'POST',
            body: JSON.stringify({ task_id: taskId, status })
        });
    }

    // ==================== Users ====================

    async getUsers() {
        return await this.request('/users/list');
    }

    async getUserProfile() {
        return await this.request('/users/profile');
    }

    async createUser(userData) {
        return await this.request('/users/create', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userData) {
        return await this.request('/users/update', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return await this.request('/users/delete', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId })
        });
    }

    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return await this.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }
}

// Create global instance
const api = new APIClient();

// Helper functions
function isLoggedIn() {
    return api.isLoggedIn();
}

function getCurrentUser() {
    return api.getCurrentUser();
}

function logout() {
    api.logout();
    window.location.href = 'login.html';
}
