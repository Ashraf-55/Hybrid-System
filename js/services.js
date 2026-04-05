// ========== 50. الفواتير اليدوية ==========

function openManualInvoiceModal() {
    const modal = document.getElementById('manualInvoiceModal');
    if (!modal) return;

    const sel = document.getElementById('manual-patient-id');
    if (sel) {
        sel.innerHTML = '<option value="">-- عميل نقدي (بدون مريض) --</option>' +
            patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    const itemsEl = document.getElementById('manual-invoice-items');
    if (itemsEl) itemsEl.innerHTML = '';
    addInvoiceItem();
    updateInvoiceTotals();
    modal.style.display = 'block';
}

function addInvoiceItem() {
    const container = document.getElementById('manual-invoice-items');
    if (!container) return;
    const rowId = 'row-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    container.insertAdjacentHTML('beforeend', `
        <tr id="${rowId}">
            <td><input type="text"   class="item-desc"  placeholder="اسم الخدمة"></td>
            <td width="80"><input  type="number" class="item-qty"   value="1"  min="1" oninput="updateInvoiceTotals()"></td>
            <td width="120"><input type="number" class="item-price" value="0"  min="0" oninput="updateInvoiceTotals()"></td>
            <td width="120" class="item-total-val">0.00 ج.م</td>
            <td width="40"><button type="button" class="btn-delete"
                onclick="this.closest('tr').remove();updateInvoiceTotals();">❌</button></td>
        </tr>`);
}

function updateInvoiceTotals() {
    let subtotal = 0;
    document.querySelectorAll('#manual-invoice-items tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const total = qty * price;
        const cell = row.querySelector('.item-total-val');
        if (cell) cell.innerText = total.toFixed(2) + ' ج.م';
        subtotal += total;
    });
    const tax = subtotal * 0.14;
    setElementText('manual-subtotal', subtotal.toFixed(2));
    setElementText('manual-tax', tax.toFixed(2));
    setElementText('manual-total', (subtotal + tax).toFixed(2));
}

function saveManualInvoice() {
    const items = [];
    document.querySelectorAll('#manual-invoice-items tr').forEach(row => {
        const desc = row.querySelector('.item-desc')?.value.trim();
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        if (desc && qty > 0 && price > 0) items.push({ description: desc, quantity: qty, price, total: qty * price });
    });
    if (!items.length) { showToast('يرجى إضافة خدمة واحدة على الأقل', 'warning'); return; }

    const patientId = document.getElementById('manual-patient-id')?.value;
    const patient = patients.find(p => p.id === patientId);
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = subtotal * 0.14;

    const newInvoice = {
        id: generateId(),
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        patientId: patientId || null,
        patientName: patient?.name || 'عميل نقدي',
        date: getTodayDate(),
        items, subtotal, tax,
        total: subtotal,
        grandTotal: subtotal + tax,
        discount: 0,
        status: 'paid',
        remainingAmount: 0,
        createdAt: new Date().toISOString()
    };
    invoices.push(newInvoice);
    saveAllData();
    loadInvoicesList();
    updateDashboard();
    closeModal();
    showToast('✅ تم حفظ الفاتورة بنجاح');
    printInvoice(invoices.length - 1);
}

function loadInvoicesList() {
    const tbody = document.querySelector('#invoices-table tbody');
    if (!tbody) return;

    if (!invoices.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا توجد فواتير مسجلة</td></tr>';
        return;
    }

    const today = getTodayDate();
    const todayInvoices = invoices.filter(i => i.date === today);
    const unpaid = invoices.filter(i => i.status === 'pending' || i.status === 'partial');

    setElementText('invoice-today-count', todayInvoices.length);
    setElementText('invoice-today-total', formatCurrency(todayInvoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0)));
    setElementText('invoice-unpaid', unpaid.length);

    tbody.innerHTML = [...invoices].reverse().map((inv, idx) => {
        const realIdx = invoices.length - 1 - idx;
        return `<tr>
            <td>#${inv.invoiceNumber}</td>
            <td>${inv.patientName}</td>
            <td>${inv.date}</td>
            <td>${(inv.subtotal || inv.total || 0).toFixed(2)} ج.م</td>
            <td>${(inv.tax || 0).toFixed(2)} ج.م</td>
            <td><strong>${(inv.grandTotal || inv.total || 0).toFixed(2)} ج.م</strong></td>
            <td><span class="badge badge-success">${inv.status || 'مدفوع'}</span></td>
            <td>
                <button class="btn-stock-plus" onclick="printInvoice(${realIdx})" title="طباعة">🖨️</button>
                <button class="btn-stock-del"  onclick="deleteInvoice(${realIdx})" title="حذف">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

function printInvoice(index) {
    try {
        const inv = invoices[index];
        if (!inv) return;
        const win = window.open('', '_blank');
        if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }

        const itemsHtml = (inv.items || []).map(item => `
            <tr>
                <td style="border:1px solid #ddd;padding:8px;">${item.description}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:center;">${item.quantity}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:center;">${item.price.toFixed(2)}</td>
                <td style="border:1px solid #ddd;padding:8px;text-align:center;">${(item.quantity * item.price).toFixed(2)}</td>
            </tr>`).join('');

        win.document.write(`<html dir="rtl"><head><title>فاتورة - ${inv.invoiceNumber}</title></head>
            <body onload="window.print();window.close();" style="font-family:sans-serif;padding:20px;">
                <h2 style="text-align:center">فاتورة عيادة</h2><hr>
                <p><strong>رقم الفاتورة:</strong> ${inv.invoiceNumber}</p>
                <p><strong>المريض:</strong> ${inv.patientName}</p>
                <p><strong>التاريخ:</strong> ${inv.date}</p>
                <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                    <thead><tr style="background:#f5f5f5;">
                        <th style="border:1px solid #ddd;padding:8px;">البيان</th>
                        <th style="border:1px solid #ddd;padding:8px;">الكمية</th>
                        <th style="border:1px solid #ddd;padding:8px;">السعر</th>
                        <th style="border:1px solid #ddd;padding:8px;">الإجمالي</th>
                    </tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div style="margin-top:30px;text-align:left;width:250px;float:left;">
                    <p>الإجمالي الفرعي: ${(inv.subtotal || inv.total || 0).toFixed(2)} ج.م</p>
                    <p>الضريبة (14%): ${(inv.tax || 0).toFixed(2)} ج.م</p>
                    <h3 style="border-top:2px solid #000;padding-top:10px;">
                        الإجمالي: ${(inv.grandTotal || inv.total || 0).toFixed(2)} ج.م
                    </h3>
                </div>
            </body></html>`);
        win.document.close();
    } catch (e) {
        showToast('حدث خطأ أثناء الطباعة', 'error');
    }
}

function deleteInvoice(index) {
    invoices.splice(index, 1);
    saveAllData();
    loadInvoicesList();
    updateDashboard();
    showToast('تم حذف الفاتورة', 'info');
}

// ========== 51. دوال التصدير والتقارير المساعدة ==========

function _downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function downloadAsExcel(dataList, fileName) {
    if (!dataList.length) { showToast('لا توجد بيانات لتصديرها', 'warning'); return; }

    const patientMap = new Map(patients.map(p => [p.id, p.name]));
    let csv = '\uFEFFتاريخ الزيارة,اسم المريض,التشخيص,المبلغ (ج.م)\n';

    dataList.forEach(v => {
        csv += `${v.visit_date || ''},${patientMap.get(v.patient_id) || 'غير معروف'},${(v.diagnosis || '').replace(/,/g, '-')},${v.total_fees || 0}\n`;
    });
    csv += `\nالإجمالي: ,,,${dataList.reduce((s, v) => s + (parseFloat(v.total_fees) || 0), 0)} ج.م`;

    _downloadCSV(csv, `${fileName}.csv`);
    showToast(`تم تحميل ${fileName}`);
}

function reportToday() {
    downloadAsExcel(visits.filter(v => v.visit_date === getTodayDate()), `تقرير_إيرادات_اليوم_${getTodayDate()}`);
}

function reportThisMonth() {
    const now = new Date();
    downloadAsExcel(
        visits.filter(v => v.visit_date && new Date(v.visit_date).getMonth() === now.getMonth() && new Date(v.visit_date).getFullYear() === now.getFullYear()),
        `تقرير_إيرادات_شهر_${now.toLocaleString('ar-EG', { month: 'long' })}_${now.getFullYear()}`
    );
}

function reportThisYear() {
    const y = new Date().getFullYear();
    downloadAsExcel(visits.filter(v => v.visit_date && new Date(v.visit_date).getFullYear() === y), `تقرير_إيرادات_سنة_${y}`);
}

function reportCustom() {
    const from = document.getElementById('date_from')?.value;
    const to = document.getElementById('date_to')?.value;
    if (!from || !to) { showToast('يرجى اختيار الفترة الزمنية', 'warning'); return; }
    downloadAsExcel(visits.filter(v => v.visit_date && v.visit_date >= from && v.visit_date <= to), `تقرير_من_${from}_إلى_${to}`);
}

function exportProcedureAnalytics() { showToast('📥 جاري تجهيز تقرير العمليات...', 'info'); }
function exportAnalytics(type) { if (type === 'patient') exportPatientAnalytics(); else showToast('جاري التطوير...', 'info'); }
function refreshAnalytics() { try { loadPatientAnalytics(); showToast('تم تحديث التحليلات'); } catch (e) { } }

function clearInventoryAnalytics() {
    ['total-consumption', 'low-stock-analytics', 'turnover-rate', 'total-supply'].forEach(id => setElementText(id, 0));
    const top = document.getElementById('top-consumed-table');
    if (top) top.innerHTML = '<tr><td colspan="2" style="text-align:center;">لا توجد بيانات</td></tr>';
    const monthly = document.querySelector('#monthly-consumption-table tbody');
    if (monthly) monthly.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا توجد بيانات</td></tr>';
}

function resetAnalytics() {
    ['age-0-18', 'age-19-35', 'age-36-50', 'age-51-65', 'age-65-plus',
        'avg-age', 'max-age', 'min-age',
        'analytics-avg-wait', 'max-wait', 'min-wait', 'cancelled-appts',
        'total-procedures', 'total-completed', 'success-rate', 'avg-cost'].forEach(id => setElementText(id, 0));

    const citiesEl = document.getElementById('top-cities-list');
    const chronicEl = document.getElementById('chronic-diseases-table');
    if (citiesEl) citiesEl.innerHTML = '<div>لا توجد بيانات</div>';
    if (chronicEl) chronicEl.innerHTML = '<tr><td colspan="2">لا توجد أمراض مزمنة</td></tr>';

    clearInventoryAnalytics();

    ['wait-time-chart', 'peak-hours-chart', 'procedure-status-chart',
        'procedure-type-chart', 'procedure-trend-chart', 'inventory-chart'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<p style="text-align:center;padding:20px;">لا توجد بيانات كافية للرسم البياني</p>';
        });

    try {
        const canvas = document.getElementById('ageChartCanvas');
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    } catch (e) { }
}

