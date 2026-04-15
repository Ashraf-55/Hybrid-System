// ============================================================
// نظام إدارة العيادة - تكامل السحابة (FastAPI)
// Clinic Management System - Cloud Integration (FastAPI)
// ============================================================

// ========== 1. إعدادات السحابة (FastAPI) ==========
const CLOUD_CONFIG = {
    enabled: true,
    provider: 'fastapi',
    baseUrl: 'http://127.0.0.1:8000',
    clinicId: '8d0b62ed-847c-47ca-b4a3-c2c7eaf525d7',
    syncIntervalMs: 15000
};

// ========== 1.5 تعريف window.currentUser من localStorage ==========
// ✅ التعديل المطلوب: قراءة currentUser من localStorage بالمفتاح الموحد clinic_user
try {
    const storedUser = localStorage.getItem('clinic_user');
    // معالجة حالة إذا كانت القيمة النصية هي 'undefined' أو 'null'
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        window.currentUser = JSON.parse(storedUser);
    } else {
        window.currentUser = null;
    }
} catch (e) {
    console.error('Error parsing clinic_user:', e);
    window.currentUser = null;
}

// ========== 2. مدير المزامنة السحابية (FastAPI Version) ==========
const CloudSyncManager = (() => {
    let _writeQueue = {};
    let _flushTimer = null;
    let _online = navigator.onLine;

    window.addEventListener('online', () => { _online = true; _flush(); });
    window.addEventListener('offline', () => { _online = false; });

    async function _fastApiPut(key, data) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${CLOUD_CONFIG.baseUrl}/${key}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`❌ فشل مزامنة ${key}:`, error);
        }
    }

    async function _flush() {
        if (!CLOUD_CONFIG.enabled || !_online || Object.keys(_writeQueue).length === 0) return;

        console.log("🔄 جاري مزامنة البيانات مع السيرفر...");
        for (const key in _writeQueue) {
            await _fastApiPut(key, _writeQueue[key]);
            delete _writeQueue[key];
        }
        _saveQueue();
    }

    function queue(key, data) {
        _writeQueue[key] = data;
        _saveQueue();
        if (!_flushTimer) {
            _flushTimer = setTimeout(() => { _flush(); _flushTimer = null; }, 2000);
        }
    }

    function _saveQueue() { localStorage.setItem('clinic_sync_queue', JSON.stringify(_writeQueue)); }
    function _loadQueue() {
        const saved = localStorage.getItem('clinic_sync_queue');
        if (saved) _writeQueue = JSON.parse(saved);
    }

    async function load(key, defaultValue) {
        try {
            const cached = localStorage.getItem(`clinic_${key}`);
            if (cached !== null) return JSON.parse(cached);
        } catch (e) { }
        return defaultValue;
    }

    async function init() {
        _loadQueue();
        if (CLOUD_CONFIG.enabled) {
            setInterval(() => { if (_online) _flush(); }, CLOUD_CONFIG.syncIntervalMs);
        }
    }

    return { save: queue, load, init, queue };
})();

// ========== 3. دوال تحميل البيانات من التخزين المحلي ==========
function loadFromStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

// ========== 4. المتغيرات العامة والحالة ==========
let patients = loadFromStorage('clinic_patients', []);
let inventory = loadFromStorage('clinic_inventory', []);
let visits = loadFromStorage('clinic_visits', []);
let appointments = loadFromStorage('clinic_appointments', []);
let pharmacy = loadFromStorage('clinic_pharmacy', []);
let invoices = loadFromStorage('clinic_invoices', []);
let expenses = loadFromStorage('clinic_expenses', []);
let doctors = loadFromStorage('clinic_doctors', []);
let patientBalances = loadFromStorage('clinic_patientBalances', []);
let insuranceCompanies = loadFromStorage('clinic_insuranceCompanies', []);
let insurancePackages = loadFromStorage('clinic_insurancePackages', []);
let patientInsurance = loadFromStorage('clinic_patientInsurance', []);
let insuranceClaims = loadFromStorage('clinic_insuranceClaims', []);
let warehouses = loadFromStorage('clinic_warehouses', []);
let suppliers = loadFromStorage('clinic_suppliers', []);
let purchaseOrders = loadFromStorage('clinic_purchaseOrders', []);
let stockTransfers = loadFromStorage('clinic_stockTransfers', []);
let stockWaste = loadFromStorage('clinic_stockWaste', []);
let stockTransactions = loadFromStorage('clinic_stockTransactions', []);
let labs = loadFromStorage('clinic_labs', []);
let labRequests = loadFromStorage('clinic_labRequests', []);
let labTemplates = loadFromStorage('clinic_labTemplates', []);
let employees = loadFromStorage('clinic_employees', []);
let attendance = loadFromStorage('clinic_attendance', []);
let tasks = loadFromStorage('clinic_tasks', []);
let salaries = loadFromStorage('clinic_salaries', []);
let shifts = loadFromStorage('clinic_shifts', []);
let campaigns = loadFromStorage('clinic_campaigns', []);
let scheduledMessages = loadFromStorage('clinic_scheduledMessages', []);
let messageTemplates = loadFromStorage('clinic_messageTemplates', []);
let patientSegments = loadFromStorage('clinic_patientSegments', []);
let messageLog = loadFromStorage('clinic_messageLog', []);
let loyaltyPoints = loadFromStorage('clinic_loyaltyPoints', []);
let loyaltyRedemptions = loadFromStorage('clinic_loyaltyRedemptions', []);
let notifications = loadFromStorage('clinic_notifications', []);
let notificationTemplates = loadFromStorage('clinic_notificationTemplates', []);
let alertLogs = loadFromStorage('clinic_alertLogs', []);
let aiReports = loadFromStorage('clinic_aiReports', []);
let performanceLogs = loadFromStorage('clinic_performanceLogs', []);

let loyaltySettings = loadFromStorage('clinic_loyaltySettings', {
    pointsPerVisit: 10, pointsPerReview: 5,
    pointsPerReferred: 20, pointsValue: 1,
    minRedeem: 50, enabled: true
});

