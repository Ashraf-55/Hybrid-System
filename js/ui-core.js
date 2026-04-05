// =============================================================================
// ██╗   ██╗██╗      ██████╗ ██████╗ ██████╗ ███████╗
// ██║   ██║██║     ██╔════╝██╔═══██╗██╔══██╗██╔════╝
// ██║   ██║██║     ██║     ██║   ██║██████╔╝█████╗
// ██║   ██║██║     ██║     ██║   ██║██╔══██╗██╔══╝
// ╚██████╔╝██║     ╚██████╗╚██████╔╝██║  ██║███████╗
//  ╚═════╝ ╚═╝      ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
// ui-core.js  |  UI Rendering & Template Engine
// Issues resolved: #9 (Dark Mode) · #18 (Dynamic Templates) · #20 (i18n)
// =============================================================================


// =============================================================================
// ISSUE #20 — MULTI-LANGUAGE SUPPORT (Translation Layer)
// =============================================================================

/**
 * UI_TRANSLATIONS — master dictionary.
 * Keys are semantic identifiers used throughout the UI.
 * Add more keys here as the app grows.
 */
const UI_TRANSLATIONS = {
    ar: {
        // ── General ──────────────────────────────────────────────────────────
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        print: 'طباعة',
        export: 'تصدير',
        search: 'بحث',
        loading: 'جارٍ التحميل…',
        no_data: 'لا توجد بيانات',
        confirm_delete: 'هل أنت متأكد من الحذف؟',
        success: 'تمت العملية بنجاح',
        warning: 'تحذير',
        error: 'خطأ',
        select_patient: 'اختر مريض…',
        select_doctor: 'اختر طبيب…',
        select_warehouse: 'اختر مخزن…',

        // ── Patients ─────────────────────────────────────────────────────────
        patient_name: 'اسم المريض',
        patient_phone: 'هاتف المريض',
        patient_age: 'العمر',
        patient_gender: 'النوع',
        next_appointment: 'الموعد القادم',

        // ── Doctors ──────────────────────────────────────────────────────────
        doctor_name: 'اسم الطبيب',
        doctor_specialty: 'التخصص',

        // ── Clinic ───────────────────────────────────────────────────────────
        clinic_name: 'اسم العيادة',
        clinic_phone: 'هاتف العيادة',
        clinic_address: 'عنوان العيادة',

        // ── Prescriptions ────────────────────────────────────────────────────
        prescription_title: 'روشتة طبية',
        medication: 'الدواء',
        dosage: 'الجرعة',
        duration: 'مدة العلاج',
        diagnosis: 'التشخيص',

        // ── Messages ─────────────────────────────────────────────────────────
        message_title: 'رسالة طبية',
        send: 'إرسال',
        send_whatsapp: 'إرسال واتساب',
        preview: 'معاينة',

        // ── Stock ────────────────────────────────────────────────────────────
        waste_title: 'تالف وهالك',
        reason_expired: 'انتهاء صلاحية',
        reason_damaged: 'تالف',
        reason_lost: 'فقدان',
        reason_other: 'أخرى',

        // ── Labs ─────────────────────────────────────────────────────────────
        lab_request: 'طلب معمل',
        test_results: 'النتائج',
        status_pending: 'معلق',
        status_processing: 'تحت التنفيذ',
        status_ready: 'جاهز',
        status_delivered: 'تم التسليم',

        // ── Employees ────────────────────────────────────────────────────────
        employee_name: 'اسم الموظف',
        attendance: 'الحضور',
        check_in: 'تسجيل حضور',
        check_out: 'تسجيل انصراف',
        salary: 'المرتب',
        tasks: 'المهام',

        // ── Theme ────────────────────────────────────────────────────────────
        theme_light: 'الوضع النهاري',
        theme_dark: 'الوضع الليلي',
    },

    en: {
        // ── General ──────────────────────────────────────────────────────────
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        print: 'Print',
        export: 'Export',
        search: 'Search',
        loading: 'Loading…',
        no_data: 'No data available',
        confirm_delete: 'Are you sure you want to delete?',
        success: 'Operation completed successfully',
        warning: 'Warning',
        error: 'Error',
        select_patient: 'Select patient…',
        select_doctor: 'Select doctor…',
        select_warehouse: 'Select warehouse…',

        // ── Patients ─────────────────────────────────────────────────────────
        patient_name: 'Patient Name',
        patient_phone: 'Patient Phone',
        patient_age: 'Age',
        patient_gender: 'Gender',
        next_appointment: 'Next Appointment',

        // ── Doctors ──────────────────────────────────────────────────────────
        doctor_name: 'Doctor Name',
        doctor_specialty: 'Specialty',

        // ── Clinic ───────────────────────────────────────────────────────────
        clinic_name: 'Clinic Name',
        clinic_phone: 'Clinic Phone',
        clinic_address: 'Clinic Address',

        // ── Prescriptions ────────────────────────────────────────────────────
        prescription_title: 'Medical Prescription',
        medication: 'Medication',
        dosage: 'Dosage',
        duration: 'Duration',
        diagnosis: 'Diagnosis',

        // ── Messages ─────────────────────────────────────────────────────────
        message_title: 'Medical Message',
        send: 'Send',
        send_whatsapp: 'Send via WhatsApp',
        preview: 'Preview',

        // ── Stock ────────────────────────────────────────────────────────────
        waste_title: 'Stock Waste',
        reason_expired: 'Expired',
        reason_damaged: 'Damaged',
        reason_lost: 'Lost',
        reason_other: 'Other',

        // ── Labs ─────────────────────────────────────────────────────────────
        lab_request: 'Lab Request',
        test_results: 'Results',
        status_pending: 'Pending',
        status_processing: 'Processing',
        status_ready: 'Ready',
        status_delivered: 'Delivered',

        // ── Employees ────────────────────────────────────────────────────────
        employee_name: 'Employee Name',
        attendance: 'Attendance',
        check_in: 'Check In',
        check_out: 'Check Out',
        salary: 'Salary',
        tasks: 'Tasks',

        // ── Theme ────────────────────────────────────────────────────────────
        theme_light: 'Light Mode',
        theme_dark: 'Dark Mode',
    }
};

/**
 * _currentLang — active language code.
 * Persisted to localStorage so the user's preference survives page reloads.
 */
let _currentLang = localStorage.getItem('ui_language') || 'ar';

/**
 * _t(key)
 * Translation helper.  Returns the label for `key` in the active language,
 * falling back to Arabic, then to the key itself if both are missing.
 *
 * Usage inside any template or function:
 *   _t('save')          → 'حفظ'  (when lang = 'ar')
 *   _t('save')          → 'Save'  (when lang = 'en')
 *   _t('unknown_key')   → 'unknown_key'
 *
 * @param {string} key
 * @returns {string}
 */
function _t(key) {
    return (UI_TRANSLATIONS[_currentLang] || UI_TRANSLATIONS['ar'])[key]
        || UI_TRANSLATIONS['ar'][key]
        || key;
}

/**
 * setLanguage(lang)
 * Switch the UI language at runtime, persist the choice, and refresh the
 * document direction (RTL for Arabic, LTR for English).
 *
 * @param {'ar'|'en'} lang
 */
function setLanguage(lang) {
    if (!UI_TRANSLATIONS[lang]) {
        console.warn(`[i18n] Unknown language "${lang}". Supported: ar, en`);
        return;
    }
    _currentLang = lang;
    localStorage.setItem('ui_language', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Re-render any element carrying a data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = _t(key);
    });

    // Update the language toggle button label if present
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) btn.textContent = lang === 'ar' ? 'English' : 'عربي';

    showToast(`🌐 ${lang === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English'}`, 'info');
}

/**
 * toggleLanguage()
 * Convenience function for a single toggle button.
 */
function toggleLanguage() {
    setLanguage(_currentLang === 'ar' ? 'en' : 'ar');
}


// =============================================================================
// ISSUE #9 — DARK MODE (Global Theme Switcher)
// =============================================================================

/**
 * THEME_CONFIG — CSS class names injected on <html> for each theme.
 * Override the CSS variables in your stylesheet with .theme-dark selectors.
 */
const THEME_CONFIG = {
    light: 'theme-light',
    dark: 'theme-dark'
};

/**
 * _currentTheme — active theme key ('light' | 'dark').
 * Loaded from localStorage on startup.
 */
let _currentTheme = localStorage.getItem('ui_theme') || 'light';

/**
 * applyTheme(theme)
 * Internal: updates the <html> class list and the toggle button label.
 *
 * @param {'light'|'dark'} theme
 */
function applyTheme(theme) {
    const html = document.documentElement;
    // Remove all theme classes first, then add the selected one
    Object.values(THEME_CONFIG).forEach(cls => html.classList.remove(cls));
    html.classList.add(THEME_CONFIG[theme] || THEME_CONFIG.light);

    // Keep meta-theme-color in sync (nice for mobile browsers)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#ffffff');

    // Update toggle button text/icon
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.textContent = theme === 'dark'
            ? `☀️ ${_t('theme_light')}`
            : `🌙 ${_t('theme_dark')}`;
        btn.setAttribute('aria-label', theme === 'dark' ? _t('theme_light') : _t('theme_dark'));
    }
}

/**
 * toggleTheme()
 * Public API — call from the theme toggle button.
 * Flips between Light and Dark, persists preference, and updates the DOM.
 */
function toggleTheme() {
    _currentTheme = _currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('ui_theme', _currentTheme);
    applyTheme(_currentTheme);
    showToast(
        _currentTheme === 'dark'
            ? `🌙 ${_t('theme_dark')}`
            : `☀️ ${_t('theme_light')}`,
        'info'
    );
}

/**
 * initTheme()
 * Must be called once on page load (DOMContentLoaded or similar).
 * Restores the user's last theme preference without a flash of wrong theme.
 */
function initTheme() {
    applyTheme(_currentTheme);
}

// Auto-initialise as soon as the script is parsed (before DOMContentLoaded)
// so there is no visible theme flash.
(function _bootstrapTheme() {
    applyTheme(_currentTheme);
    document.documentElement.setAttribute('lang', _currentLang);
    document.documentElement.setAttribute('dir', _currentLang === 'ar' ? 'rtl' : 'ltr');
})();


// =============================================================================
// ISSUE #18 — DYNAMIC TEMPLATES (Message & Prescription)
// =============================================================================