function showForgotPassword() {
    closeModal();
    document.getElementById('forgotPasswordModal').style.display = 'block';
}

function showChangePasswordModal() {
    if (!currentUser) { showToast('الرجاء تسجيل الدخول أولاً', 'warning'); return; }
    closeModal();
    document.getElementById('changePasswordModal').style.display = 'block';
}

function submitChangePassword() {
    const oldPass = document.getElementById('old-password')?.value;
    const newPass = document.getElementById('new-password')?.value;
    const confirmPass = document.getElementById('confirm-password')?.value;

    if (!oldPass || !newPass || !confirmPass) { showToast('جميع الحقول مطلوبة', 'warning'); return; }
    if (newPass !== confirmPass) { showToast('كلمة المرور الجديدة غير متطابقة', 'error'); return; }
    if (newPass.length < 6) { showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning'); return; }

    if (changePassword(oldPass, newPass)) {
        closeModal();
        ['old-password', 'new-password', 'confirm-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
}

// ========== 52. مسح البيانات التشغيلية مع حماية الإعدادات ==========

function clearDashboard() {
    // حفظ الإعدادات المحمية
    const saved = {
        notificationTemplates: JSON.parse(JSON.stringify(notificationTemplates)),
        notificationSettings: JSON.parse(JSON.stringify(notificationSettings)),
        loyaltySettings: JSON.parse(JSON.stringify(loyaltySettings)),
        loyaltyTiers: JSON.parse(JSON.stringify(loyaltyTiers)),
        clinicSettings: localStorage.getItem('clinic_settings')
    };

    // مسح المصفوفات التشغيلية
    [patients, inventory, visits, appointments, pharmacy, invoices, expenses, doctors,
        suppliers, purchaseOrders, stockTransfers, stockWaste, stockTransactions, labs,
        labRequests, labTemplates, campaigns, scheduledMessages, messageTemplates,
        patientSegments, messageLog, loyaltyPoints, loyaltyRedemptions, notifications,
        aiReports, patientBalances, insuranceCompanies, insurancePackages, patientInsurance,
        insuranceClaims, tasks, salaries, shifts, attendance].forEach(arr => {
            if (Array.isArray(arr)) arr.length = 0;
        });
    if (Array.isArray(performanceLogs)) performanceLogs.length = 0;
    if (Array.isArray(alertLogs)) alertLogs.length = 0;

    warehouses = [{ id: 'wh-main', name: 'المخزن الرئيسي', type: 'main', location: '', manager: '', notes: '', createdAt: new Date().toISOString() }];

    // إبقاء المستخدم الحالي فقط
    const currentEmp = employees.find(e => e.id === currentUser?.id);
    employees.length = 0;
    if (currentEmp) {
        employees.push(currentEmp);
    } else {
        employees.push({ id: 'emp-admin', username: 'admin', password: 'admin123', fullName: 'مدير النظام', role: 'admin', email: 'admin@clinic.com', phone: '', position: 'مدير عام', department: 'الإدارة', isActive: true, hireDate: getTodayDate(), salary: 5000, shift: 'morning', lastLogin: null, createdAt: new Date().toISOString() });
    }

    // مسح localStorage التشغيلي مع الحفاظ على الإعدادات
    const PROTECTED = new Set(['clinic_notificationTemplates', 'clinic_notificationSettings',
        'clinic_loyaltySettings', 'clinic_loyaltyTiers', 'clinic_settings', 'clinic_employees']);
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('clinic_') && !PROTECTED.has(k)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));

    // استعادة الإعدادات
    notificationTemplates = saved.notificationTemplates;
    notificationSettings = saved.notificationSettings;
    loyaltySettings = saved.loyaltySettings;
    loyaltyTiers = saved.loyaltyTiers;
    if (saved.clinicSettings) localStorage.setItem('clinic_settings', saved.clinicSettings);

    saveAllData();
    updateNotificationBadge();
    _clearAllTableBodies();
    clearInventoryAnalytics();
    resetAnalytics();
    renderAll();
    updateDashboard();
    showToast('✅ تم حذف البيانات', 'success');
}

function _clearAllTableBodies() {
    [
        '#patients-table tbody', '#inventory-table tbody', '#appointments-table tbody',
        '#pharmacy-table tbody', '#expenses-table tbody', '#balance-table tbody',
        '#invoices-table tbody', '#insurance-companies-table tbody',
        '#patient-insurance-table tbody', '#claims-table tbody',
        '#warehouses-table tbody', '#suppliers-table tbody',
        '#purchase-orders-table tbody', '#transfers-table tbody',
        '#waste-table tbody', '#ledger-table tbody', '#labs-table tbody',
        '#lab-requests-table tbody', '#lab-templates-table tbody',
        '#employees-table tbody', '#attendance-table tbody',
        '#tasks-table tbody', '#salaries-table tbody', '#campaigns-table tbody',
        '#message-templates-table tbody', '#scheduled-table tbody',
        '#message-log-table tbody', '#loyalty-points-table tbody',
        '#redemptions-table tbody', '#notification-log-table tbody',
        '#employee-performance-table tbody', '#ai-reports-table tbody'
    ].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;">تم المسح</td></tr>';
    });
}

