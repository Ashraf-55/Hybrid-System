// ============================================================
//  auth.js — منطق الأعمال (المرضى، المواعيد، الأطباء)
//  التعديلات: Issues #1, #2, #5, #11, #15
//  التعديل الجديد: توحيد مفتاح تخزين المستخدم إلى 'clinic_user'
// ============================================================

// ========== 1. دوال تسجيل الدخول ==========
async function login() {
    const userVal = document.getElementById('login-username').value;
    const passVal = document.getElementById('login-password').value;
    const loginBtn = document.querySelector('.login-btn');

    if (!userVal || !passVal) return showToast('دخل بياناتك يا هندسة', 'error');

    loginBtn.disabled = true;
    loginBtn.innerHTML = 'جاري التحقق...';

    try {
        const response = await fetch('http://127.0.0.1:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'username': userVal,
                'password': passVal
            })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ التعديلات المطلوبة هنا:
            // 1. تخزين التوكن
            localStorage.setItem('token', data.access_token);

            // 2. تخزين بيانات المستخدم بالمفتاح الموحد 'clinic_user'
            // التأكد من وجود بيانات المستخدم في الرد (data.user)
            const userData = data.user || {
                id: userVal,
                fullName: userVal,
                role: 'receptionist',
                ...data
            };
            localStorage.setItem('clinic_user', JSON.stringify(userData));

            // 3. تعيين المتغير العام currentUser (إن وجد)
            if (typeof currentUser !== 'undefined') {
                window.currentUser = userData;
            }

            showToast('✅ تم تسجيل الدخول بنجاح');

            // 4. الانتقال إلى لوحة التحكم وإعادة التحميل
            setTimeout(() => {
                window.location.hash = '#dashboard';
                window.location.reload();
            }, 300);
        } else {
            showToast('❌ ' + (data.detail || 'بيانات الدخول غير صحيحة'), 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'دخول';
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('⚠️ السيرفر مش شغال يا هندسة', 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'دخول';
    }
}

// دالة مساعدة للحصول على المستخدم الحالي من التخزين الموحد
function getCurrentUser() {
    const userStr = localStorage.getItem('clinic_user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing clinic_user:', e);
            return null;
        }
    }
    return null;
}

function logout() {
    console.log("🔄 جاري تسجيل الخروج وإعادة التهيئة...");
    // مسح كل التخزين المحلي
    localStorage.clear();
    if (typeof showToast === "function") {
        showToast('👋 تم تسجيل الخروج.. نورتنا يا هندسة');
    }
    setTimeout(() => {
        window.location.href = window.location.pathname;
    }, 500);
}

// ========== 2. الصلاحيات حسب الدور ==========
const ROLE_PERMISSIONS = {
    admin: ['*'],
    doctor: [
        'view_patients', 'save_visit', 'view_appointments',
        'view_reports', 'view_doctor_statement', 'view_history'
    ],
    receptionist: [
        'add_patient', 'save_appointment', 'delete_appointment',
        'view_patients', 'view_appointments', 'save_expense',
        'view_invoices', 'view_pharmacy'
    ]
};

// استخدام الدالة الجديدة للحصول على المستخدم
function getCurrentUserForPermissions() {
    const user = getCurrentUser();
    if (user) return user;
    // fallback للمتغير العام القديم إذا كان موجوداً
    return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
}

function hasPermission(action) {
    const currentUser = getCurrentUserForPermissions();
    if (!currentUser) return false;
    const role = currentUser.role || 'receptionist';
    const perms = ROLE_PERMISSIONS[role] || [];
    return perms.includes('*') || perms.includes(action);
}

function enforcePermission(action, fallback = null) {
    if (!hasPermission(action)) {
        showToast(`⛔ ليس لديك صلاحية لهذه العملية (${action})`, 'error');
        if (typeof fallback === 'function') fallback();
        return false;
    }
    return true;
}

function applyRoleRestrictions() {
    const currentUser = getCurrentUserForPermissions();
    if (!currentUser) return;
    const role = currentUser.role || 'receptionist';
    if (role === 'admin') return;

    const restrictedNavSections = {
        doctor: ['employees', 'salaries', 'shifts', 'attendance', 'suppliers', 'purchase-orders',
            'warehouses', 'stock-transfers', 'stock-waste', 'stock-ledger',
            'insurance-companies', 'insurance-claims'],
        receptionist: ['doctor-shares', 'employees', 'salaries', 'shifts',
            'suppliers', 'purchase-orders', 'warehouses',
            'stock-transfers', 'stock-waste', 'stock-ledger',
            'ai-reports', 'patient-analytics']
    };

    const blocked = restrictedNavSections[role] || [];
    document.querySelectorAll('.nav-links li').forEach(li => {
        const onclick = li.getAttribute('onclick') || '';
        const isBlocked = blocked.some(sec => onclick.includes(`'${sec}'`) || onclick.includes(`"${sec}"`));
        if (isBlocked) li.style.display = 'none';
    });

    const badge = document.getElementById('user-role-badge');
    const roleNames = { admin: 'مدير', doctor: 'طبيب', receptionist: 'موظف استقبال' };
    if (badge) badge.innerText = roleNames[role] || role;
}

// ========== 3. منع تكرار المرضى ==========
function validatePatientUniqueness(phone, nationalId, excludeId = null) {
    const others = excludeId ? patients.filter(p => p.id !== excludeId) : patients;

    if (phone && phone.trim()) {
        const phoneExists = others.some(p => p.phone && p.phone.trim() === phone.trim());
        if (phoneExists) {
            showToast('⚠️ رقم الهاتف مسجل مسبقاً لمريض آخر', 'warning');
            return false;
        }
    }
    if (nationalId && nationalId.trim()) {
        const nidExists = others.some(p => p.nationalId && p.nationalId.trim() === nationalId.trim());
        if (nidExists) {
            showToast('⚠️ الرقم القومي مسجل مسبقاً لمريض آخر', 'warning');
            return false;
        }
    }
    return true;
}

// ========== 4. توليد QR Code ==========
function generatePatientQR(patientId) {
    const clinicId = (typeof CLOUD_CONFIG !== 'undefined' && CLOUD_CONFIG.clinicId) || 'clinic';
    const baseUrl = window.location.origin + window.location.pathname;
    const qrString = `${baseUrl}?patient=${patientId}&clinic=${clinicId}`;
    return {
        qrString,
        qrId: `QR-${patientId.replace(/[^a-zA-Z0-9]/g, '').substr(-10).toUpperCase()}`,
        generatedAt: new Date().toISOString()
    };
}