let loyaltyTiers = loadFromStorage('clinic_loyaltyTiers', [
    { id: 'tier1', name: 'برونزي', minPoints: 0, discount: 5, color: '#cd7f32' },
    { id: 'tier2', name: 'فضي', minPoints: 100, discount: 10, color: '#c0c0c0' },
    { id: 'tier3', name: 'ذهبي', minPoints: 300, discount: 15, color: '#ffd700' },
    { id: 'tier4', name: 'بلاتيني', minPoints: 600, discount: 20, color: '#e5e4e2' }
]);

let notificationSettings = loadFromStorage('clinic_notificationSettings', {
    reminderTime: 30, sound: true, popup: true, email: false
});

let navigationHistory = [];
let currentPatientId = '';
let currentCompanyId = '';
let currentRequestId = '';
let currentTierId = null;
// ✅ استخدام window.currentUser بدلاً من المتغير المحلي
let _dirtyKeys = new Set();
let _lastFullSave = 0;
const FULL_SAVE_INTERVAL_MS = 60000;

// ========== 5. التحكم في الواجهة والمصادقة ==========
function showLoginPage() {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const lp = document.getElementById('login-page');
    if (lp) {
        lp.style.display = 'flex';
        lp.classList.add('login-fullpage');
    }
}

function showAppInterface() {
    const lp = document.getElementById('login-page');
    if (lp) lp.style.display = 'none';
}

function checkAuth() {
    if (window.currentUser) {
        showAppInterface();
        showSection('dashboard');
    } else {
        showLoginPage();
    }
}

// ========== 6. حفظ البيانات والمزامنة ==========
function markDirty(...keys) {
    keys.forEach(k => _dirtyKeys.add(k));
}

function saveAllData(forceFullSave = false) {
    const now = Date.now();
    const needFullSave = forceFullSave || (now - _lastFullSave > FULL_SAVE_INTERVAL_MS);

    const allData = {
        patients, inventory, visits, appointments, pharmacy, invoices, expenses, doctors,
        patientBalances, insuranceCompanies, insurancePackages, patientInsurance, insuranceClaims,
        warehouses, suppliers, purchaseOrders, stockTransfers, stockWaste, stockTransactions,
        labs, labRequests, labTemplates, employees, attendance, tasks, salaries, shifts,
        campaigns, scheduledMessages, messageTemplates, patientSegments, messageLog,
        loyaltyPoints, loyaltyRedemptions, loyaltyTiers,
        notifications, notificationTemplates, alertLogs,
        aiReports, performanceLogs,
        loyaltySettings, notificationSettings
    };

    if (needFullSave) {
        Object.entries(allData).forEach(([key, value]) => {
            CloudSyncManager.save(key, value);
        });
        _dirtyKeys.clear();
        _lastFullSave = now;
    } else {
        const keysToSave = _dirtyKeys.size > 0 ? _dirtyKeys : new Set(Object.keys(allData));
        keysToSave.forEach(key => {
            if (allData[key] !== undefined) {
                CloudSyncManager.save(key, allData[key]);
            }
        });
        _dirtyKeys.clear();
    }

    try {
        localStorage.setItem('clinic_user', JSON.stringify(window.currentUser));
    } catch (e) { }
}

// ========== 7. تهيئة البيانات ==========
function initializeData() {
    patients = patients.map(p => ({
        id: p.id || generateId(),
        created_at: p.created_at || getTodayDate(),
        chronic: p.chronic || 'لا يوجد',
        birthday: p.birthday || null,
        city: p.city || 'غير محدد',
        ...p
    }));

    visits = visits.map(v => ({
        id: v.id || generateId(),
        visit_date: v.visit_date || getTodayDate(),
        total_fees: v.total_fees || 0,
        diagnosis: v.diagnosis || 'لم يسجل',
        prescription: v.prescription || 'لم تسجل',
        status: v.status || 'completed',
        doctorEarning: v.doctorEarning || 0,
        ...v
    }));

    appointments = appointments.map(a => ({
        id: a.id || generateId(),
        status: a.status || 'scheduled',
        ...a
    }));

    pharmacy = pharmacy.map(d => ({
        id: d.id || generateId(),
        minStock: d.minStock || 5,
        ...d
    }));

    inventory = inventory.map(i => ({
        id: i.id || generateId(),
        warehouseId: i.warehouseId || 'wh-main',
        minStock: i.minStock || i.min_limit || 0,
        expiryDate: i.expiryDate || null,
        ...i
    }));

    if (!warehouses.length) {
        warehouses.push({
            id: 'wh-main',
            name: 'المخزن الرئيسي',
            type: 'main',
            location: '',
            manager: '',
            notes: '',
            createdAt: new Date().toISOString()
        });
    }

    if (!employees.length) {
        employees.push({
            id: 'emp-admin',
            username: 'admin',
            password: 'admin123',
            fullName: 'مدير النظام',
            role: 'admin',
            email: 'admin@clinic.com',
            phone: '0123456789',
            position: 'مدير عام',
            department: 'الإدارة',
            isActive: true,
            hireDate: getTodayDate(),
            salary: 5000,
            shift: 'morning',
            lastLogin: null,
            createdAt: new Date().toISOString()
        });
    }

    saveAllData(true);
}

// ========== 8. الدوال المساعدة الأساسية ==========
function generateId() {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount) {
    return Number(amount || 0).toLocaleString() + ' ج.م';
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '✅'}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
}

function getCategoryName(cat) {
    const categories = {
        rent: 'إيجار',
        salaries: 'مرتبات',
        electricity: 'كهرباء',
        water: 'مياه',
        maintenance: 'صيانة',
        other: 'أخرى'
    };
    return categories[cat] || cat;
}

function getPaymentMethod(method) {
    const methods = { cash: 'كاش', card: 'بطاقة', bank: 'تحويل بنكي' };
    return methods[method] || method;
}

// ========== 9. التنقل بين الأقسام ==========
function showSection(id) {
    if (window.currentUser && typeof hasPermission === 'function') {
        const adminOnlySections = ['employees', 'salaries', 'shifts', 'attendance', 'ai-reports'];
        const doctorBlocked = ['doctor-shares', 'salaries', 'shifts'];
        const role = window.currentUser.role || 'receptionist';

        if (role === 'doctor' && doctorBlocked.includes(id)) {
            showToast('⛔ ليس لديك صلاحية لعرض هذا القسم', 'error');
            return;
        }
        if (role === 'receptionist' && adminOnlySections.includes(id)) {
            showToast('⛔ ليس لديك صلاحية لعرض هذا القسم', 'error');
            return;
        }
    }

    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const section = document.getElementById(id);
    if (section) {
        section.style.display = 'block';
        if (id !== 'login-page') section.classList.remove('login-fullpage');
    }

    history.pushState(null, null, `#${id}`);
    updateActiveNavLink(id);
    loadSectionData(id);
}