function renderAll() {
    loadPatients();
    loadInventory();
    loadAppointments();
    renderPharmacy();
    updateDashboard();
}

// ========== 53. القوالب الافتراضية للتنبيهات ==========

function initDefaultNotificationTemplates() {
    if (notificationTemplates.length > 0) return;

    const defaults = [
        { id: 'tmpl-low-stock', eventType: 'low_stock', title: '⚠️ نقص في المخزون', content: 'يوجد {count} أصناف ناقصة: {items}', priority: 'high' },
        { id: 'tmpl-appointment', eventType: 'appointment_reminder', title: '🔔 تذكير بموعد', content: 'لديك موعد مع {patientName} الساعة {time}', priority: 'medium' },
        { id: 'tmpl-salary', eventType: 'salary_paid', title: '💰 صرف مرتب', content: 'تم صرف مرتب {employeeName} بقيمة {amount} ج.م', priority: 'medium' },
        { id: 'tmpl-message', eventType: 'message_sent', title: '📨 رسالة مرسلة', content: 'تم إرسال "{templateName}" إلى {recipientsCount} مريض', priority: 'low' },
        { id: 'tmpl-msg-scheduled', eventType: 'message_scheduled', title: '📅 رسالة مجدولة', content: 'تم جدولة "{templateName}" في {scheduledTime}', priority: 'low' },
        { id: 'tmpl-tier', eventType: 'tier_upgrade', title: '⭐ ترقية مستوى', content: 'تم ترقية {patientName} إلى مستوى {tier}', priority: 'medium' },
        { id: 'tmpl-task', eventType: 'task_assigned', title: '📋 مهمة جديدة', content: 'تم تعيين مهمة جديدة', priority: 'medium' },
        { id: 'tmpl-lab', eventType: 'lab_result', title: '🔬 نتيجة معمل', content: 'نتيجة معمل جديدة متاحة', priority: 'medium' },
        { id: 'tmpl-patient', eventType: 'patient_registered', title: '👤 مريض جديد', content: 'تم إضافة مريض جديد: {patientName}', priority: 'low' },
        { id: 'tmpl-appt-new', eventType: 'appointment_booked', title: '📅 موعد جديد', content: 'تم حجز موعد للمريض {patientName} في {date}', priority: 'medium' }
    ];

    defaults.forEach(d => notificationTemplates.push({
        ...d, event: d.eventType, isActive: true,
        recipients: ['admin'], createdAt: new Date().toISOString()
    }));

    saveAllData();
}