function renderPatientQR(patientId, canvasId = 'patient-qr-canvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const qr = generatePatientQR(patientId);
    if (typeof QRious !== 'undefined') {
        new QRious({ element: canvas, value: qr.qrString, size: 180, backgroundAlpha: 1 });
    } else {
        const img = document.createElement('img');
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qr.qrString)}`;
        img.alt = 'QR Code';
        img.style.borderRadius = '8px';
        canvas.parentNode.replaceChild(img, canvas);
    }
    return qr;
}

// ========== 5. المواعيد ==========
function loadAppointments() {
    const tbody = document.querySelector('#appointments-table tbody');
    if (!tbody) return;
    tbody.innerHTML = !appointments.length
        ? '<tr><td colspan="7" style="text-align:center;padding:30px;">📅 لا توجد مواعيد</td></tr>'
        : appointments.map(a => {
            const doctor = doctors.find(d => d.id === a.doctorId);
            return `</tr>
                <td>${a.patient_name || '---'}</td>
                <td>${a.type || 'كشف'}</td>
                <td>${a.patient_phone || '---'}</td>
                <td>${a.date || '---'}</td>
                <td>${a.time || '---'}</td>
                <td>${doctor ? '👨‍⚕️ ' + doctor.name : '---'}</td>
                <td><button onclick="deleteAppointment('${a.id}')" class="btn-stock-del">إلغاء</button></td>
            </tr>`;
        }).join('');
}

function populatePatientSelect() {
    const select = document.getElementById('app_patient_select');
    if (select) {
        select.innerHTML = '<option value="">اختر مريض...</option>' +
            patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
}

function saveAppointment() {
    if (!enforcePermission('save_appointment')) return;

    const select = document.getElementById('app_patient_select');
    const date = document.getElementById('app_date').value;
    const time = document.getElementById('app_time').value;
    const type = document.getElementById('app_type').value;
    const doctorSel = document.getElementById('app_doctor_select');
    const doctorId = doctorSel ? doctorSel.value : '';

    if (!select.value || !date || !time) {
        showToast('⚠️ يرجى إكمال بيانات الحجز', 'warning');
        return;
    }

    if (doctorId) {
        const conflict = appointments.some(a =>
            a.date === date &&
            a.time === time &&
            a.doctorId === doctorId &&
            a.status !== 'cancelled'
        );
        if (conflict) {
            const doctor = doctors.find(d => d.id === doctorId);
            showToast(`⛔ الطبيب ${doctor?.name || ''} لديه موعد محجوز بالفعل في ${date} الساعة ${time}`, 'error');
            return;
        }
    }

    const generalConflict = appointments.some(a =>
        a.date === date &&
        a.time === time &&
        !a.doctorId && !doctorId &&
        a.patient_id !== select.value &&
        a.status !== 'cancelled'
    );
    if (generalConflict) {
        showToast(`⛔ هذا الوقت محجوز بالفعل بتاريخ ${date} الساعة ${time}`, 'error');
        return;
    }

    const patient = patients.find(p => p.id === select.value);
    const patientName = patient?.name || 'غير معروف';

    const appointmentId = generateId();
    appointments.push({
        id: appointmentId,
        patient_id: select.value,
        patient_name: patientName,
        patient_phone: patient?.phone || 'غير مسجل',
        date,
        time,
        type,
        doctorId: doctorId || null,
        status: 'scheduled',
        createdAt: new Date().toISOString()
    });

    if (typeof createNotification === 'function') {
        createNotification(
            'appointment_booked',
            `موعد جديد: ${patientName} بتاريخ ${date} الساعة ${time}`,
            ['admin', 'receptionist'],
            {
                patientName,
                date,
                time,
                reminderMinutes: notificationSettings.reminderTime || 30,
                hideAction: true
            }
        );
    }

    saveAllData();
    loadAppointments();
    updateDashboard();
    if (typeof loadNotifications === 'function') loadNotifications();

    showToast(`✅ تم حجز موعد لـ ${patientName}`);

    document.getElementById('app_date').value = '';
    document.getElementById('app_time').value = '';
    if (doctorSel) doctorSel.value = '';
}

function deleteAppointment(id) {
    if (!enforcePermission('delete_appointment')) return;
    appointments = appointments.filter(a => a.id !== id);
    saveAllData(); loadAppointments(); updateDashboard();
    showToast('تم إلغاء الموعد', 'info');
}

function populateDoctorSelectForAppointment() {
    const sel = document.getElementById('app_doctor_select');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- بدون طبيب محدد --</option>' +
        doctors.map(d => `<option value="${d.id}">${d.name} — ${d.specialty}</option>`).join('');
}

// ========== 6. الصيدلية ==========
function addNewDrug() {
    const name = document.getElementById('drug_name').value.trim();
    const stock = parseInt(document.getElementById('drug_stock').value);
    const price = parseFloat(document.getElementById('drug_price').value) || 0;
    const expiry = document.getElementById('drug_expiry').value;
    const minStock = parseInt(document.getElementById('drug_min_stock')?.value) || 5;

    if (!name || isNaN(stock) || stock <= 0) {
        showToast('بيانات الدواء ناقصة', 'warning');
        return;
    }
    pharmacy.push({
        id: generateId(), name, stock, price, expiry,
        minStock,
        created_at: getTodayDate()
    });
    saveAllData(); renderPharmacy(); updateDashboard();
    showToast('✅ تم إضافة الدواء');
    ['drug_name', 'drug_stock', 'drug_price', 'drug_expiry', 'drug_min_stock']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function renderPharmacy() {
    const tbody = document.querySelector('#pharmacy-table tbody');
    if (!tbody) return;
    tbody.innerHTML = !pharmacy.length
        ? '<tr><td colspan="6" style="text-align:center;padding:30px;">💊 لا توجد أدوية</td></tr>'
        : pharmacy.map(drug => {
            const expiryInfo = getExpiryInfo(drug.expiry);
            const isLowStock = drug.stock <= (drug.minStock || 5);
            return `<tr>
                <td>${drug.name}</td>
                <td class="${isLowStock ? 'status-low' : ''}"><strong>${drug.stock}</strong>${isLowStock ? ' ⚠️' : ''}</td>
                <td>${drug.price} ج.م</td>
                <td class="${expiryInfo.cssClass}">${drug.expiry || 'غير محدد'}${expiryInfo.badge}</td>
                <td>${drug.minStock || 5}</td>
                <td>
                    <button onclick="updateDrugStock('${drug.id}',5)" class="btn-stock-plus">+5</button>
                    <button onclick="updateDrugStock('${drug.id}',-1)" class="btn-stock-minus">-1</button>
                    <button onclick="deleteDrug('${drug.id}')" class="btn-stock-del">حذف</button>
                 </td>
            </table>`;
        }).join('');
}

function getExpiryInfo(expiryDate) {
    if (!expiryDate) return { cssClass: '', badge: '', daysLeft: null };
    const exp = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    exp.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((exp - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { cssClass: 'status-low', badge: ' 🔴 منتهي الصلاحية', daysLeft };
    if (daysLeft <= 30) return { cssClass: 'status-low', badge: ` 🔴 (${daysLeft} يوم)`, daysLeft };
    if (daysLeft <= 60) return { cssClass: 'expiry-warning', badge: ` 🟠 (${daysLeft} يوم)`, daysLeft };
    if (daysLeft <= 90) return { cssClass: 'expiry-warning', badge: ` 🟡 (${daysLeft} يوم)`, daysLeft };
    return { cssClass: '', badge: '', daysLeft };
}

function checkExpiry(expiryDate) {
    return getExpiryInfo(expiryDate).daysLeft !== null && getExpiryInfo(expiryDate).daysLeft <= 90;
}

function updateDrugStock(id, change) {
    const drug = pharmacy.find(d => d.id === id);
    if (drug) {
        drug.stock = Math.max(0, (drug.stock || 0) + change);
        if (drug.stock <= (drug.minStock || 5)) {
            showToast(`⚠️ ${drug.name}: المخزون وصل للحد الأدنى (${drug.stock})`, 'warning');
        }
        saveAllData(); renderPharmacy(); updateDashboard();
        showToast('تم تحديث المخزون');
    }
}

function deleteDrug(id) {
    pharmacy = pharmacy.filter(d => d.id !== id);
    saveAllData(); renderPharmacy(); updateDashboard();
    showToast('تم حذف الدواء', 'info');
}

function searchDrugs() {
    const term = document.getElementById('drugSearch').value.toLowerCase();
    const tbody = document.querySelector('#pharmacy-table tbody');
    if (!tbody) return;
    const filtered = pharmacy.filter(d => d.name && d.name.toLowerCase().includes(term));
    tbody.innerHTML = filtered.length
        ? filtered.map(drug => {
            const expiryInfo = getExpiryInfo(drug.expiry);
            const isLowStock = drug.stock <= (drug.minStock || 5);
            return `<tr>
                <td>${drug.name}</td>
                <td class="${isLowStock ? 'status-low' : ''}"><strong>${drug.stock}</strong></td>
                <td>${drug.price} ج.م</td>
                <td class="${expiryInfo.cssClass}">${drug.expiry || 'غير محدد'}${expiryInfo.badge}</td>
                <td>${drug.minStock || 5}</td>
                <td>
                    <button onclick="updateDrugStock('${drug.id}',5)" class="btn-stock-plus">+5</button>
                    <button onclick="updateDrugStock('${drug.id}',-1)" class="btn-stock-minus">-1</button>
                    <button onclick="deleteDrug('${drug.id}')" class="btn-stock-del">حذف</button>
                 </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="6" style="text-align:center;">لا توجد نتائج</td></tr>';
}