function updateActiveNavLink(id) {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    const active = Array.from(document.querySelectorAll('.nav-links li'))
        .find(l => l.getAttribute('onclick')?.includes(id));
    if (active) active.classList.add('active');
}

function loadSectionData(id) {
    const loaders = {
        'dashboard': updateDashboard,
        'patients': loadPatients,
        'inventory': loadInventory,
        'appointments': () => {
            loadAppointments();
            populatePatientSelect();
            if (typeof populateDoctorSelectForAppointment === 'function')
                populateDoctorSelectForAppointment();
        },
        'pharmacy-section': renderPharmacy,
        'expenses': () => loadExpenses('all'),
        'doctor-shares': loadDoctors,
        'patient-balance': loadBalances,
        'invoices': loadInvoicesList,
        'insurance-companies': () => {
            loadInsuranceCompanies();
            hidePackagesSection();
        },
        'patient-insurance': loadPatientInsurance,
        'insurance-claims': () => loadClaims('all'),
        'warehouses': loadWarehouses,
        'suppliers': loadSuppliers,
        'purchase-orders': () => loadPurchaseOrders('all'),
        'stock-transfers': loadTransfers,
        'stock-waste': loadWaste,
        'stock-ledger': () => {
            populateLedgerFilter();
            loadStockLedger();
        },
        'labs': loadLabs,
        'lab-requests': () => loadLabRequests('all'),
        'lab-templates': loadLabTemplates,
        'employees': loadEmployees,
        'attendance': loadAttendance,
        'tasks': () => {
            populateTaskAssignee();
            loadTasks('all');
        },
        'salaries': loadSalaries,
        'shifts': loadShifts,
        'employee-reports': () => loadEmployeeReports('all'),
        'campaigns': loadCampaigns,
        'scheduled-messages': loadScheduledMessages,
        'message-templates': loadMessageTemplates,
        'patient-segments': loadSegments,
        'message-log': () => loadMessageLog('all'),
        'loyalty': loadLoyaltySection,
        'notifications': () => loadNotifications('all'),
        'notification-settings': loadNotificationSettings,
        'notification-templates': loadNotificationTemplates,
        'notification-log': loadNotificationLog,
        'alert-log': loadNotificationLog,
        'patient-analytics': loadPatientAnalytics,
        'appointment-analytics': loadAppointmentAnalytics,
        'procedure-analytics': loadProcedureAnalytics,
        'inventory-analytics': loadInventoryAnalytics,
        'ai-reports': loadAIReports
    };

    if (loaders[id]) loaders[id]();
}

function hidePackagesSection() {
    const el = document.getElementById('packages-section');
    if (el) el.style.display = 'none';
}

function populateTaskAssignee() {
    const select = document.getElementById('task-assignee');
    if (select) {
        select.innerHTML = '<option value="">اختر الموظف...</option>' +
            employees.filter(e => e.isActive)
                .map(e => `<option value="${e.id}">${e.fullName}</option>`).join('');
    }
}

function populateLedgerFilter() {
    const sel = document.getElementById('ledger-warehouse-filter');
    if (sel) {
        sel.innerHTML = '<option value="all">كل المخازن</option>' +
            warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    }
}

window.addEventListener('popstate', e => {
    e.preventDefault();
    if (navigationHistory.length > 0) showSection(navigationHistory.pop());
});

// ✅ التعديل المطلوب: إلغاء سطر الـ else showLoginPage() تماماً
function handleRouteChange() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else if (window.currentUser) {
        showSection('dashboard');
    }
    // ❌ تم إزالة else showLoginPage() - لم يعد يتم طرد المستخدم هنا
}

function goBack() {
    if (navigationHistory.length > 0) showSection(navigationHistory.pop());
    else {
        showSection('dashboard');
        showToast('لا يوجد صفحات سابقة', 'info');
    }
}

