/**
 * =====================================================
 * ملف JavaScript لصفحة لوحة التحكم
 * Dashboard JavaScript
 * =====================================================
 */

// التحقق من تسجيل الدخول
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

/**
 * تحميل الإحصائيات
 */
async function loadStatistics() {
    try {
        const projectsResult = await api.getProjects();
        const tasksResult = await api.getTasks();

        if (projectsResult.success && tasksResult.success) {
            const projects = projectsResult.data;
            const tasks = tasksResult.data;

            // حساب الإحصائيات
            const totalProjects = projects.length;
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'completed').length;

            // حساب المهام المتأخرة
            const today = new Date();
            const overdueTasks = tasks.filter(t => {
                if (t.deadline && t.status !== 'completed') {
                    return new Date(t.deadline) < today;
                }
                return false;
            }).length;

            // نسبة الإنجاز
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            // تحديث الإحصائيات
            document.getElementById('totalProjects').textContent = totalProjects;
            document.getElementById('totalTasks').textContent = totalTasks;
            document.getElementById('completedTasks').textContent = completedTasks;
            document.getElementById('overdueTasks').textContent = overdueTasks;

            // تحديث شريط التقدم
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            progressBar.style.width = completionRate + '%';
            progressText.textContent = completionRate + '%';

            // تحديث حالة المشاريع
            const activeProjects = projects.filter(p => p.status === 'in_progress').length;
            const completedProjectsCount = projects.filter(p => p.status === 'completed').length;
            const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;

            document.getElementById('activeProjects').textContent = activeProjects;
            document.getElementById('completedProjects').textContent = completedProjectsCount;
            document.getElementById('onHoldProjects').textContent = onHoldProjects;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * تحميل المهام الأخيرة
 */
async function loadRecentTasks() {
    try {
        const result = await api.getTasks();

        if (result.success) {
            const tasks = result.data.slice(0, 5); // أول 5 مهام
            const tasksList = document.getElementById('recentTasksList');

            if (tasks.length === 0) {
                tasksList.innerHTML = '<p class="text-muted text-center">لا توجد مهام موكلة لك</p>';
                return;
            }

            tasksList.innerHTML = tasks.map(task => `
                <div class="task-item ${task.status === 'completed' ? 'completed' : ''} ${task.priority === 'urgent' ? 'urgent' : ''}">
                    <div class="task-info">
                        <div class="task-title">
                            <i class="fas fa-check-square"></i> ${task.task_title}
                        </div>
                        <div class="task-meta">
                            <span>
                                <i class="fas fa-project-diagram"></i> ${task.project_name || 'بدون مشروع'}
                            </span>
                            <span>
                                <i class="fas fa-calendar"></i> ${formatDateArabic(task.deadline)}
                            </span>
                            <span>
                                ${getPriorityBadge(task.priority)}
                            </span>
                        </div>
                    </div>
                    <div>
                        ${getStatusBadge(task.status)}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent tasks:', error);
    }
}

/**
 * إنشاء مشروع جديد
 */
async function createProject() {
    const form = document.getElementById('newProjectForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    if (!data.project_name) {
        showAlert('يرجى إدخال اسم المشروع', 'warning');
        return;
    }

    try {
        const result = await api.createProject(data);

        if (result.success) {
            showAlert('تم إنشاء المشروع بنجاح', 'success');
            form.reset();

            // Properly close modal and return focus
            const modalElement = document.getElementById('newProjectModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
                setTimeout(() => {
                    document.querySelector('[data-bs-target="#newProjectModal"]').focus();
                }, 100);
            }

            // إعادة تحميل الإحصائيات
            loadStatistics();
        } else {
            showAlert(result.message || 'حدث خطأ أثناء إنشاء المشروع', 'danger');
        }
    } catch (error) {
        showAlert('حدث خطأ أثناء إنشاء المشروع: ' + error.message, 'danger');
    }
}

/**
 * تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadRecentTasks();

    // تحديث البيانات كل 30 ثانية
    setInterval(() => {
        loadStatistics();
        loadRecentTasks();
    }, 30000);
});

// Helper functions
function formatDateArabic(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = {
        '0': 'يناير', '1': 'فبراير', '2': 'مارس',
        '3': 'أبريل', '4': 'مايو', '5': 'يونيو',
        '6': 'يوليو', '7': 'أغسطس', '8': 'سبتمبر',
        '9': 'أكتوبر', '10': 'نوفمبر', '11': 'ديسمبر'
    };
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getPriorityBadge(priority) {
    const priorities = {
        'low': { label: 'منخفضة', class: 'bg-success' },
        'medium': { label: 'متوسطة', class: 'bg-info' },
        'high': { label: 'عالية', class: 'bg-warning' },
        'urgent': { label: 'عاجلة', class: 'bg-danger' }
    };
    const p = priorities[priority] || priorities['medium'];
    return `<span class="badge ${p.class}">${p.label}</span>`;
}

function getStatusBadge(status) {
    const statuses = {
        'todo': { label: 'لم تبدأ', class: 'bg-secondary' },
        'in_progress': { label: 'قيد التنفيذ', class: 'bg-info' },
        'review': { label: 'قيد المراجعة', class: 'bg-warning' },
        'completed': { label: 'مكتملة', class: 'bg-success' },
        'planning': { label: 'التخطيط', class: 'bg-secondary' },
        'on_hold': { label: 'معلقة', class: 'bg-warning' }
    };
    const s = statuses[status] || statuses['todo'];
    return `<span class="badge ${s.class}">${s.label}</span>`;
}
