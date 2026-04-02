/**
 * =====================================================
 * ملف JavaScript الرئيسي
 * Main JavaScript File
 * =====================================================
 */

// الإعدادات الأساسية
const API_BASE_URL = '../';

/**
 * فئة API للتواصل مع الخادم
 */
class API {
    static async request(endpoint, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };

        if (data) {
            options.body = new URLSearchParams(data);
        }

        try {
            const response = await fetch(API_BASE_URL + endpoint, options);
            const result = await response.json();

            if (response.status === 401) {
                window.location.href = 'login.html';
                return null;
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'خطأ في الاتصال' };
        }
    }

    static async getProjects() {
        return this.request('api_projects.php?action=list');
    }

    static async getProject(projectId) {
        return this.request(`api_projects.php?action=get&project_id=${projectId}`);
    }

    static async createProject(data) {
        return this.request('api_projects.php?action=create', 'POST', data);
    }

    static async updateProject(data) {
        return this.request('api_projects.php?action=update', 'POST', data);
    }

    static async deleteProject(projectId) {
        return this.request('api_projects.php?action=delete', 'POST', { project_id: projectId });
    }

    static async getTasks(projectId = null, status = null) {
        let url = 'api_tasks.php?action=list';
        if (projectId) url += `&project_id=${projectId}`;
        if (status) url += `&status=${status}`;
        return this.request(url);
    }

    static async getTask(taskId) {
        return this.request(`api_tasks.php?action=get&task_id=${taskId}`);
    }

    static async createTask(data) {
        return this.request('api_tasks.php?action=create', 'POST', data);
    }

    static async updateTask(data) {
        return this.request('api_tasks.php?action=update', 'POST', data);
    }

    static async deleteTask(taskId) {
        return this.request('api_tasks.php?action=delete', 'POST', { task_id: taskId });
    }

    static async changeTaskStatus(taskId, status) {
        return this.request('api_tasks.php?action=change_status', 'POST', { task_id: taskId, status: status });
    }

    static async getUsers() {
        return this.request('api_users.php?action=list');
    }

    static async getStatistics() {
        return this.request('api_users.php?action=statistics');
    }

    static async getOverdueTasks() {
        return this.request('api_users.php?action=overdue_tasks');
    }

    static async getMyTasks(status = null) {
        let url = 'api_users.php?action=my_tasks';
        if (status) url += `&status=${status}`;
        return this.request(url);
    }

    static async addUser(data) {
        return this.request('api_users.php?action=add_user', 'POST', data);
    }

    static async updateUser(data) {
        return this.request('api_users.php?action=update_user', 'POST', data);
    }
}

/**
 * فئة المساعدات
 */
class Utils {
    /**
     * تحويل التاريخ إلى صيغة عربية
     */
    static formatDateArabic(dateString) {
        const months = {
            '01': 'يناير', '02': 'فبراير', '03': 'مارس',
            '04': 'أبريل', '05': 'مايو', '06': 'يونيو',
            '07': 'يوليو', '08': 'أغسطس', '09': 'سبتمبر',
            '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
        };

        const date = new Date(dateString);
        const day = date.getDate();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day} ${months[month]} ${year}`;
    }

    /**
     * حساب الأيام المتبقية
     */
    static daysRemaining(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    /**
     * الحصول على تصنيف الأولوية
     */
    static getPriorityBadge(priority) {
        const priorities = {
            'low': { label: 'منخفضة', class: 'badge-success' },
            'medium': { label: 'متوسطة', class: 'badge-info' },
            'high': { label: 'عالية', class: 'badge-warning' },
            'urgent': { label: 'عاجلة', class: 'badge-danger' }
        };

        const p = priorities[priority] || priorities['medium'];
        return `<span class="badge ${p.class}">${p.label}</span>`;
    }

    /**
     * الحصول على تصنيف الحالة
     */
    static getStatusBadge(status) {
        const statuses = {
            'todo': { label: 'لم تبدأ', class: 'badge-secondary' },
            'in_progress': { label: 'قيد التنفيذ', class: 'badge-info' },
            'review': { label: 'قيد المراجعة', class: 'badge-warning' },
            'completed': { label: 'مكتملة', class: 'badge-success' },
            'planning': { label: 'التخطيط', class: 'badge-secondary' },
            'on_hold': { label: 'معلقة', class: 'badge-warning' }
        };

        const s = statuses[status] || statuses['todo'];
        return `<span class="badge ${s.class}">${s.label}</span>`;
    }

    /**
     * عرض رسالة نجاح
     */
    static showSuccess(message, duration = 3000) {
        this.showAlert(message, 'success', duration);
    }

    /**
     * عرض رسالة خطأ
     */
    static showError(message, duration = 3000) {
        this.showAlert(message, 'danger', duration);
    }

    /**
     * عرض رسالة تنبيه
     */
    static showAlert(message, type = 'info', duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.main-content') || document.body;
        container.insertBefore(alertDiv, container.firstChild);

        if (duration > 0) {
            setTimeout(() => {
                alertDiv.remove();
            }, duration);
        }
    }

    /**
     * تحميل بيانات المستخدم الحالي
     */
    static loadCurrentUser() {
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');

        if (userName) {
            const userElement = document.getElementById('userName');
            if (userElement) {
                userElement.textContent = userName;
            }
        }

        return { name: userName, role: userRole };
    }

    /**
     * حفظ بيانات المستخدم الحالي
     */
    static saveCurrentUser(name, role) {
        localStorage.setItem('userName', name);
        localStorage.setItem('userRole', role);
    }

    /**
     * التحقق من تسجيل الدخول
     */
    static checkLogin() {
        const userName = localStorage.getItem('userName');
        if (!userName) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * تحويل الكائن إلى صيغة FormData
     */
    static objectToFormData(obj) {
        const formData = new FormData();
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                formData.append(key, obj[key]);
            }
        }
        return formData;
    }

    /**
     * تنسيق الرقم بفواصل
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    /**
     * الحصول على لون الأولوية
     */
    static getPriorityColor(priority) {
        const colors = {
            'low': '#48bb78',
            'medium': '#4299e1',
            'high': '#ed8936',
            'urgent': '#f56565'
        };
        return colors[priority] || '#718096';
    }
}

// تحميل بيانات المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Utils.loadCurrentUser();
});

// معالج الأخطاء العام
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
});

// معالج الأخطاء غير المعالجة في Promise
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
});
