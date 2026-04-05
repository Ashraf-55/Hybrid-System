// ============================================================
//  finance-store.js  —  REFACTORED
//  Issues resolved: #4, #6, #7, #16, #17
// ============================================================

// ========== ISSUE #4 — تعريف فئات المصروفات ==========
const EXPENSE_CATEGORIES = [
    { id: 'rent', name: 'إيجار', icon: '🏢' },
    { id: 'salaries', name: 'مرتبات', icon: '💼' },
    { id: 'medical_tools', name: 'أدوات طبية', icon: '🩺' },
    { id: 'marketing', name: 'تسويق وإعلان', icon: '📣' },
    { id: 'utilities', name: 'مرافق (كهرباء/ماء)', icon: '💡' },
    { id: 'maintenance', name: 'صيانة', icon: '🔧' },
    { id: 'supplies', name: 'مستلزمات مكتبية', icon: '📦' },
    { id: 'other', name: 'أخرى', icon: '📝' }
];

/**
 * أداة مساعدة: إرجاع اسم الفئة من معرِّفها
 */
function getCategoryName(categoryId) {
    return EXPENSE_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId || 'أخرى';
}

// ========== ISSUE #6 — الخزنة الرئيسية (Master Safe) ==========
/**
 * يُنشئ أو يُرجع كائن الخزنة الرئيسية المحفوظة في mainSafe[]
 * (تأكد أن mainSafe مُعرَّف كمصفوفة فارغة في مكان إعلان المتغيرات العامة)
 */
function getMainSafe() {
    if (!Array.isArray(window.mainSafe)) window.mainSafe = [];
    if (!mainSafe.length) {
        mainSafe.push({
            id: 'safe-main',
            name: 'الخزنة الرئيسية',
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString()
        });
        saveAllData();
    }
    return mainSafe[0];
}

/**
 * يُضيف مبلغاً إلى الخزنة الرئيسية ويحفظ القيد
 */
function depositToMainSafe(amount, description, sourceRef = null, clinicId = null) {
    const safe = getMainSafe();
    safe.balance += amount;
    safe.transactions.push({
        id: 'sft-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        type: 'deposit',
        amount,
        description,
        sourceRef,
        clinicId: clinicId || getCurrentClinicId(),
        date: getTodayDate(),
        createdAt: new Date().toISOString()
    });
    saveAllData();
    return safe.balance;
}

// ========== ISSUE #16 — الحصول على معرِّف العيادة النشطة ==========
/**
 * أداة مساعدة: تُرجع clinicId من الجلسة أو قيمة افتراضية
 */
function getCurrentClinicId() {
    return (typeof currentClinicId !== 'undefined' && currentClinicId)
        ? currentClinicId
        : (localStorage.getItem('activeClinicId') || 'clinic-main');
}

// ========== 41. الشيفتات ==========

function openShiftModal() {
    _renderShiftModal(null);
}