/**
 * TEMPLATE_PLACEHOLDERS
 * Central registry of every supported placeholder.
 * Keys are the mustache-style tokens used in template content strings.
 * Values describe the data source (for documentation purposes).
 */
const TEMPLATE_PLACEHOLDERS = {
    '{{patient_name}}': 'اسم المريض / Patient name',
    '{{patient_phone}}': 'هاتف المريض / Patient phone',
    '{{patient_age}}': 'عمر المريض / Patient age',
    '{{patient_gender}}': 'جنس المريض / Patient gender',
    '{{doctor_name}}': 'اسم الطبيب / Doctor name',
    '{{doctor_specialty}}': 'تخصص الطبيب / Doctor specialty',
    '{{clinic_name}}': 'اسم العيادة / Clinic name',
    '{{clinic_phone}}': 'هاتف العيادة / Clinic phone',
    '{{clinic_address}}': 'عنوان العيادة / Clinic address',
    '{{diagnosis}}': 'التشخيص / Diagnosis',
    '{{prescription}}': 'الدواء والجرعة / Medication & dosage',
    '{{next_appointment}}': 'الموعد القادم / Next appointment date',
    '{{visit_date}}': 'تاريخ الزيارة / Visit date',
    '{{today_date}}': 'تاريخ اليوم / Today date (auto-filled)',
    '{{notes}}': 'ملاحظات / Notes',
};

/**
 * resolveTemplatePlaceholders(templateContent, dataContext)
 * Core engine — replaces every {{placeholder}} in `templateContent` with the
 * corresponding value from `dataContext`, then falls back to an empty string.
 *
 * @param {string} templateContent    Raw template string with {{…}} tokens.
 * @param {Object} dataContext        Key-value map.  Keys must match tokens
 *                                    WITHOUT the double-braces, e.g.:
 *                                    { patient_name: 'Ahmed Ali', … }
 * @returns {string}                  Fully resolved string, ready to display/print/send.
 */
function resolveTemplatePlaceholders(templateContent, dataContext = {}) {
    if (!templateContent) return '';

    // Always inject today's date automatically
    const enriched = Object.assign({
        today_date: getTodayDate ? getTodayDate() : new Date().toLocaleDateString('ar-EG'),
    }, dataContext);

    return templateContent.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = enriched[key];
        return value !== undefined && value !== null ? String(value) : '';
    });
}

/**
 * buildMessageContext(patientId, doctorId, visitId)
 * Gathers all data needed to fill a Message template from the live app state.
 * Any of the three IDs may be null/undefined.
 *
 * @returns {Object}  Flat key-value context object.
 */
function buildMessageContext(patientId, doctorId, visitId) {
    const patient = (typeof patients !== 'undefined' && patientId)
        ? patients.find(p => p.id === patientId) : null;
    const doctor = (typeof doctors !== 'undefined' && doctorId)
        ? doctors.find(d => d.id === doctorId) : null;
    const visit = (typeof visits !== 'undefined' && visitId)
        ? visits.find(v => v.id === visitId) : null;

    // Pull clinic settings if available
    const settings = (typeof clinicSettings !== 'undefined') ? clinicSettings : {};

    return {
        patient_name: patient?.name || '',
        patient_phone: patient?.phone || '',
        patient_age: patient?.age || '',
        patient_gender: patient?.gender || '',
        doctor_name: doctor?.name || '',
        doctor_specialty: doctor?.specialty || '',
        clinic_name: settings.clinicName || settings.name || '',
        clinic_phone: settings.phone || '',
        clinic_address: settings.address || '',
        diagnosis: visit?.diagnosis || '',
        prescription: visit?.prescription || '',
        next_appointment: visit?.nextAppointment || patient?.nextAppointment || '',
        visit_date: visit?.visit_date || visit?.date || '',
        notes: visit?.notes || patient?.notes || '',
    };
}

/**
 * buildPrescriptionContext(patientId, doctorId, visitId)
 * Same idea as buildMessageContext but tailored for prescription printouts.
 * The prescription field is formatted as a multi-line drug list when possible.
 *
 * @returns {Object}
 */
function buildPrescriptionContext(patientId, doctorId, visitId) {
    const base = buildMessageContext(patientId, doctorId, visitId);

    // If visits carry a structured medications array, stringify it nicely.
    const visit = (typeof visits !== 'undefined' && visitId)
        ? visits.find(v => v.id === visitId) : null;

    if (visit?.medications && Array.isArray(visit.medications) && visit.medications.length) {
        base.prescription = visit.medications
            .map((m, i) => `${i + 1}. ${m.name} — ${m.dosage || ''} ${m.duration ? '(' + m.duration + ')' : ''}`.trim())
            .join('\n');
    }

    return base;
}

/**
 * renderMessageTemplate(templateId, patientId, doctorId, visitId)
 * Looks up a saved message template by ID, resolves all placeholders, and
 * returns the filled text — ready to display in a preview or send via WhatsApp.
 *
 * @returns {string|null}  Resolved content, or null if template not found.
 */
function renderMessageTemplate(templateId, patientId, doctorId, visitId) {
    if (typeof messageTemplates === 'undefined') return null;
    const template = messageTemplates.find(t => t.id === templateId);
    if (!template) return null;

    const ctx = buildMessageContext(patientId, doctorId, visitId);
    return resolveTemplatePlaceholders(template.content, ctx);
}

/**
 * previewMessageTemplate(templateId, patientId, doctorId, visitId)
 * Opens a small popup window showing the filled template alongside a
 * "Send via WhatsApp" button (if the patient has a phone number).
 */