// ========== 7. المصروفات ==========
function openExpenseModal() {
    const dateEl = document.getElementById('expense-date');
    if (dateEl) dateEl.value = getTodayDate();
    const modal = document.getElementById('expenseModal');
    if (modal) modal.style.display = 'block';
}

function saveExpense() {
    if (!enforcePermission('save_expense')) return;
    const currentUser = getCurrentUserForPermissions();
    const category = document.getElementById('expense-category')?.value || 'other';
    const description = document.getElementById('expense-description')?.value.trim() || '';
    const amount = parseFloat(document.getElementById('expense-amount')?.value || '0');
    const date = document.getElementById('expense-date')?.value || getTodayDate();
    const payment = document.getElementById('expense-payment')?.value || 'cash';

    if (!description) { showToast('الرجاء إدخال وصف المصروف', 'warning'); return; }
    if (isNaN(amount) || amount <= 0) { showToast('الرجاء إدخال مبلغ صحيح', 'warning'); return; }

    expenses.push({
        id: generateId(), category, description, amount, date, payment,
        recordedBy: currentUser?.fullName || 'النظام',
        createdAt: new Date().toISOString()
    });
    saveAllData();
    const descEl = document.getElementById('expense-description'); if (descEl) descEl.value = '';
    const amtEl = document.getElementById('expense-amount'); if (amtEl) amtEl.value = '';
    loadExpenses('all'); closeModal(); updateDashboard(); loadDoctors();
    showToast('✅ تم إضافة المصروف');
}

function loadExpenses(filter = 'all') {
    const tbody = document.querySelector('#expenses-table tbody');
    if (!tbody) return;
    const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">لا توجد مصروفات</td></tr>';
        return;
    }
    tbody.innerHTML = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => `
        <tr>
            <td>${e.date}</td>
            <td>${getCategoryName(e.category)}</td>
            <td>${e.description}</td>
            <td>${e.amount} ج.م</td>
            <td>${getPaymentMethod(e.payment)}</td>
            <td><button onclick="deleteExpense('${e.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`).join('');
}

function filterExpenses(category, event) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadExpenses(category);
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    saveAllData(); loadExpenses('all'); updateDashboard();
    showToast('تم حذف المصروف', 'info');
}

// ========== 8. الأطباء ==========
function openDoctorModal() {
    document.getElementById('doctorModal').style.display = 'block';
}

function saveDoctor() {
    const name = document.getElementById('doctor-name').value.trim();
    const specialty = document.getElementById('doctor-specialty').value.trim();
    const percentage = parseFloat(document.getElementById('doctor-percentage').value) || 0;
    const shareType = document.getElementById('doctor-share-type').value;
    if (!name || !specialty) { showToast('الاسم والتخصص مطلوبان', 'warning'); return; }
    const linked = employees.find(e => e.fullName.trim().toLowerCase() === name.toLowerCase());
    doctors.push({
        id: generateId(),
        name,
        specialty,
        percentage,
        shareType,
        employeeId: linked?.id || null,
        totalEarnings: 0,
        earningsLog: [],
        earningsHistory: [],
        createdAt: new Date().toISOString()
    });
    saveAllData(); loadDoctors(); closeModal();
    showToast('✅ تم إضافة الطبيب' + (linked ? ` (مرتبط: ${linked.fullName})` : ''));
}