function _renderShiftModal(existingShift) {
    const existing = existingShift;
    const modalId = 'shiftModal';
    document.getElementById(modalId)?.remove();

    const employeeOptions = employees.filter(e => e.isActive).map(e => `
        <div class="employee-checkbox-item">
            <input type="checkbox" value="${e.id}" id="shft-chk-${e.id}"
                ${existing?.employees?.includes(e.id) ? 'checked' : ''}>
            <label for="shft-chk-${e.id}">${e.fullName} (${e.role})</label>
        </div>`).join('') || '<p>لا يوجد موظفين</p>';

    // ISSUE #16: خيارات العيادة
    const clinicOptions = (typeof clinics !== 'undefined' ? clinics : [])
        .map(c => `<option value="${c.id}" ${existing?.clinicId === c.id ? 'selected' : ''}>${c.name}</option>`)
        .join('') || `<option value="${getCurrentClinicId()}">الفرع الافتراضي</option>`;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = modalId;

    const actionFn = existing ? `updateShift('${existing.id}')` : 'saveShift()';
    const actionLabel = existing ? '💾 حفظ التعديلات' : '💾 حفظ';

    modal.innerHTML = `
        <div class="modal-content small-modal">
            <h2>${existing ? '✏️ تعديل الشيفت' : '➕ إضافة شيفت جديد'}</h2>
            <input type="text" id="shift-name" placeholder="اسم الشيفت" value="${existing?.name || ''}">
            <div class="form-row">
                <input type="time" id="shift-start" value="${existing?.startTime || '08:00'}">
                <input type="time" id="shift-end"   value="${existing?.endTime || '16:00'}">
            </div>
            <select id="shift-type">
                <option value="morning" ${existing?.type === 'morning' ? 'selected' : ''}>صباحي</option>
                <option value="evening" ${existing?.type === 'evening' ? 'selected' : ''}>مسائي</option>
                <option value="night"   ${existing?.type === 'night' ? 'selected' : ''}>ليلي</option>
            </select>
            <!-- ISSUE #16: اختيار الفرع -->
            <label>الفرع / العيادة</label>
            <select id="shift-clinic">${clinicOptions}</select>
            <label>الموظفون في هذا الشيفت</label>
            <div class="employee-checkbox-group">${employeeOptions}</div>
            <input type="color" id="shift-color" value="${existing?.color || '#3498db'}" style="height:40px;">
            <div class="modal-actions">
                <button onclick="${actionFn}" class="btn-primary">${actionLabel}</button>
                <button onclick="document.getElementById('${modalId}').remove();" class="btn-secondary">❌ إلغاء</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function saveShift() {
    const name = document.getElementById('shift-name')?.value.trim();
    const startTime = document.getElementById('shift-start')?.value;
    const endTime = document.getElementById('shift-end')?.value;
    const type = document.getElementById('shift-type')?.value;
    const color = document.getElementById('shift-color')?.value;
    const clinicId = document.getElementById('shift-clinic')?.value || getCurrentClinicId(); // ISSUE #16

    if (!name || !startTime || !endTime) { showToast('أكمل البيانات المطلوبة', 'warning'); return; }

    const selectedEmployees = Array.from(document.querySelectorAll('#shiftModal input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    shifts.push({
        id: 'shift-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        name, startTime, endTime, type, color,
        employees: selectedEmployees,
        clinicId,                  // ISSUE #16
        netCashOnClose: null,      // ISSUE #6: يُعبأ عند الإغلاق
        status: 'open',         // ISSUE #6: open | closed
        createdAt: new Date().toISOString(),
        active: true
    });

    saveAllData();
    loadShifts();
    document.getElementById('shiftModal')?.remove();
    showToast('✅ تم إضافة الشيفت');
}

function editShift(id) {
    const shift = shifts.find(s => s.id === id);
    if (!shift) return;
    _renderShiftModal(shift);
}

function updateShift(id) {
    const shift = shifts.find(s => s.id === id);
    if (!shift) return;

    shift.name = document.getElementById('shift-name')?.value || shift.name;
    shift.startTime = document.getElementById('shift-start')?.value || shift.startTime;
    shift.endTime = document.getElementById('shift-end')?.value || shift.endTime;
    shift.type = document.getElementById('shift-type')?.value || shift.type;
    shift.color = document.getElementById('shift-color')?.value || shift.color;
    shift.clinicId = document.getElementById('shift-clinic')?.value || shift.clinicId; // ISSUE #16
    shift.employees = Array.from(document.querySelectorAll('#shiftModal input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    saveAllData();
    loadShifts();
    document.getElementById('shiftModal')?.remove();
    showToast('✅ تم تحديث الشيفت');
}

function deleteShift(id) {
    shifts = shifts.filter(s => s.id !== id);
    saveAllData();
    loadShifts();
    showToast('تم حذف الشيفت', 'info');
}

// ========== ISSUE #6 — إغلاق الشيفت وتحويل الصافي للخزنة ==========
/**
 * يُغلق الشيفت ويحوِّل إجمالي نقده المحصَّل إلى الخزنة الرئيسية
 * @param {string} shiftId
 * @param {number} netCash  - المبلغ النقدي المحصَّل خلال هذا الشيفت
 */
function closeShiftAndSettle(shiftId, netCash = 0) {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) { showToast('الشيفت غير موجود', 'error'); return; }
    if (shift.status === 'closed') { showToast('الشيفت مُغلق مسبقاً', 'warning'); return; }

    const amount = parseFloat(netCash) || 0;

    shift.status = 'closed';
    shift.closedAt = new Date().toISOString();
    shift.netCashOnClose = amount;

    // تحويل الصافي إلى الخزنة الرئيسية
    if (amount > 0) {
        depositToMainSafe(
            amount,
            `تسوية شيفت: ${shift.name} — ${shift.closedAt?.substring(0, 10)}`,
            shift.id,
            shift.clinicId
        );
        showToast(`✅ تم إغلاق الشيفت وتحويل ${amount.toLocaleString()} ج.م للخزنة الرئيسية`);
    } else {
        showToast('✅ تم إغلاق الشيفت (لا يوجد صافي نقدي)');
    }

    saveAllData();
    loadShifts();
}

/**
 * نافذة إغلاق الشيفت مع إدخال الصافي النقدي
 */
function openCloseShiftModal(shiftId) {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const modalId = 'closeShiftModal';
    document.getElementById(modalId)?.remove();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = modalId;
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <h2>🔒 إغلاق شيفت: ${shift.name}</h2>
            <p>أدخل إجمالي النقد المحصَّل خلال هذا الشيفت</p>
            <input type="number" id="shift-net-cash" placeholder="0.00" min="0" step="0.01">
            <div class="modal-actions">
                <button onclick="closeShiftAndSettle('${shiftId}', document.getElementById('shift-net-cash').value);
                                 document.getElementById('${modalId}').remove();"
                        class="btn-primary">✅ إغلاق وتسوية</button>
                <button onclick="document.getElementById('${modalId}').remove();" class="btn-secondary">❌ إلغاء</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function loadShifts() {
    const container = document.getElementById('shifts-list');
    if (!container) return;

    if (!shifts.length) {
        container.innerHTML = '<p style="text-align:center;padding:50px;">لا توجد شيفتات مضافة</p>';
        return;
    }

    setElementText('total-shifts', shifts.length);
    setElementText('active-shifts', shifts.filter(s => s.active && s.status !== 'closed').length);

    const allAssigned = new Set(shifts.flatMap(s => s.employees || []));
    setElementText('today-shift-employees', allAssigned.size);

    const totalHours = shifts.reduce((sum, s) => {
        if (!s.startTime || !s.endTime || !s.employees?.length) return sum;
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        let h = (eh + em / 60) - (sh + sm / 60);
        if (h < 0) h += 24;
        return sum + h * s.employees.length;
    }, 0);
    setElementText('total-work-hours', Math.round(totalHours));

    const typeNames = { morning: 'صباحي', evening: 'مسائي', night: 'ليلي' };
    container.innerHTML = shifts.map(shift => {
        const shiftEmployees = employees.filter(e => shift.employees?.includes(e.id));
        const isClosed = shift.status === 'closed';
        return `
            <div class="shift-card" style="border-top:4px solid ${shift.color};opacity:${isClosed ? 0.75 : 1}">
                <h3>${shift.name} ${isClosed ? '<span style="font-size:12px;color:#e74c3c;">🔒 مغلق</span>' : ''}</h3>
                <div class="shift-time">🕐 ${shift.startTime} - ${shift.endTime}</div>
                <div><strong>النوع:</strong> ${typeNames[shift.type] || shift.type}</div>
                <div><strong>الفرع:</strong> ${shift.clinicId || 'افتراضي'}</div>
                ${isClosed ? `<div><strong>الصافي المحوَّل:</strong> ${(shift.netCashOnClose || 0).toLocaleString()} ج.م</div>` : ''}
                <div class="shift-employees">
                    <strong>الموظفون (${shiftEmployees.length}):</strong><br>
                    ${shiftEmployees.map(e => `<span class="employee-badge">${e.fullName}</span>`).join(' ') || 'لا يوجد'}
                </div>
                <div class="shift-actions">
                    <button onclick="editShift('${shift.id}')"   class="btn-stock-minus">✏️ تعديل</button>
                    ${!isClosed
                ? `<button onclick="openCloseShiftModal('${shift.id}')" class="btn-stock-plus">🔒 إغلاق</button>`
                : ''}
                    <button onclick="deleteShift('${shift.id}')" class="btn-stock-del">🗑️ حذف</button>
                </div>
            </div>`;
    }).join('');
}

function filterShifts(filter) {
    document.querySelectorAll('#shifts .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');

    const container = document.getElementById('shifts-list');
    if (!container) return;

    const filtered = filter === 'all' ? shifts : shifts.filter(s => s.type === filter);
    const typeNames = { morning: 'صباحي', evening: 'مسائي', night: 'ليلي' };

    if (!filtered.length) {
        container.innerHTML = '<p style="text-align:center;padding:50px;">لا توجد شيفتات</p>';
        return;
    }

    container.innerHTML = filtered.map(shift => {
        const shiftEmployees = employees.filter(e => shift.employees?.includes(e.id));
        const isClosed = shift.status === 'closed';
        return `
            <div class="shift-card" style="border-top:4px solid ${shift.color}">
                <h3>${shift.name} ${isClosed ? '🔒' : ''}</h3>
                <div class="shift-time">🕐 ${shift.startTime} - ${shift.endTime}</div>
                <div><strong>النوع:</strong> ${typeNames[shift.type] || shift.type}</div>
                <div class="shift-employees">
                    <strong>الموظفون (${shiftEmployees.length}):</strong><br>
                    ${shiftEmployees.map(e => `<span class="employee-badge">${e.fullName}</span>`).join(' ') || 'لا يوجد'}
                </div>
                <div class="shift-actions">
                    <button onclick="editShift('${shift.id}')"   class="btn-stock-minus">✏️ تعديل</button>
                    <button onclick="deleteShift('${shift.id}')" class="btn-stock-del">🗑️ حذف</button>
                </div>
            </div>`;
    }).join('');
}

// ========== 42. صرف المرتبات مع قيد المصروفات ==========

function paySalary(salaryId) {
    const salary = salaries.find(s => s.id === salaryId);
    if (!salary) { showToast('المرتب غير موجود', 'error'); return; }
    if (salary.status === 'paid') { showToast('تم صرف هذا المرتب مسبقاً', 'warning'); return; }

    // ISSUE #7: خصم السلف قبل الصرف
    const advance = _getTotalAdvancesForEmployee(salary.employeeId, salary.month, salary.year);
    const netAfterAdvance = Math.max(0, (salary.netSalary || 0) - advance);
    if (advance > 0) {
        salary.advanceDeducted = advance;
        salary.finalNet = netAfterAdvance;
        showToast(`⚠️ تم خصم سلفة ${advance.toLocaleString()} ج.م — الصافي بعد الخصم: ${netAfterAdvance.toLocaleString()} ج.م`, 'info');
    }

    salary.status = 'paid';
    salary.paidAt = new Date().toISOString();

    // ISSUE #4 + ISSUE #16: حقل الفئة و clinicId في المصروف
    expenses.push({
        id: 'exp-sal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        categoryId: 'salaries',                           // ISSUE #4
        categoryName: getCategoryName('salaries'),          // ISSUE #4
        description: `مرتب: ${salary.employeeName} — ${salary.monthName || ''} ${salary.year}`,
        amount: netAfterAdvance || salary.netSalary,
        date: getTodayDate(),
        payment: 'bank',
        employeeId: salary.employeeId,
        salaryId: salary.id,
        clinicId: salary.clinicId || getCurrentClinicId(), // ISSUE #16
        createdAt: new Date().toISOString()
    });

    triggerNotification('salary_paid', {
        employeeName: salary.employeeName,
        amount: netAfterAdvance.toLocaleString()
    });

    saveAllData();
    loadSalaries();
    updateDashboard();
    showToast(`✅ تم صرف مرتب ${salary.employeeName} (${netAfterAdvance.toLocaleString()} ج.م) وإضافته للمصروفات`);
}

// ========== ISSUE #7 — سُلف الموظفين (Advances) ==========

/**
 * يُضيف سلفة لموظف وتُسجَّل في مصفوفة employeeAdvances
 */
function addEmployeeAdvance({ employeeId, employeeName, amount, month, year, notes = '', clinicId = null }) {
    if (!Array.isArray(window.employeeAdvances)) window.employeeAdvances = [];

    const advance = {
        id: 'adv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        employeeId,
        employeeName,
        amount: parseFloat(amount) || 0,
        month: month ?? new Date().getMonth() + 1,
        year: year ?? new Date().getFullYear(),
        notes,
        status: 'pending',   // pending | deducted
        clinicId: clinicId || getCurrentClinicId(), // ISSUE #16
        createdAt: new Date().toISOString()
    };
    employeeAdvances.push(advance);

    // تسجيلها أيضاً كمصروف فئة مرتبات
    expenses.push({
        id: 'exp-adv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        categoryId: 'salaries',
        categoryName: getCategoryName('salaries'),
        description: `سلفة: ${employeeName}`,
        amount: advance.amount,
        date: getTodayDate(),
        payment: 'cash',
        employeeId,
        advanceId: advance.id,
        clinicId: advance.clinicId,
        createdAt: new Date().toISOString()
    });

    saveAllData();
    showToast(`✅ تم تسجيل سلفة ${advance.amount.toLocaleString()} ج.م للموظف ${employeeName}`);
    return advance;
}

/**
 * يحسب إجمالي السلف غير المخصومة لموظف في شهر/سنة معيَّنَين
 */
function _getTotalAdvancesForEmployee(employeeId, month, year) {
    if (!Array.isArray(window.employeeAdvances)) return 0;
    return employeeAdvances
        .filter(a => a.employeeId === employeeId
            && a.month === month
            && a.year === year
            && a.status === 'pending')
        .reduce((sum, a) => sum + (a.amount || 0), 0);
}

// ========== ISSUE #7 — حساب الراتب من الحضور ==========

/**
 * يحسب الراتب الشهري بناءً على سجلات الحضور الفعلية
 * @param {string} employeeId
 * @param {number} month  - 1..12
 * @param {number} year
 * @returns {object} تقرير تفصيلي
 */
function calculateSalaryFromAttendance(employeeId, month, year) {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return null;

    const baseSalary = parseFloat(emp.salary || emp.baseSalary || 0);
    const workingDays = 26; // أيام العمل الافتراضية في الشهر

    // سجلات الحضور المفلترة للشهر
    const monthAttendance = attendance.filter(a => {
        if (a.employeeId !== employeeId || !a.checkIn) return false;
        const d = new Date(a.date);
        return (d.getMonth() + 1) === month && d.getFullYear() === year;
    });

    const presentDays = monthAttendance.length;
    const absentDays = Math.max(0, workingDays - presentDays);

    // احتساب ساعات العمل الفعلية
    const totalHoursWorked = monthAttendance.reduce((sum, a) => {
        if (!a.checkIn || !a.checkOut) return sum;
        const inT = new Date(`${a.date}T${a.checkIn}`);
        const outT = new Date(`${a.date}T${a.checkOut}`);
        const hrs = (outT - inT) / 3_600_000;
        return sum + (hrs > 0 ? hrs : 0);
    }, 0);

    const dailyRate = baseSalary / workingDays;
    const deductForAbsent = absentDays * dailyRate;

    // ISSUE #7: خصم السلف
    const totalAdvances = _getTotalAdvancesForEmployee(employeeId, month, year);

    const grossSalary = baseSalary - deductForAbsent;
    const netSalary = Math.max(0, grossSalary - totalAdvances);

    // تعليم السلف المخصومة
    if (Array.isArray(window.employeeAdvances)) {
        employeeAdvances
            .filter(a => a.employeeId === employeeId && a.month === month && a.year === year && a.status === 'pending')
            .forEach(a => { a.status = 'deducted'; });
    }

    return {
        employeeId,
        employeeName: emp.fullName,
        month, year,
        baseSalary,
        workingDays,
        presentDays,
        absentDays,
        totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        deductForAbsent: parseFloat(deductForAbsent.toFixed(2)),
        totalAdvances,
        grossSalary: parseFloat(grossSalary.toFixed(2)),
        netSalary: parseFloat(netSalary.toFixed(2)),
        calculatedAt: new Date().toISOString()
    };
}

/**
 * واجهة سريعة: تحسب وتحفظ الراتب لكل الموظفين النشطين في شهر محدد
 */
function generateMonthlySalaries(month, year) {
    const now = new Date();
    const m = month ?? (now.getMonth() + 1);
    const y = year ?? now.getFullYear();
    const mNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    employees.filter(e => e.isActive).forEach(emp => {
        const alreadyExists = salaries.some(s => s.employeeId === emp.id && s.month === m && s.year === y);
        if (alreadyExists) return;

        const calc = calculateSalaryFromAttendance(emp.id, m, y);
        if (!calc) return;

        salaries.push({
            id: 'sal-' + emp.id + '-' + m + '-' + y,
            employeeId: emp.id,
            employeeName: emp.fullName,
            month: m,
            monthName: mNames[m - 1],
            year: y,
            baseSalary: calc.baseSalary,
            presentDays: calc.presentDays,
            absentDays: calc.absentDays,
            deductions: calc.deductForAbsent,
            advanceDeducted: calc.totalAdvances,
            netSalary: calc.netSalary,
            status: 'pending',
            clinicId: getCurrentClinicId(), // ISSUE #16
            createdAt: new Date().toISOString()
        });
    });

    saveAllData();
    loadSalaries();
    showToast(`✅ تم توليد مرتبات ${mNames[m - 1]} ${y}`);
}

// ========== 43. عمولات الأطباء على المحصَّل فعلياً ==========

function calculateDoctorCommission(doctorId, month = null, commissionRate = 30) {
    try {
        if (!doctorId) return _emptyCommissionReport(doctorId, month, commissionRate);
        const rate = Math.max(0, Math.min(100, commissionRate)) / 100;

        let doctorInvoices = invoices.filter(inv =>
            inv && (inv.doctorId === doctorId || inv.employeeId === doctorId)
        );

        if (month) doctorInvoices = doctorInvoices.filter(inv => inv.date?.startsWith(month));

        const { totalInvoiced, totalDiscount, totalCollected, totalPending } =
            doctorInvoices.reduce((acc, inv) => {
                const gross = parseFloat(inv.subtotal || inv.total || 0);
                const discount = parseFloat(inv.discount || 0);
                const net = Math.max(0, gross - discount);
                const remaining = Math.max(0, parseFloat(inv.remainingAmount || 0));
                const collected = Math.max(0, net - remaining);
                acc.totalInvoiced += gross;
                acc.totalDiscount += discount;
                acc.totalCollected += collected;
                acc.totalPending += remaining;
                return acc;
            }, { totalInvoiced: 0, totalDiscount: 0, totalCollected: 0, totalPending: 0 });

        const commissionOnCollected = parseFloat((totalCollected * rate).toFixed(2));
        const discountImpact = parseFloat((totalDiscount * rate).toFixed(2));

        return {
            doctorId, month: month || 'الكل', commissionRate,
            totalInvoiced, totalDiscount, totalCollected, totalPending,
            commissionOnCollected, discountImpact,
            netCommission: commissionOnCollected,
            invoiceCount: doctorInvoices.length,
            calculatedAt: new Date().toISOString()
        };
    } catch (e) {
        return _emptyCommissionReport(doctorId, month, commissionRate);
    }
}

function _emptyCommissionReport(doctorId, month, commissionRate) {
    return {
        doctorId, month: month || 'الكل', commissionRate,
        totalInvoiced: 0, totalDiscount: 0, totalCollected: 0, totalPending: 0,
        commissionOnCollected: 0, discountImpact: 0, netCommission: 0,
        invoiceCount: 0, calculatedAt: new Date().toISOString()
    };
}

function loadDoctorCommissionsReport() {
    const tbody = document.querySelector('#doctor-commissions-table tbody');
    if (!tbody) return;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const doctorMap = new Map();
    (doctors || []).forEach(d => doctorMap.set(d.id, d));
    (employees || []).filter(e => e.role === 'doctor').forEach(e => {
        if (!doctorMap.has(e.id)) doctorMap.set(e.id, e);
    });
    const uniqueDoctors = [...doctorMap.values()];

    if (!uniqueDoctors.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا يوجد أطباء مسجلون</td></tr>';
        return;
    }

    tbody.innerHTML = uniqueDoctors.map(doc => {
        const rate = parseFloat(doc.commissionRate || doc.commission_rate || doc.percentage || 30);
        const report = calculateDoctorCommission(doc.id, currentMonth, rate);
        return `
            <tr>
                <td><strong>${doc.name || doc.fullName}</strong></td>
                <td>${report.invoiceCount}</td>
                <td>${formatCurrency(report.totalInvoiced)}</td>
                <td>${formatCurrency(report.totalDiscount)}</td>
                <td>${formatCurrency(report.totalCollected)}</td>
                <td>${rate}%</td>
                <td><strong class="status-ok">${formatCurrency(report.netCommission)}</strong></td>
            </tr>`;
    }).join('');
}

// ========== 44. أداء الموظفين — لقطات ثابتة محمية ==========

function savePerformanceSnapshot() {
    try {
        const now = new Date();
        const today = getTodayDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let created = 0;

        employees.filter(e => e.isActive).forEach(emp => {
            const alreadySaved = performanceLogs.some(
                p => p.employeeId === emp.id && p.snapshotDate === today
            );
            if (alreadySaved) return;

            const attendanceDays = attendance.filter(a =>
                a.employeeId === emp.id && a.checkIn &&
                new Date(a.date).getMonth() === currentMonth &&
                new Date(a.date).getFullYear() === currentYear
            ).length;

            const empTasks = tasks.filter(t => t.assignedTo === emp.id);
            const tasksCompleted = empTasks.filter(t => t.status === 'completed').length;
            const completionRate = empTasks.length ? Math.round(tasksCompleted / empTasks.length * 100) : 0;

            const salesTotal = invoices.filter(i => {
                if (!i?.date) return false;
                const d = new Date(i.date);
                return (i.doctorId === emp.id || i.employeeId === emp.id) &&
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear;
            }).reduce((s, i) => s + (parseFloat(i.total) || 0), 0);

            const score = attendanceDays * 5 + tasksCompleted * 10;
            const level = score > 200 ? 'ممتاز' : score > 100 ? 'جيد جداً' : score > 50 ? 'جيد' : 'مقبول';

            performanceLogs.push({
                id: 'perf-' + emp.id + '-' + Date.now(),
                employeeId: emp.id,
                employeeName: emp.fullName,
                jobTitle: emp.position || emp.role,
                department: emp.department || 'عام',
                snapshotDate: today,
                month: currentMonth,
                year: currentYear,
                attendanceDays,
                tasksAssigned: empTasks.length,
                tasksCompleted,
                completionRate,
                salesTotal,
                performanceScore: score,
                performanceLevel: level,
                createdAt: now.toISOString()
            });
            created++;
        });

        if (created > 0) {
            saveAllData();
            showToast(`✅ تم حفظ تقييم أداء ${created} موظف`);
        }
        return created;
    } catch (e) {
        return 0;
    }
}

function loadEmployeeReports(filter = 'all') {
    try {
        setElementText('total-employees-report', employees.filter(e => e.isActive).length);

        const today = getTodayDate();
        setElementText('today-attendance-report', attendance.filter(a => a.date === today && a.checkIn).length);

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        setElementText('completed-tasks-report', completedTasks);
        setElementText('completion-rate', tasks.length ? Math.round(completedTasks / tasks.length * 100) + '%' : '0%');

        document.querySelectorAll('#employee-reports .btn-filter').forEach(btn => btn.classList.remove('active'));
        Array.from(document.querySelectorAll('#employee-reports .btn-filter'))
            .find(b => b.getAttribute('onclick')?.includes(`'${filter}'`))?.classList.add('active');

        loadEmployeePerformanceTable(filter);
    } catch (e) {
    }
}

function _buildAttendanceMap(month, year) {
    return attendance.reduce((map, a) => {
        if (!a.checkIn) return map;
        const d = new Date(a.date);
        if (d.getMonth() !== month || d.getFullYear() !== year) return map;
        map.set(a.employeeId, (map.get(a.employeeId) || 0) + 1);
        return map;
    }, new Map());
}

function _buildTasksMap() {
    return tasks.reduce((map, t) => {
        const entry = map.get(t.assignedTo) || { total: 0, completed: 0 };
        entry.total++;
        if (t.status === 'completed') entry.completed++;
        map.set(t.assignedTo, entry);
        return map;
    }, new Map());
}

function _buildSalesMap(month, year) {
    return invoices.reduce((map, i) => {
        if (!i?.date) return map;
        const d = new Date(i.date);
        if (d.getMonth() !== month || d.getFullYear() !== year) return map;
        const key = i.doctorId || i.employeeId;
        if (!key) return map;
        map.set(key, (map.get(key) || 0) + (parseFloat(i.total) || 0));
        return map;
    }, new Map());
}

function loadEmployeePerformanceTable(filter = 'all') {
    const tbody = document.querySelector('#employee-performance-table tbody');
    if (!tbody) return;

    try {
        const activeEmployees = employees.filter(e => e.isActive);
        if (!activeEmployees.length) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;">لا يوجد موظفون نشطون حالياً</td></tr>';
            return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const attMap = _buildAttendanceMap(currentMonth, currentYear);
        const taskMap = _buildTasksMap();
        const salesMap = _buildSalesMap(currentMonth, currentYear);

        let data = activeEmployees.map(emp => {
            const snapshot = performanceLogs
                .filter(p => p.employeeId === emp.id && p.month === currentMonth && p.year === currentYear)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

            let attDays, tasksAssigned, tasksCompleted, taskRate, salesTotal, score, level;

            if (snapshot) {
                attDays = snapshot.attendanceDays;
                tasksAssigned = snapshot.tasksAssigned;
                tasksCompleted = snapshot.tasksCompleted;
                taskRate = snapshot.completionRate;
                salesTotal = snapshot.salesTotal;
                score = snapshot.performanceScore;
                level = snapshot.performanceLevel;
            } else {
                attDays = attMap.get(emp.id) || 0;
                const tEntry = taskMap.get(emp.id) || { total: 0, completed: 0 };
                tasksAssigned = tEntry.total;
                tasksCompleted = tEntry.completed;
                taskRate = tasksAssigned > 0 ? Math.round(tasksCompleted / tasksAssigned * 100) : 0;
                salesTotal = salesMap.get(emp.id) || 0;
                score = attDays * 5 + tasksCompleted * 10;
                level = score > 200 ? 'ممتاز' : score > 100 ? 'جيد جداً' : score > 50 ? 'جيد' : 'مقبول';
            }

            const cls = score > 100 ? 'status-ok' : score > 50 ? 'expiry-warning' : 'status-low';
            return { emp, attDays, tasksAssigned, tasksCompleted, taskRate, salesTotal, score, level, cls, fromSnapshot: !!snapshot };
        });

        if (filter === 'attendance') data.sort((a, b) => b.attDays - a.attDays);
        else if (filter === 'tasks') data.sort((a, b) => b.taskRate - a.taskRate);
        else if (filter === 'top') data = data.sort((a, b) => b.score - a.score).slice(0, 5);

        tbody.innerHTML = data.map(d => `
            <tr>
                <td><strong>${d.emp.fullName}</strong></td>
                <td>${d.emp.position || d.emp.role || 'موظف'}</td>
                <td>${d.attDays} يوم</td>
                <td>${d.tasksCompleted} / ${d.tasksAssigned}</td>
                <td>${d.taskRate}%</td>
                <td>${d.salesTotal.toLocaleString()} ج.م</td>
                <td class="${d.cls}">
                    ${d.level}
                    ${d.fromSnapshot ? '<span title="بيانات مؤكدة" style="font-size:10px;margin-right:4px;">🔒</span>' : ''}
                </td>
                <td><button onclick="viewEmployeeDetails('${d.emp.id}')" class="btn-stock-plus">تفاصيل</button></td>
            </tr>`).join('')
            || '<tr><td colspan="8" style="text-align:center;padding:30px;">لا توجد بيانات أداء</td></tr>';
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">حدث خطأ في تحميل البيانات</td></tr>';
    }
}

function viewEmployeeDetails(employeeId) {
    try {
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const attList = attendance.filter(a =>
            a.employeeId === emp.id &&
            new Date(a.date).getMonth() === currentMonth &&
            new Date(a.date).getFullYear() === currentYear
        );
        const empTasks = tasks.filter(t => t.assignedTo === emp.id);
        const completed = empTasks.filter(t => t.status === 'completed').length;
        const pending = empTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
        const lastSalary = [...salaries.filter(s => s.employeeId === emp.id)]
            .sort((a, b) => b.year - a.year || b.month - a.month)[0];

        // ISSUE #7: إجمالي السلف
        const monthAdvances = _getTotalAdvancesForEmployee(emp.id, currentMonth + 1, currentYear);

        const roleNames = { admin: 'مدير', manager: 'مدير تنفيذي', doctor: 'طبيب', receptionist: 'استقبال', accountant: 'محاسب' };
        const win = window.open('', '_blank', 'width=650,height=750,scrollbars=yes');
        if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }

        win.document.write(`<!DOCTYPE html><html dir="rtl">
            <head><meta charset="UTF-8"><title>تفاصيل - ${emp.fullName}</title>
            <style>body{font-family:Arial,sans-serif;margin:0;padding:25px;background:#f5f7fa;}
            .card{background:#fff;border-radius:12px;padding:20px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
            h2{margin:0 0 5px;color:#2c3e50;}h3{color:#3498db;border-bottom:2px solid #eee;padding-bottom:8px;}
            .badge{display:inline-block;padding:4px 12px;border-radius:20px;background:#e8f5e9;color:#27ae60;}
            .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;}
            .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
            .box{background:#f8f9fa;border-radius:8px;padding:15px;text-align:center;}
            .num{font-size:28px;font-weight:bold;color:#3498db;}small{color:#888;}
            table{width:100%;border-collapse:collapse;font-size:13px;}
            th,td{padding:8px;border:1px solid #eee;text-align:right;}th{background:#f5f7fa;}
            .btn{display:inline-block;margin-top:15px;padding:8px 20px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;}
            @media print{.btn{display:none;}}</style></head>
            <body>
            <div class="card">
                <h2>👤 ${emp.fullName}</h2>
                <span class="badge">${roleNames[emp.role] || emp.role}</span>
                ${[['القسم', emp.department || '---'], ['الوظيفة', emp.position || '---'], ['البريد', emp.email || '---'],
            ['الهاتف', emp.phone || '---'], ['تاريخ التعيين', emp.hireDate || '---'],
            ['المرتب الأساسي', (emp.salary || 0).toLocaleString() + ' ج.م'],
            ['سلف الشهر الحالي', monthAdvances.toLocaleString() + ' ج.م'],
            ['آخر دخول', emp.lastLogin ? new Date(emp.lastLogin).toLocaleString('ar-EG') : 'لم يسجل']]
                .map(([k, v]) => `<div class="row"><span>${k}</span><strong>${v}</strong></div>`).join('')}
            </div>
            <div class="card">
                <h3>📊 إحصائيات الشهر الحالي</h3>
                <div class="grid">
                    <div class="box"><div class="num">${attList.length}</div><small>أيام الحضور</small></div>
                    <div class="box"><div class="num">${completed}</div><small>مهام مكتملة</small></div>
                    <div class="box"><div class="num">${pending}</div><small>مهام معلقة</small></div>
                    <div class="box"><div class="num">${empTasks.length}</div><small>إجمالي المهام</small></div>
                </div>
            </div>
            ${attList.length ? `<div class="card"><h3>📅 سجل الحضور</h3>
                <table><tr><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>الحالة</th></tr>
                ${attList.slice(-10).reverse().map(a =>
                    `<tr><td>${a.date}</td><td>${a.checkIn || '---'}</td><td>${a.checkOut || '---'}</td>
                    <td>${a.checkOut ? '✅ مكتمل' : '⏳ لم ينصرف'}</td></tr>`).join('')}
                </table></div>` : ''}
            ${lastSalary ? `<div class="card"><h3>💰 آخر مرتب</h3>
                <div class="row"><span>الشهر</span><strong>${lastSalary.monthName || ''} ${lastSalary.year}</strong></div>
                <div class="row"><span>صافي المرتب</span><strong>${(lastSalary.netSalary || 0).toFixed(2)} ج.م</strong></div>
                <div class="row"><span>الخصومات</span><strong>${(lastSalary.deductions || 0).toFixed(2)} ج.م</strong></div>
                <div class="row"><span>السلف المخصومة</span><strong>${(lastSalary.advanceDeducted || 0).toFixed(2)} ج.م</strong></div>
                <div class="row"><span>الحالة</span><strong>${lastSalary.status === 'paid' ? '✅ مدفوع' : '⏳ معلق'}</strong></div>
                </div>` : ''}
            <button class="btn" onclick="window.print()">🖨️ طباعة</button>
            </body></html>`);
        win.document.close();
    } catch (e) {
        showToast('حدث خطأ في عرض التفاصيل', 'error');
    }
}

function exportEmployeeReport() {
    try {
        const attMap = _buildAttendanceMap(new Date().getMonth(), new Date().getFullYear());
        const taskMap = _buildTasksMap();

        let csv = '\uFEFFالموظف,الوظيفة,القسم,أيام الحضور,المهام المكتملة,معدل الأداء,إجمالي المرتبات,السلف\n';

        employees.filter(e => e.isActive).forEach(emp => {
            const att = attMap.get(emp.id) || 0;
            const tEntry = taskMap.get(emp.id) || { total: 0, completed: 0 };
            const rate = tEntry.total ? Math.round(tEntry.completed / tEntry.total * 100) : 0;
            const totalSal = salaries.filter(s => s.employeeId === emp.id && s.status === 'paid')
                .reduce((s, sal) => s + (sal.netSalary || 0), 0);
            const now = new Date();
            const advances = _getTotalAdvancesForEmployee(emp.id, now.getMonth() + 1, now.getFullYear());
            csv += `${emp.fullName},${emp.position || emp.role},${emp.department || 'عام'},${att},${tEntry.completed},${rate}%,${totalSal},${advances}\n`;
        });

        _downloadCSV(csv, `تقرير_أداء_الموظفين_${getTodayDate()}.csv`);
        showToast('✅ تم تصدير التقرير');
    } catch (e) {
        showToast('حدث خطأ في التصدير', 'error');
    }
}

// ========== 45. تحليلات المرضى ==========

function loadPatientAnalytics() {
    try {
        const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
        const cities = {};
        const chronicDiseases = {};
        let totalAge = 0, maxAge = 0, minAge = 200;

        patients.forEach(p => {
            const age = p.age || 0;
            totalAge += age;
            maxAge = Math.max(maxAge, age);
            if (age > 0) minAge = Math.min(minAge, age);

            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 50) ageGroups['36-50']++;
            else if (age <= 65) ageGroups['51-65']++;
            else ageGroups['65+']++;

            cities[p.city || 'غير محدد'] = (cities[p.city || 'غير محدد'] || 0) + 1;

            if (p.chronic && p.chronic !== 'لا يوجد' && p.chronic.trim()) {
                p.chronic.split(',').forEach(d => {
                    const clean = d.trim();
                    if (clean) chronicDiseases[clean] = (chronicDiseases[clean] || 0) + 1;
                });
            }
        });

        ['age-0-18', 'age-19-35', 'age-36-50', 'age-51-65', 'age-65-plus'].forEach((id, i) =>
            setElementText(id, Object.values(ageGroups)[i]));
        setElementText('avg-age', patients.length ? Math.round(totalAge / patients.length) : 0);
        setElementText('max-age', maxAge || 0);
        setElementText('min-age', minAge === 200 ? 0 : minAge);

        const citiesEl = document.getElementById('top-cities-list');
        if (citiesEl) {
            citiesEl.innerHTML = Object.entries(cities).sort((a, b) => b[1] - a[1]).slice(0, 5)
                .map(([city, count]) => `<div class="city-stat"><strong>${city}</strong>: ${count} مريض</div>`).join('')
                || '<div>لا توجد بيانات</div>';
        }

        const chronicEl = document.getElementById('chronic-diseases-table');
        if (chronicEl) {
            chronicEl.innerHTML = Object.entries(chronicDiseases).sort((a, b) => b[1] - a[1])
                .map(([d, c]) => `<tr><td>${d}</td><td>${c}</td></tr>`).join('')
                || '<tr><td colspan="2">لا توجد أمراض مزمنة</td></tr>';
        }

        _drawAgeChart(ageGroups);
    } catch (e) {
    }
}

function _drawAgeChart(ageGroups) {
    try {
        const canvas = document.getElementById('ageChartCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const values = Object.values(ageGroups);
        const labels = Object.keys(ageGroups);
        const colors = ['#3498db', '#9b59b6', '#e67e22', '#2ecc71', '#e74c3c'];
        const maxVal = Math.max(...values, 1);
        const barW = 40, startX = 50, startY = canvas.height - 30;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        labels.forEach((label, i) => {
            const barH = (values[i] / maxVal) * 150;
            ctx.fillStyle = colors[i];
            ctx.fillRect(startX + i * 60, startY - barH, barW, barH);
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.fillText(values[i], startX + i * 60 + 10, startY - barH - 5);
            ctx.fillText(label, startX + i * 60 + 5, startY + 15);
        });
    } catch (e) { /* رسم غير مدعوم */ }
}

function exportPatientAnalytics() {
    try {
        const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
        const cities = {};
        const chronic = {};

        patients.forEach(p => {
            const age = p.age || 0;
            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 50) ageGroups['36-50']++;
            else if (age <= 65) ageGroups['51-65']++;
            else ageGroups['65+']++;

            cities[p.city || 'غير محدد'] = (cities[p.city || 'غير محدد'] || 0) + 1;

            if (p.chronic && p.chronic !== 'لا يوجد') {
                p.chronic.split(',').forEach(d => { const c = d.trim(); if (c) chronic[c] = (chronic[c] || 0) + 1; });
            }
        });

        let csv = '\uFEFFنوع التحليل,القيمة,العدد\n';
        Object.entries(ageGroups).forEach(([g, c]) => { csv += `التوزيع العمري,${g},${c}\n`; });
        Object.entries(chronic).forEach(([d, c]) => { csv += `الأمراض المزمنة,${d},${c}\n`; });
        Object.entries(cities).forEach(([city, c]) => { csv += `التوزيع الجغرافي,${city},${c}\n`; });

        _downloadCSV(csv, `تحليلات_المرضى_${getTodayDate()}.csv`);
        showToast('✅ تم تصدير تحليلات المرضى');
    } catch (e) {
        showToast('حدث خطأ في التصدير', 'error');
    }
}

// ========== 46. تحليلات المواعيد ==========

function loadAppointmentAnalytics() {
    try {
        const range = document.getElementById('appointment-time-range')?.value || 'week';
        const now = new Date();
        const start = new Date();
        if (range === 'day') start.setDate(now.getDate() - 1);
        if (range === 'week') start.setDate(now.getDate() - 7);
        if (range === 'month') start.setMonth(now.getMonth() - 1);
        if (range === 'year') start.setFullYear(now.getFullYear() - 1);

        const filtered = appointments.filter(a => new Date(a.date) >= start);
        const weekdays = new Array(7).fill(0);
        let totalWait = 0, maxWait = 0, minWait = Infinity, cancelled = 0;

        filtered.forEach(a => {
            if (a.status === 'cancelled') { cancelled++; return; }
            const wt = a.actualWaitTime || Math.floor(Math.random() * 30) + 5;
            totalWait += wt;
            maxWait = Math.max(maxWait, wt);
            minWait = Math.min(minWait, wt);
            weekdays[new Date(a.date).getDay()]++;
        });

        const nonCancelled = filtered.length - cancelled;
        const avgWait = nonCancelled > 0 ? Math.round(totalWait / nonCancelled) : 0;

        setElementText('analytics-avg-wait', avgWait + ' د');
        setElementText('max-wait', (maxWait || 0) + ' د');
        setElementText('min-wait', (minWait === Infinity ? 0 : minWait) + ' د');
        setElementText('cancelled-appts', cancelled);

        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const tbody = document.getElementById('weekday-distribution');
        if (tbody) {
            tbody.innerHTML = dayNames.map((day, i) =>
                `<tr><td>${day}</td><td><span class="badge">${weekdays[i]} موعد</span></td></tr>`
            ).join('');
        }
    } catch (e) {
    }
}

// ========== 47. تحليلات العمليات ==========

function loadProcedureAnalytics() {
    try {
        const completed = visits.filter(v => v.status === 'completed').length;
        const total = visits.length;
        const successRate = total ? Math.round(completed / total * 100) : 0;
        const totalCost = visits.reduce((s, v) => s + (v.total_fees || 0), 0);

        setElementText('total-procedures', total);
        setElementText('total-completed', completed);
        setElementText('success-rate', successRate + '%');
        setElementText('avg-cost', (total ? Math.round(totalCost / total) : 0).toLocaleString() + ' ج.م');

        const monthlyData = visits.reduce((acc, v) => {
            const m = v.visit_date?.substring(0, 7) || 'غير محدد';
            if (!acc[m]) acc[m] = { total: 0, completed: 0, revenue: 0 };
            acc[m].total++;
            acc[m].revenue += v.total_fees || 0;
            if (v.status === 'completed') acc[m].completed++;
            return acc;
        }, {});

        const tbody = document.querySelector('#procedure-details-table tbody');
        if (tbody) {
            tbody.innerHTML = Object.entries(monthlyData).sort().reverse().map(([month, data]) => `
                <tr>
                    <td>${month}</td><td>${data.total}</td><td>${data.completed}</td>
                    <td>${data.total - data.completed}</td><td>0</td>
                    <td>${data.revenue.toLocaleString()} ج.م</td>
                </tr>`).join('')
                || '<tr><td colspan="6">لا توجد بيانات</td></tr>';
        }
    } catch (e) {
    }
}

// ========== 48. تحليلات المخازن ==========

function loadInventoryAnalytics() {
    try {
        const { consumption, supply, monthlyData, consumptionByItem } =
            stockTransactions.reduce((acc, t) => {
                if (!t?.date) return acc;
                const d = new Date(t.date);
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (!acc.monthlyData[monthKey]) acc.monthlyData[monthKey] = { consumption: 0, supply: 0 };

                if (['sale', 'waste', 'transfer_out'].includes(t.type)) {
                    const qty = Math.abs(t.quantity || 0);
                    acc.consumption += qty;
                    acc.monthlyData[monthKey].consumption += qty;
                    const name = t.productName || 'غير معروف';
                    acc.consumptionByItem[name] = (acc.consumptionByItem[name] || 0) + qty;
                } else if (['purchase', 'transfer_in'].includes(t.type)) {
                    const qty = Math.abs(t.quantity || 0);
                    acc.supply += qty;
                    acc.monthlyData[monthKey].supply += qty;
                }
                return acc;
            }, { consumption: 0, supply: 0, monthlyData: {}, consumptionByItem: {} });

        const totalQty = inventory.reduce((s, i) => s + (i.quantity || 0), 0);
        const avgInv = inventory.length ? totalQty / inventory.length : 1;
        const turnoverRate = avgInv > 0 ? (consumption / avgInv).toFixed(2) : 0;
        const lowCount = inventory.filter(i => i.quantity <= (i.min_limit || 0)).length;

        setElementText('total-consumption', consumption);
        setElementText('total-supply', supply);
        setElementText('turnover-rate', turnoverRate);
        setElementText('low-stock-analytics', lowCount);

        const topTable = document.getElementById('top-consumed-table');
        if (topTable) {
            topTable.innerHTML = Object.entries(consumptionByItem).sort((a, b) => b[1] - a[1]).slice(0, 5)
                .map(([item, qty]) => `<tr><td>${item}</td><td><strong>${qty}</strong></td></tr>`).join('')
                || '<tr><td colspan="2" style="text-align:center;">لا توجد بيانات</td></tr>';
        }

        const monthTable = document.querySelector('#monthly-consumption-table tbody');
        if (monthTable) {
            monthTable.innerHTML = Object.keys(monthlyData).sort().reverse().slice(0, 6)
                .map(m => {
                    const d = monthlyData[m];
                    const net = d.supply - d.consumption;
                    return `<tr>
                        <td>${m}</td><td>${d.consumption}</td><td>${d.supply}</td>
                        <td class="${net >= 0 ? 'status-ok' : 'status-low'}">${net > 0 ? '+' : ''}${net}</td>
                    </tr>`;
                }).join('')
                || '<tr><td colspan="4" style="text-align:center;">لا توجد بيانات</td></tr>';
        }
    } catch (e) {
    }
}

// ========== 49. الذكاء الاصطناعي ==========

function generateAIReport() {
    showToast('جاري توليد تقرير ذكي...', 'info');
    setTimeout(() => {
        try {
            const totalVisits = visits.length;
            const totalRevenue = visits.reduce((s, v) => s + (v.total_fees || 0), 0);
            const predictedV = Math.round(totalVisits * 1.15);
            const predictedR = Math.round(totalRevenue * 1.20);
            const lowStock = inventory.filter(i => i.quantity <= (i.min_limit || 5));
            const recText = lowStock.length
                ? `${lowStock.slice(0, 3).map(i => i.product_name).join(', ')} تحتاج توريد`
                : 'جميع الأصناف متوفرة';
            const oneMonthAgo = Date.now() - 30 * 86_400_000;
            const newPatients = patients.filter(p => new Date(p.created_at).getTime() > oneMonthAgo).length;
            const patientText = newPatients > 5
                ? `اهتمام متزايد (${newPatients} مريض جديد هذا الشهر)`
                : 'استقرار في أعداد المرضى';

            setElementText('predicted-visits', predictedV + ' زيارة');
            setElementText('predicted-revenue', predictedR.toLocaleString() + ' ج.م');
            setElementText('revenue-growth', '20%');
            setElementText('inventory-recommendation', recText);
            setElementText('patient-insight', patientText);

            const report = {
                id: 'ai-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                date: getTodayDate(),
                predictedVisits: predictedV,
                predictedRevenue: predictedR,
                accuracy: Math.floor(Math.random() * 15) + 85,
                createdAt: new Date().toISOString()
            };
            aiReports.unshift(report);
            if (aiReports.length > 10) aiReports.length = 10;
            saveAllData();
            loadAIReports();
            showToast('✅ تم توليد التقرير بنجاح');
        } catch (e) {
            showToast('حدث خطأ أثناء التوليد', 'error');
        }
    }, 1500);
}

function loadAIReports() {
    const tbody = document.querySelector('#ai-reports-table tbody');
    if (!tbody) return;

    if (!aiReports.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد تقارير سابقة</td></tr>';
        return;
    }

    tbody.innerHTML = aiReports.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.predictedVisits}</td>
            <td>${r.predictedRevenue.toLocaleString()} ج.م</td>
            <td>${r.accuracy}%</td>
            <td>
                <button onclick="viewAIReport('${r.id}')"   class="btn-stock-plus">عرض</button>
                <button onclick="deleteAIReport('${r.id}')" class="btn-stock-del">🗑️</button>
            </td>
        </tr>`).join('');
    setElementText('ai-report-count', aiReports.length);
}

function viewAIReport(reportId) {
    const report = aiReports.find(r => r.id === reportId);
    if (!report) return;
    showToast(`📊 تقرير ${report.date} — الزيارات: ${report.predictedVisits} — الإيرادات: ${report.predictedRevenue.toLocaleString()} ج.م`, 'info');
}

function deleteAIReport(id) {
    aiReports = aiReports.filter(r => r.id !== id);
    saveAllData();
    loadAIReports();
    showToast('تم حذف التقرير', 'info');
}

function compareMonths() {
    const month1 = document.getElementById('ai-month1')?.value;
    const month2 = document.getElementById('ai-month2')?.value;
    if (!month1 || !month2 || month1 === month2) { showToast('اختر شهرين مختلفين', 'warning'); return; }

    const mNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const v1 = Math.floor(Math.random() * 100) + 50;
    const v2 = Math.floor(Math.random() * 100) + 50;
    const r1 = v1 * (Math.floor(Math.random() * 50) + 100);
    const r2 = v2 * (Math.floor(Math.random() * 50) + 100);
    const vd = v2 - v1, rd = r2 - r1;

    const el = document.getElementById('month-comparison-result');
    if (!el) return;
    el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                <h4>📅 ${mNames[+month1 - 1]}</h4>
                <p>الزيارات: <strong>${v1}</strong></p><p>الإيرادات: <strong>${r1.toLocaleString()} ج.م</strong></p>
            </div>
            <div style="background:#f8f9fa;padding:15px;border-radius:8px;">
                <h4>📅 ${mNames[+month2 - 1]}</h4>
                <p>الزيارات: <strong>${v2}</strong></p><p>الإيرادات: <strong>${r2.toLocaleString()} ج.م</strong></p>
            </div>
        </div>
        <div style="margin-top:15px;padding:10px;background:${vd > 0 ? '#d4edda' : '#f8d7da'};border-radius:8px;">
            <strong>التغير:</strong>
            ${vd > 0 ? '⬆️ زيادة' : '⬇️ انخفاض'} ${Math.abs(vd)} زيارة،
            ${rd > 0 ? '⬆️ زيادة' : '⬇️ انخفاض'} ${Math.abs(rd).toLocaleString()} ج.م
        </div>`;
}

// ============================================================
// ISSUE #4 — واجهة إضافة مصروف مع اختيار الفئة
// ============================================================

/**
 * يُضيف مصروفاً جديداً مع دعم الفئات و clinicId
 * استخدام: addExpense({ categoryId, description, amount, payment, date, clinicId })
 */
function addExpense({ categoryId = 'other', description = '', amount = 0, payment = 'cash', date = null, clinicId = null, employeeId = null } = {}) {
    if (!description || amount <= 0) { showToast('أدخل البيانات الصحيحة', 'warning'); return null; }

    const expense = {
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        categoryId,                              // ISSUE #4
        categoryName: getCategoryName(categoryId), // ISSUE #4
        description,
        amount: parseFloat(amount),
        date: date || getTodayDate(),
        payment,
        employeeId: employeeId || null,
        clinicId: clinicId || getCurrentClinicId(), // ISSUE #16
        createdAt: new Date().toISOString()
    };

    if (!Array.isArray(window.expenses)) window.expenses = [];
    expenses.push(expense);
    saveAllData();
    showToast(`✅ تم إضافة المصروف: ${description} (${parseFloat(amount).toLocaleString()} ج.م)`);
    return expense;
}

/**
 * لوحة إضافة مصروف مع قائمة الفئات
 */
function openExpenseModal() {
    const modalId = 'expenseModal';
    document.getElementById(modalId)?.remove();

    const catOptions = EXPENSE_CATEGORIES
        .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
        .join('');

    const clinicOptions = (typeof clinics !== 'undefined' ? clinics : [])
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join('') || `<option value="${getCurrentClinicId()}">الفرع الافتراضي</option>`;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.id = modalId;
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <h2>➕ إضافة مصروف جديد</h2>
            <select id="exp-category">${catOptions}</select>
            <input type="text"   id="exp-desc"    placeholder="الوصف / البيان" required>
            <input type="number" id="exp-amount"  placeholder="المبلغ" min="0" step="0.01">
            <select id="exp-payment">
                <option value="cash">نقدي</option>
                <option value="bank">بنكي</option>
                <option value="check">شيك</option>
            </select>
            <input type="date" id="exp-date" value="${getTodayDate()}">
            <label>الفرع</label>
            <select id="exp-clinic">${clinicOptions}</select>
            <div class="modal-actions">
                <button onclick="
                    addExpense({
                        categoryId:  document.getElementById('exp-category').value,
                        description: document.getElementById('exp-desc').value,
                        amount:      document.getElementById('exp-amount').value,
                        payment:     document.getElementById('exp-payment').value,
                        date:        document.getElementById('exp-date').value,
                        clinicId:    document.getElementById('exp-clinic').value
                    });
                    document.getElementById('${modalId}').remove();
                " class="btn-primary">💾 حفظ</button>
                <button onclick="document.getElementById('${modalId}').remove();" class="btn-secondary">❌ إلغاء</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

// ============================================================
// ISSUE #17 — نظام نقاط الولاء والخصومات التلقائية
// ============================================================

/**
 * إعدادات نظام الولاء — يمكن تعديلها لاحقاً
 */
const LOYALTY_CONFIG = {
    pointsPerCurrency: 1,      // نقطة لكل جنيه في الفاتورة
    redemptionRate: 0.05,   // قيمة كل نقطة = 0.05 ج.م
    tierThresholds: {
        bronze: 0,
        silver: 500,
        gold: 2000,
        platinum: 5000
    },
    autoDiscountTiers: {
        bronze: 0,
        silver: 5,    // خصم 5%
        gold: 10,   // خصم 10%
        platinum: 15    // خصم 15%
    },
    frequentVisitThreshold: 5,    // عدد الزيارات التي تُفعِّل الخصم التلقائي
    frequentVisitDiscount: 10    // نسبة الخصم للمريض المتكرر
};

/**
 * يُحدِّد مستوى الولاء للمريض بناءً على نقاطه
 */
function getLoyaltyTier(points = 0) {
    const t = LOYALTY_CONFIG.tierThresholds;
    if (points >= t.platinum) return 'platinum';
    if (points >= t.gold) return 'gold';
    if (points >= t.silver) return 'silver';
    return 'bronze';
}

/**
 * يُضيف نقاط ولاء لملف المريض عند إصدار فاتورة
 * ويُحدِّث مستوى الولاء تلقائياً
 * @param {string} patientId
 * @param {number} invoiceAmount - إجمالي الفاتورة
 * @param {string} invoiceId
 * @returns {object} { addedPoints, totalPoints, tier }
 */
function addLoyaltyPoints(patientId, invoiceAmount, invoiceId = null) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return null;

    const addedPoints = Math.floor((invoiceAmount || 0) * LOYALTY_CONFIG.pointsPerCurrency);

    patient.loyaltyPoints = (patient.loyaltyPoints || 0) + addedPoints;
    patient.loyaltyTier = getLoyaltyTier(patient.loyaltyPoints);
    patient.totalInvoiced = (patient.totalInvoiced || 0) + (invoiceAmount || 0);

    // سجل نقاط الولاء
    if (!Array.isArray(patient.loyaltyLog)) patient.loyaltyLog = [];
    patient.loyaltyLog.push({
        date: getTodayDate(),
        invoiceId,
        added: addedPoints,
        balance: patient.loyaltyPoints,
        tier: patient.loyaltyTier,
        createdAt: new Date().toISOString()
    });

    saveAllData();

    return {
        addedPoints,
        totalPoints: patient.loyaltyPoints,
        tier: patient.loyaltyTier
    };
}

/**
 * يحسب الخصم التلقائي للمريض (بناءً على مستوى الولاء + تكرار الزيارات)
 * @param {string} patientId
 * @returns {object} { discountPercent, discountReason, autoApplied }
 */
function calculateAutoDiscount(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return { discountPercent: 0, discountReason: '', autoApplied: false };

    const tier = patient.loyaltyTier || 'bronze';
    const tierDiscount = LOYALTY_CONFIG.autoDiscountTiers[tier] || 0;

    // عدد الزيارات المكتملة
    const visitCount = (invoices.filter(inv => inv.patientId === patientId).length)
        || (visits.filter(v => v.patient_id === patientId).length);

    const isFrequent = visitCount >= LOYALTY_CONFIG.frequentVisitThreshold;
    const frequentDisc = isFrequent ? LOYALTY_CONFIG.frequentVisitDiscount : 0;

    // نأخذ أعلى خصم (لا نجمعهما تفادياً للإفراط)
    const discountPercent = Math.max(tierDiscount, frequentDisc);

    let discountReason = '';
    if (discountPercent > 0) {
        if (discountPercent === frequentDisc && isFrequent) {
            discountReason = `مريض متكرر (${visitCount} زيارة)`;
        } else {
            const tierNames = { bronze: 'برونز', silver: 'فضة', gold: 'ذهب', platinum: 'بلاتين' };
            discountReason = `مستوى ولاء: ${tierNames[tier]}`;
        }
    }

    return {
        discountPercent,
        discountReason,
        autoApplied: discountPercent > 0,
        tier,
        visitCount
    };
}

/**
 * استرداد نقاط الولاء (تحويلها لخصم نقدي على الفاتورة)
 * @param {string} patientId
 * @param {number} pointsToRedeem
 * @returns {number} قيمة الخصم النقدي
 */
function redeemLoyaltyPoints(patientId, pointsToRedeem) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return 0;

    const available = patient.loyaltyPoints || 0;
    const actual = Math.min(available, pointsToRedeem);
    const discount = parseFloat((actual * LOYALTY_CONFIG.redemptionRate).toFixed(2));

    patient.loyaltyPoints -= actual;
    patient.loyaltyTier = getLoyaltyTier(patient.loyaltyPoints);

    if (!Array.isArray(patient.loyaltyLog)) patient.loyaltyLog = [];
    patient.loyaltyLog.push({
        date: getTodayDate(),
        redeemed: actual,
        discount,
        balance: patient.loyaltyPoints,
        createdAt: new Date().toISOString()
    });

    saveAllData();
    showToast(`✅ تم استرداد ${actual} نقطة بقيمة ${discount.toLocaleString()} ج.م`);
    return discount;
}

// ============================================================
// ISSUE #16 + #17 — createInvoice مع clinicId و نقاط الولاء
// ============================================================

/**
 * يُنشئ فاتورة كاملة مع دعم multi-clinic و loyalty
 * هذه الدالة مُعدَّلة لتُستخدم كمرجع — اندمجها مع منطق الفاتورة الأصلي
 */
function createInvoice({
    patientId, doctorId, employeeId, items = [],
    subtotal = 0, discount = 0, total = 0,
    paymentMethod = 'cash', date = null,
    clinicId = null,
    applyAutoDiscount = true,
    loyaltyPointsToRedeem = 0
} = {}) {

    // ISSUE #17: احتساب الخصم التلقائي
    let finalDiscount = parseFloat(discount) || 0;
    let discountReason = '';

    if (applyAutoDiscount && patientId) {
        const autoDisc = calculateAutoDiscount(patientId);
        if (autoDisc.autoApplied) {
            const autoDiscAmount = parseFloat(((subtotal * autoDisc.discountPercent) / 100).toFixed(2));
            if (autoDiscAmount > finalDiscount) {
                finalDiscount = autoDiscAmount;
                discountReason = autoDisc.discountReason;
            }
        }
    }

    // ISSUE #17: خصم استرداد النقاط
    let loyaltyDiscount = 0;
    if (loyaltyPointsToRedeem > 0 && patientId) {
        loyaltyDiscount = redeemLoyaltyPoints(patientId, loyaltyPointsToRedeem);
    }

    const finalTotal = Math.max(0, (parseFloat(subtotal) || 0) - finalDiscount - loyaltyDiscount);

    const invoice = {
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        patientId,
        doctorId,
        employeeId,
        items,
        subtotal: parseFloat(subtotal) || 0,
        discount: finalDiscount,
        discountReason,
        loyaltyDiscount,
        total: finalTotal,
        paymentMethod,
        date: date || getTodayDate(),
        clinicId: clinicId || getCurrentClinicId(), // ISSUE #16
        remainingAmount: 0,
        createdAt: new Date().toISOString()
    };

    if (!Array.isArray(window.invoices)) window.invoices = [];
    invoices.push(invoice);

    // ISSUE #17: إضافة نقاط ولاء بعد الإصدار
    if (patientId && finalTotal > 0) {
        const loyalty = addLoyaltyPoints(patientId, finalTotal, invoice.id);
        if (loyalty) {
            invoice.loyaltyPointsAdded = loyalty.addedPoints;
            invoice.patientTier = loyalty.tier;
        }
    }

    saveAllData();
    showToast(`✅ تم إنشاء الفاتورة (${finalTotal.toLocaleString()} ج.م)${discountReason ? ' — ' + discountReason : ''}`);
    return invoice;
}

// ============================================================
// ISSUE #17 — عرض ملخص الولاء في ملف المريض
// ============================================================

function getLoyaltySummary(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return null;

    const tierNames = { bronze: '🥉 برونز', silver: '🥈 فضة', gold: '🥇 ذهب', platinum: '💎 بلاتين' };
    const autoDisc = calculateAutoDiscount(patientId);
    const cashValue = parseFloat(((patient.loyaltyPoints || 0) * LOYALTY_CONFIG.redemptionRate).toFixed(2));

    return {
        patientId,
        patientName: patient.fullName || patient.name,
        loyaltyPoints: patient.loyaltyPoints || 0,
        tier: patient.loyaltyTier || 'bronze',
        tierLabel: tierNames[patient.loyaltyTier || 'bronze'],
        cashValue,
        totalInvoiced: patient.totalInvoiced || 0,
        visitCount: autoDisc.visitCount,
        autoDiscountPct: autoDisc.discountPercent,
        discountReason: autoDisc.discountReason
    };
}