// ========== 10. لوحة التحكم ==========
function updateDashboard() {
    const today = getTodayDate();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayVisits = visits.filter(v => v?.visit_date === today);
    const todayRevenue = todayVisits.reduce((s, v) => s + (parseFloat(v?.total_fees) || 0), 0);
    const todayNewPatients = patients.filter(p => p?.created_at === today);
    const lowStock = inventory.filter(i => i?.quantity <= (i?.min_limit || 0));
    const todayAppointments = appointments.filter(a => a?.date === today);
    const todayExpenses = expenses.filter(e => e?.date === today);
    const todayInvoices = invoices.filter(i => i?.date === today);

    const unpaidInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
    const unpaidInvoicesTotal = unpaidInvoices.reduce((s, i) => s + (i.remainingAmount || i.total || 0), 0);
    const unreadCount = notifications.filter(n => !n.read).length;
    const totalPoints = loyaltyPoints.reduce((s, p) => s + (p.points || 0), 0);
    const totalRedeemed = loyaltyRedemptions.reduce((s, r) => s + (r.points || 0), 0);
    const pendingClaims = insuranceClaims?.filter(c => c?.status === 'pending') || [];
    const pendingOrders = purchaseOrders?.filter(po => po?.status === 'pending') || [];
    const todayTransfers = stockTransfers?.filter(t => t?.date === today) || [];
    const monthWaste = stockWaste?.filter(w => {
        if (!w?.date) return false;
        const d = new Date(w.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }) || [];
    const pendingLabRequests = labRequests?.filter(r => r?.status === 'pending' || r?.status === 'processing').length || 0;
    const readyLabRequests = labRequests?.filter(r => r?.status === 'ready').length || 0;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    setElementText('visit-count', todayVisits.length);
    setElementText('today-revenue', formatCurrency(todayRevenue));
    setElementText('today-patients-count', todayNewPatients.length);
    setElementText('low-stock-count', lowStock.length);
    setElementText('pharmacy-count', pharmacy.length);
    setElementText('today-appointments-count', todayAppointments.length);
    setElementText('today-expenses-count', todayExpenses.length);
    setElementText('today-expenses-total', formatCurrency(todayExpenses.reduce((s, e) => s + (e?.amount || 0), 0)));
    setElementText('today-invoices-count', todayInvoices.length);
    setElementText('today-invoices-total', formatCurrency(todayInvoices.reduce((s, i) => s + (i?.total || 0), 0)));
    setElementText('doctors-count', doctors.length);
    setElementText('patients-with-balance', patientBalances.filter(b => b?.debit > b?.credit).length);
    setElementText('total-patients', patients.length);
    setElementText('total-visits', visits.length);
    setElementText('total-revenue', formatCurrency(visits.reduce((s, v) => s + (parseFloat(v?.total_fees) || 0), 0)));
    setElementText('total-employees', employees.filter(e => e.isActive).length);
    setElementText('insurance-companies-count', insuranceCompanies?.length || 0);
    setElementText('pending-claims-count', pendingClaims.length);
    setElementText('pending-claims-value', formatCurrency(pendingClaims.reduce((s, c) => s + (c?.claimAmount || 0), 0)));
    setElementText('warehouses-count', warehouses?.length || 0);
    setElementText('suppliers-count', suppliers?.length || 0);
    setElementText('pending-orders', pendingOrders.length);
    setElementText('pending-orders-value', formatCurrency(pendingOrders.reduce((s, po) => s + (po?.totalAmount || 0), 0)));
    setElementText('today-transfers', todayTransfers.length);
    setElementText('waste-month', monthWaste.reduce((s, w) => s + (w?.quantity || 0), 0));
    setElementText('labs-count', labs?.length || 0);
    setElementText('pending-lab-requests', pendingLabRequests);
    setElementText('ready-lab-requests', readyLabRequests);
    setElementText('total-lab-balance', formatCurrency(labs?.reduce((s, l) => s + (l?.accountBalance || 0), 0) || 0));
    setElementText('active-campaigns', activeCampaigns);
    setElementText('total-campaigns', campaigns.length);
    setElementText('templates-count', messageTemplates.length);
    setElementText('scheduled-count', scheduledMessages.filter(s => s.status === 'pending').length);
    setElementText('total-points', totalPoints);
    setElementText('total-redeemed', totalRedeemed);
    setElementText('patients-with-points', loyaltyPoints.length);
    setElementText('unread-notifications', unreadCount);
    setElementText('unpaid-invoices-alert', unpaidInvoices.length);
    setElementText('unpaid-invoices-total', formatCurrency(unpaidInvoicesTotal));
    setElementText('today-appointments-alert', todayAppointments.length);
    setElementText('reminder-time', notificationSettings.reminderTime || 30);
    setElementText('invoice-today-count', todayInvoices.length);
    setElementText('invoice-today-total', formatCurrency(todayInvoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0)));
    setElementText('invoice-unpaid', unpaidInvoices.length);
    setElementText('invoice-tax-count', invoices.filter(i => i.tax && i.tax > 0).length);

    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'inline';
            badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }

    const lowStockEl = document.getElementById('low-stock-list');
    if (lowStockEl) {
        lowStockEl.innerHTML = lowStock.length
            ? lowStock.map(i => `⚠️ ${i.product_name} (${i.quantity})`).join('<br>')
            : '✅ لا توجد نواقص';
    }

    const aptEl = document.getElementById('today-appointments-list');
    if (aptEl) {
        aptEl.innerHTML = todayAppointments.length
            ? todayAppointments.slice(0, 3).map(a =>
                `<div class="appointment-mini-item"><span>${a.patient_name}</span><span class="appointment-mini-time">${a.time}</span></div>`
            ).join('') + (todayAppointments.length > 3
                ? `<div class="appointment-mini-more">+${todayAppointments.length - 3} مواعيد أخرى</div>` : '')
            : 'لا توجد مواعيد اليوم';
    }
}

// ========== 11. معالجة الملفات ==========
document.addEventListener('DOMContentLoaded', function () {
    const scanFileInput = document.getElementById('scan_file');
    if (scanFileInput) scanFileInput.addEventListener('change', e => previewFile(e.target, 'scan_preview'));

    const labFileInput = document.getElementById('lab_file');
    if (labFileInput) labFileInput.addEventListener('change', e => previewFile(e.target, 'lab_preview'));

    const redeemInput = document.getElementById('redeem-points-input');
    if (redeemInput) {
        redeemInput.addEventListener('input', function () {
            const pts = parseInt(this.value) || 0;
            const el = document.getElementById('redeem-discount-value');
            if (el) el.innerText = formatCurrency(pts * loyaltySettings.pointsValue);
        });
    }

    CloudSyncManager.init().then(() => {
        if (CLOUD_CONFIG.enabled) {
            patients = loadFromStorage('clinic_patients', patients);
            inventory = loadFromStorage('clinic_inventory', inventory);
            visits = loadFromStorage('clinic_visits', visits);
            appointments = loadFromStorage('clinic_appointments', appointments);
            invoices = loadFromStorage('clinic_invoices', invoices);
            employees = loadFromStorage('clinic_employees', employees);
            doctors = loadFromStorage('clinic_doctors', doctors);
            labs = loadFromStorage('clinic_labs', labs);
            labRequests = loadFromStorage('clinic_labRequests', labRequests);
            campaigns = loadFromStorage('clinic_campaigns', campaigns);
            scheduledMessages = loadFromStorage('clinic_scheduledMessages', scheduledMessages);
            loyaltyPoints = loadFromStorage('clinic_loyaltyPoints', loyaltyPoints);
            notifications = loadFromStorage('clinic_notifications', notifications);
            loyaltySettings = loadFromStorage('clinic_loyaltySettings', loyaltySettings);
            notificationSettings = loadFromStorage('clinic_notificationSettings', notificationSettings);

            if (window.currentUser) updateDashboard();
        }
    });
});