// ========== 54. تنظيف التنبيهات القديمة ==========

function cleanupOldNotifications() {
    try {
        const cutoff = Date.now() - 7 * 86_400_000;
        const before = notifications.length;
        notifications = notifications.filter(n => n && new Date(n.createdAt).getTime() > cutoff && n.type !== 'patient_birthday');
        if (before !== notifications.length) { saveAllData(); updateNotificationBadge(); }
    } catch (e) {
    }
}

// ========== Issue #14 | Cloud Sync Priority ==========
// مزامنة السحابة أولاً قبل localStorage
// ─────────────────────────────────────────────────────
// لتفعيل Firebase: أضف مفتاح CLOUD_PROVIDER = 'firebase' وبيانات الاتصال في CONFIG.
// لتفعيل Supabase:  أضف مفتاح CLOUD_PROVIDER = 'supabase' وبيانات الاتصال في CONFIG.
// إذا لم يُحدَّد المزود أو لم يكن هناك اتصال بالإنترنت، يُستخدم localStorage تلقائياً.

async function _fetchCloudData() {
    const provider = (typeof CONFIG !== 'undefined' && CONFIG.CLOUD_PROVIDER) || null;
    if (!provider) return null;

    // ── Firebase Realtime Database ──
    if (provider === 'firebase') {
        const url = `${CONFIG.FIREBASE_URL}/clinicData.json?auth=${CONFIG.FIREBASE_TOKEN}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Firebase HTTP ${res.status}`);
        return res.json();
    }

    // ── Supabase REST ──
    if (provider === 'supabase') {
        const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/clinic_data?select=*`, {
            headers: {
                apikey: CONFIG.SUPABASE_KEY,
                Authorization: `Bearer ${CONFIG.SUPABASE_KEY}`
            },
            signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
        const rows = await res.json();
        // يُفترض أن السطر الأول يحمل البيانات بصيغة JSON تحت مفتاح "payload"
        return rows?.[0]?.payload ?? null;
    }

    return null;
}

function _applyCloudData(cloudData) {
    if (!cloudData || typeof cloudData !== 'object') return;

    // خريطة: مفتاح السحابة → المتغير العالمي المحلي
    const mapping = {
        patients, inventory, visits, appointments, pharmacy, invoices,
        expenses, doctors, suppliers, purchaseOrders, stockTransfers,
        stockWaste, stockTransactions, labs, labRequests, labTemplates,
        campaigns, scheduledMessages, messageTemplates, patientSegments,
        messageLog, loyaltyPoints, loyaltyRedemptions, notifications,
        aiReports, patientBalances, insuranceCompanies, insurancePackages,
        patientInsurance, insuranceClaims, tasks, salaries, shifts,
        attendance, employees, notificationTemplates, performanceLogs, alertLogs
    };

    Object.entries(mapping).forEach(([key, arr]) => {
        if (Array.isArray(cloudData[key]) && Array.isArray(arr)) {
            arr.length = 0;
            arr.push(...cloudData[key]);
        }
    });

    // متغيرات مفردة
    if (cloudData.warehouses) warehouses = cloudData.warehouses;
    if (cloudData.notificationSettings) notificationSettings = cloudData.notificationSettings;
    if (cloudData.loyaltySettings) loyaltySettings = cloudData.loyaltySettings;
    if (cloudData.loyaltyTiers) loyaltyTiers = cloudData.loyaltyTiers;
    if (cloudData.clinicSettings) localStorage.setItem('clinic_settings', JSON.stringify(cloudData.clinicSettings));

    console.info('[Cloud Sync] ✅ البيانات محمّلة من السحابة بنجاح.');
}

/**
 * initializeData  (Issue #14)
 * الأولوية: السحابة (Firebase / Supabase) ← localStorage ← بيانات افتراضية
 */
async function initializeData() {
    // 1) محاولة السحابة عند توفر الاتصال
    if (navigator.onLine) {
        try {
            const cloudData = await _fetchCloudData();
            if (cloudData) {
                _applyCloudData(cloudData);
                // حفظ نسخة محلية لضمان التوافر بدون إنترنت
                saveAllData();
                return;
            }
        } catch (err) {
            console.warn('[Cloud Sync] ⚠️ فشل الاتصال بالسحابة، جارٍ التحميل من localStorage:', err.message);
        }
    }

    // 2) الرجوع إلى localStorage
    try {
        const keys = [
            'patients', 'inventory', 'visits', 'appointments', 'pharmacy',
            'invoices', 'expenses', 'doctors', 'suppliers', 'purchaseOrders',
            'stockTransfers', 'stockWaste', 'stockTransactions', 'labs',
            'labRequests', 'labTemplates', 'campaigns', 'scheduledMessages',
            'messageTemplates', 'patientSegments', 'messageLog', 'loyaltyPoints',
            'loyaltyRedemptions', 'notifications', 'aiReports', 'patientBalances',
            'insuranceCompanies', 'insurancePackages', 'patientInsurance',
            'insuranceClaims', 'tasks', 'salaries', 'shifts', 'attendance',
            'employees', 'notificationTemplates', 'performanceLogs', 'alertLogs'
        ];

        keys.forEach(key => {
            const raw = localStorage.getItem(`clinic_${key}`);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    const target = eval(key); // المتغيرات العالمية المُعرَّفة مسبقاً
                    if (Array.isArray(target) && Array.isArray(parsed)) {
                        target.length = 0;
                        target.push(...parsed);
                    }
                } catch (_) { /* تجاهل مفتاح تالف */ }
            }
        });

        const warehousesRaw = localStorage.getItem('clinic_warehouses');
        if (warehousesRaw) warehouses = JSON.parse(warehousesRaw);

        console.info('[initializeData] ✅ البيانات محمّلة من localStorage.');
    } catch (err) {
        console.error('[initializeData] ❌ خطأ أثناء تحميل localStorage:', err);
    }
}

// ========== Issue #19 | Performance Optimization — Safe Interval ==========
// منع تداخل الدورات وإيقاف المهام في حالة عدم نشاط التبويب

/**
 * safeInterval
 * غلاف آمن لـ setInterval يمنع التداخل ويوقف التنفيذ عند إخفاء التبويب.
 *
 * @param {Function} fn      - الدالة المراد تشغيلها (تدعم async/await)
 * @param {number}   ms      - الفاصل الزمني بالمللي ثانية
 * @param {string}   label   - اسم المهمة لتسهيل التتبع في Console
 * @returns {number}         - معرّف الـ interval لإمكانية إلغائه لاحقاً
 */
function safeInterval(fn, ms, label = 'task') {
    let isRunning = false;

    const wrapped = async () => {
        // ── إيقاف تام عند إخفاء التبويب لتوفير الموارد ──
        if (document.hidden) {
            console.debug(`[safeInterval:${label}] التبويب غير نشط — تم تخطي الدورة.`);
            return;
        }

        // ── منع التداخل: إذا لا تزال الدورة السابقة قيد التنفيذ ──
        if (isRunning) {
            console.warn(`[safeInterval:${label}] دورة سابقة لم تنتهِ بعد — تم تخطي هذه الدورة.`);
            return;
        }

        isRunning = true;
        try {
            await fn();
        } catch (err) {
            console.error(`[safeInterval:${label}] خطأ:`, err);
        } finally {
            isRunning = false;
        }
    };

    return setInterval(wrapped, ms);
}

// ========== 55. التهيئة النهائية ==========
// الترتيب الصحيح: Theme → Data → Auth → Permissions → UI → Intervals

window.onload = async function () {
    try {

        (function applyTheme() {
            try {
                const settings = JSON.parse(localStorage.getItem('clinic_settings') || '{}');
                const theme = settings.theme || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                document.body.classList.toggle('dark-mode', theme === 'dark');
            } catch (_) { }
        })();

        if (Array.isArray(notifications)) {
            notifications = notifications.filter(n => n?.type !== 'patient_birthday');
        }

        await initializeData();

        initDefaultNotificationTemplates();

        checkAuth();

        if (currentUser) {
            if (typeof applyUserPermissions === 'function') applyUserPermissions(currentUser);
            showAppInterface();
            renderAll();
            handleRouteChange();
            startScheduledMessagesChecker();
        }

        // ── 7. المهام الدورية الآمنة (Issue #19) ──
        safeInterval(updateDashboard, CONFIG.DASHBOARD_INTERVAL_MS, 'dashboard');
        safeInterval(checkAutomaticNotifications, CONFIG.NOTIFICATION_CHECK_MS, 'notifications');
        safeInterval(updateNotificationBadge, CONFIG.BADGE_REFRESH_MS, 'badge');
        safeInterval(cleanupOldNotifications, CONFIG.CLEANUP_INTERVAL_MS, 'cleanup');

        // ── 8. لقطة الأداء اليومية عند 11:55 م ──
        const now = new Date();
        const nextSnapshot = new Date(
            now.getFullYear(), now.getMonth(), now.getDate(),
            CONFIG.PERF_SNAPSHOT_HOUR, CONFIG.PERF_SNAPSHOT_MIN, 0
        );
        const msUntil = nextSnapshot - now;

        const startDailySnapshot = () => {
            savePerformanceSnapshot();
            safeInterval(savePerformanceSnapshot, 86_400_000, 'perf-snapshot');
        };

        if (msUntil > 0) {
            setTimeout(startDailySnapshot, msUntil);
        } else {
            // الوقت فات اليوم — ابدأ من الغد
            setTimeout(startDailySnapshot, msUntil + 86_400_000);
        }

    } catch (e) {
        console.error('[window.onload] ❌ خطأ فادح أثناء التهيئة:', e);
    }
};