function previewMessageTemplate(templateId, patientId, doctorId, visitId) {
    const resolved = renderMessageTemplate(templateId, patientId, doctorId, visitId);
    if (resolved === null) { showToast('القالب غير موجود', 'warning'); return; }

    const patient = (typeof patients !== 'undefined' && patientId)
        ? patients.find(p => p.id === patientId) : null;
    const waLink = patient?.phone
        ? `https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(resolved)}`
        : null;

    const isDark = _currentTheme === 'dark';
    const win = window.open('', '_blank', 'width=560,height=540,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }

    win.document.write(`<!DOCTYPE html><html dir="${_currentLang === 'ar' ? 'rtl' : 'ltr'}" lang="${_currentLang}">
    <head><meta charset="UTF-8"><title>${_t('preview')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 24px;
               background: ${isDark ? '#1e1e2e' : '#f5f7fa'};
               color:      ${isDark ? '#e0e0e0' : '#2c3e50'}; }
        .card { background: ${isDark ? '#2a2a3e' : '#fff'}; border-radius: 10px;
                padding: 20px; white-space: pre-wrap; line-height: 1.7;
                box-shadow: 0 2px 8px rgba(0,0,0,.12); font-size: 15px; }
        .actions { margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap; }
        .btn { padding: 9px 20px; border: none; border-radius: 6px;
               font-size: 14px; cursor: pointer; }
        .btn-print { background: #3498db; color: #fff; }
        .btn-wa    { background: #25d366; color: #fff; }
        @media print { .actions { display: none; } }
    </style></head><body>
    <div class="card">${resolved.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <div class="actions">
        <button class="btn btn-print" onclick="window.print()">🖨️ ${_t('print')}</button>
        ${waLink ? `<a href="${waLink}" target="_blank" class="btn btn-wa">💬 ${_t('send_whatsapp')}</a>` : ''}
    </div>
    </body></html>`);
    win.document.close();

    // Increment usage counter
    if (typeof messageTemplates !== 'undefined') {
        const tpl = messageTemplates.find(t => t.id === templateId);
        if (tpl) { tpl.usageCount = (tpl.usageCount || 0) + 1; }
        if (typeof saveAllData === 'function') saveAllData();
    }
}

/**
 * printPrescription(patientId, doctorId, visitId, customContent)
 * Generates a fully dynamic prescription printout.
 * `customContent` may be a raw template string with placeholders, or omitted to
 * fall back to a default layout built entirely from the context data.
 *
 * @param {string|null} customContent  Optional template string.
 */
function printPrescription(patientId, doctorId, visitId, customContent = null) {
    const ctx = buildPrescriptionContext(patientId, doctorId, visitId);

    const body = customContent
        ? resolveTemplatePlaceholders(customContent, ctx)
        : _buildDefaultPrescriptionHTML(ctx);

    const isDark = _currentTheme === 'dark';
    const win = window.open('', '_blank', 'width=680,height=780,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }

    win.document.write(`<!DOCTYPE html><html dir="${_currentLang === 'ar' ? 'rtl' : 'ltr'}" lang="${_currentLang}">
    <head><meta charset="UTF-8"><title>${_t('prescription_title')}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 30px;
               background: ${isDark ? '#1e1e2e' : '#fff'};
               color:      ${isDark ? '#e0e0e0' : '#2c3e50'}; }
        .rx-header  { text-align: center; border-bottom: 3px double #2c3e50; padding-bottom: 14px; margin-bottom: 18px; }
        .rx-header h2 { margin: 0 0 4px; font-size: 20px; }
        .rx-meta    { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 14px; margin-bottom: 16px; }
        .rx-meta span { background: ${isDark ? '#2a2a3e' : '#f8f9fa'}; padding: 6px 10px; border-radius: 6px; }
        .rx-label   { font-weight: bold; font-size: 13px; color: #888; margin: 14px 0 4px; }
        .rx-content { background: ${isDark ? '#2a2a3e' : '#f8f9fa'}; border-radius: 8px; padding: 14px; white-space: pre-wrap; line-height: 1.8; font-size: 15px; }
        .rx-footer  { margin-top: 28px; display: flex; justify-content: space-between; font-size: 13px; color: #888; }
        .btn { padding: 8px 22px; border: none; border-radius: 6px; background: #3498db; color: #fff; cursor: pointer; font-size: 14px; margin-top: 18px; }
        @media print { .btn { display: none; } }
    </style></head><body>${body}
    <button class="btn" onclick="window.print()">🖨️ ${_t('print')}</button>
    </body></html>`);
    win.document.close();
}

/**
 * _buildDefaultPrescriptionHTML(ctx)
 * Private helper — builds the HTML body of a prescription from raw context data.
 *
 * @param {Object} ctx
 * @returns {string}
 */
function _buildDefaultPrescriptionHTML(ctx) {
    return `
    <div class="rx-header">
        <h2>🏥 ${ctx.clinic_name || _t('prescription_title')}</h2>
        ${ctx.clinic_phone ? `<div>${ctx.clinic_phone}</div>` : ''}
        ${ctx.clinic_address ? `<div>${ctx.clinic_address}</div>` : ''}
    </div>

    <div class="rx-meta">
        <span><strong>${_t('patient_name')}:</strong> ${ctx.patient_name}</span>
        <span><strong>${_t('patient_age')}:</strong> ${ctx.patient_age}</span>
        <span><strong>${_t('doctor_name')}:</strong> ${ctx.doctor_name}</span>
        <span><strong>${_t('visit_date')}:</strong> ${ctx.visit_date || ctx.today_date}</span>
    </div>

    ${ctx.diagnosis ? `
    <div class="rx-label">📋 ${_t('diagnosis')}</div>
    <div class="rx-content">${ctx.diagnosis}</div>` : ''}

    ${ctx.prescription ? `
    <div class="rx-label">💊 ${_t('prescription_title')}</div>
    <div class="rx-content">${ctx.prescription}</div>` : ''}

    ${ctx.next_appointment ? `
    <div class="rx-label">📅 ${_t('next_appointment')}</div>
    <div class="rx-content">${ctx.next_appointment}</div>` : ''}

    ${ctx.notes ? `
    <div class="rx-label">📝 ${_t('notes')}</div>
    <div class="rx-content">${ctx.notes}</div>` : ''}

    <div class="rx-footer">
        <span>${_t('today_date') !== 'today_date' ? '' : ''}${ctx.today_date}</span>
        <span>${ctx.doctor_name}</span>
    </div>`;
}

// ─── Expose placeholder list so the template editor can populate its toolbar ─
function getTemplatePlaceholders() {
    return Object.entries(TEMPLATE_PLACEHOLDERS).map(([token, desc]) => ({ token, desc }));
}


// =============================================================================
// END OF FEATURE ADDITIONS — original ui-core.js continues below
// =============================================================================


// ========== 21. STOCK WASTE ==========
function openWasteModal() {
    document.getElementById('waste-warehouse').innerHTML = '<option value="">اختر مخزن...</option>' +
        warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    document.getElementById('waste-product').innerHTML = '<option value="">اختر صنف...</option>' +
        inventory.map(i => `<option value="${i.id}" data-qty="${i.quantity}" data-price="${i.price || 0}">${i.product_name} (متوفر: ${i.quantity})</option>`).join('');
    document.getElementById('wasteModal').style.display = 'block';
}

function saveWaste() {
    const warehouseId = document.getElementById('waste-warehouse').value;
    const productId = document.getElementById('waste-product').value;
    const qty = parseInt(document.getElementById('waste-qty').value);
    const reason = document.getElementById('waste-reason').value;
    const notes = document.getElementById('waste-notes').value.trim();
    if (!warehouseId || !productId || !qty || qty <= 0) { showToast('أكمل البيانات', 'warning'); return; }
    const product = inventory.find(i => i.id === productId);
    if (!product || product.quantity < qty) { showToast('الكمية غير متوفرة', 'warning'); return; }
    const value = qty * (product.price || 0);
    const wh = warehouses.find(w => w.id === warehouseId);
    product.quantity -= qty;
    stockWaste.push({
        id: generateId(), date: getTodayDate(), warehouseId, warehouseName: wh?.name,
        productId, productName: product.product_name, quantity: qty, value, reason, notes, createdAt: new Date().toISOString()
    });
    stockTransactions.push({
        id: generateId(), date: getTodayDate(), warehouseId, productId,
        productName: product.product_name, type: 'waste', quantity: -qty, value, reason,
        reference: 'تالف وهالك', balanceAfter: product.quantity
    });
    saveAllData(); loadWaste(); closeModal(); showToast('✅ تم تسجيل التالف');
}

function loadWaste() {
    const tbody = document.querySelector('#waste-table tbody');
    if (!tbody) return;
    if (!stockWaste.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد تالف وهالك</td></tr>'; return; }
    const now = new Date(); const cm = now.getMonth(); const cy = now.getFullYear();
    const mw = stockWaste.filter(w => { const d = new Date(w.date); return d.getMonth() === cm && d.getFullYear() === cy; });
    const yw = stockWaste.filter(w => new Date(w.date).getFullYear() === cy);
    setElementText('waste-month-total', formatCurrency(mw.reduce((s, w) => s + w.value, 0)));
    setElementText('waste-year-total', formatCurrency(yw.reduce((s, w) => s + w.value, 0)));
    setElementText('waste-all-total', formatCurrency(stockWaste.reduce((s, w) => s + w.value, 0)));
    setElementText('waste-month', mw.reduce((s, w) => s + w.quantity, 0));
    const rText = { expired: 'انتهاء صلاحية', damaged: 'تالف', lost: 'فقدان', other: 'أخرى' };
    tbody.innerHTML = [...stockWaste].sort((a, b) => new Date(b.date) - new Date(a.date)).map(w => `
        <tr><td>${w.date}</td><td>${w.warehouseName}</td><td>${w.productName}</td>
        <td>${w.quantity}</td><td>${formatCurrency(w.value)}</td>
        <td>${rText[w.reason] || w.notes || w.reason}</td>
        <td><button onclick="deleteWaste('${w.id}')" class="btn-stock-del">🗑️</button></td></tr>`).join('');
}

function deleteWaste(id) {
    stockWaste = stockWaste.filter(w => w.id !== id);
    saveAllData(); loadWaste(); showToast('تم حذف السجل', 'info');
}

// ========== 22. STOCK LEDGER ==========
function loadStockLedger() {
    const tbody = document.querySelector('#ledger-table tbody');
    if (!tbody) return;
    const whFilter = document.getElementById('ledger-warehouse-filter')?.value || 'all';
    const typeFilter = document.getElementById('ledger-type-filter')?.value || 'all';
    const fromDate = document.getElementById('ledger-from')?.value;
    const toDate = document.getElementById('ledger-to')?.value;
    let filtered = [...stockTransactions];
    if (whFilter !== 'all') filtered = filtered.filter(t => t.warehouseId === whFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);
    if (fromDate) filtered = filtered.filter(t => t.date >= fromDate);
    if (toDate) filtered = filtered.filter(t => t.date <= toDate);
    if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا توجد حركات</td></tr>'; return; }
    const tNames = { purchase: 'توريد', sale: 'صرف', transfer_out: 'تحويل خارج', transfer_in: 'تحويل داخل', waste: 'تالف', adjust: 'تسوية' };
    tbody.innerHTML = filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => {
        const wh = warehouses.find(w => w.id === t.warehouseId);
        return `<tr><td>${t.date}</td><td>${wh?.name || '---'}</td><td>${t.productName}</td>
            <td>${tNames[t.type] || t.type}</td><td>${t.quantity}</td><td>${t.balanceAfter || '---'}</td>
            <td>${t.reference || '---'}</td><td>${t.notes || ''}</td></tr>`;
    }).join('');
}

function exportLedger() {
    const whFilter = document.getElementById('ledger-warehouse-filter')?.value || 'all';
    const typeFilter = document.getElementById('ledger-type-filter')?.value || 'all';
    const fromDate = document.getElementById('ledger-from')?.value || '';
    const toDate = document.getElementById('ledger-to')?.value || '';
    let filtered = [...stockTransactions];
    if (whFilter !== 'all') filtered = filtered.filter(t => t.warehouseId === whFilter);
    if (typeFilter !== 'all') filtered = filtered.filter(t => t.type === typeFilter);
    if (fromDate) filtered = filtered.filter(t => t.date >= fromDate);
    if (toDate) filtered = filtered.filter(t => t.date <= toDate);
    if (!filtered.length) { showToast('لا توجد بيانات لتصديرها', 'warning'); return; }
    const tNames = { purchase: 'توريد', sale: 'صرف', transfer_out: 'تحويل خارج', transfer_in: 'تحويل داخل', waste: 'تالف', adjust: 'تسوية' };
    let csv = '\uFEFFالتاريخ,المخزن,الصنف,النوع,الكمية,الرصيد بعد,المرجع,ملاحظات\n';
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const wh = warehouses.find(w => w.id === t.warehouseId);
        csv += [t.date, wh?.name || '---', t.productName || '---', tNames[t.type] || t.type,
        t.quantity, t.balanceAfter ?? '---', (t.reference || '---').replace(/,/g, ' '), (t.notes || '').replace(/,/g, ' ')].join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `سجل_المخزون_${getTodayDate()}.csv`; link.click();
    showToast('✅ تم تصدير سجل المخزون');
}

// ========== 23. LABS ==========
function openLabModal() { document.getElementById('labModal').style.display = 'block'; }

function saveLab() {
    const name = document.getElementById('lab-name').value.trim();
    const phone = document.getElementById('lab-phone').value.trim();
    const email = document.getElementById('lab-email').value.trim();
    const contact = document.getElementById('lab-contact').value.trim();
    const address = document.getElementById('lab-address').value.trim();
    const notes = document.getElementById('lab-notes').value.trim();
    if (!name) { showToast('اسم المعمل مطلوب', 'warning'); return; }
    labs.push({ id: generateId(), name, phone, email, contactPerson: contact, address, notes, accountBalance: 0, totalRequests: 0, createdAt: new Date().toISOString() });
    saveAllData(); loadLabs(); closeModal(); showToast('✅ تم إضافة المعمل');
}

function loadLabs() {
    const tbody = document.querySelector('#labs-table tbody');
    if (!tbody) return;
    if (!labs.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد معامل</td></tr>'; return; }
    const cm = new Date().getMonth(); const cy = new Date().getFullYear();
    const monthlyReqs = labRequests.filter(r => { const d = new Date(r.createdAt); return d.getMonth() === cm && d.getFullYear() === cy; }).length;
    setElementText('total-labs', labs.length);
    setElementText('total-pending-lab', labRequests.filter(r => r.status === 'pending' || r.status === 'processing').length);
    setElementText('monthly-lab-requests', monthlyReqs);
    setElementText('total-lab-balance', formatCurrency(labs.reduce((s, l) => s + (l.accountBalance || 0), 0)));
    tbody.innerHTML = labs.map(lab => {
        const cnt = labRequests.filter(r => r.labId === lab.id).length;
        return `<tr><td><strong>${lab.name}</strong></td><td>${lab.phone || '---'}</td>
            <td>${lab.contactPerson || '---'}</td><td>${cnt}</td><td>${formatCurrency(lab.accountBalance || 0)}</td>
            <td><button onclick="viewLabRequests('${lab.id}')" class="btn-stock-plus">📋 الطلبات</button>
            <button onclick="deleteLab('${lab.id}')" class="btn-stock-del">🗑️</button></td></tr>`;
    }).join('');
}

function deleteLab(id) {
    labs = labs.filter(l => l.id !== id);
    saveAllData(); loadLabs(); showToast('تم حذف المعمل', 'info');
}

function openLabRequestModal() {
    document.getElementById('request-patient').innerHTML = '<option value="">اختر مريض...</option>' +
        patients.map(p => `<option value="${p.id}">${p.name} (${p.phone || ''})</option>`).join('');
    document.getElementById('request-lab').innerHTML = '<option value="">اختر معمل...</option>' +
        labs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    const expected = new Date(); expected.setDate(expected.getDate() + 3);
    document.getElementById('request-expected').value = expected.toISOString().split('T')[0];
    document.getElementById('request-tests-container').innerHTML = '';
    addTestItem();
    document.getElementById('labRequestModal').style.display = 'block';
}

function addTestItem() {
    const container = document.getElementById('request-tests-container');
    const template = document.getElementById('test-item-template');
    container.appendChild(template.content.cloneNode(true));
}

function loadLabTemplates() {
    const labId = document.getElementById('request-lab')?.value;
    const sel = document.getElementById('request-template');
    if (!labId || !sel) return;
    const tmplList = labTemplates.filter(t => t.labId === labId);
    sel.innerHTML = '<option value="">-- اختر قالب --</option>' +
        tmplList.map(t => `<option value="${t.id}" data-tests='${JSON.stringify(t.tests)}' data-price="${t.price}">${t.name}</option>`).join('');
}

function applyTemplate() {
    const sel = document.getElementById('request-template');
    const selected = sel.options[sel.selectedIndex];
    if (!selected.value) return;
    const tests = JSON.parse(selected.dataset.tests || '[]');
    const container = document.getElementById('request-tests-container');
    container.innerHTML = '';
    tests.forEach(test => {
        const tmpl = document.getElementById('test-item-template');
        const clone = tmpl.content.cloneNode(true);
        clone.querySelector('.test-name').value = test.name || '';
        clone.querySelector('.test-unit').value = test.unit || '';
        container.appendChild(clone);
    });
    document.getElementById('request-price').value = selected.dataset.price || 0;
}

function saveLabRequest() {
    const patientId = document.getElementById('request-patient').value;
    const labId = document.getElementById('request-lab').value;
    const expectedDate = document.getElementById('request-expected').value;
    const price = parseFloat(document.getElementById('request-price').value) || 0;
    const notes = document.getElementById('request-notes').value.trim();
    if (!patientId || !labId) { showToast('اختر المريض والمعمل', 'warning'); return; }
    const tests = [];
    document.querySelectorAll('.test-item').forEach(item => {
        const name = item.querySelector('.test-name')?.value;
        if (name) tests.push({ name, result: '', unit: item.querySelector('.test-unit')?.value || '', normalRange: '' });
    });
    if (!tests.length) { showToast('أضف تحليل واحد على الأقل', 'warning'); return; }
    const patient = patients.find(p => p.id === patientId);
    const lab = labs.find(l => l.id === labId);
    const newReq = {
        id: generateId(), requestNumber: 'LAB-' + Math.floor(1000 + Math.random() * 9000),
        patientId, patientName: patient?.name, labId, labName: lab?.name, tests, expectedDate,
        price, status: 'pending', createdAt: new Date().toISOString(), createdDate: getTodayDate(),
        notes, resultDate: null, resultFile: null, resultNotes: ''
    };
    labRequests.push(newReq);
    if (lab) { lab.totalRequests = (lab.totalRequests || 0) + 1; lab.accountBalance = (lab.accountBalance || 0) + price; }
    saveAllData(); loadLabRequests('all'); closeModal(); showToast('✅ تم إنشاء طلب المعمل رقم ' + newReq.requestNumber);
}

function sendToLab(requestId) {
    const req = labRequests.find(r => r.id === requestId);
    if (req) { req.status = 'processing'; req.sentToLabAt = new Date().toISOString(); saveAllData(); loadLabRequests('all'); showToast('✅ تم إرسال الطلب للمعمل'); }
}

function enterResults(requestId) {
    const request = labRequests.find(r => r.id === requestId);
    if (!request) return;
    document.getElementById('result-request-info').innerText = `طلب: ${request.requestNumber} - ${request.patientName}`;
    const container = document.getElementById('result-tests-container');
    container.innerHTML = '';
    request.tests.forEach(test => {
        const div = document.createElement('div');
        div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-bottom:8px;';
        div.innerHTML = `
            <input type="text" value="${test.name}" readonly style="background:#f0f0f0;padding:6px;">
            <input type="text" placeholder="النتيجة" class="test-result-value" value="${test.result || ''}" style="padding:6px;">
            <input type="text" placeholder="الوحدة" value="${test.unit || ''}" readonly style="background:#f0f0f0;padding:6px;">`;
        container.appendChild(div);
    });
    document.getElementById('result-notes').value = request.resultNotes || '';
    document.getElementById('result-file').value = '';
    currentRequestId = requestId;
    document.getElementById('resultModal').style.display = 'block';
}

function saveLabResult() {
    const request = labRequests.find(r => r.id === currentRequestId);
    if (!request) return;
    document.querySelectorAll('#result-tests-container .test-result-value').forEach((inp, i) => {
        if (request.tests[i]) request.tests[i].result = inp.value || '';
    });
    request.resultNotes = document.getElementById('result-notes').value;
    const resultFile = document.getElementById('result-file').files[0];
    const doSave = () => { request.status = 'ready'; request.resultDate = getTodayDate(); saveAllData(); loadLabRequests('all'); closeModal(); showToast('✅ تم حفظ النتائج'); };
    if (resultFile) {
        const reader = new FileReader();
        reader.onload = e => { request.resultFile = e.target.result; request.resultFileName = resultFile.name; doSave(); };
        reader.readAsDataURL(resultFile);
    } else doSave();
}

function deliverToPatient(requestId) {
    const req = labRequests.find(r => r.id === requestId);
    if (req) { req.status = 'delivered'; saveAllData(); loadLabRequests('all'); showToast('✅ تم تسليم النتيجة للمريض'); }
}

function loadLabRequests(filter = 'all') {
    const tbody = document.querySelector('#lab-requests-table tbody');
    if (!tbody) return;
    let filtered = filter === 'all' ? labRequests : labRequests.filter(r => r.status === filter);
    if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">لا توجد طلبات معامل</td></tr>'; return; }
    setElementText('request-pending', labRequests.filter(r => r.status === 'pending').length);
    setElementText('request-processing', labRequests.filter(r => r.status === 'processing').length);
    setElementText('request-ready', labRequests.filter(r => r.status === 'ready').length);
    setElementText('request-delivered', labRequests.filter(r => r.status === 'delivered').length);
    setElementText('pending-lab-requests', labRequests.filter(r => r.status === 'pending' || r.status === 'processing').length);
    setElementText('ready-lab-requests', labRequests.filter(r => r.status === 'ready').length);
    const sText = { pending: 'معلق', processing: 'تحت التنفيذ', ready: 'جاهز', delivered: 'تم التسليم' };
    const sCls = { pending: 'expiry-warning', processing: 'status-ok', ready: 'status-ok', delivered: 'status-low' };
    tbody.innerHTML = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(req => `
        <tr><td><strong>${req.requestNumber}</strong></td><td>${req.patientName}</td><td>${req.labName}</td>
        <td>${req.tests.length} تحليل</td><td>${req.createdDate}</td><td>${req.expectedDate || '---'}</td>
        <td class="${sCls[req.status] || ''}">${sText[req.status] || req.status}</td>
        <td>
            ${req.status === 'pending' ? `<button onclick="sendToLab('${req.id}')" class="btn-stock-plus">📤 إرسال</button>` : ''}
            ${req.status === 'processing' ? `<button onclick="enterResults('${req.id}')" class="btn-stock-plus">📝 نتائج</button>` : ''}
            ${req.status === 'ready' ? `<button onclick="deliverToPatient('${req.id}')" class="btn-stock-plus">✅ تسليم</button>` : ''}
            <button onclick="deleteLabRequest('${req.id}')" class="btn-stock-del">🗑️</button>
        </td></tr>`).join('');
}

function filterLabRequests(filter) {
    document.querySelectorAll('#lab-requests .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadLabRequests(filter);
}

function deleteLabRequest(id) {
    labRequests = labRequests.filter(r => r.id !== id);
    saveAllData(); loadLabRequests('all'); showToast('تم حذف الطلب', 'info');
}

function viewLabRequests(labId) {
    showSection('lab-requests');
    setTimeout(() => { filterLabRequests('all'); }, 100);
}

function openLabTemplateModal() {
    document.getElementById('template-lab').innerHTML = '<option value="">اختر معمل...</option>' +
        labs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    document.getElementById('template-tests-container').innerHTML = '';
    addTemplateTest();
    document.getElementById('labTemplateModal').style.display = 'block';
}

function addTemplateTest() {
    const container = document.getElementById('template-tests-container');
    const template = document.getElementById('template-test-template');
    container.appendChild(template.content.cloneNode(true));
}

function saveLabTemplate() {
    const name = document.getElementById('template-name').value.trim();
    const labId = document.getElementById('template-lab').value;
    const price = parseFloat(document.getElementById('template-price').value) || 0;
    if (!name || !labId) { showToast('اسم القالب والمعمل مطلوبان', 'warning'); return; }
    const tests = [];
    document.querySelectorAll('.template-test-item').forEach(item => {
        const n = item.querySelector('.tpl-test-name')?.value;
        if (n) tests.push({ name: n, unit: item.querySelector('.tpl-test-unit')?.value || '' });
    });
    if (!tests.length) { showToast('أضف تحليل واحد على الأقل', 'warning'); return; }
    labTemplates.push({ id: generateId(), name, labId, tests, price, usageCount: 0, createdAt: new Date().toISOString() });
    saveAllData(); loadLabTemplates(); closeModal(); showToast('✅ تم إضافة القالب');
}

function loadLabTemplates() {
    const tbody = document.querySelector('#lab-templates-table tbody');
    if (!tbody) return;
    if (!labTemplates.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد قوالب</td></tr>'; return; }
    tbody.innerHTML = labTemplates.map(t => {
        const lab = labs.find(l => l.id === t.labId);
        return `<tr><td><strong>${t.name}</strong></td><td>${lab?.name || '---'}</td>
            <td>${t.tests.map(ts => ts.name).join(', ')}</td><td>${t.price || 0} ج.م</td>
            <td>${t.usageCount || 0}</td>
            <td><button onclick="deleteLabTemplate('${t.id}')" class="btn-stock-del">🗑️</button></td></tr>`;
    }).join('');
}

function deleteLabTemplate(id) {
    labTemplates = labTemplates.filter(t => t.id !== id);
    saveAllData(); loadLabTemplates(); showToast('تم حذف القالب', 'info');
}

// ========== 24. EMPLOYEES — FIX: performance sync on add ==========
function openEmployeeModal() { document.getElementById('employeeModal').style.display = 'block'; }

function saveEmployee() {
    const username = document.getElementById('emp-username').value.trim();
    const password = document.getElementById('emp-password').value;
    const fullName = document.getElementById('emp-name').value.trim();
    const role = document.getElementById('emp-role').value;
    const email = document.getElementById('emp-email').value.trim();
    const phone = document.getElementById('emp-phone').value.trim();
    const position = document.getElementById('emp-position').value.trim();
    const department = document.getElementById('emp-department').value.trim();
    const salary = parseFloat(document.getElementById('emp-salary').value) || 0;
    const shift = document.getElementById('emp-shift').value;

    if (!username || !password || !fullName) { showToast('البيانات الأساسية مطلوبة', 'warning'); return; }
    if (employees.find(e => e.username === username)) { showToast('اسم المستخدم موجود بالفعل', 'error'); return; }

    const newEmployee = {
        id: 'emp-' + Date.now(), username, password, fullName, role, email, phone,
        position, department, hireDate: getTodayDate(), salary, shift, isActive: true,
        lastLogin: null, createdAt: new Date().toISOString()
    };
    employees.push(newEmployee);

    // FIX: Auto-create a performance log entry for this employee
    initEmployeePerformanceLog(newEmployee);

    saveAllData(); loadEmployees(); closeModal(); showToast('✅ تم إضافة الموظف');
}

// FIX: Create initial performance record when employee is added
function initEmployeePerformanceLog(emp) {
    const now = new Date();
    performanceLogs.push({
        id: 'perf-' + emp.id + '-' + Date.now(),
        employeeId: emp.id,
        employeeName: emp.fullName,
        jobTitle: emp.position || emp.role,
        department: emp.department || 'عام',
        hireDate: emp.hireDate,
        month: now.getMonth(),
        year: now.getFullYear(),
        attendanceDays: 0,
        tasksAssigned: 0,
        tasksCompleted: 0,
        completionRate: 0,
        salesTotal: 0,
        performanceLevel: 'مقبول',
        createdAt: now.toISOString(),
        lastUpdated: now.toISOString()
    });
}

function loadEmployees() {
    const tbody = document.querySelector('#employees-table tbody');
    if (!tbody) return;
    if (!employees.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا يوجد موظفين</td></tr>'; return; }
    const roleNames = { admin: 'مدير', manager: 'مدير تنفيذي', doctor: 'طبيب', receptionist: 'موظف استقبال', accountant: 'محاسب' };
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td><strong>${emp.fullName}</strong></td><td>${emp.username}</td>
            <td>${roleNames[emp.role] || emp.role}</td><td>${emp.department || '---'}</td>
            <td>${emp.isActive ? '🟢 نشط' : '🔴 غير نشط'}</td>
            <td>${emp.lastLogin ? new Date(emp.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل'}</td>
            <td>
                <button onclick="toggleEmployeeStatus('${emp.id}')" class="btn-stock-plus">${emp.isActive ? '🔴 تعطيل' : '🟢 تفعيل'}</button>
                <button onclick="deleteEmployee('${emp.id}')" class="btn-stock-del">🗑️</button>
            </td>
        </tr>`).join('');
    setElementText('employees-count', employees.length);
    setElementText('total-employees', employees.length);
}

// FIX: Single definition (removed duplicate)
function toggleEmployeeStatus(id) {
    if (currentUser && currentUser.id === id) { showToast('لا يمكنك تعطيل حسابك الشخصي', 'warning'); return; }
    const emp = employees.find(e => e.id === id);
    if (emp) { emp.isActive = !emp.isActive; saveAllData(); loadEmployees(); showToast(`تم ${emp.isActive ? 'تفعيل' : 'تعطيل'} الموظف`); }
}

function deleteEmployee(id) {
    employees = employees.filter(e => e.id !== id);
    performanceLogs = performanceLogs.filter(p => p.employeeId !== id);
    saveAllData(); loadEmployees(); showToast('✅ تم حذف الموظف', 'info');
}

// ========== 25. ATTENDANCE — FIX: Dynamic (any employee) ==========
// Admins can record attendance for any employee; employees record their own.
function checkIn(targetEmployeeId = null) {
    const empId = targetEmployeeId || currentUser?.id;
    const empName = targetEmployeeId
        ? employees.find(e => e.id === targetEmployeeId)?.fullName
        : currentUser?.fullName;
    if (!empId) { showToast('الرجاء تسجيل الدخول أولاً', 'warning'); return; }

    const today = getTodayDate();
    const existing = attendance.find(a => a.employeeId === empId && a.date === today);
    if (existing) {
        if (existing.checkIn) { showToast('تم تسجيل الحضور مسبقاً اليوم', 'warning'); }
        else { existing.checkIn = getCurrentTime(); saveAllData(); loadAttendance(); showToast(`✅ تم تحديث وقت حضور ${empName}`); }
        return;
    }

    const record = {
        id: 'att-' + Date.now(), employeeId: empId, employeeName: empName,
        date: today, checkIn: getCurrentTime(), checkOut: null,
        latitude: null, longitude: null, status: 'present', notes: '', createdAt: new Date().toISOString()
    };

    const doSave = () => {
        attendance.push(record);
        _syncPerformanceAttendance(empId);
        saveAllData(); loadAttendance();
        showToast(`✅ تم تسجيل حضور ${empName} الساعة ${getCurrentTime()}`);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => { record.latitude = pos.coords.latitude; record.longitude = pos.coords.longitude; doSave(); },
            () => doSave(), { timeout: 4000 }
        );
    } else doSave();
}

function checkOut(targetEmployeeId = null) {
    const empId = targetEmployeeId || currentUser?.id;
    const empName = targetEmployeeId
        ? employees.find(e => e.id === targetEmployeeId)?.fullName
        : currentUser?.fullName;
    if (!empId) { showToast('الرجاء تسجيل الدخول أولاً', 'warning'); return; }

    const record = attendance.find(a => a.employeeId === empId && a.date === getTodayDate());
    if (!record) { showToast('لم يتم تسجيل الحضور اليوم', 'warning'); return; }
    if (record.checkOut) { showToast('تم تسجيل الانصراف مسبقاً', 'info'); return; }
    record.checkOut = getCurrentTime();
    saveAllData(); loadAttendance();
    showToast(`✅ تم تسجيل انصراف ${empName} الساعة ${getCurrentTime()}`);
}

// Admin: open modal to select employee then check in
function openCheckInModal() {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    if (!isAdmin) { checkIn(); return; }
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.style.display = 'block'; modal.id = 'checkInModal';
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <h2>🕐 تسجيل حضور موظف</h2>
            <select id="attendance-employee-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-bottom:12px;">
                <option value="">اختر الموظف...</option>
                ${employees.filter(e => e.isActive).map(e => `<option value="${e.id}">${e.fullName}</option>`).join('')}
            </select>
            <div class="modal-actions">
                <button onclick="checkIn(document.getElementById('attendance-employee-select').value||null); document.getElementById('checkInModal').remove();" class="btn-primary">✅ تسجيل حضور</button>
                <button onclick="document.getElementById('checkInModal').remove();" class="btn-secondary">❌ إلغاء</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

function openCheckOutModal() {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    if (!isAdmin) { checkOut(); return; }
    const modal = document.createElement('div');
    modal.className = 'modal'; modal.style.display = 'block'; modal.id = 'checkOutModal';
    modal.innerHTML = `
        <div class="modal-content small-modal">
            <h2>🕔 تسجيل انصراف موظف</h2>
            <select id="checkout-employee-select" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;margin-bottom:12px;">
                <option value="">اختر الموظف...</option>
                ${employees.filter(e => e.isActive).map(e => `<option value="${e.id}">${e.fullName}</option>`).join('')}
            </select>
            <div class="modal-actions">
                <button onclick="checkOut(document.getElementById('checkout-employee-select').value||null); document.getElementById('checkOutModal').remove();" class="btn-primary">✅ تسجيل انصراف</button>
                <button onclick="document.getElementById('checkOutModal').remove();" class="btn-secondary">❌ إلغاء</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
}

// Internal: keep performanceLog in sync when attendance changes
function _syncPerformanceAttendance(empId) {
    const now = new Date();
    const cm = now.getMonth(); const cy = now.getFullYear();
    let log = performanceLogs.find(p => p.employeeId === empId && p.month === cm && p.year === cy);
    if (!log) {
        const emp = employees.find(e => e.id === empId);
        log = {
            id: 'perf-' + empId + '-' + Date.now(), employeeId: empId, employeeName: emp?.fullName || '',
            jobTitle: emp?.position || emp?.role || '', department: emp?.department || 'عام',
            hireDate: emp?.hireDate || '', month: cm, year: cy, attendanceDays: 0,
            tasksAssigned: 0, tasksCompleted: 0, completionRate: 0, salesTotal: 0,
            performanceLevel: 'مقبول', createdAt: now.toISOString(), lastUpdated: now.toISOString()
        };
        performanceLogs.push(log);
    }
    log.attendanceDays = attendance.filter(a => {
        if (a.employeeId !== empId) return false;
        const d = new Date(a.date); return d.getMonth() === cm && d.getFullYear() === cy && a.checkIn;
    }).length;
    log.lastUpdated = now.toISOString();
}

function loadAttendance() {
    const tbody = document.querySelector('#attendance-table tbody');
    if (!tbody) return;
    const today = getTodayDate();
    setElementText('today-present', attendance.filter(a => a.date === today && a.checkIn).length);
    const all = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!all.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;">لا توجد سجلات حضور</td></tr>'; return; }
    tbody.innerHTML = all.map(a => `
        <tr><td>${a.date}</td><td><strong>${a.employeeName}</strong></td>
        <td>${a.checkIn || '---'}</td><td>${a.checkOut || '---'}</td>
        <td>${a.latitude ? '📍 موقع معروف' : '📍 بدون موقع'}</td>
        <td class="${a.checkOut ? 'status-ok' : 'expiry-warning'}">${a.checkOut ? 'مكتمل' : 'لم ينصرف'}</td>
        <td><button onclick="deleteAttendance('${a.id}')" class="btn-stock-del">🗑️</button></td></tr>`).join('');
}

function deleteAttendance(id) {
    attendance = attendance.filter(a => a.id !== id);
    saveAllData(); loadAttendance(); showToast('تم حذف الحضور', 'info');
}

// ========== 26. TASKS ==========
function openTaskModal() { document.getElementById('taskModal').style.display = 'block'; }

function saveTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-desc').value.trim();
    const assignedTo = document.getElementById('task-assignee').value;
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;
    if (!title || !assignedTo) { showToast('عنوان المهمة والموظف مطلوبان', 'warning'); return; }
    const emp = employees.find(e => e.id === assignedTo);
    tasks.push({
        id: 'task-' + Date.now(), title, description, createdBy: currentUser?.id || 'system',
        createdByName: currentUser?.fullName || 'النظام', assignedTo, assignedName: emp?.fullName,
        priority, deadline, status: 'pending', completedAt: null, completedBy: null,
        notes: '', createdAt: new Date().toISOString()
    });
    // FIX: sync performance log for assigned employee
    _syncPerformanceTasks(assignedTo);
    saveAllData(); loadTasks('all'); closeModal(); showToast('✅ تم إنشاء المهمة');
}

function _syncPerformanceTasks(empId) {
    const now = new Date(); const cm = now.getMonth(); const cy = now.getFullYear();
    let log = performanceLogs.find(p => p.employeeId === empId && p.month === cm && p.year === cy);
    if (!log) { _syncPerformanceAttendance(empId); log = performanceLogs.find(p => p.employeeId === empId && p.month === cm && p.year === cy); }
    if (!log) return;
    const empTasks = tasks.filter(t => t.assignedTo === empId);
    const completed = empTasks.filter(t => t.status === 'completed').length;
    log.tasksAssigned = empTasks.length;
    log.tasksCompleted = completed;
    log.completionRate = empTasks.length ? Math.round((completed / empTasks.length) * 100) : 0;
    log.lastUpdated = now.toISOString();
}

function loadTasks(filter = 'all') {
    const tbody = document.querySelector('#tasks-table tbody');
    if (!tbody) return;
    let filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
    if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد مهام</td></tr>'; return; }
    setElementText('pending-tasks', tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length);
    const pNames = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
    const sNames = { pending: 'معلق', 'in-progress': 'قيد التنفيذ', completed: 'مكتمل', rejected: 'مرفوض' };
    const sCls = { pending: 'expiry-warning', 'in-progress': 'status-ok', completed: 'status-ok', rejected: 'status-low' };
    tbody.innerHTML = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => `
        <tr><td><strong>${t.title}</strong></td><td>${t.assignedName}</td>
        <td>${pNames[t.priority] || t.priority}</td><td>${t.deadline || '---'}</td>
        <td class="${sCls[t.status]}">${sNames[t.status] || t.status}</td><td>${t.createdByName}</td>
        <td>
            ${t.status === 'pending' && t.assignedTo === currentUser?.id ? `<button onclick="updateTaskStatus('${t.id}','in-progress')" class="btn-stock-plus">▶️ بدء</button>` : ''}
            ${t.status === 'in-progress' && t.assignedTo === currentUser?.id ? `<button onclick="updateTaskStatus('${t.id}','completed')" class="btn-stock-plus">✅ إكمال</button>` : ''}
            ${(currentUser?.role === 'admin' || currentUser?.role === 'manager') ? `<button onclick="deleteTask('${t.id}')" class="btn-stock-del">🗑️</button>` : ''}
        </td></tr>`).join('');
}

function updateTaskStatus(taskId, status) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = status;
        task.completedAt = status === 'completed' ? new Date().toISOString() : null;
        task.completedBy = status === 'completed' ? currentUser?.id : null;
        _syncPerformanceTasks(task.assignedTo);
        saveAllData(); loadTasks('all'); showToast('✅ تم تحديث حالة المهمة');
    }
}

function filterTasks(filter) {
    document.querySelectorAll('#tasks .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadTasks(filter);
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    tasks = tasks.filter(t => t.id !== id);
    if (task) _syncPerformanceTasks(task.assignedTo);
    saveAllData(); loadTasks('all'); showToast('تم حذف المهمة', 'info');
}

// ========== 27. SALARIES ==========
function calculateSalaries() {
    const now = new Date(); const cm = now.getMonth(); const cy = now.getFullYear();
    let count = 0;
    employees.filter(e => e.isActive).forEach(emp => {
        if (salaries.find(s => s.employeeId === emp.id && s.month === cm && s.year === cy)) return;
        const daysInMonth = new Date(cy, cm + 1, 0).getDate();
        const attendanceDays = attendance.filter(a => {
            const d = new Date(a.date);
            return a.employeeId === emp.id && d.getMonth() === cm && d.getFullYear() === cy && a.checkIn;
        }).length;
        const absenceDays = daysInMonth - attendanceDays;
        const deductionRate = 0.02;
        const totalDeduction = parseFloat((emp.salary * absenceDays * deductionRate / daysInMonth).toFixed(2));
        const completedTasks = tasks.filter(t => t.assignedTo === emp.id && t.status === 'completed' && t.completedAt && new Date(t.completedAt).getMonth() === cm && new Date(t.completedAt).getFullYear() === cy).length;
        const tasksBonus = completedTasks * 50;

        let doctorShare = 0;
        let doctorShareDetails = null;
        const linkedDoctor = doctors.find(d => d.employeeId === emp.id || d.name.trim().toLowerCase() === emp.fullName.trim().toLowerCase());
        if (linkedDoctor) {
            const monthVisits = visits.filter(v => { const d = new Date(v.visit_date); return v.doctorId === linkedDoctor.id && d.getMonth() === cm && d.getFullYear() === cy; });
            // FIX: use pre-calculated doctorEarning from visit objects
            doctorShare = parseFloat(monthVisits.reduce((s, v) => s + (v.doctorEarning || 0), 0).toFixed(2));
            doctorShareDetails = {
                doctorId: linkedDoctor.id, doctorName: linkedDoctor.name,
                visits: monthVisits.length, percentage: linkedDoctor.percentage, amount: doctorShare
            };
        }

        const netSalary = emp.salary - totalDeduction + tasksBonus + doctorShare;
        salaries.push({
            id: 'sal-' + Date.now() + '-' + emp.id, employeeId: emp.id, employeeName: emp.fullName,
            month: cm, year: cy, monthName: now.toLocaleString('ar-EG', { month: 'long' }),
            baseSalary: emp.salary, attendanceDays, absenceDays, deductions: totalDeduction,
            bonuses: tasksBonus, doctorShare, doctorShareDetails, netSalary: parseFloat(netSalary.toFixed(2)),
            status: 'pending', paidAt: null,
            notes: `أيام الحضور: ${attendanceDays} من ${daysInMonth}` + (doctorShare > 0 ? ` | نصيب طبيب: ${doctorShare} ج.م` : ''),
            createdAt: new Date().toISOString()
        });
        count++;
    });
    saveAllData(); loadSalaries();
    showToast(count > 0 ? `✅ تم حساب مرتبات ${count} موظف` : 'جميع المرتبات محسوبة لهذا الشهر', count > 0 ? 'success' : 'info');
}

function loadSalaries() {
    const tbody = document.querySelector('#salaries-table tbody');
    if (!tbody) return;
    if (!salaries.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;">لا توجد مرتبات محسوبة بعد</td></tr>'; return; }
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const sorted = [...salaries].sort((a, b) => b.year !== a.year ? b.year - a.year : b.month !== a.month ? b.month - a.month : a.employeeName.localeCompare(b.employeeName));
    tbody.innerHTML = sorted.map(s => {
        const sCls = s.status === 'paid' ? 'status-ok' : 'expiry-warning';
        const sText = s.status === 'paid' ? 'مدفوع' : 'معلق';
        const mName = s.monthName || months[s.month] || `شهر ${s.month + 1}`;
        const docRow = s.doctorShare > 0 ? `<td style="color:#27ae60;">+ ${s.doctorShare.toFixed(2)} ج.م</td>` : '<td>---</td>';
        return `<tr>
            <td><strong>${s.employeeName}</strong></td><td>${mName} ${s.year}</td>
            <td>${s.baseSalary.toLocaleString()} ج.م</td><td>${s.attendanceDays} يوم</td>
            ${docRow}<td><strong>${s.netSalary.toLocaleString()} ج.م</strong></td>
            <td class="${sCls}">${sText}</td>
            <td>${s.status === 'pending'
                ? `<button onclick="paySalary('${s.id}')" class="btn-stock-plus">💰 دفع</button>`
                : `<button onclick="viewSalaryReceipt('${s.id}')" class="btn-stock-plus">🧾 عرض</button>`}
            <button onclick="deleteSalary('${s.id}')" class="btn-stock-del">🗑️</button></td></tr>`;
    }).join('');
}

function paySalary(salaryId) {
    const s = salaries.find(s => s.id === salaryId);
    if (!s) return;
    s.status = 'paid'; s.paidAt = new Date().toISOString();
    saveAllData(); loadSalaries(); showToast(`✅ تم دفع مرتب ${s.employeeName}`);
}

function viewSalaryReceipt(salaryId) {
    const s = salaries.find(s => s.id === salaryId);
    if (!s) return;
    const win = window.open('', '_blank', 'width=620,height=720,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }
    const docRow = s.doctorShare > 0 ? `<div class="row"><span>نصيب الطبيب من الكشوفات</span>
        <span class="bonus">+ ${s.doctorShare.toFixed(2)} ج.م ${s.doctorShareDetails ? `<small>(${s.doctorShareDetails.visits} كشف × ${s.doctorShareDetails.percentage}%)</small>` : ''}</span></div>` : '';
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <title>إيصال مرتب - ${s.employeeName}</title>
        <style>body{font-family:Arial,sans-serif;margin:0;padding:30px;background:#fff;}
        .header{text-align:center;border-bottom:3px solid #2c3e50;padding-bottom:15px;margin-bottom:20px;}
        .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;font-size:15px;}
        .row span:last-child{font-weight:bold;}.deduct{color:#e74c3c;}.bonus{color:#27ae60;}
        .total-row{display:flex;justify-content:space-between;padding:15px 0;font-size:18px;font-weight:bold;border-top:3px solid #2c3e50;margin-top:10px;}
        .total-row span:last-child{color:#27ae60;}.btn{display:block;margin:20px auto;padding:10px 30px;background:#3498db;color:#fff;border:none;border-radius:6px;font-size:15px;cursor:pointer;}
        @media print{.btn{display:none;}}</style></head><body>
        <div class="header"><h2>🏥 إيصال صرف مرتب</h2><p>رقم: SAL-${s.id.slice(-6).toUpperCase()}</p></div>
        <div class="row"><span>اسم الموظف</span><span>${s.employeeName}</span></div>
        <div class="row"><span>الشهر</span><span>${s.monthName || ''} ${s.year}</span></div>
        <div class="row"><span>المرتب الأساسي</span><span>${s.baseSalary.toLocaleString()} ج.م</span></div>
        <div class="row"><span>أيام الحضور</span><span>${s.attendanceDays} يوم</span></div>
        <div class="row"><span>أيام الغياب</span><span>${s.absenceDays} يوم</span></div>
        <div class="row"><span>الخصومات</span><span class="deduct">- ${(s.deductions || 0).toFixed(2)} ج.م</span></div>
        <div class="row"><span>مكافأة المهام</span><span class="bonus">+ ${(s.bonuses || 0).toFixed(2)} ج.م</span></div>
        ${docRow}
        <div class="total-row"><span>صافي المرتب</span><span>${(s.netSalary || 0).toFixed(2)} ج.م</span></div>
        <div class="row"><span>تاريخ الصرف</span><span>${s.paidAt ? new Date(s.paidAt).toLocaleDateString('ar-EG') : '---'}</span></div>
        ${s.notes ? `<div class="row"><span>ملاحظات</span><span>${s.notes}</span></div>` : ''}
        <button class="btn" onclick="window.print()">🖨️ طباعة</button></body></html>`);
    win.document.close();
}

function deleteSalary(id) {
    salaries = salaries.filter(s => s.id !== id);
    saveAllData(); loadSalaries(); showToast('تم حذف المرتب', 'info');
}

// ========== 28. EMPLOYEE PERFORMANCE REPORTS — FIX: no undefined var ==========
function loadEmployeeReports(filter = 'all') {
    setElementText('total-employees-report', employees.filter(e => e.isActive).length);
    setElementText('today-attendance-report', attendance.filter(a => a.date === getTodayDate() && a.checkIn).length);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    setElementText('completed-tasks-report', completedTasks);
    setElementText('completion-rate', tasks.length ? Math.round(completedTasks / tasks.length * 100) + '%' : '0%');
    loadEmployeePerformanceTable(filter);
}

// FIX: Completely rewritten — removed undefined performanceArray references
function loadEmployeePerformanceTable(filter = 'all') {
    const tbody = document.querySelector('#employee-performance-table tbody');
    if (!tbody) return;

    const activeEmployees = employees.filter(e => e.isActive);
    if (!activeEmployees.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;">لا يوجد موظفون نشطون حالياً</td></tr>';
        return;
    }

    const now = new Date(); const cm = now.getMonth(); const cy = now.getFullYear();

    // Build data array
    let data = activeEmployees.map(emp => {
        const attDays = attendance.filter(a => {
            if (a.employeeId !== emp.id) return false;
            const d = new Date(a.date);
            return d.getMonth() === cm && d.getFullYear() === cy && a.checkIn;
        }).length;

        const empTasks = tasks.filter(t => t.assignedTo === emp.id);
        const tasksComp = empTasks.filter(t => t.status === 'completed').length;
        const taskRate = empTasks.length ? Math.round(tasksComp / empTasks.length * 100) : 0;

        // FIX: Use pre-calculated doctorEarning from visit objects for sales
        const salesTotal = invoices.filter(i => {
            if (!i.doctorId && !i.employeeId) return false;
            const iDate = new Date(i.date);
            return (i.doctorId === emp.id || i.employeeId === emp.id) &&
                iDate.getMonth() === cm && iDate.getFullYear() === cy;
        }).reduce((s, i) => s + (parseFloat(i.total) || 0), 0);

        const score = attDays * 5 + tasksComp * 10;
        const level = score > 200 ? 'ممتاز' : score > 100 ? 'جيد جداً' : score > 50 ? 'جيد' : 'مقبول';
        const cls = score > 100 ? 'status-ok' : score > 50 ? 'expiry-warning' : 'status-low';

        return { emp, attDays, tasksComp, empTasks: empTasks.length, taskRate, salesTotal, score, level, cls };
    });

    // FIX: Sort by filter without undefined variable
    if (filter === 'attendance') data.sort((a, b) => b.attDays - a.attDays);
    if (filter === 'tasks') data.sort((a, b) => b.taskRate - a.taskRate);
    if (filter === 'top') data = data.sort((a, b) => b.score - a.score).slice(0, 5);

    tbody.innerHTML = data.map(d => `
        <tr>
            <td><strong>${d.emp.fullName}</strong></td>
            <td>${d.emp.position || d.emp.role || 'موظف'}</td>
            <td>${d.attDays} يوم</td>
            <td>${d.tasksComp} / ${d.empTasks}</td>
            <td>${d.taskRate}%</td>
            <td>${d.salesTotal.toLocaleString()} ج.م</td>
            <td class="${d.cls}">${d.level}</td>
            <td><button onclick="viewEmployeeDetails('${d.emp.id}')" class="btn-stock-plus">تفاصيل</button></td>
        </tr>`).join('');

    // Also update performanceLogs for all employees (sync)
    data.forEach(d => {
        let log = performanceLogs.find(p => p.employeeId === d.emp.id && p.month === cm && p.year === cy);
        if (!log) {
            log = {
                id: 'perf-' + d.emp.id + '-' + Date.now(), employeeId: d.emp.id,
                employeeName: d.emp.fullName, jobTitle: d.emp.position || d.emp.role,
                department: d.emp.department || 'عام', hireDate: d.emp.hireDate,
                month: cm, year: cy, createdAt: now.toISOString()
            };
            performanceLogs.push(log);
        }
        log.attendanceDays = d.attDays;
        log.tasksAssigned = d.empTasks;
        log.tasksCompleted = d.tasksComp;
        log.completionRate = d.taskRate;
        log.salesTotal = d.salesTotal;
        log.performanceLevel = d.level;
        log.lastUpdated = now.toISOString();
    });
}

function viewEmployeeDetails(employeeId) {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;
    const now = new Date(); const cm = now.getMonth(); const cy = now.getFullYear();
    const attList = attendance.filter(a => { const d = new Date(a.date); return a.employeeId === emp.id && d.getMonth() === cm && d.getFullYear() === cy; });
    const empTasks = tasks.filter(t => t.assignedTo === emp.id);
    const completed = empTasks.filter(t => t.status === 'completed').length;
    const empSalaries = salaries.filter(s => s.employeeId === emp.id);
    const lastSalary = empSalaries.sort((a, b) => b.year - a.year || b.month - a.month)[0];
    const rNames = { admin: 'مدير', manager: 'مدير تنفيذي', doctor: 'طبيب', receptionist: 'استقبال', accountant: 'محاسب' };
    const win = window.open('', '_blank', 'width=650,height=750,scrollbars=yes');
    if (!win) { showToast('الرجاء السماح بالنوافذ المنبثقة', 'warning'); return; }
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8">
        <title>تفاصيل الموظف - ${emp.fullName}</title>
        <style>body{font-family:Arial,sans-serif;margin:0;padding:25px;background:#f5f7fa;}
        .card{background:#fff;border-radius:12px;padding:20px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
        h3{color:#3498db;border-bottom:2px solid #eee;padding-bottom:8px;}
        .badge{display:inline-block;padding:4px 12px;border-radius:20px;background:#e8f5e9;color:#27ae60;}
        .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;}
        .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .stat-box{background:#f8f9fa;border-radius:8px;padding:15px;text-align:center;}
        .stat-box .num{font-size:28px;font-weight:bold;color:#3498db;}.stat-box small{color:#888;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        th,td{padding:8px;border:1px solid #eee;text-align:right;}th{background:#f5f7fa;}
        .btn{display:inline-block;margin-top:15px;padding:8px 20px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;}
        @media print{.btn{display:none;}}</style></head><body>
        <div class="card"><h2>👤 ${emp.fullName}</h2><span class="badge">${rNames[emp.role] || emp.role}</span>
            <div class="row" style="margin-top:12px;"><span>الوظيفة</span><strong>${emp.position || '---'}</strong></div>
            <div class="row"><span>القسم</span><strong>${emp.department || '---'}</strong></div>
            <div class="row"><span>البريد</span><strong>${emp.email || '---'}</strong></div>
            <div class="row"><span>الهاتف</span><strong>${emp.phone || '---'}</strong></div>
            <div class="row"><span>تاريخ التعيين</span><strong>${emp.hireDate || '---'}</strong></div>
            <div class="row"><span>المرتب الأساسي</span><strong>${(emp.salary || 0).toLocaleString()} ج.م</strong></div>
            <div class="row"><span>آخر دخول</span><strong>${emp.lastLogin ? new Date(emp.lastLogin).toLocaleString('ar-EG') : 'لم يسجل'}</strong></div></div>
        <div class="card"><h3>📊 إحصائيات الشهر الحالي</h3>
            <div class="stat-grid">
                <div class="stat-box"><div class="num">${attList.length}</div><small>أيام الحضور</small></div>
                <div class="stat-box"><div class="num">${completed}</div><small>مهام مكتملة</small></div>
                <div class="stat-box"><div class="num">${empTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}</div><small>مهام معلقة</small></div>
                <div class="stat-box"><div class="num">${empTasks.length}</div><small>إجمالي المهام</small></div>
            </div></div>
        ${attList.length ? `<div class="card"><h3>📅 سجل الحضور</h3><table>
            <tr><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>الحالة</th></tr>
            ${attList.slice(-10).reverse().map(a => `<tr><td>${a.date}</td><td>${a.checkIn || '---'}</td><td>${a.checkOut || '---'}</td>
                <td>${a.checkOut ? '✅ مكتمل' : '⏳ لم ينصرف'}</td></tr>`).join('')}
            </table></div>`: ''}
        ${lastSalary ? `<div class="card"><h3>💰 آخر مرتب</h3>
            <div class="row"><span>الشهر</span><strong>${lastSalary.monthName || ''} ${lastSalary.year}</strong></div>
            <div class="row"><span>صافي المرتب</span><strong>${(lastSalary.netSalary || 0).toFixed(2)} ج.م</strong></div>
            <div class="row"><span>الحالة</span><strong>${lastSalary.status === 'paid' ? '✅ مدفوع' : '⏳ معلق'}</strong></div></div>` : ''}
        <button class="btn" onclick="window.print()">🖨️ طباعة</button></body></html>`);
    win.document.close();
}

function exportEmployeeReport() {
    let csv = '\uFEFFالموظف,الوظيفة,القسم,أيام الحضور,المهام المكتملة,معدل الأداء,إجمالي المرتبات\n';
    employees.filter(e => e.isActive).forEach(emp => {
        const att = attendance.filter(a => a.employeeId === emp.id).length;
        const tsk = tasks.filter(t => t.assignedTo === emp.id);
        const comp = tsk.filter(t => t.status === 'completed').length;
        const rate = tsk.length ? Math.round(comp / tsk.length * 100) : 0;
        const totalSal = salaries.filter(s => s.employeeId === emp.id && s.status === 'paid').reduce((s, sal) => s + sal.netSalary, 0);
        csv += `${emp.fullName},${emp.position || emp.role},${emp.department || 'عام'},${att},${comp},${rate}%,${totalSal}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `تقرير_أداء_الموظفين_${getTodayDate()}.csv`; link.click();
    showToast('✅ تم تصدير التقرير');
}

// ========== 29. SEGMENTS ==========
function openSegmentModal() {
    document.getElementById('segment-conditions').innerHTML = '';
    addSegmentCondition(); updateSegmentCount();
    document.getElementById('segmentModal').style.display = 'block';
}

function addSegmentCondition() {
    const container = document.getElementById('segment-conditions');
    const div = document.createElement('div');
    div.className = 'condition-row';
    div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    div.innerHTML = `
        <select class="condition-field" style="flex:2;padding:6px;" onchange="updateSegmentCount()">
            <option value="age">السن</option><option value="gender">النوع</option>
            <option value="chronic">مرض مزمن</option><option value="visitCount">عدد الزيارات</option>
            <option value="lastVisit">آخر زيارة (أيام)</option><option value="city">المدينة</option>
        </select>
        <select class="condition-operator" style="flex:1;padding:6px;" onchange="updateSegmentCount()">
            <option value="=">=</option><option value=">">></option><option value="<"><</option>
            <option value=">=">≥</option><option value="<=">≤</option><option value="!=">≠</option>
            <option value="contains">يحتوي</option>
        </select>
        <input type="text" class="condition-value" placeholder="القيمة" style="flex:2;padding:6px;" onkeyup="updateSegmentCount()">
        <button onclick="this.parentElement.remove();updateSegmentCount();" class="btn-stock-del" style="padding:6px;">🗑️</button>`;
    container.appendChild(div);
}

function updateSegmentCount() {
    const conditions = [];
    document.querySelectorAll('.condition-row').forEach(row => {
        const field = row.querySelector('.condition-field')?.value;
        const operator = row.querySelector('.condition-operator')?.value;
        const value = row.querySelector('.condition-value')?.value;
        if (field && operator && value) conditions.push({ field, operator, value });
    });
    setElementText('segment-count', calculateSegmentCount(conditions));
}

function calculateSegmentCount(conditions) {
    if (!conditions || !conditions.length) return patients.length;
    return patients.filter(p => conditions.every(cond => {
        switch (cond.field) {
            case 'age': return evaluateCondition(p.age || 0, cond.operator, parseFloat(cond.value));
            case 'gender': return evaluateCondition(p.gender || '', cond.operator, cond.value);
            case 'chronic': return evaluateCondition(p.chronic && p.chronic !== 'لا يوجد' && p.chronic !== '', cond.operator, cond.value === 'true');
            case 'visitCount': return evaluateCondition(visits.filter(v => v.patient_id === p.id).length, cond.operator, parseFloat(cond.value));
            case 'lastVisit': {
                const last = visits.filter(v => v.patient_id === p.id).sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))[0];
                if (!last) return cond.operator === '=' && cond.value === '0';
                return evaluateCondition(Math.floor((new Date() - new Date(last.visit_date)) / (1000 * 60 * 60 * 24)), cond.operator, parseFloat(cond.value));
            }
            case 'city': return evaluateCondition(p.city || '', cond.operator, cond.value);
            default: return true;
        }
    })).length;
}

function evaluateCondition(value, operator, target) {
    switch (operator) {
        case '=': return value == target; case '>': return value > target;
        case '<': return value < target; case '>=': return value >= target;
        case '<=': return value <= target; case '!=': return value != target;
        case 'contains': return String(value).toLowerCase().includes(String(target).toLowerCase());
        default: return true;
    }
}

function saveSegment() {
    const name = document.getElementById('segment-name').value.trim();
    if (!name) { showToast('اسم الفئة مطلوب', 'warning'); return; }
    const conditions = [];
    document.querySelectorAll('.condition-row').forEach(row => {
        const field = row.querySelector('.condition-field')?.value;
        const operator = row.querySelector('.condition-operator')?.value;
        const value = row.querySelector('.condition-value')?.value;
        if (field && operator && value) conditions.push({ field, operator, value });
    });
    if (!conditions.length) { showToast('أضف شرط واحد على الأقل', 'warning'); return; }
    patientSegments.push({
        id: 'seg-' + Date.now(), name, conditions,
        patientCount: calculateSegmentCount(conditions),
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    saveAllData(); loadSegments(); closeModal(); showToast('✅ تم إنشاء الفئة');
}

function loadSegments() {
    const tbody = document.querySelector('#segments-table tbody');
    if (!tbody) return;
    if (!patientSegments.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد فئات مرضى</td></tr>'; return; }
    const chronicCount = patients.filter(p => p.chronic && p.chronic !== 'لا يوجد' && p.chronic !== '').length;
    const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthlyVisitors = new Set(visits.filter(v => new Date(v.visit_date) > lastMonth).map(v => v.patient_id)).size;
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const lapsedCount = patients.filter(p => {
        const last = visits.filter(v => v.patient_id === p.id).sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))[0];
        return !last || new Date(last.visit_date) < sixMonthsAgo;
    }).length;
    setElementText('total-patients-segment', patients.length);
    setElementText('chronic-patients', chronicCount);
    setElementText('monthly-visitors', monthlyVisitors);
    setElementText('lapsed-patients', lapsedCount);
    tbody.innerHTML = [...patientSegments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(s => `
        <tr><td><strong>${s.name}</strong></td><td>${s.conditions ? s.conditions.length + ' شرط' : 'مخصص'}</td>
        <td>${s.patientCount || 0}</td><td>${s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('ar-EG') : '---'}</td>
        <td><button onclick="deleteSegment('${s.id}')" class="btn-stock-del">🗑️</button></td></tr>`).join('');
}

function deleteSegment(id) {
    patientSegments = patientSegments.filter(s => s.id !== id);
    saveAllData(); loadSegments(); showToast('تم حذف الفئة', 'info');
}

// ========== 30. MESSAGE TEMPLATES ==========
function openMessageTemplateModal() { document.getElementById('messageTemplateModal').style.display = 'block'; }

function insertVariable(variable) {
    const content = document.getElementById('template-content');
    const start = content.selectionStart; const end = content.selectionEnd;
    content.value = content.value.substring(0, start) + variable + content.value.substring(end);
    content.focus(); content.selectionStart = content.selectionEnd = start + variable.length;
}

function saveMessageTemplate() {
    const name = document.getElementById('template-name').value.trim();
    const type = document.getElementById('template-type').value;
    const subject = document.getElementById('template-subject').value.trim();
    const content = document.getElementById('template-content').value.trim();
    if (!name || !content) { showToast('اسم القالب والمحتوى مطلوبان', 'warning'); return; }
    const variables = [...content.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
    messageTemplates.push({
        id: 'temp-' + Date.now(), name, type, subject, content,
        variables: [...new Set(variables)], usageCount: 0, createdAt: new Date().toISOString()
    });
    saveAllData(); loadMessageTemplates(); closeModal(); showToast('✅ تم حفظ القالب');
}

function loadMessageTemplates() {
    const tbody = document.querySelector('#message-templates-table tbody');
    if (!tbody) return;
    if (!messageTemplates.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد قوالب رسائل</td></tr>'; return; }
    const tNames = { reminder: 'تذكير', birthday: 'تهنئة بعيد ميلاد', followup: 'متابعة', promotion: 'ترويجي', greeting: 'تهنئة' };
    tbody.innerHTML = [...messageTemplates].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => `
        <tr><td><strong>${t.name}</strong></td><td>${tNames[t.type] || t.type}</td>
        <td>${t.content.substring(0, 50)}${t.content.length > 50 ? '...' : ''}</td><td>${t.usageCount || 0}</td>
        <td><button onclick="deleteMessageTemplate('${t.id}')" class="btn-stock-del">🗑️</button></td></tr>`).join('');
    setElementText('templates-count', messageTemplates.length);
}

function deleteMessageTemplate(id) {
    messageTemplates = messageTemplates.filter(t => t.id !== id);
    saveAllData(); loadMessageTemplates(); showToast('تم حذف القالب', 'info');
}