function previewFile(input, previewId) {
    const preview = document.getElementById(previewId);
    if (!preview || !input.files || !input.files[0]) {
        if (preview) preview.innerHTML = '';
        return;
    }

    const file = input.files[0];
    if (file.size > 10 * 1024 * 1024) {
        showToast('الملف كبير جداً (الحد الأقصى 10 ميجابايت)', 'warning');
        input.value = '';
        preview.innerHTML = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'max-width:100%;max-height:200px;border-radius:8px;margin-top:10px;cursor:pointer;border:2px solid #3498db;';
            img.onclick = () => window.open(e.target.result, '_blank');
            preview.innerHTML = '';
            preview.appendChild(img);

            const name = document.createElement('div');
            name.style.cssText = 'font-size:12px;color:#666;margin-top:5px;';
            name.innerHTML = `📄 ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            preview.appendChild(name);
        } else {
            preview.innerHTML = `
                <div style="background:#e9ecef;padding:15px;border-radius:8px;text-align:center;margin-top:10px;">
                    <span style="font-size:24px;">📄</span>
                    <div style="font-weight:bold;margin-top:5px;">${file.name}</div>
                    <div style="font-size:12px;color:#666;">${(file.size / 1024).toFixed(2)} KB</div>
                    <a href="${e.target.result}" target="_blank" style="display:inline-block;margin-top:10px;padding:5px 15px;background:#3498db;color:white;text-decoration:none;border-radius:5px;">عرض الملف</a>
                </div>`;
        }
    };
    reader.readAsDataURL(file);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast('الملف كبير جداً', 'warning');
            reject(new Error('File too large'));
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
    });
}

// ========== 12. إدارة المرضى ==========
function loadPatients() {
    const tbody = document.querySelector('#patients-table tbody');
    if (!tbody) return;

    tbody.innerHTML = !patients.length
        ? '<tr><td colspan="5" style="text-align:center;padding:30px;">👥 لا يوجد مرضى</td></tr>'
        : patients.map(p => `
            <tr>
                <td>${p.name || '---'}</td>
                <td>${p.phone || '---'}</td>
                <td>${p.nationalId || '---'}</td>
                <td>${p.created_at || getTodayDate()}</td>
                <td>
                    <button onclick="openVisitModal('${p.id}','${p.name}')" class="btn-stock-plus">كشف</button>
                    <button onclick="viewHistory('${p.id}','${p.name}')" class="btn-stock-minus">السجل</button>
                    <button onclick="showPatientQR('${p.id}')" class="btn-stock-minus" title="QR Code">📲</button>
                    <button onclick="deletePatient('${p.id}')" class="btn-stock-del">حذف</button>
                </td>
            </tr>
        `).join('');
}

function searchPatients() {
    const term = document.getElementById('searchPatients').value.toLowerCase();
    const tbody = document.querySelector('#patients-table tbody');
    if (!tbody) return;

    const filtered = patients.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.phone && p.phone.includes(term)) ||
        (p.nationalId && p.nationalId.includes(term))
    );

    tbody.innerHTML = filtered.length
        ? filtered.map(p => `
            <tr>
                <td>${p.name || '---'}</td>
                <td>${p.phone || '---'}</td>
                <td>${p.nationalId || '---'}</td>
                <td>${p.created_at || getTodayDate()}</td>
                <td>
                    <button onclick="openVisitModal('${p.id}','${p.name}')" class="btn-stock-plus">كشف</button>
                    <button onclick="viewHistory('${p.id}','${p.name}')" class="btn-stock-minus">السجل</button>
                    <button onclick="showPatientQR('${p.id}')" class="btn-stock-minus">📲</button>
                    <button onclick="deletePatient('${p.id}')" class="btn-stock-del">حذف</button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="5" style="text-align:center;">لا توجد نتائج</td></tr>';
}

function openAddPatientModal() {
    const modal = document.getElementById('patientModal');
    if (modal) modal.style.display = 'block';
    clearPatientForm();
}

function clearPatientForm() {
    const fields = ['patientName', 'patientPhone', 'patientNationalId', 'patientAge',
        'patientChronic', 'patientBirthday', 'patientCity'];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const g = document.getElementById('patientGender');
    if (g) g.value = 'ذكر';
}

function saveNewPatient() {
    if (typeof enforcePermission === 'function' && !enforcePermission('add_patient')) return;

    const name = document.getElementById('patientName')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim() || '';
    const nationalId = document.getElementById('patientNationalId')?.value.trim() || '';
    const age = document.getElementById('patientAge')?.value;
    const gender = document.getElementById('patientGender')?.value || 'ذكر';
    const chronic = document.getElementById('patientChronic')?.value.trim() || 'لا يوجد';
    const birthday = document.getElementById('patientBirthday')?.value || '';
    const city = document.getElementById('patientCity')?.value.trim() || 'غير محدد';

    if (!name) {
        showToast('الرجاء إدخال اسم المريض', 'warning');
        return;
    }
    if (!age) {
        showToast('الرجاء إدخال عمر المريض', 'warning');
        return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
        showToast('الرجاء إدخال عمر صحيح (1-150)', 'warning');
        return;
    }

    if (typeof validatePatientUniqueness === 'function') {
        if (!validatePatientUniqueness(phone, nationalId)) return;
    }

    const patientId = generateId();

    let qrData = null;
    if (typeof generatePatientQR === 'function') {
        qrData = generatePatientQR(patientId);
    }

    patients.push({
        id: patientId,
        name,
        phone,
        nationalId,
        age: ageNum,
        gender,
        chronic,
        birthday: birthday || null,
        city,
        qrCode: qrData,
        created_at: getTodayDate(),
        createdBy: window.currentUser?.fullName || 'النظام'
    });

    markDirty('patients');
    saveAllData();
    loadPatients();
    closeModal();
    updateDashboard();

    if (typeof triggerNotification === 'function') {
        triggerNotification('patient_registered', { patientName: name });
    }

    showToast(`✅ تم إضافة المريض ${name} بنجاح`);
}

function showPatientQR(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const qr = typeof generatePatientQR === 'function' ? generatePatientQR(patientId) : null;
    if (!qr) {
        showToast('لا يمكن توليد QR Code', 'warning');
        return;
    }

    const win = window.open('', '_blank', 'width=320,height=380');
    if (!win) {
        showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning');
        return;
    }

    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <title>QR - ${patient.name}</title>
        <style>body{font-family:Arial;text-align:center;padding:20px;background:#f5f7fa;}
        img{border-radius:8px;border:2px solid #3498db;}</style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"><\/script>
        </head><body>
        <h3>📲 ${patient.name}</h3>
        <p style="color:#888;font-size:12px;">${qr.qrId}</p>
        <canvas id="qrCanvas"></canvas>
        <p style="font-size:11px;color:#aaa;margin-top:10px;">امسح لفتح ملف المريض</p>
        <script>
            new QRious({ element:document.getElementById('qrCanvas'), value:'${qr.qrString}', size:220 });
        <\/script>
        </body></html>`);
    win.document.close();
}

function deletePatient(id) {
    patients = patients.filter(p => p.id !== id);
    visits = visits.filter(v => v.patient_id !== id);
    appointments = appointments.filter(a => a.patient_id !== id);

    markDirty('patients', 'visits', 'appointments');
    saveAllData();
    loadPatients();
    updateDashboard();
    showToast('تم حذف المريض', 'info');
}

// ========== 13. إدارة الزيارات ==========
function openVisitModal(id, name) {
    currentPatientId = id;
    const titleEl = document.getElementById('visitModalTitle');
    if (titleEl) titleEl.innerText = `🩺 كشف لـ: ${name}`;

    injectDoctorSelector();
    populateInventoryChecklist();
    populatePharmacyChecklist();

    const modal = document.getElementById('visitModal');
    if (modal) modal.style.display = 'block';
}

function injectDoctorSelector() {
    if (document.getElementById('visit-doctor-select')) return;

    const diagnosisEl = document.getElementById('diagnosis');
    if (!diagnosisEl) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-bottom:12px;';
    wrapper.innerHTML = `
        <label style="display:block;margin-bottom:5px;font-weight:bold;">👨‍⚕️ الطبيب المعالج</label>
        <select id="visit-doctor-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;font-size:14px;">
            <option value="">-- بدون طبيب محدد --</option>
            ${doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty} (نسبة ${d.percentage}%)</option>`).join('')}
        </select>`;

    diagnosisEl.parentElement.insertBefore(wrapper, diagnosisEl);
}

function populateInventoryChecklist() {
    const container = document.getElementById('inventory-check-list');
    if (!container) return;

    container.innerHTML = !inventory.length ? '<p>لا توجد مستلزمات</p>'
        : inventory.map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:5px;background:#f9f9f9;border-radius:5px;">
                <span style="flex:1;">${item.product_name} (متوفر: ${item.quantity} - سعر: ${item.price || 0} ج.م)</span>
                <input type="number" class="used-item-input" data-id="${item.id}" data-price="${item.price || 0}"
                    value="0" min="0" max="${item.quantity}" style="width:80px;padding:5px;border:1px solid #ddd;border-radius:3px;">
            </div>`).join('');
}

function populatePharmacyChecklist() {
    const container = document.getElementById('pharmacy-check-list');
    if (!container) return;

    container.innerHTML = !pharmacy.length ? '<p>لا توجد أدوية</p>'
        : pharmacy.map(drug => `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:5px;background:#f9f9f9;border-radius:5px;">
                <span style="flex:1;">${drug.name} (متوفر: ${drug.stock} - سعر: ${drug.price} ج.م)</span>
                <input type="number" class="used-drug-input" data-id="${drug.id}" data-price="${drug.price}"
                    value="0" min="0" max="${drug.stock}" style="width:80px;padding:5px;border:1px solid #ddd;border-radius:3px;">
            </div>`).join('');
}

function calculateDoctorEarning(doctorId, totalFees) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return 0;
    if (doctor.shareType === 'fixed') return parseFloat((doctor.percentage || 0).toFixed(2));
    return parseFloat((totalFees * ((doctor.percentage || 0) / 100)).toFixed(2));
}

function saveVisit() {
    if (!currentPatientId) {
        showToast('لا يوجد مريض محدد', 'error');
        closeModal();
        return;
    }
    if (typeof enforcePermission === 'function' && !enforcePermission('save_visit')) return;

    const diagnosisInput = document.getElementById('diagnosis');
    const prescriptionInput = document.getElementById('prescription');
    const scanNameInput = document.getElementById('scan_name');
    const labNameInput = document.getElementById('lab_name');
    const totalFeesInput = document.getElementById('total_fees');
    const scanFileInput = document.getElementById('scan_file');
    const labFileInput = document.getElementById('lab_file');
    const doctorSelect = document.getElementById('visit-doctor-select');

    if (!diagnosisInput || !prescriptionInput || !totalFeesInput) {
        showToast('خطأ في النموذج', 'error');
        return;
    }

    const diagnosis = diagnosisInput.value.trim() || 'لم يسجل';
    const prescription = prescriptionInput.value.trim() || 'لم تسجل';
    const scanName = scanNameInput?.value.trim() || '';
    const labName = labNameInput?.value.trim() || '';
    const fees = parseFloat(totalFeesInput.value) || 0;
    const selectedDoctorId = doctorSelect?.value || '';
    const scanFile = scanFileInput?.files?.[0] || null;
    const labFile = labFileInput?.files?.[0] || null;

    let extraFees = 0;

    document.querySelectorAll('.used-drug-input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const price = parseFloat(input.dataset.price) || 0;
        if (qty > 0) {
            extraFees += qty * price;
            const drug = pharmacy.find(d => d.id === input.dataset.id);
            if (drug) drug.stock = Math.max(0, (drug.stock || 0) - qty);
        }
    });

    document.querySelectorAll('.used-item-input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const price = parseFloat(input.dataset.price) || 0;
        if (qty > 0) {
            extraFees += qty * price;
            const item = inventory.find(i => i.id === input.dataset.id);
            if (item) item.quantity = Math.max(0, (item.quantity || 0) - qty);
        }
    });

    const totalFees = fees + extraFees;
    const doctorEarning = selectedDoctorId ? calculateDoctorEarning(selectedDoctorId, totalFees) : 0;

    Promise.all([fileToBase64(scanFile), fileToBase64(labFile)]).then(([scanData, labData]) => {
        const newVisit = {
            id: generateId(),
            patient_id: currentPatientId,
            diagnosis,
            prescription,
            total_fees: totalFees,
            scan_desc: scanName,
            lab_desc: labName,
            scan_file: scanData,
            lab_file: labData,
            scan_name: scanFile?.name || null,
            lab_name: labFile?.name || null,
            scan_type: scanFile?.type || null,
            lab_type: labFile?.type || null,
            scan_size: scanFile?.size || null,
            lab_size: labFile?.size || null,
            doctorId: selectedDoctorId || null,
            doctorEarning,
            visit_date: getTodayDate(),
            status: 'completed'
        };

        visits.push(newVisit);

        if (selectedDoctorId) recordDoctorEarning(selectedDoctorId, newVisit.id, totalFees, doctorEarning);
        createInvoiceFromVisit(newVisit, currentPatientId);
        if (typeof addPointsForVisit === 'function') addPointsForVisit(currentPatientId);

        markDirty('visits', 'pharmacy', 'inventory', 'invoices', 'doctors');
        saveAllData();

        const fields = [diagnosisInput, prescriptionInput, scanNameInput, labNameInput, totalFeesInput, scanFileInput, labFileInput];
        fields.forEach(el => { if (el) el.value = ''; });
        if (doctorSelect) doctorSelect.value = '';

        ['scan_preview', 'lab_preview'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '';
        });

        closeModal();
        loadPatients();
        updateDashboard();
        showToast('✅ تم حفظ الكشف وإنشاء الفاتورة' + (selectedDoctorId ? ' وتسجيل نصيب الطبيب' : ''));
    }).catch(() => showToast('حدث خطأ أثناء حفظ الملفات', 'error'));
}

function recordDoctorEarning(doctorId, visitId, totalFees, earning = null) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    if (earning === null) earning = calculateDoctorEarning(doctorId, totalFees);
    if (!doctor.earningsLog) doctor.earningsLog = [];
    if (!doctor.earningsHistory) doctor.earningsHistory = [];

    const record = {
        id: generateId(),
        visitId,
        date: getTodayDate(),
        fees: totalFees,
        earning,
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    };

    doctor.earningsLog.push(record);
    doctor.earningsHistory.push(record);
    doctor.totalEarnings = (doctor.totalEarnings || 0) + earning;
}

function createInvoiceFromVisit(visit, patientId) {
    const patient = patients.find(p => p.id === patientId);
    const doctor = visit.doctorId ? doctors.find(d => d.id === visit.doctorId) : null;
    const amount = visit.total_fees;
    const doctorEarning = visit.doctorEarning || 0;

    const invoice = {
        id: generateId(),
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        visitId: visit.id,
        patientId,
        patientName: patient?.name || 'غير معروف',
        doctorId: visit.doctorId || null,
        doctorName: doctor?.name || null,
        doctorEarning,
        date: getTodayDate(),
        subtotal: amount,
        total: amount,
        tax: parseFloat((amount * 0.14).toFixed(2)),
        grandTotal: parseFloat((amount * 1.14).toFixed(2)),
        status: 'paid',
        remainingAmount: 0,
        items: [{ description: 'كشف طبي', quantity: 1, price: amount, total: amount }],
        createdAt: new Date().toISOString()
    };

    invoices.push(invoice);

    if (doctorEarning > 0 && doctor) {
        logUserAction('commission',
            `عمولة د. ${doctor.name}: ${doctorEarning.toFixed(2)} ج.م (فاتورة ${invoice.invoiceNumber})`);
    }
}

function createInvoice(visitId, patientId, amount, doctorId = null) {
    const visit = visits.find(v => v.id === visitId) || { id: visitId, total_fees: amount, doctorId, doctorEarning: 0 };
    createInvoiceFromVisit(visit, patientId);
}

function viewHistory(patientId, patientName) {
    const patient = patients.find(p => p.id === patientId);
    setElementText('hist-name', patientName);
    setElementText('hist-age', (patient?.age || '--') + ' سنة');
    setElementText('hist-gender', patient?.gender || '--');
    setElementText('hist-chronic', patient?.chronic || 'لا يوجد');

    const container = document.getElementById('visits-list-container');
    const template = document.getElementById('visit-template');
    if (!container || !template) return;
    container.innerHTML = '';

    const patientVisits = visits.filter(v => v.patient_id === patientId);
    if (!patientVisits.length) {
        container.innerHTML = '<p style="text-align:center;">لا يوجد زيارات سابقة</p>';
    } else {
        [...patientVisits].sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date)).forEach(v => {
            const clone = template.content.cloneNode(true);
            const q = sel => clone.querySelector(sel);

            if (q('.v-date')) q('.v-date').innerText = '📅 ' + (v.visit_date || 'غير معروف');
            if (q('.v-fees')) q('.v-fees').innerText = '💰 ' + (v.total_fees || 0) + ' ج.م';
            if (q('.v-diagnosis')) q('.v-diagnosis').innerText = v.diagnosis || 'لا يوجد';
            if (q('.v-prescription')) q('.v-prescription').innerText = v.prescription || 'لا يوجد';

            if (v.scan_desc && q('.v-scan-desc')) {
                q('.v-scan-desc').innerText = v.scan_desc;
                if (q('.no-scan')) q('.no-scan').style.display = 'none';
            }
            if (v.lab_desc && q('.v-lab-desc')) {
                q('.v-lab-desc').innerText = v.lab_desc;
                if (q('.no-lab')) q('.no-lab').style.display = 'none';
            }

            container.appendChild(clone);
        });
    }

    const modal = document.getElementById('historyModal');
    if (modal) modal.style.display = 'block';
}

// ========== 14. إدارة المخزون ==========
function loadInventory() {
    const tbody = document.querySelector('#inventory-table tbody');
    if (!tbody) return;

    tbody.innerHTML = !inventory.length
        ? '<tr><td colspan="6" style="text-align:center;padding:30px;">📦 لا توجد أصناف</td></tr>'
        : inventory.map(item => {
            const isLow = item.quantity <= (item.min_limit || item.minStock || 0);
            const expInfo = typeof getExpiryInfo === 'function'
                ? getExpiryInfo(item.expiryDate)
                : { cssClass: '', badge: '' };

            return `
                <tr>
                    <td>${item.product_name}</td>
                    <td class="${isLow ? 'status-low' : ''}"><strong>${item.quantity}</strong>${isLow ? ' ⚠️' : ''}</td>
                    <td>${item.price || 0} ج.م}<!--
                    <td class="${isLow ? 'status-low' : 'status-ok'}">${isLow ? '⚠️ ناقص' : '✅ متوفر'}</td>
                    <td class="${expInfo.cssClass}">${item.expiryDate || '---'}${expInfo.badge}</td>
                    <td>
                        <button onclick="updateStock('${item.id}',1)" class="btn-stock-plus">+</button>
                        <button onclick="updateStock('${item.id}',-1)" class="btn-stock-minus">-</button>
                        <button onclick="deleteInventoryItem('${item.id}')" class="btn-stock-del">حذف</button>
                    </td>
                </tr>
            `;
        }).join('');
}

function addNewInventoryItem() {
    const name = document.getElementById('inv_name').value.trim();
    const qty = parseInt(document.getElementById('inv_qty').value);
    const price = parseFloat(document.getElementById('inv_price').value) || 0;
    const limit = parseInt(document.getElementById('inv_limit').value) || 0;
    const minStock = parseInt(document.getElementById('inv_min_stock')?.value) || limit;
    const expiryDate = document.getElementById('inv_expiry')?.value || null;

    if (!name || isNaN(qty) || qty <= 0) {
        showToast('بيانات المخزن ناقصة', 'warning');
        return;
    }

    inventory.push({
        id: generateId(),
        product_name: name,
        quantity: qty,
        price,
        min_limit: minStock,
        minStock,
        expiryDate,
        warehouseId: 'wh-main'
    });

    markDirty('inventory');
    saveAllData();
    loadInventory();
    updateDashboard();
    showToast('✅ تمت إضافة الصنف');

    checkInventoryAlerts();

    const fields = ['inv_name', 'inv_qty', 'inv_price', 'inv_limit', 'inv_min_stock', 'inv_expiry'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function updateStock(id, change) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(0, (item.quantity || 0) + change);
        if (item.quantity <= (item.minStock || item.min_limit || 0)) {
            showToast(`⚠️ ${item.product_name}: المخزون وصل للحد الأدنى (${item.quantity})`, 'warning');
        }
        markDirty('inventory');
        saveAllData();
        loadInventory();
        updateDashboard();
        showToast('تم تحديث الكمية');
    }
}

function deleteInventoryItem(id) {
    inventory = inventory.filter(i => i.id !== id);
    markDirty('inventory');
    saveAllData();
    loadInventory();
    updateDashboard();
    showToast('تم حذف الصنف', 'info');
}

function checkInventoryAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let alertsShown = 0;

    inventory.forEach(item => {
        const threshold = item.minStock || item.min_limit || 5;

        if (item.quantity <= 0) {
            if (alertsShown < 5) showToast(`🔴 ${item.product_name}: نفد المخزون تماماً!`, 'error');
            alertsShown++;
        } else if (item.quantity <= threshold) {
            if (alertsShown < 5) showToast(`⚠️ ${item.product_name}: مخزون منخفض (${item.quantity})`, 'warning');
            alertsShown++;
        }

        if (item.expiryDate) {
            const exp = new Date(item.expiryDate);
            exp.setHours(0, 0, 0, 0);
            const daysLeft = Math.round((exp - today) / 86400000);

            if (daysLeft < 0) {
                if (alertsShown < 5) showToast(`🔴 ${item.product_name}: منتهي الصلاحية!`, 'error');
                alertsShown++;
            } else if (daysLeft <= 30) {
                if (alertsShown < 5) showToast(`🟠 ${item.product_name}: ينتهي خلال ${daysLeft} يوم`, 'warning');
                alertsShown++;
            } else if (daysLeft <= 60) {
                if (alertsShown < 5) showToast(`🟡 ${item.product_name}: ينتهي خلال ${daysLeft} يوم`, 'info');
                alertsShown++;
            }
        }
    });

    if (alertsShown > 5) showToast(`... و${alertsShown - 5} تنبيهات أخرى`, 'info');
}

function checkPharmacyAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts30 = [];
    const alerts60 = [];
    const alerts90 = [];
    const lowStock = [];

    pharmacy.forEach(drug => {
        if (drug.stock <= (drug.minStock || 5)) {
            lowStock.push(`💊 ${drug.name} (${drug.stock} متبقي)`);
        }
        if (drug.expiry) {
            const exp = new Date(drug.expiry);
            exp.setHours(0, 0, 0, 0);
            const daysLeft = Math.round((exp - today) / 86400000);

            if (daysLeft < 0) alerts30.push(`❌ ${drug.name}: منتهي!`);
            else if (daysLeft <= 30) alerts30.push(`🔴 ${drug.name}: ${daysLeft} يوم`);
            else if (daysLeft <= 60) alerts60.push(`🟠 ${drug.name}: ${daysLeft} يوم`);
            else if (daysLeft <= 90) alerts90.push(`🟡 ${drug.name}: ${daysLeft} يوم`);
        }
    });

    if ((alerts30.length || lowStock.length) && typeof triggerNotification === 'function') {
        const oneHourAgo = Date.now() - 3600000;
        const recentExists = notifications.some(n =>
            n.type === 'low_stock' && new Date(n.createdAt).getTime() > oneHourAgo);

        if (!recentExists) {
            triggerNotification('low_stock', {
                count: alerts30.length + lowStock.length,
                items: [...lowStock, ...alerts30].slice(0, 3).join(', ')
            });
        }
    }

    return { alerts30, alerts60, alerts90, lowStock };
}

// ========== 15. تصدير الدوال العامة ==========
window.showSection = showSection;
window.goBack = goBack;
window.checkAuth = checkAuth;
window.showToast = showToast;
window.closeModal = closeModal;
window.generateId = generateId;
window.getTodayDate = getTodayDate;
window.formatCurrency = formatCurrency;
window.setElementText = setElementText;
window.markDirty = markDirty;
window.saveAllData = saveAllData;
window.initializeData = initializeData;

window.loadPatients = loadPatients;
window.searchPatients = searchPatients;
window.openAddPatientModal = openAddPatientModal;
window.saveNewPatient = saveNewPatient;
window.showPatientQR = showPatientQR;
window.deletePatient = deletePatient;

window.openVisitModal = openVisitModal;
window.saveVisit = saveVisit;
window.viewHistory = viewHistory;

window.loadInventory = loadInventory;
window.addNewInventoryItem = addNewInventoryItem;
window.updateStock = updateStock;
window.deleteInventoryItem = deleteInventoryItem;

// تصدير handleRouteChange أيضًا
window.handleRouteChange = handleRouteChange;

// ========== 16. التشغيل النهائي ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeData();
        checkAuth();
    });
} else {
    initializeData();
    checkAuth();
}