function loadDoctors() {
    const grid = document.querySelector('.doctors-grid');
    if (!grid) return;
    if (!doctors.length) {
        grid.innerHTML = '<p style="text-align:center;padding:30px;">لا يوجد أطباء مسجلون</p>';
        return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    grid.innerHTML = doctors.map(d => {
        const doctorVisits = visits.filter(v => v.doctorId === d.id);
        const monthVisits = doctorVisits.filter(v => {
            const vd = new Date(v.visit_date);
            return vd.getMonth() === currentMonth && vd.getFullYear() === currentYear;
        });
        const grossMonth = monthVisits.reduce((sum, v) => sum + (v.doctorEarning || 0), 0);
        const doctorExp = expenses.filter(e => {
            const ed = new Date(e.date);
            return ed.getMonth() === currentMonth && ed.getFullYear() === currentYear &&
                e.description.includes(d.name);
        }).reduce((sum, e) => sum + e.amount, 0);
        const netMonth = grossMonth - doctorExp;
        const totalEarnings = doctorVisits.reduce((sum, v) => sum + (v.doctorEarning || 0), 0);

        return `
        <div class="doctor-card" style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,.08);border-top:4px solid #3498db;">
            <h3 style="margin:0 0 8px;">👨‍⚕️ ${d.name}</h3>
            <div style="color:#666;margin-bottom:12px;">🔬 ${d.specialty}</div>
            <div style="background:#f8f9fa;border-radius:8px;padding:12px;margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="color:#888;font-size:13px;">نسبة الحصة</span>
                    <strong style="color:#3498db;">${d.percentage}% (${d.shareType === 'fixed' ? 'ثابت' : 'نسبة'})</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="color:#888;font-size:13px;">زيارات الشهر</span><strong>${monthVisits.length}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="color:#e74c3c;font-size:13px;">مصروفات/سلف</span>
                    <strong style="color:#e74c3c;">-${doctorExp.toFixed(2)} ج.م</strong>
                </div>
                <div style="display:flex;justify-content:space-between;">
                    <span style="color:#888;font-size:13px;">الصافي المستحق</span>
                    <strong style="color:#27ae60;">${netMonth.toFixed(2)} ج.م</strong>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #eee;">
                <span style="color:#888;font-size:13px;">إجمالي المستحقات تاريخياً</span>
                <strong style="color:#e67e22;">${totalEarnings.toFixed(2)} ج.م</strong>
            </div>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <button onclick="viewDoctorStatement('${d.id}')" class="btn-stock-minus" style="flex:1;">📊 كشف حساب</button>
                <button onclick="viewDoctorEarningsHistory('${d.id}')" class="btn-stock-plus" style="flex:1;">📈 سجل العمولات</button>
                <button onclick="deleteDoctor('${d.id}')" class="btn-stock-del">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

function viewDoctorEarningsHistory(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const doctorVisits = visits
        .filter(v => v.doctorId === doctorId)
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

    const win = window.open('', '_blank', 'width=700,height=600,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }

    const rows = doctorVisits.map(v => {
        const patient = patients.find(p => p.id === v.patient_id);
        return `<tr>
            <td>${v.visit_date}</td>
            <td>${patient?.name || 'غير معروف'}</td>
            <td>${v.total_fees?.toFixed(2) || 0} ج.م</td>
            <td style="color:#27ae60;font-weight:bold;">${(v.doctorEarning || 0).toFixed(2)} ج.م</td>
        </tr>`;
    }).join('');

    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <title>سجل عمولات - ${doctor.name}</title>
        <style>
            body{font-family:Arial,sans-serif;padding:20px;background:#f5f7fa;}
            table{width:100%;border-collapse:collapse;margin-top:16px;}
            th,td{border:1px solid #ddd;padding:10px;text-align:right;}
            th{background:#3498db;color:#fff;}
            tr:nth-child(even){background:#f9f9f9;}
            .total-row{background:#e8f8f5;font-weight:bold;}
        </style></head><body>
        <h2>📈 سجل عمولات الدكتور / ${doctor.name}</h2>
        <p>التخصص: ${doctor.specialty} | نسبة الحصة: ${doctor.percentage}% (${doctor.shareType === 'fixed' ? 'ثابت' : 'نسبة من الإيراد'})</p>
        <table>
            <thead><tr><th>التاريخ</th><th>المريض</th><th>إجمالي الكشف</th><th>عمولة الطبيب</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4" style="text-align:center;">لا توجد زيارات</td></tr>'}</tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="2">الإجمالي</td>
                    <td>${doctorVisits.reduce((s, v) => s + (v.total_fees || 0), 0).toFixed(2)} ج.م</td>
                    <td>${doctorVisits.reduce((s, v) => s + (v.doctorEarning || 0), 0).toFixed(2)} ج.م</td>
                </tr>
            </tfoot>
        </table>
        <script>window.print();<\/script></body></html>`);
    win.document.close();
}

function viewDoctorStatement(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    const doctorVisits = visits.filter(v => v.doctorId === doctorId)
        .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    const win = window.open('', '_blank', 'width=700,height=750,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <title>كشف حساب - ${doctor.name}</title>
        <style>body{font-family:Arial,sans-serif;margin:0;padding:25px;background:#f5f7fa;}
        table{width:100%;border-collapse:collapse;margin-top:16px;}
        th,td{border:1px solid #ddd;padding:10px;text-align:right;}
        th{background:#2c3e50;color:#fff;}
        tr:even{background:#f9f9f9;}</style></head><body>
        <h2>📋 كشف حساب: ${doctor.name}</h2>
        <table>
            <thead><tr><th>التاريخ</th><th>المريض</th><th>إجمالي</th><th>نصيب الطبيب</th></tr></thead>
            <tbody>${doctorVisits.map(v => {
        const p = patients.find(pt => pt.id === v.patient_id);
        return `<tr>
                    <td>${v.visit_date}</td>
                    <td>${p?.name || '---'}</td>
                    <td>${(v.total_fees || 0).toFixed(2)} ج.م</td>
                    <td><strong>${(v.doctorEarning || 0).toFixed(2)} ج.م</strong></td>
                </tr>`;
    }).join('') || '<tr><td colspan="4" style="text-align:center;">لا توجد زيارات</td></tr>'}</tbody>
        </table>
        <script>window.print();<\/script></body></html>`);
    win.document.close();
}

function deleteDoctor(id) {
    doctors = doctors.filter(d => d.id !== id);
    saveAllData(); loadDoctors(); showToast('تم حذف الطبيب', 'info');
}

// ========== 9. أرصدة المرضى ==========
function loadBalances() {
    const tbody = document.querySelector('#balance-table tbody');
    if (!tbody) return;
    let totalCredit = 0, totalDebit = 0;
    if (!patientBalances.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">لا توجد أرصدة</td></tr>';
        setElementText('total-credit', formatCurrency(0));
        setElementText('total-debit', formatCurrency(0));
        return;
    }
    tbody.innerHTML = patientBalances.map(b => {
        const net = (b.debit || 0) - (b.credit || 0);
        totalCredit += (b.credit || 0);
        totalDebit += (b.debit || 0);
        return `<tr>
            <td>${b.patientName}</td>
            <td>${formatCurrency(b.debit || 0)}</td>
            <td>${formatCurrency(b.credit || 0)}</td>
            <td class="${net > 0 ? 'status-low' : 'status-ok'}">${formatCurrency(Math.abs(net))}</td>
            <td class="${net > 0 ? 'status-low' : 'status-ok'}">${net > 0 ? 'مدين' : 'دائن'}</td>
            <td><button onclick="returnMoney('${b.patientId}')" class="btn-stock-minus">رد مبلغ</button></td>
        </tr>`;
    }).join('');
    setElementText('total-credit', formatCurrency(totalCredit));
    setElementText('total-debit', formatCurrency(totalDebit));
}

function returnMoney(patientId) {
    const amount = prompt('أدخل المبلغ المراد رده:');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const balance = patientBalances.find(b => b.patientId === patientId);
        if (balance) {
            balance.credit += parseFloat(amount);
            balance.transactions.push({
                id: generateId(), date: new Date().toISOString(),
                type: 'credit', amount: parseFloat(amount), reason: 'رد مبلغ', balance: balance.credit
            });
            saveAllData(); loadBalances(); showToast('✅ تم رد المبلغ بنجاح');
        }
    }
}

// ========== 10. التأمين ==========
function openInsuranceCompanyModal() { document.getElementById('insuranceCompanyModal').style.display = 'block'; }

function saveInsuranceCompany() {
    const name = document.getElementById('company-name').value.trim();
    const phone = document.getElementById('company-phone').value.trim();
    const email = document.getElementById('company-email').value.trim();
    const contact = document.getElementById('company-contact').value.trim();
    const notes = document.getElementById('company-notes').value.trim();
    if (!name) { showToast('اسم الشركة مطلوب', 'warning'); return; }
    insuranceCompanies.push({
        id: generateId(), name, phone, email, contact, notes,
        packages: [], createdAt: new Date().toISOString()
    });
    saveAllData(); loadInsuranceCompanies(); closeModal();
    showToast('✅ تم إضافة شركة التأمين');
    ['company-name', 'company-phone', 'company-email', 'company-contact', 'company-notes']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function loadInsuranceCompanies() {
    const tbody = document.querySelector('#insurance-companies-table tbody');
    if (!tbody) return;
    tbody.innerHTML = !insuranceCompanies.length
        ? '<td><td colspan="5" style="text-align:center;">لا توجد شركات تأمين</td></tr>'
        : insuranceCompanies.map(c => {
            const pkgs = insurancePackages.filter(p => p.companyId === c.id);
            return `<tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone || '---'}</td>
                <td>${c.email || '---'}</td>
                <td>${pkgs.length}</td>
                <td>
                    <button onclick="showPackages('${c.id}','${c.name}')" class="btn-stock-plus">📦 الباقات</button>
                    <button onclick="deleteInsuranceCompany('${c.id}')" class="btn-stock-del">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    setElementText('companies-count', insuranceCompanies.length);
}

function showPackages(companyId, companyName) {
    document.getElementById('selected-company-name').innerText = companyName;
    document.getElementById('packages-section').style.display = 'block';
    currentCompanyId = companyId;
    loadPackages(companyId);
}

function loadPackages(companyId) {
    const tbody = document.querySelector('#packages-table tbody');
    if (!tbody) return;
    const pkgs = insurancePackages.filter(p => p.companyId === companyId);
    tbody.innerHTML = !pkgs.length
        ? '<tr><td colspan="5" style="text-align:center;">لا توجد باقات</td></tr>'
        : pkgs.map(pkg => `<tr>
            <td><strong>${pkg.name}</strong></td>
            <td>${pkg.coverage}%</td>
            <td>${pkg.maxAmount?.toLocaleString()} ج.م</td>
            <td>${pkg.premium?.toLocaleString()} ج.م / ${pkg.period === 'monthly' ? 'شهري' : 'سنوي'}</td>
            <td><button onclick="deletePackage('${pkg.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`);
    setElementText('packages-count', pkgs.length);
}

function openPackageModal() { document.getElementById('packageModal').style.display = 'block'; }

function savePackage() {
    const name = document.getElementById('package-name').value.trim();
    const coverage = parseFloat(document.getElementById('package-coverage').value);
    const maxAmount = parseFloat(document.getElementById('package-max').value) || 0;
    const premium = parseFloat(document.getElementById('package-premium').value) || 0;
    const period = document.getElementById('package-period').value;
    const benefits = document.getElementById('package-benefits').value.trim();
    if (!name || !coverage || coverage <= 0) { showToast('بيانات الباقة غير مكتملة', 'warning'); return; }
    insurancePackages.push({
        id: generateId(), companyId: currentCompanyId, name, coverage,
        maxAmount, premium, period, benefits, createdAt: new Date().toISOString()
    });
    saveAllData(); loadPackages(currentCompanyId); loadInsuranceCompanies(); closeModal();
    showToast('✅ تم إضافة الباقة');
}

function deleteInsuranceCompany(id) {
    insuranceCompanies = insuranceCompanies.filter(c => c.id !== id);
    insurancePackages = insurancePackages.filter(p => p.companyId !== id);
    saveAllData(); loadInsuranceCompanies();
    document.getElementById('packages-section').style.display = 'none';
    showToast('تم حذف الشركة', 'info');
}

function deletePackage(id) {
    insurancePackages = insurancePackages.filter(p => p.id !== id);
    saveAllData(); loadPackages(currentCompanyId); loadInsuranceCompanies();
    showToast('تم حذف الباقة', 'info');
}

function openPatientInsuranceModal() {
    const patientSelect = document.getElementById('insurance-patient-select');
    patientSelect.innerHTML = '<option value="">اختر مريض...</option>' +
        patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const companySelect = document.getElementById('insurance-company-select');
    companySelect.innerHTML = '<option value="">اختر شركة تأمين...</option>' +
        insuranceCompanies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    companySelect.onchange = function () {
        const pkgs = insurancePackages.filter(p => p.companyId === this.value);
        document.getElementById('insurance-package-select').innerHTML =
            '<option value="">اختر الباقة...</option>' +
            pkgs.map(p => `<option value="${p.id}" data-coverage="${p.coverage}" data-max="${p.maxAmount}">${p.name} (تغطية ${p.coverage}%)</option>`).join('');
    };
    document.getElementById('insurance-start-date').value = getTodayDate();
    const ny = new Date(); ny.setFullYear(ny.getFullYear() + 1);
    document.getElementById('insurance-end-date').value = ny.toISOString().split('T')[0];
    document.getElementById('patientInsuranceModal').style.display = 'block';
}

function savePatientInsurance() {
    const patientId = document.getElementById('insurance-patient-select').value;
    const companyId = document.getElementById('insurance-company-select').value;
    const packageId = document.getElementById('insurance-package-select').value;
    const memberId = document.getElementById('insurance-member-id').value.trim();
    const startDate = document.getElementById('insurance-start-date').value;
    const endDate = document.getElementById('insurance-end-date').value;
    const limit = parseFloat(document.getElementById('insurance-limit').value) || 0;
    const used = parseFloat(document.getElementById('insurance-used').value) || 0;
    const status = document.getElementById('insurance-status').value;
    if (!patientId || !companyId || !packageId || !memberId) {
        showToast('أكمل البيانات المطلوبة', 'warning'); return;
    }
    const patient = patients.find(p => p.id === patientId);
    const company = insuranceCompanies.find(c => c.id === companyId);
    const pkg = insurancePackages.find(p => p.id === packageId);
    patientInsurance.push({
        id: generateId(), patientId, patientName: patient?.name, companyId,
        companyName: company?.name, packageId, packageName: pkg?.name,
        coverage: pkg?.coverage, maxAmount: pkg?.maxAmount,
        memberId, startDate, endDate, limit, used, status, createdAt: new Date().toISOString()
    });
    saveAllData(); loadPatientInsurance(); closeModal();
    showToast('✅ تم إضافة الملف التأميني');
}

function loadPatientInsurance() {
    const tbody = document.querySelector('#patient-insurance-table tbody');
    if (!tbody) return;
    tbody.innerHTML = !patientInsurance.length
        ? '<tr><td colspan="7" style="text-align:center;">لا توجد ملفات تأمينية</td></tr>'
        : patientInsurance.map(ins => {
            const isExpired = new Date(ins.endDate) < new Date();
            const cls = isExpired ? 'status-low' : ins.status === 'active' ? 'status-ok' : 'expiry-warning';
            const text = isExpired ? 'منتهي' : ins.status === 'active' ? 'نشط' : 'موقوف';
            return `<tr>
                <td>${ins.patientName}</td>
                <td>${ins.companyName}</td>
                <td>${ins.packageName}</td>
                <td>${ins.memberId}</td>
                <td>${ins.endDate}</td>
                <td class="${cls}">${text}</td>
                <td><button onclick="deletePatientInsurance('${ins.id}')" class="btn-stock-del">🗑️</button></td>
              </tr>`;
        }).join('');
    setElementText('insured-patients-count2', patientInsurance.filter(i => i.status === 'active').length);
}

function deletePatientInsurance(id) {
    patientInsurance = patientInsurance.filter(i => i.id !== id);
    saveAllData(); loadPatientInsurance(); showToast('تم حذف الملف التأميني', 'info');
}

function openClaimModal() {
    const patientSelect = document.getElementById('claim-patient-select');
    patientSelect.innerHTML = '<option value="">اختر مريض...</option>' +
        patientInsurance.filter(i => i.status === 'active').map(ins => {
            const p = patients.find(pt => pt.id === ins.patientId);
            return `<option value="${ins.id}" data-patient="${ins.patientId}" data-company="${ins.companyId}"
                data-coverage="${ins.coverage}" data-limit="${ins.limit}" data-used="${ins.used}">
                ${p?.name} - ${ins.companyName}</option>`;
        }).join('');
    patientSelect.onchange = function () {
        const sel = this.options[this.selectedIndex];
        if (sel.value) {
            const remaining = (sel.dataset.limit || 0) - (sel.dataset.used || 0);
            document.getElementById('claim-insurance-info').innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                    <div><small>نسبة التغطية</small><br><strong>${sel.dataset.coverage}%</strong></div>
                    <div><small>الحد المتبقي</small><br><strong>${remaining.toLocaleString()} ج.م</strong></div>
                    <div><small>المستخدم</small><br><strong>${(+sel.dataset.used).toLocaleString()} ج.م</strong></div>
                </div>`;
        }
    };
    document.getElementById('claim-from').value = getTodayDate();
    document.getElementById('claim-to').value = getTodayDate();
    document.getElementById('claim-services-container').innerHTML = '';
    addClaimService();
    document.getElementById('claimModal').style.display = 'block';
}

function addClaimService() {
    const container = document.getElementById('claim-services-container');
    const template = document.getElementById('claim-service-template');
    const clone = template.content.cloneNode(true);
    clone.querySelectorAll('input').forEach(i => i.addEventListener('input', updateClaimTotal));
    container.appendChild(clone);
    updateClaimTotal();
}

function updateClaimTotal() {
    let subtotal = 0;
    document.querySelectorAll('.claim-service-item').forEach(item => {
        subtotal += parseFloat(item.querySelector('.service-amount')?.value) || 0;
    });
    const sel = document.getElementById('claim-patient-select');
    const coverage = sel ? parseFloat(sel.options[sel.selectedIndex]?.dataset.coverage) || 0 : 0;
    document.getElementById('claim-subtotal').innerText = subtotal.toLocaleString() + ' ج.م';
    document.getElementById('claim-coverage').innerText = coverage + '%';
    document.getElementById('claim-total').innerText = (subtotal * coverage / 100).toLocaleString() + ' ج.م';
}

function saveClaim() {
    const sel = document.getElementById('claim-patient-select');
    const selected = sel.options[sel.selectedIndex];
    const fromDate = document.getElementById('claim-from').value;
    const toDate = document.getElementById('claim-to').value;
    const notes = document.getElementById('claim-notes').value.trim();
    if (!selected.value || !fromDate || !toDate) { showToast('أكمل البيانات المطلوبة', 'warning'); return; }
    const insurance = patientInsurance.find(i => i.id === selected.value);
    const coverage = parseFloat(selected.dataset.coverage);
    const services = [];
    let totalAmount = 0;
    document.querySelectorAll('.claim-service-item').forEach(item => {
        const desc = item.querySelector('.service-desc')?.value;
        const date = item.querySelector('.service-date')?.value;
        const amount = parseFloat(item.querySelector('.service-amount')?.value) || 0;
        if (desc && date && amount > 0) { services.push({ desc, date, amount }); totalAmount += amount; }
    });
    if (!services.length) { showToast('أضف خدمات للمطالبة', 'warning'); return; }
    const claimAmount = totalAmount * (coverage / 100);
    const patient = patients.find(p => p.id === selected.dataset.patient);
    const company = insuranceCompanies.find(c => c.id === selected.dataset.company);
    insuranceClaims.push({
        id: generateId(),
        claimNumber: 'CLM-' + Math.floor(1000 + Math.random() * 9000),
        insuranceId: selected.value,
        patientId: selected.dataset.patient,
        patientName: patient?.name,
        companyId: selected.dataset.company,
        companyName: company?.name,
        fromDate, toDate, services, totalAmount, coverage, claimAmount,
        paidAmount: 0, remainingAmount: claimAmount, status: 'pending', notes,
        createdAt: new Date().toISOString()
    });
    if (insurance) insurance.used = (insurance.used || 0) + claimAmount;
    saveAllData(); loadClaims('all'); closeModal(); showToast('✅ تم إنشاء المطالبة');
}

function loadClaims(filter = 'all') {
    const tbody = document.querySelector('#claims-table tbody');
    if (!tbody) return;
    let filtered = filter === 'all' ? insuranceClaims : insuranceClaims.filter(c => c.status === filter);
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">لا توجد مطالبات</td></tr>'; return;
    }
    const sText = { pending: 'معلق', approved: 'معتمد', paid: 'مدفوع', rejected: 'مرفوض' };
    const sCls = { pending: 'expiry-warning', approved: 'status-ok', paid: 'status-ok', rejected: 'status-low' };
    setElementText('total-claims', insuranceClaims.length);
    setElementText('total-claimed', formatCurrency(insuranceClaims.reduce((s, c) => s + c.claimAmount, 0)));
    setElementText('total-paid', formatCurrency(insuranceClaims.reduce((s, c) => s + (c.paidAmount || 0), 0)));
    setElementText('total-remaining', formatCurrency(insuranceClaims.reduce((s, c) => s + (c.remainingAmount || 0), 0)));
    setElementText('pending-claims-count2', insuranceClaims.filter(c => c.status === 'pending').length);
    tbody.innerHTML = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(c => `
        <tr>
            <td><strong>${c.claimNumber}</strong></td>
            <td>${c.patientName}</td>
            <td>${c.companyName}</td>
            <td>${c.fromDate} إلى ${c.toDate}</td>
            <td>${formatCurrency(c.claimAmount)}</td>
            <td>${formatCurrency(c.paidAmount || 0)}</td>
            <td>${formatCurrency(c.remainingAmount || c.claimAmount)}</td>
            <td class="${sCls[c.status] || ''}">${sText[c.status] || c.status}</td>
            <td><button onclick="updateClaimPayment('${c.id}')" class="btn-stock-plus">💰</button>
            <button onclick="deleteClaim('${c.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`);
}

function updateClaimPayment(claimId) {
    const claim = insuranceClaims.find(c => c.id === claimId);
    if (!claim) return;
    const amount = prompt('أدخل المبلغ المدفوع:', claim.remainingAmount || claim.claimAmount);
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        claim.paidAmount = (claim.paidAmount || 0) + parseFloat(amount);
        claim.remainingAmount = Math.max(0, claim.claimAmount - claim.paidAmount);
        claim.status = claim.remainingAmount === 0 ? 'paid' : 'approved';
        saveAllData(); loadClaims('all'); showToast('✅ تم تحديث الدفعة');
    }
}

function filterClaims(filter) {
    document.querySelectorAll('#insurance-claims .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadClaims(filter);
}

function deleteClaim(id) {
    insuranceClaims = insuranceClaims.filter(c => c.id !== id);
    saveAllData(); loadClaims('all'); showToast('تم حذف المطالبة', 'info');
}

// ========== 11. المخازن ==========
function openWarehouseModal() { document.getElementById('warehouseModal').style.display = 'block'; }

function saveWarehouse() {
    const name = document.getElementById('warehouse-name').value.trim();
    const type = document.getElementById('warehouse-type').value;
    const location = document.getElementById('warehouse-location').value.trim();
    const manager = document.getElementById('warehouse-manager').value.trim();
    const notes = document.getElementById('warehouse-notes').value.trim();
    if (!name) { showToast('اسم المخزن مطلوب', 'warning'); return; }
    warehouses.push({
        id: generateId(), name, type, location, manager, notes, createdAt: new Date().toISOString()
    });
    saveAllData(); loadWarehouses(); closeModal(); showToast('✅ تم إضافة المخزن');
}

function loadWarehouses() {
    const tbody = document.querySelector('#warehouses-table tbody');
    if (!tbody) return;
    if (!warehouses.length) {
        tbody.innerHTML = '<td><td colspan="6" style="text-align:center;">لا توجد مخازن</td></tr>'; return;
    }
    setElementText('total-warehouses', warehouses.length);
    setElementText('main-warehouses', warehouses.filter(w => w.type === 'main').length);
    setElementText('sub-warehouses', warehouses.filter(w => w.type === 'sub').length);
    setElementText('total-items-all', inventory.reduce((s, i) => s + (i.quantity || 0), 0));
    tbody.innerHTML = warehouses.map(w => `
        <tr>
            <td><strong>${w.name}</strong> ${w.type === 'main' ? '⭐' : ''}</td>
            <td>${w.type === 'main' ? 'رئيسي' : 'فرعي'}</td>
            <td>${w.location || '---'}</td>
            <td>${w.manager || '---'}</td>
            <td>${inventory.filter(i => i.warehouseId === w.id).length}</td>
            <td><button onclick="deleteWarehouse('${w.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`);
}

function deleteWarehouse(id) {
    warehouses = warehouses.filter(w => w.id !== id);
    saveAllData(); loadWarehouses(); showToast('تم حذف المخزن', 'info');
}

// ========== 12. الموردين ==========
function openSupplierModal() { document.getElementById('supplierModal').style.display = 'block'; }

function saveSupplier() {
    const name = document.getElementById('supplier-name').value.trim();
    const phone = document.getElementById('supplier-phone').value.trim();
    const email = document.getElementById('supplier-email').value.trim();
    const company = document.getElementById('supplier-company').value.trim();
    const tax = document.getElementById('supplier-tax').value.trim();
    const address = document.getElementById('supplier-address').value.trim();
    if (!name) { showToast('اسم المورد مطلوب', 'warning'); return; }
    suppliers.push({
        id: generateId(), name, phone, email, company, tax, address,
        balance: 0, totalPurchases: 0, createdAt: new Date().toISOString()
    });
    saveAllData(); loadSuppliers(); closeModal(); showToast('✅ تم إضافة المورد');
}

function loadSuppliers() {
    const tbody = document.querySelector('#suppliers-table tbody');
    if (!tbody) return;
    if (!suppliers.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد موردين</td></tr>'; return;
    }
    tbody.innerHTML = suppliers.map(s => {
        const last = purchaseOrders.filter(po => po.supplierId === s.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return `<tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.phone || '---'}</td>
            <td>${s.email || '---'}</td>
            <td>${(s.balance || 0).toLocaleString()} ج.م</td>
            <td>${last ? last.date : '---'}</td>
            <td><button onclick="openPurchaseOrderModal('${s.id}')" class="btn-stock-plus">📦 أمر شراء</button>
            <button onclick="deleteSupplier('${s.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`;
    }).join('');
    setElementText('suppliers-count', suppliers.length);
}

function deleteSupplier(id) {
    suppliers = suppliers.filter(s => s.id !== id);
    saveAllData(); loadSuppliers(); showToast('تم حذف المورد', 'info');
}

// ========== 13. أوامر الشراء ==========
function openPurchaseOrderModal(supplierId = '') {
    const supplierSelect = document.getElementById('po-supplier');
    supplierSelect.innerHTML = '<option value="">اختر مورد...</option>' +
        suppliers.map(s => `<option value="${s.id}" ${s.id === supplierId ? 'selected' : ''}>${s.name}</option>`).join('');
    const warehouseSelect = document.getElementById('po-warehouse');
    warehouseSelect.innerHTML = '<option value="">المخزن المستهدف...</option>' +
        warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    document.getElementById('po-date').value = getTodayDate();
    document.getElementById('po-items-container').innerHTML = '';
    addPOItem();
    document.getElementById('purchaseOrderModal').style.display = 'block';
}

function addPOItem() {
    const container = document.getElementById('po-items-container');
    const template = document.getElementById('po-item-template');
    const clone = template.content.cloneNode(true);
    const opts = '<option value="">اختر صنف...</option>' +
        inventory.map(i => `<option value="${i.id}" data-price="${i.price || 0}">${i.product_name}</option>`).join('');
    const sel = clone.querySelector('.po-item-product');
    sel.innerHTML = opts;
    clone.querySelector('.po-item-qty').addEventListener('input', calculatePOItemTotal);
    clone.querySelector('.po-item-price').addEventListener('input', calculatePOItemTotal);
    sel.addEventListener('change', function () {
        const price = this.selectedOptions[0]?.dataset.price || 0;
        this.closest('.po-item').querySelector('.po-item-price').value = price;
        this.closest('.po-item').querySelector('.po-item-qty').dispatchEvent(new Event('input'));
    });
    container.appendChild(clone);
}

function calculatePOItemTotal() {
    const item = this.closest('.po-item');
    const qty = parseFloat(item.querySelector('.po-item-qty').value) || 0;
    const price = parseFloat(item.querySelector('.po-item-price').value) || 0;
    item.querySelector('.po-item-total').value = (qty * price).toFixed(2);
    calculatePOTotal();
}

function calculatePOTotal() {
    const total = Array.from(document.querySelectorAll('.po-item-total'))
        .reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
    document.getElementById('po-total-amount').innerText = total.toFixed(2) + ' ج.م';
}

function savePurchaseOrder() {
    const supplierId = document.getElementById('po-supplier').value;
    const warehouseId = document.getElementById('po-warehouse').value;
    const date = document.getElementById('po-date').value;
    const expectedDate = document.getElementById('po-expected').value;
    const paymentStatus = document.getElementById('po-payment-status').value;
    const notes = document.getElementById('po-notes').value.trim();
    if (!supplierId || !warehouseId) { showToast('اختر المورد والمخزن', 'warning'); return; }
    const items = [];
    let totalAmount = 0;
    document.querySelectorAll('.po-item').forEach(item => {
        const productId = item.querySelector('.po-item-product').value;
        const qty = parseFloat(item.querySelector('.po-item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.po-item-price').value) || 0;
        if (productId && qty > 0 && price > 0) {
            const product = inventory.find(i => i.id === productId);
            items.push({ productId, productName: product?.product_name, qty, price, total: qty * price });
            totalAmount += qty * price;
        }
    });
    if (!items.length) { showToast('أضف أصناف للأمر', 'warning'); return; }
    const supplier = suppliers.find(s => s.id === supplierId);
    const warehouse = warehouses.find(w => w.id === warehouseId);
    const newPO = {
        id: generateId(),
        poNumber: 'PO-' + Math.floor(1000 + Math.random() * 9000),
        supplierId, supplierName: supplier?.name,
        warehouseId, warehouseName: warehouse?.name,
        date, expectedDate, items, totalAmount,
        paidAmount: 0, remainingAmount: totalAmount,
        paymentStatus, status: 'pending', notes,
        createdAt: new Date().toISOString()
    };
    purchaseOrders.push(newPO);
    if (supplier) {
        supplier.balance = (supplier.balance || 0) + totalAmount;
        supplier.totalPurchases = (supplier.totalPurchases || 0) + totalAmount;
    }
    saveAllData(); loadPurchaseOrders('all'); closeModal();
    showToast(`✅ تم إنشاء أمر الشراء ${newPO.poNumber}`);
}

function loadPurchaseOrders(filter = 'all') {
    const tbody = document.querySelector('#purchase-orders-table tbody');
    if (!tbody) return;
    let filtered = filter === 'all' ? purchaseOrders : purchaseOrders.filter(po => po.status === filter);
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">لا توجد أوامر شراء</td></tr>'; return;
    }
    const sText = { pending: 'معلق', approved: 'معتمد', received: 'مستلم', cancelled: 'ملغي' };
    const sCls = { pending: 'expiry-warning', approved: 'status-ok', received: 'status-ok', cancelled: 'status-low' };
    setElementText('po-pending', purchaseOrders.filter(po => po.status === 'pending').length);
    setElementText('po-completed', purchaseOrders.filter(po => po.status === 'received').length);
    setElementText('po-total', formatCurrency(purchaseOrders.reduce((s, po) => s + po.totalAmount, 0)));
    setElementText('po-unpaid', formatCurrency(purchaseOrders.reduce((s, po) => s + (po.remainingAmount || 0), 0)));
    tbody.innerHTML = filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(po => `
        <tr>
            <td><strong>${po.poNumber}</strong></td>
            <td>${po.supplierName}</td>
            <td>${po.date}</td>
            <td>${po.items.length}</td>
            <td>${formatCurrency(po.totalAmount)}</td>
            <td>${formatCurrency(po.paidAmount || 0)}</td>
            <td>${formatCurrency(po.remainingAmount || po.totalAmount)}</td>
            <td class="${sCls[po.status] || ''}">${sText[po.status] || po.status}</td>
            <td><button onclick="receivePO('${po.id}')" class="btn-stock-plus">📥 استلام</button>
            <button onclick="deletePO('${po.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`);
}

function receivePO(poId) {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    if (po.status === 'received') { showToast('هذا الأمر تم استلامه مسبقاً', 'warning'); return; }
    po.items.forEach(item => {
        const invItem = inventory.find(i => i.id === item.productId);
        if (invItem) {
            invItem.quantity = (invItem.quantity || 0) + item.qty;
            stockTransactions.push({
                id: generateId(), date: getTodayDate(), warehouseId: po.warehouseId,
                productId: item.productId, productName: item.productName, type: 'purchase',
                quantity: item.qty, value: item.total, reference: po.poNumber, balanceAfter: invItem.quantity
            });
        }
    });
    po.status = 'received';
    po.receivedAt = new Date().toISOString();
    saveAllData(); loadPurchaseOrders('all'); loadInventory();
    showToast(`✅ تم استلام أمر الشراء ${po.poNumber}`);
}

function deletePO(id) {
    purchaseOrders = purchaseOrders.filter(po => po.id !== id);
    saveAllData(); loadPurchaseOrders('all'); showToast('تم حذف الأمر', 'info');
}

function filterPO(filter) {
    document.querySelectorAll('#purchase-orders .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadPurchaseOrders(filter);
}

// ========== 14. تحويلات المخزون ==========
function openTransferModal() {
    const opts = warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    document.getElementById('transfer-from').innerHTML = '<option value="">من مخزن...</option>' + opts;
    document.getElementById('transfer-to').innerHTML = '<option value="">إلى مخزن...</option>' + opts;
    document.getElementById('transfer-product').innerHTML = '<option value="">اختر صنف...</option>' +
        inventory.map(i => `<option value="${i.id}" data-qty="${i.quantity}">${i.product_name} (متوفر: ${i.quantity})</option>`).join('');
    document.getElementById('transferModal').style.display = 'block';
}

function saveTransfer() {
    const fromId = document.getElementById('transfer-from').value;
    const toId = document.getElementById('transfer-to').value;
    const productId = document.getElementById('transfer-product').value;
    const qty = parseInt(document.getElementById('transfer-qty').value);
    const reason = document.getElementById('transfer-reason').value.trim();
    const currentUser = getCurrentUserForPermissions();
    if (!fromId || !toId || !productId || !qty || qty <= 0) { showToast('أكمل البيانات', 'warning'); return; }
    if (fromId === toId) { showToast('لا يمكن التحويل لنفس المخزن', 'warning'); return; }
    const product = inventory.find(i => i.id === productId);
    if (!product || product.quantity < qty) { showToast('الكمية غير متوفرة', 'warning'); return; }
    product.quantity -= qty;
    const fromWh = warehouses.find(w => w.id === fromId);
    const toWh = warehouses.find(w => w.id === toId);
    stockTransfers.push({
        id: generateId(), date: getTodayDate(), fromId, fromName: fromWh?.name,
        toId, toName: toWh?.name, productId, productName: product.product_name, quantity: qty,
        reason, by: currentUser?.fullName || 'Admin', status: 'completed',
        createdAt: new Date().toISOString()
    });
    stockTransactions.push({
        id: generateId(), date: getTodayDate(), warehouseId: fromId,
        productId, productName: product.product_name, type: 'transfer_out', quantity: -qty,
        reference: `تحويل إلى ${toWh?.name}`, balanceAfter: product.quantity
    });
    const toProduct = inventory.find(i => i.id === productId && i.warehouseId === toId);
    if (!toProduct) inventory.push({ ...product, id: generateId(), warehouseId: toId, quantity: qty });
    else toProduct.quantity = (toProduct.quantity || 0) + qty;
    saveAllData(); loadTransfers(); closeModal(); showToast('✅ تم التحويل بنجاح');
}

function loadTransfers() {
    const tbody = document.querySelector('#transfers-table tbody');
    if (!tbody) return;
    tbody.innerHTML = !stockTransfers.length
        ? '<tr><td colspan="8" style="text-align:center;">لا توجد تحويلات</td></tr>'
        : [...stockTransfers].sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => `
            <tr>
                <td>${t.date}</td>
                <td>${t.fromName}</td>
                <td>${t.toName}</td>
                <td>${t.productName}</td>
                <td>${t.quantity}</td>
                <td>${t.by || 'Admin'}</td>
                <td class="status-ok">مكتمل</td>
                <td><button onclick="deleteTransfer('${t.id}')" class="btn-stock-del">🗑️</button></td>
            </tr>`);
    setElementText('today-transfers', stockTransfers.filter(t => t.date === getTodayDate()).length);
}

function deleteTransfer(id) {
    stockTransfers = stockTransfers.filter(t => t.id !== id);
    saveAllData(); loadTransfers(); showToast('تم حذف التحويل', 'info');
}