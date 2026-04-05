// نظام إدارة العيادة — دوال 31–53
// 📲 PATIENT COMMUNICATIONS GATEWAY — WhatsApp / SMS via MESSAGING_CONFIG
// ✅ مُحدَّث: Issue #8 (Real-Time Notifications) | #10 #13 (Messaging) | #12 (AI Reports) | #19 (Performance)

// ─────────────────────────────────────────────────────────────────────────────
// ثوابت التكوين الرئيسية
// ─────────────────────────────────────────────────────────────────────────────

const MESSAGING_CONFIG = {
    enabled: true,
    provider: 'whatsapp_cloud',   // 'whatsapp_cloud' | 'twilio' | 'egypts_sms'
    whatsappToken: 'YOUR_WHATSAPP_TOKEN',
    whatsappPhoneId: 'YOUR_PHONE_NUMBER_ID',
    whatsappApiUrl: 'https://graph.facebook.com/v19.0',
    twilioSid: 'YOUR_TWILIO_SID',
    twilioToken: 'YOUR_TWILIO_TOKEN',
    twilioFrom: '+1XXXXXXXXXX',
    smsApiUrl: 'https://sms-gateway.example.com/send',
    smsApiKey: 'YOUR_SMS_API_KEY',
    smsSenderId: 'CLINIC',
    rateLimitMs: 1000,
    maxRetries: 2,
    birthdayHour: 9,
    followupDays: [1, 3, 7],
};

const CONFIG = {
    MSG_LOG_MAX: 500,
    ALERT_LOG_MAX: 200,
    NOTIFICATION_MAX: 300,
    PERF_SNAPSHOT_HOUR: 23,
    PERF_SNAPSHOT_MIN: 55,
    DASHBOARD_INTERVAL_MS: 60_000,
    NOTIFICATION_CHECK_MS: 600_000,
    BADGE_REFRESH_MS: 30_000,
    CLEANUP_INTERVAL_MS: 86_400_000,
    MSG_CHECKER_MS: 60_000,
    BIRTHDAY_CHECKER_MS: 3_600_000,
    // Issue #12: AI Reports
    AI_REPORT_MODEL: 'gpt-4o',
    AI_REPORT_API_URL: 'https://api.openai.com/v1/chat/completions',
    AI_REPORT_API_KEY: 'YOUR_OPENAI_API_KEY',
    // Issue #19: Performance batch size for log processing
    PERF_BATCH_SIZE: 50,
};

// ─────────────────────────────────────────────────────────────────────────────
// Issue #8 — NotificationBus: نظام التنبيهات في الوقت الفعلي
// يدعم الاستماع المحلي + WebSocket + Firebase Cloud Messaging (FCM)
// ─────────────────────────────────────────────────────────────────────────────

const NotificationBus = (() => {
    /** @type {Map<string, Set<Function>>} */
    const _listeners = new Map();
    let _wsConnection = null;
    let _fcmToken = null;

    /**
     * الاشتراك في حدث معين أو جميع الأحداث ('*')
     * @param {string} eventType  - نوع الحدث مثل 'low_stock' أو '*'
     * @param {Function} callback - الدالة المُستدعاة عند وقوع الحدث
     * @returns {Function} دالة لإلغاء الاشتراك
     */
    function on(eventType, callback) {
        if (!_listeners.has(eventType)) _listeners.set(eventType, new Set());
        _listeners.get(eventType).add(callback);
        return () => off(eventType, callback);
    }

    /** إلغاء اشتراك مستمع */
    function off(eventType, callback) {
        _listeners.get(eventType)?.delete(callback);
    }

    /**
     * إرسال حدث لجميع المشتركين + WebSocket + FCM
     * يُستدعى تلقائياً من triggerNotification()
     * @param {Object} notification - كائن التنبيه الكامل
     */
    function dispatch(notification) {
        // 1) المستمعون المحليون للنوع المحدد
        _listeners.get(notification.type)?.forEach(cb => { try { cb(notification); } catch (e) { } });
        // 2) المستمعون العامون '*'
        _listeners.get('*')?.forEach(cb => { try { cb(notification); } catch (e) { } });
        // 3) WebSocket (إن كان متصلاً)
        _sendViaWebSocket(notification);
        // 4) Firebase Cloud Messaging (إن كان مهيأً)
        _sendViaFCM(notification);
    }

    /**
     * تهيئة اتصال WebSocket للتحديثات الفورية
     * استبدل 'wss://your-server.com/ws' بعنوان السيرفر الفعلي
     * @param {string} wsUrl
     */
    function connectWebSocket(wsUrl = 'wss://your-clinic-server.com/ws/notifications') {
        try {
            if (typeof WebSocket === 'undefined') return;
            _wsConnection = new WebSocket(wsUrl);
            _wsConnection.onopen = () => console.info('[NotificationBus] ✅ WebSocket connected');
            _wsConnection.onclose = () => {
                console.warn('[NotificationBus] WebSocket closed. Reconnecting in 5s...');
                setTimeout(() => connectWebSocket(wsUrl), 5000);
            };
            _wsConnection.onerror = (e) => console.error('[NotificationBus] WebSocket error:', e);
            _wsConnection.onmessage = (evt) => {
                try {
                    const incoming = JSON.parse(evt.data);
                    if (incoming?.type) dispatch(incoming);
                } catch (e) { }
            };
        } catch (e) {
            console.warn('[NotificationBus] WebSocket unavailable:', e.message);
        }
    }

    /**
     * تخزين رمز FCM وتهيئة الاستماع للرسائل الواردة
     * @param {string} token - رمز جهاز FCM
     */
    function registerFCM(token) {
        _fcmToken = token;
        console.info('[NotificationBus] FCM registered:', token?.substring(0, 20) + '...');
        // عند وصول رسالة FCM في الخلفية، استدعِ: NotificationBus.dispatch(payload)
    }

    function _sendViaWebSocket(notification) {
        if (!_wsConnection || _wsConnection.readyState !== WebSocket.OPEN) return;
        try {
            _wsConnection.send(JSON.stringify({
                channel: 'clinic_notification',
                payload: notification,
            }));
        } catch (e) { }
    }

    async function _sendViaFCM(notification) {
        if (!_fcmToken) return;
        // تكامل FCM عبر Firebase Admin SDK أو REST API
        // هذا placeholder — يُفعَّل عند ربط Firebase
        console.debug('[NotificationBus] FCM dispatch ready for:', notification.type);
    }

    return { on, off, dispatch, connectWebSocket, registerFCM };
})();

// ─────────────────────────────────────────────────────────────────────────────
// Issues #10 & #13 — MessagingGateway: WhatsApp Cloud API + SMS
// ─────────────────────────────────────────────────────────────────────────────

const MessagingGateway = (() => {
    let _lastSendTime = 0;

    // ── تطبيع أرقام الهاتف المصرية ──────────────────────────────────────────

    function _normalisePhone(raw = '') {
        let phone = raw.replace(/[\s\-().]/g, '');
        if (phone.startsWith('0') && phone.length === 11) phone = '+2' + phone;
        if (!phone.startsWith('+')) phone = '+2' + phone;
        return phone;
    }

    // ── Rate Limiter ─────────────────────────────────────────────────────────

    async function _throttle() {
        const now = Date.now();
        const wait = MESSAGING_CONFIG.rateLimitMs - (now - _lastSendTime);
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
        _lastSendTime = Date.now();
    }

    // ── مزودو الإرسال ────────────────────────────────────────────────────────

    /** Issue #10 — WhatsApp Cloud API */
    async function _sendViaWhatsAppCloud(phone, message) {
        const url = `${MESSAGING_CONFIG.whatsappApiUrl}/${MESSAGING_CONFIG.whatsappPhoneId}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { preview_url: false, body: message },
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MESSAGING_CONFIG.whatsappToken}`,
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`WhatsApp API ${res.status}: ${err}`);
        }
        return await res.json();
    }

    /** Issue #13 — Twilio SMS */
    async function _sendViaTwilio(phone, message) {
        const credentials = btoa(`${MESSAGING_CONFIG.twilioSid}:${MESSAGING_CONFIG.twilioToken}`);
        const body = new URLSearchParams({
            To: phone,
            From: MESSAGING_CONFIG.twilioFrom,
            Body: message,
        });
        const res = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${MESSAGING_CONFIG.twilioSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body,
            }
        );
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Twilio API ${res.status}: ${err}`);
        }
        return await res.json();
    }

    /** Issue #13 — Egypt SMS Gateway */
    async function _sendViaEgyptSms(phone, message) {
        const res = await fetch(MESSAGING_CONFIG.smsApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': MESSAGING_CONFIG.smsApiKey,
            },
            body: JSON.stringify({
                sender_id: MESSAGING_CONFIG.smsSenderId,
                to: phone,
                message,
            }),
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Egypt SMS API ${res.status}: ${err}`);
        }
        return await res.json();
    }

    // ── منطق الإرسال مع إعادة المحاولة ──────────────────────────────────────

    async function _send(phone, message, retries = MESSAGING_CONFIG.maxRetries) {
        await _throttle();
        try {
            switch (MESSAGING_CONFIG.provider) {
                case 'whatsapp_cloud': return await _sendViaWhatsAppCloud(phone, message);
                case 'twilio': return await _sendViaTwilio(phone, message);
                case 'egypts_sms': return await _sendViaEgyptSms(phone, message);
                default: throw new Error(`Unknown provider: ${MESSAGING_CONFIG.provider}`);
            }
        } catch (err) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 3000));
                return _send(phone, message, retries - 1);
            }
            throw err;
        }
    }

    // ── الدالة العامة للإرسال ────────────────────────────────────────────────

    async function send(rawPhone, message, logType = 'manual', patientName = '') {
        const phone = _normalisePhone(rawPhone);

        if (!MESSAGING_CONFIG.enabled) {
            console.info(`[Messaging] 📲 [DRY-RUN] → ${phone}\n${message}`);
            _logMessage({ type: logType, phone, patientName, message, status: 'dry_run' });
            return { success: true, provider: 'dry_run', phone };
        }

        try {
            await _send(phone, message);
            _logMessage({ type: logType, phone, patientName, message, status: 'sent' });
            return { success: true, provider: MESSAGING_CONFIG.provider, phone };
        } catch (err) {
            console.error(`[Messaging] ❌ Failed → ${phone}:`, err.message);
            _logMessage({ type: logType, phone, patientName, message, status: 'failed', error: err.message });
            return { success: false, provider: MESSAGING_CONFIG.provider, phone, error: err.message };
        }
    }

    // ── الإرسال الجماعي مع Issue #19: معالجة دفعيّة ────────────────────────

    /**
     * إرسال جماعي مع تقطيع الدفعات لحماية الأداء (Issue #19)
     * @param {Array}    recipients  - [{phone, name}]
     * @param {Function} templateFn  - دالة تُنشئ نص الرسالة من الاسم
     * @param {string}   logType
     */
    async function broadcast(recipients, templateFn, logType) {
        const results = [];
        const batches = _chunkArray(recipients.filter(r => r.phone), CONFIG.PERF_BATCH_SIZE);

        for (const batch of batches) {
            const batchResults = await Promise.allSettled(
                batch.map(r => {
                    const msg = templateFn(r.name || 'عزيزنا');
                    return send(r.phone, msg, logType, r.name);
                })
            );
            batchResults.forEach(res => {
                results.push(res.status === 'fulfilled' ? res.value : { success: false, error: res.reason?.message });
            });
            // فترة راحة بين الدفعات لحماية الـ Rate Limit
            if (batches.length > 1) await new Promise(r => setTimeout(r, MESSAGING_CONFIG.rateLimitMs * batch.length));
        }
        return results;
    }

    // ── Issue #10: تذكيرات المواعيد (قابلة للاستدعاء من services.js) ────────

    /**
     * إرسال تذكير موعد لمريض واحد
     * يُستدعى من services.js عند حجز أو تأكيد موعد
     * @param {{ patient_name: string, patient_phone: string, time: string, date: string }} appointment
     * @param {string} [clinicName]
     * @returns {Promise<Object>}
     */
    async function sendAppointmentReminder(appointment, clinicName = 'عيادتنا') {
        if (!appointment?.patient_phone) return { success: false, error: 'no_phone' };

        const now = new Date();
        const [h, m] = (appointment.time || '00:00').split(':').map(Number);
        const aptTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        const minutesLeft = Math.max(0, Math.round((aptTime - now) / 60_000));

        const message =
            `مرحباً ${appointment.patient_name}،\n` +
            `نذكّرك بموعدك في ${clinicName} اليوم الساعة ${appointment.time}.\n` +
            `الموعد بعد ${minutesLeft} دقيقة تقريباً.\n` +
            `إذا كنت بحاجة للتأجيل، يُرجى الاتصال بنا مسبقاً.\n` +
            `شكراً لثقتك بنا. 🦷`;

        return send(appointment.patient_phone, message, 'reminder', appointment.patient_name);
    }

    /**
     * إرسال تهنئة عيد ميلاد لمريض واحد
     * يُستدعى من services.js أو من _checkBirthdays()
     * @param {{ name: string, phone: string }} patient
     * @param {string} [clinicName]
     * @returns {Promise<Object>}
     */
    async function sendBirthdayGreeting(patient, clinicName = 'عيادتنا') {
        if (!patient?.phone) return { success: false, error: 'no_phone' };

        const message =
            `🎂 عيد ميلاد سعيد يا ${patient.name}!\n` +
            `فريق ${clinicName} يتمنى لك عاماً صحياً مليئاً بالبسمات الجميلة. 😊\n` +
            `هديتنا لك: خصم 10% على زيارتك القادمة خلال شهرك هذا.`;

        return send(patient.phone, message, 'birthday', patient.name);
    }

    // ── سجل الرسائل الداخلي ──────────────────────────────────────────────────

    function _logMessage({ type, phone, patientName, message, status, error }) {
        if (typeof messageLog !== 'undefined' && typeof _appendMessageLog === 'function') {
            _appendMessageLog({
                type,
                phone,
                patientName,
                content: message.substring(0, 120),
                status,
                error: error || null,
                recipientsCount: 1,
            });
        }
    }

    return { send, broadcast, sendAppointmentReminder, sendBirthdayGreeting };
})();

// ─────────────────────────────────────────────────────────────────────────────
// Issue #12 — AI Smart Reports: تقارير ذكية بالذكاء الاصطناعي
// ─────────────────────────────────────────────────────────────────────────────

/**
 * جمع بيانات العيادة وإرسالها لـ OpenAI للحصول على تحليل ذكي
 * يُستدعى من زر "إنشاء تقرير AI" في لوحة التحكم
 * @param {{ period?: string, includeForecasts?: boolean }} [options]
 * @returns {Promise<{ success: boolean, report?: string, data?: Object, error?: string }>}
 */
async function generateAISmartReport(options = {}) {
    const { period = 'monthly', includeForecasts = true } = options;

    showToast('🤖 جاري تحليل بيانات العيادة...', 'info');

    try {
        // ── 1) جمع البيانات ──────────────────────────────────────────────────
        const clinicData = _gatherClinicSnapshot(period);

        // ── 2) بناء الـ Prompt ───────────────────────────────────────────────
        const systemPrompt =
            `أنت محلل بيانات متخصص في إدارة العيادات الطبية. ` +
            `ستُقدَّم لك بيانات عيادة خلال فترة ${period === 'monthly' ? 'شهر' : period}. ` +
            `قم بتحليل البيانات وتقديم: ` +
            `1) ملخص تنفيذي موجز. ` +
            `2) نقاط القوة الرئيسية. ` +
            `3) التحديات والمشاكل التي تستحق الانتباه. ` +
            (includeForecasts ? `4) توقعات للشهر القادم مع توصيات عملية. ` : '') +
            `أجب باللغة العربية، واستخدم أرقاماً وإحصاءات دقيقة من البيانات.`;

        const userPrompt =
            `بيانات العيادة — ${clinicData.periodLabel}:\n\n` +
            `💰 الإيرادات:\n` +
            `  • إجمالي الإيرادات: ${clinicData.revenue.total.toLocaleString()} ج.م\n` +
            `  • المدفوع: ${clinicData.revenue.paid.toLocaleString()} ج.م\n` +
            `  • المتبقي (غير محصَّل): ${clinicData.revenue.unpaid.toLocaleString()} ج.م\n` +
            `  • متوسط قيمة الفاتورة: ${clinicData.revenue.avgInvoice.toLocaleString()} ج.م\n\n` +
            `👥 المرضى:\n` +
            `  • إجمالي المرضى: ${clinicData.patients.total}\n` +
            `  • مرضى جدد هذه الفترة: ${clinicData.patients.newThisPeriod}\n` +
            `  • معدل العودة: ${clinicData.patients.returnRate}%\n\n` +
            `📅 المواعيد:\n` +
            `  • إجمالي المواعيد: ${clinicData.appointments.total}\n` +
            `  • المكتملة: ${clinicData.appointments.completed}\n` +
            `  • الملغاة أو الغياب: ${clinicData.appointments.cancelled}\n` +
            `  • معدل الإلغاء: ${clinicData.appointments.cancellationRate}%\n\n` +
            `📦 المخزون:\n` +
            `  • إجمالي الأصناف: ${clinicData.inventory.total}\n` +
            `  • أصناف منخفضة المخزون: ${clinicData.inventory.lowStock}\n` +
            `  • أصناف منتهية الصلاحية: ${clinicData.inventory.expired}\n\n` +
            `📲 التواصل مع المرضى:\n` +
            `  • رسائل مُرسَلة: ${clinicData.messaging.sent}\n` +
            `  • تهاني أعياد ميلاد: ${clinicData.messaging.birthdays}\n` +
            `  • تذكيرات متابعة: ${clinicData.messaging.followups}\n\n` +
            `🔔 التنبيهات النشطة:\n` +
            `  • فواتير غير مدفوعة: ${clinicData.alerts.unpaidInvoices}\n` +
            `  • نقص مخزون: ${clinicData.alerts.lowStock}\n`;

        // ── 3) استدعاء OpenAI API ────────────────────────────────────────────
        const res = await fetch(CONFIG.AI_REPORT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.AI_REPORT_API_KEY}`,
            },
            body: JSON.stringify({
                model: CONFIG.AI_REPORT_MODEL,
                max_tokens: 1500,
                temperature: 0.4,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
            }),
        });

        if (!res.ok) {
            const errBody = await res.text();
            throw new Error(`AI API ${res.status}: ${errBody}`);
        }

        const aiResponse = await res.json();
        const reportText = aiResponse.choices?.[0]?.message?.content || 'لم يتمكن النظام من توليد التقرير.';

        // ── 4) تسجيل التقرير ─────────────────────────────────────────────────
        _appendAIReportLog({
            period,
            generatedAt: new Date().toISOString(),
            dataSnapshot: clinicData,
            reportText,
        });

        showToast('✅ تم إنشاء التقرير الذكي بنجاح');
        return { success: true, report: reportText, data: clinicData };

    } catch (err) {
        console.error('[AI Report] ❌ Failed:', err.message);
        showToast('❌ فشل إنشاء التقرير: ' + err.message, 'error');
        return { success: false, error: err.message };
    }
}

/**
 * جمع snapshot لبيانات العيادة خلال فترة زمنية
 * Issue #19: يستخدم performanceArray لتقطيع البيانات الضخمة
 * @param {string} period - 'monthly' | 'weekly'
 * @returns {Object}
 */
function _gatherClinicSnapshot(period = 'monthly') {
    const now = new Date();
    const periodStart = new Date(now);
    let periodLabel = '';

    if (period === 'weekly') {
        periodStart.setDate(now.getDate() - 7);
        periodLabel = 'آخر 7 أيام';
    } else {
        periodStart.setMonth(now.getMonth() - 1);
        periodLabel = `شهر ${now.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}`;
    }

    const inPeriod = (dateStr) => dateStr && new Date(dateStr) >= periodStart;

    // Issue #19: معالجة دفعيّة للبيانات الكبيرة باستخدام performanceArray
    const safeInvoices = _safePerformanceSlice(typeof invoices !== 'undefined' ? invoices : []);
    const safeAppointments = _safePerformanceSlice(typeof appointments !== 'undefined' ? appointments : []);
    const safeMessageLog = _safePerformanceSlice(typeof messageLog !== 'undefined' ? messageLog : []);

    const periodInvoices = safeInvoices.filter(i => inPeriod(i.createdAt || i.date));
    const totalRevenue = periodInvoices.reduce((s, i) => s + (i.total || 0), 0);
    const paidRevenue = periodInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    const avgInvoice = periodInvoices.length ? Math.round(totalRevenue / periodInvoices.length) : 0;

    const safePatients = typeof patients !== 'undefined' ? patients : [];
    const newPatients = safePatients.filter(p => inPeriod(p.createdAt)).length;
    const returnVisits = safeAppointments.filter(a => inPeriod(a.date) && a.status === 'completed' && !inPeriod(
        safePatients.find(p => p.id === a.patient_id)?.createdAt
    )).length;
    const returnRate = safePatients.length ? Math.round(returnVisits / Math.max(periodInvoices.length, 1) * 100) : 0;

    const periodApts = safeAppointments.filter(a => inPeriod(a.date));
    const completedApts = periodApts.filter(a => a.status === 'completed').length;
    const cancelledApts = periodApts.filter(a => ['cancelled', 'no_show'].includes(a.status)).length;
    const cancellationRate = periodApts.length ? Math.round(cancelledApts / periodApts.length * 100) : 0;

    const safeInventory = typeof inventory !== 'undefined' ? inventory : [];
    const lowStockCount = safeInventory.filter(i => i?.quantity <= (i?.min_limit || 5)).length;
    const expiredCount = safeInventory.filter(i => i?.expiry_date && new Date(i.expiry_date) < now).length;

    const periodMsgs = safeMessageLog.filter(l => inPeriod(l.sentAt));
    const birthdayMsgs = periodMsgs.filter(l => l.type === 'birthday').length;
    const followupMsgs = periodMsgs.filter(l => l.type === 'followup').length;

    const safeNotifications = typeof notifications !== 'undefined' ? notifications : [];
    const unpaidAlerts = safeNotifications.filter(n => n.type === 'invoice_unpaid' && !n.read).length;
    const stockAlerts = safeNotifications.filter(n => n.type === 'low_stock' && !n.read).length;

    return {
        periodLabel,
        generatedAt: now.toISOString(),
        revenue: { total: totalRevenue, paid: paidRevenue, unpaid: unpaidRevenue, avgInvoice },
        patients: { total: safePatients.length, newThisPeriod: newPatients, returnRate },
        appointments: { total: periodApts.length, completed: completedApts, cancelled: cancelledApts, cancellationRate },
        inventory: { total: safeInventory.length, lowStock: lowStockCount, expired: expiredCount },
        messaging: { sent: periodMsgs.length, birthdays: birthdayMsgs, followups: followupMsgs },
        alerts: { unpaidInvoices: unpaidAlerts, lowStock: stockAlerts },
    };
}

/**
 * تسجيل التقارير الذكية مع حماية الذاكرة (Issue #19)
 */
function _appendAIReportLog(entry) {
    if (typeof aiReportLog === 'undefined') return;
    aiReportLog.push({ id: 'air-' + Date.now(), ...entry });
    if (aiReportLog.length > 50) aiReportLog = aiReportLog.slice(-50);
    if (typeof saveAllData === 'function') saveAllData();
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue #19 — Performance Helpers: أدوات الأداء والتقطيع الدفعي
// ─────────────────────────────────────────────────────────────────────────────

/**
 * يُرجع شريحة آمنة من المصفوفة بحد أقصى CONFIG.PERF_BATCH_SIZE * 10
 * لتجنب تكرار المعالجة على بيانات ضخمة جداً
 * @param {Array} arr
 * @returns {Array}
 */
function _safePerformanceSlice(arr) {
    if (!Array.isArray(arr)) return [];
    const MAX = CONFIG.PERF_BATCH_SIZE * 10;
    return arr.length > MAX ? arr.slice(-MAX) : arr;
}

/**
 * تقطيع مصفوفة إلى دفعات لمعالجة تدريجية
 * @param {Array}  arr
 * @param {number} size
 * @returns {Array[]}
 */
function _chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

/**
 * معالجة دفعيّة غير متزامنة لسجل الرسائل الكبير
 * تُستخدم عند تصدير أو تحليل سجلات ضخمة (Issue #19)
 * @param {Array}    items      - العناصر المراد معالجتها
 * @param {Function} processFn  - دالة المعالجة لكل عنصر
 * @param {number}   [batchSize]
 * @returns {Promise<Array>}
 */
async function processInBatches(items, processFn, batchSize = CONFIG.PERF_BATCH_SIZE) {
    const results = [];
    const chunks = _chunkArray(items, batchSize);
    for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(chunk.map(processFn));
        chunkResults.forEach(r => {
            if (r.status === 'fulfilled') results.push(r.value);
        });
        // إعطاء الـ event loop فرصة للتنفس بين الدفعات
        await new Promise(r => setTimeout(r, 0));
    }
    return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 31. الرسائل المجدولة ==========
// ─────────────────────────────────────────────────────────────────────────────

function openScheduledMessageModal() {
    const tmplSel = document.getElementById('scheduled-template');
    const segSel = document.getElementById('scheduled-segment');
    if (!tmplSel || !segSel) return;

    tmplSel.innerHTML =
        '<option value="">اختر قالب...</option>' +
        (messageTemplates.length
            ? messageTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
            : '<option disabled>لا توجد قوالب</option>');

    segSel.innerHTML =
        '<option value="">الفئة المستهدفة...</option>' +
        (patientSegments.length
            ? patientSegments.map(s => `<option value="${s.id}">${s.name}</option>`).join('')
            : '<option disabled>لا توجد فئات</option>');

    tmplSel.onchange = function () {
        const t = messageTemplates.find(t => t.id === this.value);
        const contentEl = document.getElementById('scheduled-content');
        if (t && contentEl) contentEl.value = t.content;
    };

    ['scheduled-type', 'scheduled-datetime', 'scheduled-condition',
        'scheduled-delay', 'scheduled-content'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

    const typeEl = document.getElementById('scheduled-type');
    if (typeEl) typeEl.value = 'single';
    document.getElementById('scheduledMessageModal').style.display = 'block';
}

function saveScheduledMessage() {
    const type = document.getElementById('scheduled-type')?.value;
    const templateId = document.getElementById('scheduled-template')?.value;
    const segmentId = document.getElementById('scheduled-segment')?.value;
    const datetime = document.getElementById('scheduled-datetime')?.value;
    const condition = document.getElementById('scheduled-condition')?.value.trim() || '';
    const delay = parseInt(document.getElementById('scheduled-delay')?.value) || 0;
    const content = document.getElementById('scheduled-content')?.value.trim() || '';

    if (!templateId || !segmentId) { showToast('اختر القالب والفئة', 'warning'); return; }
    if (type === 'single' && !datetime) { showToast('اختر تاريخ ووقت الإرسال', 'warning'); return; }

    const tmpl = messageTemplates.find(t => t.id === templateId);
    const seg = patientSegments.find(s => s.id === segmentId);

    scheduledMessages.push({
        id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        type, templateId,
        templateName: tmpl?.name,
        segmentId,
        segmentName: seg?.name,
        scheduledTime: datetime,
        condition, delay,
        content: content || tmpl?.content || '',
        status: 'pending',
        sentAt: null,
        createdAt: new Date().toISOString()
    });

    saveAllData();
    loadScheduledMessages();
    closeModal();
    showToast('✅ تم جدولة الرسالة');
    triggerNotification('message_scheduled', { templateName: tmpl?.name, scheduledTime: datetime });
}

function loadScheduledMessages() {
    const tbody = document.querySelector('#scheduled-table tbody');
    if (!tbody) return;

    if (!scheduledMessages.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد رسائل مجدولة</td></tr>';
        return;
    }

    const tNames = { single: 'مرة واحدة', daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري' };
    const sNames = { pending: 'في الانتظار', sent: 'تم الإرسال', failed: 'فشل' };
    const now = new Date();
    let changed = false;

    scheduledMessages.forEach(s => {
        if (s.status === 'pending' && s.scheduledTime && new Date(s.scheduledTime) < now) {
            s.status = 'sent';
            s.sentAt = new Date().toISOString();
            _appendMessageLog({
                type: 'scheduled',
                templateName: s.templateName,
                segmentName: s.segmentName,
                recipientsCount: patientSegments.find(sg => sg.id === s.segmentId)?.patientCount || 1,
                content: (s.content || '').substring(0, 100),
                status: 'sent',
                sentAt: s.sentAt
            });
            changed = true;
        }
    });

    tbody.innerHTML = [...scheduledMessages]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(s => `
            <tr>
                <td>${tNames[s.type] || s.type}</td>
                <td>${s.segmentName || 'كل المرضى'}</td>
                <td>${s.scheduledTime ? new Date(s.scheduledTime).toLocaleString('ar-EG') : 'فوري'}</td>
                <td class="${s.status === 'pending' ? 'expiry-warning' : s.status === 'sent' ? 'status-ok' : 'status-low'}">
                    ${sNames[s.status] || s.status}
                </td>
                <td>${s.sentAt ? new Date(s.sentAt).toLocaleString('ar-EG') : '---'}</td>
                <td>${s.status === 'pending'
                ? `<button onclick="cancelScheduledMessage('${s.id}')" class="btn-stock-del">إلغاء</button>`
                : ''}</td>
            </tr>`).join('');

    setElementText('scheduled-count', scheduledMessages.filter(s => s.status === 'pending').length);
    if (changed) saveAllData();
}

function cancelScheduledMessage(id) {
    scheduledMessages = scheduledMessages.filter(s => s.id !== id);
    saveAllData();
    loadScheduledMessages();
    showToast('تم إلغاء الرسالة', 'info');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 32. سجل الرسائل ==========
// ─────────────────────────────────────────────────────────────────────────────

/** مُلحِق مركزي للسجل مع حماية الحصة (Issue #19) */
function _appendMessageLog(entry) {
    messageLog.push({
        id: 'log-' + Date.now() + Math.random().toString(36).substr(2, 5),
        sentAt: new Date().toISOString(),
        ...entry
    });
    if (messageLog.length > CONFIG.MSG_LOG_MAX)
        messageLog = messageLog.slice(-CONFIG.MSG_LOG_MAX);

    // تحديث performanceArray إن كان موجوداً (Issue #19)
    if (typeof performanceArray !== 'undefined' && Array.isArray(performanceArray)) {
        const perfEntry = {
            timestamp: new Date().toISOString(),
            module: 'messaging',
            action: entry.type || 'send',
            status: entry.status || 'sent',
            meta: { phone: entry.phone, recipientsCount: entry.recipientsCount || 1 }
        };
        performanceArray.push(perfEntry);
        if (performanceArray.length > 1000) performanceArray.splice(0, 100);
    }
}

function loadMessageLog(filter = 'all') {
    const tbody = document.querySelector('#message-log-table tbody');
    if (!tbody) return;

    const today = getTodayDate();
    setElementText('today-messages', messageLog.filter(l => l.sentAt?.startsWith(today)).length);

    const filtered = filter === 'all' ? messageLog : messageLog.filter(l => l.type === filter);

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">لا توجد رسائل مرسلة</td></tr>';
        return;
    }

    const tNames = {
        campaign: 'حملة تسويقية', scheduled: 'رسالة مجدولة',
        birthday: 'تهنئة ميلاد', reminder: 'تذكير', manual: 'يدوي',
        followup: 'متابعة'
    };

    // Issue #19: عرض آخر 200 سجل فقط لحماية أداء الـ DOM
    const displayItems = [...filtered]
        .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
        .slice(0, 200);

    tbody.innerHTML = displayItems.map(log => `
            <tr>
                <td>${log.sentAt ? new Date(log.sentAt).toLocaleDateString('ar-EG') : '---'}</td>
                <td>${log.recipientsCount || 1} مستلم</td>
                <td>${tNames[log.type] || log.type}</td>
                <td>${(log.content || log.campaignName || 'رسالة').substring(0, 50)}</td>
                <td class="${log.status === 'failed' ? 'status-low' : 'status-ok'}">${log.status === 'failed' ? 'فشل' : 'تم الإرسال'}</td>
                <td>${log.sentAt ? new Date(log.sentAt).toLocaleString('ar-EG') : '---'}</td>
            </tr>`).join('');
}

function filterLog(filter) {
    document.querySelectorAll('#message-log .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadMessageLog(filter);
}

function exportMessageLog() {
    if (!messageLog.length) { showToast('لا توجد رسائل لتصديرها', 'warning'); return; }

    const tNames = { campaign: 'حملة', scheduled: 'مجدولة', birthday: 'ميلاد', reminder: 'تذكير', manual: 'يدوي', followup: 'متابعة' };
    let csv = '\uFEFFالتاريخ,النوع,عدد المستلمين,المحتوى,الحالة,وقت الإرسال\n';

    // Issue #19: معالجة دفعيّة للتصدير لتجنب تجميد الواجهة
    const items = [...messageLog].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    items.forEach(log => {
        csv += [
            new Date(log.sentAt).toLocaleDateString('ar-EG'),
            tNames[log.type] || log.type,
            log.recipientsCount || 1,
            (log.content || log.campaignName || '').replace(/,/g, ' ').substring(0, 80),
            log.status === 'failed' ? 'فشل' : 'تم الإرسال',
            new Date(log.sentAt).toLocaleString('ar-EG')
        ].join(',') + '\n';
    });

    _downloadCSV(csv, `سجل_الرسائل_${getTodayDate()}.csv`);
    showToast('✅ تم تصدير سجل الرسائل');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 33. الإرسال التلقائي للرسائل المجدولة ==========
// ─────────────────────────────────────────────────────────────────────────────

function startScheduledMessagesChecker() {
    _runScheduledMessagesCheck();
    setInterval(_runScheduledMessagesCheck, CONFIG.MSG_CHECKER_MS);
}

function _runScheduledMessagesCheck() {
    try {
        checkScheduledMessages();
    } catch (e) {
    }
}

function checkScheduledMessages() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    let changed = false;

    scheduledMessages.forEach(msg => {
        if (msg.status !== 'pending') return;

        let shouldSend = false;
        try {
            if (msg.type === 'single' && msg.scheduledTime && new Date(msg.scheduledTime) <= now) {
                shouldSend = true;
            } else if (msg.type === 'daily' && msg.scheduledTime) {
                const msgTime = msg.scheduledTime.includes('T')
                    ? msg.scheduledTime.split('T')[1].slice(0, 5)
                    : msg.scheduledTime.slice(0, 5);
                if (msgTime === currentTime) shouldSend = true;
            } else if (msg.type === 'weekly' && msg.scheduledTime) {
                const d = new Date(msg.scheduledTime);
                if (d.getDay() === now.getDay() && d.toTimeString().slice(0, 5) === currentTime) shouldSend = true;
            } else if (msg.type === 'monthly' && msg.scheduledTime) {
                const d = new Date(msg.scheduledTime);
                if (d.getDate() === now.getDate() && d.toTimeString().slice(0, 5) === currentTime) shouldSend = true;
            }
        } catch (e) { /* تجاهل التواريخ التالفة */ }

        if (shouldSend) { _sendScheduledMessage(msg); changed = true; }
    });

    if (changed) saveAllData();
}

function _sendScheduledMessage(msg) {
    msg.status = 'sent';
    msg.sentAt = new Date().toISOString();
    const segment = patientSegments.find(s => s.id === msg.segmentId);
    const recipientsCount = segment?.patientCount || 1;

    _appendMessageLog({
        type: 'scheduled',
        templateName: msg.templateName,
        segmentName: msg.segmentName,
        recipientsCount,
        content: (msg.content || '').substring(0, 100),
        status: 'sent',
        sentAt: msg.sentAt
    });

    triggerNotification('message_sent', {
        templateName: msg.templateName || 'رسالة',
        recipientsCount,
        message: `تم إرسال "${msg.templateName}" إلى ${recipientsCount} مريض`
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 34. الحملات التسويقية ==========
// ─────────────────────────────────────────────────────────────────────────────

function openCampaignModal() {
    const segSel = document.getElementById('campaign-segment');
    const tmplSel = document.getElementById('campaign-template');
    if (!segSel || !tmplSel) return;

    segSel.innerHTML =
        '<option value="">اختر الفئة المستهدفة...</option>' +
        (patientSegments.length
            ? patientSegments.map(s => `<option value="${s.id}" data-count="${s.patientCount || 0}">${s.name} (${s.patientCount || 0})</option>`).join('')
            : '<option disabled>لا توجد فئات</option>');

    tmplSel.innerHTML =
        '<option value="">اختر قالب الرسالة...</option>' +
        (messageTemplates.length
            ? messageTemplates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
            : '<option disabled>لا توجد قوالب</option>');

    segSel.onchange = function () { setElementText('campaign-recipients', this.options[this.selectedIndex]?.dataset.count || 0); };
    tmplSel.onchange = function () {
        const t = messageTemplates.find(t => t.id === this.value);
        const el = document.getElementById('campaign-content');
        if (t && el) el.value = t.content;
    };

    const dateEl = document.getElementById('campaign-date');
    if (dateEl) dateEl.value = getTodayDate();
    const contentEl = document.getElementById('campaign-content');
    if (contentEl) contentEl.value = '';
    setElementText('campaign-recipients', '0');
    document.getElementById('campaignModal').style.display = 'block';
}

function saveCampaign() {
    const name = document.getElementById('campaign-name')?.value.trim();
    const segSel = document.getElementById('campaign-segment');
    const segmentId = segSel?.value;
    const segmentName = segSel?.selectedOptions[0]?.text.split(' (')[0] || 'كل المرضى';
    const templateId = document.getElementById('campaign-template')?.value;
    const date = document.getElementById('campaign-date')?.value;
    const status = document.getElementById('campaign-status')?.value;
    const content = document.getElementById('campaign-content')?.value.trim();
    const recipients = parseInt(document.getElementById('campaign-recipients')?.innerText) || 0;

    if (!name || !content) { showToast('اسم الحملة والمحتوى مطلوبان', 'warning'); return; }
    if (!segmentId) { showToast('اختر الفئة المستهدفة', 'warning'); return; }

    campaigns.push({
        id: 'camp-' + Date.now(),
        name, segmentId, segmentName, templateId,
        scheduledDate: date, status, content,
        recipientsCount: recipients,
        sentCount: 0, openedCount: 0,
        createdAt: new Date().toISOString()
    });
    saveAllData();
    loadCampaigns();
    closeModal();
    showToast('✅ تم إنشاء الحملة');
}

function loadCampaigns() {
    const tbody = document.querySelector('#campaigns-table tbody');
    if (!tbody) return;

    if (!campaigns.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد حملات تسويقية</td></tr>';
        return;
    }

    setElementText('campaigns-active', campaigns.filter(c => c.status === 'active').length);
    setElementText('campaigns-ended', campaigns.filter(c => c.status === 'ended').length);
    setElementText('campaigns-scheduled', campaigns.filter(c => c.status === 'scheduled').length);
    setElementText('total-sent-campaigns', campaigns.reduce((s, c) => s + (c.sentCount || 0), 0));

    const sText = { draft: 'مسودة', scheduled: 'مجدولة', active: 'نشطة', ended: 'منتهية', paused: 'موقوفة' };
    const sCls = { draft: 'expiry-warning', scheduled: 'status-ok', active: 'status-ok', ended: 'status-low', paused: 'expiry-warning' };

    tbody.innerHTML = [...campaigns]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(c => {
            const openRate = c.sentCount ? ((c.openedCount || 0) / c.sentCount * 100).toFixed(1) : '0';
            return `<tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.segmentName || 'كل المرضى'}</td>
                <td>${c.scheduledDate || '---'}</td>
                <td class="${sCls[c.status] || ''}">${sText[c.status] || c.status}</td>
                <td>${c.sentCount || 0} / ${c.recipientsCount || 0}</td>
                <td>${openRate}%</td>
                <td>
                    ${c.status === 'draft' ? `<button onclick="sendCampaign('${c.id}')"  class="btn-stock-plus">📨 إرسال</button>` : ''}
                    ${c.status === 'active' ? `<button onclick="pauseCampaign('${c.id}')" class="btn-stock-minus">⏸️ إيقاف</button>` : ''}
                    <button onclick="deleteCampaign('${c.id}')" class="btn-stock-del">🗑️</button>
                </td>
            </tr>`;
        }).join('');
}

function sendCampaign(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    campaign.status = 'active';
    campaign.sentCount = campaign.recipientsCount || 0;
    campaign.sentAt = new Date().toISOString();
    campaign.openedCount = Math.floor(campaign.recipientsCount * (Math.random() * 10 + 5) / 100);

    _appendMessageLog({
        type: 'campaign',
        campaignId: campaign.id,
        campaignName: campaign.name,
        recipientsCount: campaign.recipientsCount,
        content: campaign.content.substring(0, 100),
        status: 'sent',
        sentAt: campaign.sentAt
    });

    saveAllData();
    loadCampaigns();
    loadMessageLog('all');
    showToast(`✅ تم إرسال الحملة إلى ${campaign.recipientsCount} مريض`);
}

function pauseCampaign(id) {
    const c = campaigns.find(c => c.id === id);
    if (c) { c.status = 'paused'; saveAllData(); loadCampaigns(); showToast('⏸️ تم إيقاف الحملة مؤقتاً'); }
}

function deleteCampaign(id) {
    campaigns = campaigns.filter(c => c.id !== id);
    saveAllData();
    loadCampaigns();
    showToast('تم حذف الحملة', 'info');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 35. نظام الولاء ==========
// ─────────────────────────────────────────────────────────────────────────────

function addLoyaltyPoints(patientId, points, reason, referenceId = null) {
    if (!loyaltySettings.enabled) return null;

    let lp = loyaltyPoints.find(p => p.patientId === patientId);
    if (!lp) {
        const patient = patients.find(p => p.id === patientId);
        lp = {
            id: 'lp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            patientId,
            patientName: patient?.name || 'غير معروف',
            phone: patient?.phone || '',
            points: 0,
            lifetimePoints: 0,
            tier: 'tier1',
            transactions: [],
            createdAt: new Date().toISOString()
        };
        loyaltyPoints.push(lp);
    }

    const previousTier = lp.tier;
    lp.points += points;
    lp.lifetimePoints = (lp.lifetimePoints || 0) + points;
    lp.tier = _calculatePatientTier(lp.lifetimePoints);

    lp.transactions.push({
        id: 'lpt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString(),
        points, type: 'earn', reason, referenceId,
        balance: lp.points
    });

    if (lp.tier !== previousTier) {
        triggerNotification('tier_upgrade', {
            patientName: lp.patientName,
            tier: loyaltyTiers.find(t => t.id === lp.tier)?.name || lp.tier
        });
    }

    saveAllData();
    return lp;
}

function _calculatePatientTier(points) {
    return [...loyaltyTiers]
        .sort((a, b) => b.minPoints - a.minPoints)
        .find(t => points >= t.minPoints)?.id || 'tier1';
}

function addPointsForVisit(patientId) {
    if (!loyaltySettings.enabled) return;
    addLoyaltyPoints(patientId, loyaltySettings.pointsPerVisit, 'زيارة');
}

function redeemPoints(patientId, pointsToRedeem, invoiceId = null) {
    const lp = loyaltyPoints.find(p => p.patientId === patientId);
    if (!lp || lp.points < pointsToRedeem) { showToast('رصيد النقاط غير كافٍ', 'warning'); return null; }
    if (pointsToRedeem < loyaltySettings.minRedeem) {
        showToast(`أقل نقاط للاستبدال: ${loyaltySettings.minRedeem}`, 'warning');
        return null;
    }

    const discountValue = pointsToRedeem * loyaltySettings.pointsValue;
    lp.points -= pointsToRedeem;

    const redemption = {
        id: 'lpr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        patientId,
        patientName: lp.patientName,
        points: pointsToRedeem,
        discountValue,
        invoiceId,
        date: new Date().toISOString(),
        status: 'completed'
    };
    loyaltyRedemptions.push(redemption);

    lp.transactions.push({
        id: 'lpt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString(),
        points: -pointsToRedeem,
        type: 'redeem',
        reason: 'استبدال نقاط',
        referenceId: redemption.id,
        balance: lp.points
    });

    saveAllData();
    return redemption;
}

function loadLoyaltySection() {
    _updateLoyaltyStats();
    const containers = ['points-table-container', 'redemptions-table-container', 'tiers-table-container'];
    containers.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.style.display = i === 0 ? 'block' : 'none';
    });

    document.querySelectorAll('#loyalty .btn-filter').forEach((btn, idx) => {
        btn.onclick = function () {
            document.querySelectorAll('#loyalty .btn-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            containers.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
            const target = document.getElementById(containers[idx]);
            if (target) target.style.display = 'block';
            if (idx === 0) loadLoyaltyPointsTable();
            else if (idx === 1) loadRedemptionsTable();
            else loadTiersTable();
        };
    });

    loadLoyaltyPointsTable();
}

function _updateLoyaltyStats() {
    const total = loyaltyPoints.reduce((s, p) => s + (p.points || 0), 0);
    const redeemed = loyaltyRedemptions.reduce((s, r) => s + (r.points || 0), 0);
    const avg = loyaltyPoints.length ? (total / loyaltyPoints.length).toFixed(0) : 0;

    setElementText('total-points', total);
    setElementText('total-redeemed', redeemed);
    setElementText('avg-points', avg);
    setElementText('patients-with-points', loyaltyPoints.length);
    setElementText('top-points', loyaltyPoints.length ? Math.max(...loyaltyPoints.map(p => p.points || 0)) : 0);
}

function loadLoyaltyPointsTable() {
    const tbody = document.querySelector('#loyalty-points-table tbody');
    if (!tbody) return;

    if (!loyaltyPoints.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لا توجد نقاط مسجلة</td></tr>';
        return;
    }

    const tColors = { tier1: '#cd7f32', tier2: '#c0c0c0', tier3: '#ffd700', tier4: '#e5e4e2' };
    const tNames = { tier1: 'برونزي', tier2: 'فضي', tier3: 'ذهبي', tier4: 'بلاتيني' };

    tbody.innerHTML = [...loyaltyPoints].sort((a, b) => b.points - a.points).map(lp => `
        <tr>
            <td><strong>${lp.patientName}</strong></td>
            <td>${lp.phone || '---'}</td>
            <td><strong>${lp.points}</strong></td>
            <td>${lp.lifetimePoints || 0}</td>
            <td><span style="display:inline-block;padding:3px 10px;border-radius:15px;
                background:${tColors[lp.tier] || '#cd7f32'};color:#000;font-weight:bold;">
                ${tNames[lp.tier] || 'برونزي'}</span></td>
            <td>${lp.transactions?.length || 0}</td>
            <td>
                <button onclick="showPatientPointsHistory('${lp.patientId}')" class="btn-stock-minus">📋 السجل</button>
                <button onclick="openRedeemModal('${lp.patientId}','${lp.patientName}',${lp.points})" class="btn-stock-plus">💰 استبدال</button>
            </td>
        </tr>`).join('');
}

function loadRedemptionsTable() {
    const tbody = document.querySelector('#redemptions-table tbody');
    if (!tbody) return;

    if (!loyaltyRedemptions.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد عمليات استبدال</td></tr>';
        return;
    }

    tbody.innerHTML = [...loyaltyRedemptions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(r => `
            <tr>
                <td>${new Date(r.date).toLocaleDateString('ar-EG')}</td>
                <td>${r.patientName}</td>
                <td><strong>${r.points}</strong></td>
                <td>${formatCurrency(r.discountValue)}</td>
                <td>${r.invoiceId ? 'مرتبط بفاتورة' : '---'}</td>
                <td><span class="status-ok">مكتمل</span></td>
            </tr>`).join('');
}

function loadTiersTable() {
    const tbody = document.querySelector('#tiers-table tbody');
    if (!tbody) return;

    tbody.innerHTML = [...loyaltyTiers].sort((a, b) => a.minPoints - b.minPoints).map(t => `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.minPoints}</td>
            <td>${t.discount}%</td>
            <td><span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${t.color};"></span> ${t.color}</td>
            <td><button onclick="openEditTierModal('${t.id}')" class="btn-stock-minus">✏️</button></td>
        </tr>`).join('');
}

function showPatientPointsHistory(patientId) {
    const lp = loyaltyPoints.find(p => p.patientId === patientId);
    if (!lp) return;

    const rows = (lp.transactions || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(t => {
            const cls = t.type === 'earn' ? 'status-ok' : 'expiry-warning';
            const text = t.type === 'earn' ? '➕ إضافة' : '➖ استبدال';
            return `<tr>
                <td>${new Date(t.date).toLocaleDateString('ar-EG')}</td>
                <td class="${cls}">${text}</td>
                <td><strong>${t.points > 0 ? '+' : ''}${t.points}</strong></td>
                <td>${t.reason || '---'}</td>
                <td>${t.balance}</td>
            </tr>`;
        }).join('');

    const html = `<div style="max-height:400px;overflow-y:auto;">
        <table style="width:100%;border-collapse:collapse;">
            <tr><th>التاريخ</th><th>النوع</th><th>النقاط</th><th>السبب</th><th>الرصيد</th></tr>
            ${rows || '<tr><td colspan="5" style="text-align:center;">لا توجد معاملات</td></tr>'}
        </table></div>`;

    setElementText('pointsHistoryTitle', `📋 سجل نقاط - ${lp.patientName}`);
    document.getElementById('pointsHistoryContent').innerHTML = html;
    document.getElementById('pointsHistoryModal').style.display = 'block';
}

function openRedeemModal(patientId, patientName, availablePoints) {
    document.getElementById('redeem-patient-info').innerText = `المريض: ${patientName}`;
    document.getElementById('redeem-available-points').innerText = availablePoints;
    document.getElementById('redeem-min-points').innerText = loyaltySettings.minRedeem || 50;

    const input = document.getElementById('redeem-points-input');
    if (!input) return;
    input.value = Math.min(100, availablePoints);
    input.max = availablePoints;
    input.min = loyaltySettings.minRedeem || 50;
    document.getElementById('redeem-discount-value').innerText =
        formatCurrency(parseInt(input.value) * loyaltySettings.pointsValue);

    const modal = document.getElementById('redeemPointsModal');
    if (!modal) return;
    modal.dataset.patientId = patientId;
    modal.dataset.patientName = patientName;
    modal.dataset.availablePoints = availablePoints;
    modal.style.display = 'block';
}

function processRedeemPoints() {
    const modal = document.getElementById('redeemPointsModal');
    const patientId = modal?.dataset.patientId;
    const available = parseInt(modal?.dataset.availablePoints || '0');
    const pts = parseInt(document.getElementById('redeem-points-input')?.value) || 0;

    if (pts < loyaltySettings.minRedeem) { showToast(`أقل نقاط: ${loyaltySettings.minRedeem}`, 'warning'); return; }
    if (pts > available) { showToast('النقاط غير كافية', 'warning'); return; }

    const redemption = redeemPoints(patientId, pts);
    if (redemption) {
        showToast(`✅ تم استبدال ${pts} نقطة بقيمة ${formatCurrency(redemption.discountValue)}`);
        closeModal();
        loadLoyaltyPointsTable();
        loadRedemptionsTable();
        updateDashboard();
        _updateLoyaltyStats();
    }
}

function openLoyaltySettingsModal() {
    const fields = ['loyalty-enabled', 'points-per-visit', 'points-per-review',
        'points-per-referred', 'points-value', 'min-redeem'];
    const vals = [loyaltySettings.enabled, loyaltySettings.pointsPerVisit || 10,
    loyaltySettings.pointsPerReview || 5, loyaltySettings.pointsPerReferred || 20,
    loyaltySettings.pointsValue || 1, loyaltySettings.minRedeem || 50];
    fields.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = vals[i];
        else el.value = vals[i];
    });
    document.getElementById('loyaltySettingsModal').style.display = 'block';
}

function saveLoyaltySettings() {
    loyaltySettings = {
        enabled: document.getElementById('loyalty-enabled')?.checked ?? true,
        pointsPerVisit: parseInt(document.getElementById('points-per-visit')?.value) || 10,
        pointsPerReview: parseInt(document.getElementById('points-per-review')?.value) || 5,
        pointsPerReferred: parseInt(document.getElementById('points-per-referred')?.value) || 20,
        pointsValue: parseFloat(document.getElementById('points-value')?.value) || 1,
        minRedeem: parseInt(document.getElementById('min-redeem')?.value) || 50
    };
    localStorage.setItem('clinic_loyaltySettings', JSON.stringify(loyaltySettings));
    showToast('✅ تم حفظ إعدادات الولاء');
    closeModal();
}

function openEditTierModal(tierId) {
    const t = loyaltyTiers.find(t => t.id === tierId);
    if (!t) return;
    currentTierId = tierId;
    document.getElementById('edit-tier-name').value = t.name;
    document.getElementById('edit-tier-min-points').value = t.minPoints;
    document.getElementById('edit-tier-discount').value = t.discount;
    document.getElementById('edit-tier-color').value = t.color;
    document.getElementById('editTierModal').style.display = 'block';
}

function saveTierChanges() {
    const t = loyaltyTiers.find(t => t.id === currentTierId);
    if (!t) return;
    t.name = document.getElementById('edit-tier-name')?.value || t.name;
    t.minPoints = parseInt(document.getElementById('edit-tier-min-points')?.value) || 0;
    t.discount = parseInt(document.getElementById('edit-tier-discount')?.value) || 0;
    t.color = document.getElementById('edit-tier-color')?.value || t.color;
    localStorage.setItem('clinic_loyaltyTiers', JSON.stringify(loyaltyTiers));
    showToast('✅ تم حفظ التعديلات');
    closeModal();
    loadTiersTable();
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 36. نظام التنبيهات الموحَّد (Issue #8 — Enhanced) ==========
// ─────────────────────────────────────────────────────────────────────────────

/** قاموس العناوين والرسائل الافتراضية مع دعم الأولوية والفئات */
const _DEFAULT_NOTIFICATION_TEMPLATES = {
    // ── مخزون ──────────────────────────────────────────────────────────────
    low_stock: { title: '⚠️ نقص في المخزون', message: 'يوجد {count} صنف ناقص: {items}', category: 'inventory', priority: 'high' },
    // ── مواعيد ─────────────────────────────────────────────────────────────
    appointment_reminder: { title: '🔔 تذكير بموعد قادم', message: 'موعد {patientName} الساعة {time}', category: 'appointment', priority: 'medium' },
    appointment_booked: { title: '📅 موعد جديد', message: 'تم حجز موعد للمريض {patientName} في {date}', category: 'appointment', priority: 'medium' },
    // ── مالية ──────────────────────────────────────────────────────────────
    invoice_unpaid: { title: '💰 فواتير غير مدفوعة', message: '{count} فاتورة بإجمالي {total} ج.م', category: 'finance', priority: 'high' },
    salary_paid: { title: '💰 صرف مرتب', message: 'تم صرف مرتب {employeeName} بقيمة {amount} ج.م', category: 'finance', priority: 'medium' },
    // ── رسائل ──────────────────────────────────────────────────────────────
    message_sent: { title: '📨 رسالة مرسلة', message: 'تم إرسال "{templateName}" إلى {recipientsCount} مريض', category: 'messaging', priority: 'low' },
    message_scheduled: { title: '📅 رسالة مجدولة', message: 'تم جدولة "{templateName}" في {scheduledTime}', category: 'messaging', priority: 'low' },
    // ── ولاء ───────────────────────────────────────────────────────────────
    tier_upgrade: { title: '⭐ ترقية مستوى ولاء', message: '{patientName} وصل إلى مستوى {tier}', category: 'loyalty', priority: 'medium' },
    // ── نظام ───────────────────────────────────────────────────────────────
    task_assigned: { title: '📋 مهمة جديدة', message: 'تم تعيين مهمة جديدة', category: 'system', priority: 'medium' },
    lab_result: { title: '🔬 نتيجة معمل جاهزة', message: 'نتيجة معمل جديدة متاحة', category: 'clinical', priority: 'high' },
    patient_registered: { title: '👤 مريض جديد', message: 'تم إضافة {patientName}', category: 'patients', priority: 'low' },
    // ── تقارير AI ──────────────────────────────────────────────────────────
    ai_report_ready: { title: '🤖 تقرير ذكي جاهز', message: 'تم إنشاء التقرير الذكي لفترة {period}', category: 'ai_reports', priority: 'low' },
};

/**
 * تشغيل تنبيه جديد — Issue #8: مُحسَّن بـ NotificationBus + تصنيف كامل
 * @param {string} eventType - نوع الحدث من _DEFAULT_NOTIFICATION_TEMPLATES
 * @param {Object} data      - بيانات إضافية للاستبدال في القالب
 * @returns {Object|null}    - كائن التنبيه المُنشأ
 */
function triggerNotification(eventType, data = {}) {
    try {
        // البحث عن قالب مخصص أولاً ثم الرجوع للافتراضي
        const custom = notificationTemplates.find(t => (t.eventType || t.event) === eventType && t.isActive !== false);
        const defaults = _DEFAULT_NOTIFICATION_TEMPLATES[eventType] || {
            title: `تنبيه: ${eventType}`,
            message: data.message || '',
            category: 'system',
            priority: 'medium',
        };

        let title = custom?.title || defaults.title;
        let message = custom?.content || defaults.message;

        // استبدال القيم المتغيرة بشكل موحَّد
        const replaceVars = (str) => str.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
        title = replaceVars(title);
        message = replaceVars(message);

        const priority = custom?.priority || defaults.priority || 'medium';
        const category = defaults.category || 'system';

        const notification = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8),
            type: eventType,
            category,                    // Issue #8: تصنيف التنبيه
            title,
            message,
            data: { ...data },
            read: false,
            readBy: [],
            createdAt: new Date().toISOString(),
            priority,
            expiresAt: custom?.expiresAfterDays
                ? new Date(Date.now() + custom.expiresAfterDays * 86_400_000).toISOString()
                : null,
            recipientRoles: custom?.recipients || ['admin'],
            source: data._source || 'system',  // من أي ملف صدر التنبيه
        };

        notifications.push(notification);

        // سجل التنبيهات مع حماية الحصة (Issue #19)
        if (Array.isArray(alertLogs)) {
            alertLogs.push({
                id: 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                notificationId: notification.id,
                eventType, category, title, message,
                triggeredBy: currentUser?.id || 'system',
                createdAt: new Date().toISOString()
            });
            if (alertLogs.length > CONFIG.ALERT_LOG_MAX)
                alertLogs = alertLogs.slice(-CONFIG.ALERT_LOG_MAX);
        }

        // تحديد الحد الأقصى للإشعارات (Issue #19)
        if (notifications.length > CONFIG.NOTIFICATION_MAX)
            notifications = notifications.slice(-CONFIG.NOTIFICATION_MAX);

        saveAllData();
        updateNotificationBadge();

        // Issue #8: إرسال عبر NotificationBus للتحديث الفوري
        NotificationBus.dispatch(notification);

        if (document.querySelector('#notification-log-table tbody')) loadNotificationLog();
        if (document.getElementById('notifications-list')) loadNotifications('all');
        if (notificationSettings?.sound) _playNotificationSound();

        return notification;
    } catch (e) {
        console.error('[triggerNotification] Error:', e);
        return null;
    }
}

function updateNotificationBadge() {
    const count = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.style.display = count > 0 ? 'inline' : 'none';
        if (count > 0) badge.innerText = count > 99 ? '99+' : count;
    }
    setElementText('unread-notifications', count);
}

function _playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* الصوت غير مدعوم */ }
}

function createNotification(type, title, message, relatedId = null, recipientRoles = ['admin']) {
    return triggerNotification(type, { message, relatedId, _title: title, _recipientRoles: recipientRoles });
}

function loadNotifications(filter = 'all') {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    let filtered = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : filter !== 'all'
            ? notifications.filter(n => n.type.includes(filter) || n.category === filter)
            : [...notifications];

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Issue #19: عرض آخر 100 تنبيه لحماية الأداء
    filtered = filtered.slice(0, 100);

    if (!filtered.length) {
        container.innerHTML = '<div style="text-align:center;padding:50px;">لا توجد تنبيهات</div>';
        return;
    }

    const getIcon = t => {
        if (t.includes('invoice')) return '💰';
        if (t.includes('appointment')) return '📅';
        if (t.includes('stock')) return '📦';
        if (t.includes('task')) return '📋';
        if (t.includes('message')) return '📨';
        if (t.includes('tier')) return '⭐';
        if (t.includes('salary')) return '💵';
        if (t.includes('lab')) return '🔬';
        if (t.includes('ai')) return '🤖';
        if (t.includes('patient')) return '👤';
        return '🔔';
    };
    const getCls = t => {
        if (t.includes('invoice') || t.includes('salary')) return 'invoice';
        if (t.includes('appointment')) return 'appointment';
        if (t.includes('stock')) return 'stock';
        if (t.includes('task')) return 'task';
        if (t.includes('message')) return 'message';
        if (t.includes('ai')) return 'system';
        return 'system';
    };

    // Issue #8: ترتيب حسب الأولوية ثم التاريخ
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
        const pDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = filtered.map(n => {
        const d = n.data || {};
        const inject = str => (str || '').replace(/\{(\w+)\}/g, (_, k) => d[k] ?? `{${k}}`);
        const resolvedTitle = inject(n.title);
        const resolvedMessage = inject(n.message);
        const priorityBadge = n.priority === 'high'
            ? '<span style="background:#e74c3c;color:#fff;font-size:10px;padding:1px 6px;border-radius:8px;margin-right:4px;">عالي</span>'
            : '';
        return `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markAsRead('${n.id}')">
            <div class="notification-icon ${getCls(n.type)}">${getIcon(n.type)}</div>
            <div class="notification-content">
                <div class="notification-title">${priorityBadge}${resolvedTitle}</div>
                <div class="notification-message">${resolvedMessage}</div>
                <div class="notification-time">${timeAgo(n.createdAt)}</div>
            </div>
            <div class="notification-actions">
                ${n.type !== 'appointment_booked' && d.relatedId
                ? `<button onclick="goToRelated('${n.type}','${d.relatedId}');event.stopPropagation();" class="btn-stock-plus">عرض</button>`
                : ''}
                <button onclick="deleteNotification('${n.id}');event.stopPropagation();" class="btn-stock-del">🗑️</button>
            </div>
        </div>`;
    }).join('');

    updateNotificationBadge();
}

function markAsRead(notificationId) {
    const n = notifications.find(n => n.id === notificationId);
    if (n && !n.read) {
        n.read = true;
        n.readBy = n.readBy || [];
        n.readBy.push({ userId: currentUser?.id || 'system', readAt: new Date().toISOString() });
        saveAllData();
        loadNotifications('all');
    }
}

function markAllAsRead() {
    const now = new Date().toISOString();
    notifications.forEach(n => {
        if (!n.read) {
            n.read = true;
            n.readBy = n.readBy || [];
            n.readBy.push({ userId: currentUser?.id || 'system', readAt: now });
        }
    });
    saveAllData();
    loadNotifications('all');
    showToast('تم تحديد الكل كمقروء');
}

function timeAgo(dateString) {
    const secs = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (secs < 60) return 'منذ لحظات';
    if (secs < 3600) return `منذ ${Math.floor(secs / 60)} دقيقة`;
    if (secs < 86400) return `منذ ${Math.floor(secs / 3600)} ساعة`;
    if (secs < 604800) return `منذ ${Math.floor(secs / 86400)} يوم`;
    return new Date(dateString).toLocaleDateString('ar-EG');
}

function deleteNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveAllData();
    loadNotifications('all');
    showToast('تم حذف التنبيه', 'info');
}

function filterNotifications(filter) {
    document.querySelectorAll('#notifications .btn-filter').forEach(b => b.classList.remove('active'));
    if (event) event.target.classList.add('active');
    loadNotifications(filter);
}

function clearAllNotifications() {
    notifications = [];
    saveAllData();
    loadNotifications('all');
    updateNotificationBadge();
    showToast('تم حذف جميع التنبيهات', 'info');
}

function goToRelated(type, id) {
    if (type.includes('invoice')) showSection('invoices');
    else if (type.includes('appointment')) showSection('appointments');
    else if (type.includes('stock')) showSection('inventory');
    else if (type.includes('task')) showSection('tasks');
    else if (type.includes('message')) showSection('scheduled-messages');
    else if (type.includes('ai')) showSection('reports');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 37. التنبيهات التلقائية الدورية ==========
// ─────────────────────────────────────────────────────────────────────────────

function checkAutomaticNotifications() {
    try { _checkUnpaidInvoices(); } catch (e) { console.warn('[Notify] unpaidInvoices:', e); }
    try { _checkUpcomingAppointments(); } catch (e) { console.warn('[Notify] appointments:', e); }
    try { _checkLowStock(); } catch (e) { console.warn('[Notify] lowStock:', e); }
    try { _checkBirthdays(); } catch (e) { console.warn('[Notify] birthdays:', e); }
    try { _checkPostProcedureFollowups(); } catch (e) { console.warn('[Notify] followups:', e); }
}

function _checkUnpaidInvoices() {
    const unpaid = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
    if (!unpaid.length) return;

    const total = unpaid.reduce((s, i) => s + (i.remainingAmount || i.total || 0), 0);
    const oneHourAgo = Date.now() - 3_600_000;
    const recentExists = notifications.some(n => n.type === 'invoice_unpaid' && new Date(n.createdAt).getTime() > oneHourAgo);
    if (!recentExists) triggerNotification('invoice_unpaid', { count: unpaid.length, total: total.toLocaleString() });

    setElementText('unpaid-invoices-alert', unpaid.length);
    setElementText('unpaid-invoices-total', total.toLocaleString());
}

function _checkUpcomingAppointments() {
    if (!Array.isArray(appointments)) return;
    const now = new Date();
    const today = getTodayDate();
    const reminderMs = (notificationSettings.reminderTime || 60) * 60_000;
    const thirtyMsAgo = Date.now() - 1_800_000;

    appointments.filter(a => a?.date === today).forEach(apt => {
        if (!apt.time || !apt.patient_name) return;
        try {
            const [h, m] = apt.time.split(':').map(Number);
            const aptTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
            const diff = aptTime - now;
            if (diff <= 0 || diff > reminderMs) return;

            const recentDup = notifications.some(n =>
                n.type === 'appointment_reminder' &&
                n.message?.includes(apt.patient_name) &&
                new Date(n.createdAt).getTime() > thirtyMsAgo
            );
            if (!recentDup) {
                triggerNotification('appointment_reminder', {
                    patientName: apt.patient_name,
                    time: apt.time,
                });
            }

            if (!apt._reminderSent) {
                const patient = typeof patients !== 'undefined'
                    ? patients.find(p => p.id === apt.patient_id || p.name === apt.patient_name)
                    : null;
                const phone = apt.patient_phone || patient?.phone;

                if (phone) {
                    apt._reminderSent = true;
                    const clinicName = typeof currentUser !== 'undefined'
                        ? (currentUser?.clinicName || 'عيادتنا')
                        : 'عيادتنا';

                    // Issue #10: استخدام sendAppointmentReminder المخصصة
                    MessagingGateway.sendAppointmentReminder(
                        { ...apt, patient_phone: phone },
                        clinicName
                    ).catch(err => console.warn('[Reminder] Send failed:', err));
                }
            }
        } catch (e) { /* تجاهل التواريخ التالفة */ }
    });

    setElementText('today-appointments-alert', appointments.filter(a => a?.date === today).length);
}

function _checkBirthdays() {
    if (!Array.isArray(patients)) return;

    const now = new Date();
    if (now.getHours() !== MESSAGING_CONFIG.birthdayHour) return;

    const todayMMDD = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDate = getTodayDate();
    const clinicName = typeof currentUser !== 'undefined'
        ? (currentUser?.clinicName || 'عيادتنا')
        : 'عيادتنا';

    const birthdayPatients = patients.filter(p => {
        if (!p.birthday || !p.phone) return false;
        const bMMDD = p.birthday.slice(5);
        if (bMMDD !== todayMMDD) return false;
        const alreadySent = typeof messageLog !== 'undefined' && messageLog.some(l =>
            l.type === 'birthday' &&
            l.patientName === p.name &&
            (l.sentAt || '').startsWith(todayDate)
        );
        return !alreadySent;
    });

    if (!birthdayPatients.length) return;

    // Issue #10: استخدام sendBirthdayGreeting المخصصة + broadcast الدفعي (Issue #19)
    MessagingGateway.broadcast(
        birthdayPatients.map(p => ({ phone: p.phone, name: p.name })),
        (name) =>
            `🎂 عيد ميلاد سعيد يا ${name}!\n` +
            `فريق ${clinicName} يتمنى لك عاماً صحياً مليئاً بالبسمات الجميلة. 😊\n` +
            `هديتنا لك: خصم 10% على زيارتك القادمة خلال شهرك هذا.`,
        'birthday'
    ).then(results => {
        const sentCount = results.filter(r => r.success).length;
        if (sentCount > 0) {
            triggerNotification('message_sent', {
                templateName: 'تهنئة أعياد الميلاد',
                recipientsCount: sentCount,
                message: `تم إرسال ${sentCount} تهنئة ميلاد`,
            });
        }
    }).catch(err => console.warn('[Birthday] Broadcast error:', err));
}

/**
 * إرسال تهنئة لمريض واحد (يُستدعى من services.js)
 * @param {Object} patient
 */
async function sendSingleBirthdayGreeting(patient) {
    const clinicName = typeof currentUser !== 'undefined'
        ? (currentUser?.clinicName || 'عيادتنا')
        : 'عيادتنا';
    return MessagingGateway.sendBirthdayGreeting(patient, clinicName);
}

function _checkPostProcedureFollowups() {
    if (!Array.isArray(visits)) return;

    const now = new Date();
    const todayDate = getTodayDate();
    const clinicName = typeof currentUser !== 'undefined'
        ? (currentUser?.clinicName || 'عيادتنا')
        : 'عيادتنا';

    const followupDays = MESSAGING_CONFIG.followupDays || [1, 3, 7];

    visits.filter(v => v.status === 'completed' && v.visit_date && v.patient_id).forEach(visit => {
        const visitDate = new Date(visit.visit_date);
        const daysSince = Math.floor((now - visitDate) / 86_400_000);
        if (!followupDays.includes(daysSince)) return;

        const patient = typeof patients !== 'undefined'
            ? patients.find(p => p.id === visit.patient_id)
            : null;
        if (!patient?.phone) return;

        const alreadySent = typeof messageLog !== 'undefined' && messageLog.some(l =>
            l.type === 'followup' &&
            l.referenceId === visit.id &&
            l.day === daysSince
        );
        if (alreadySent) return;

        let message;
        if (daysSince === 1) {
            message =
                `مرحباً ${patient.name}،\nنتمنى أن تكون بخير بعد زيارتك لـ${clinicName} أمس.\n` +
                `إذا كنت تشعر بأي انزعاج أو لديك أي استفسار، تواصل معنا في أي وقت. 💙`;
        } else if (daysSince === 3) {
            message =
                `مرحباً ${patient.name}،\nمضى 3 أيام على زيارتك، ونتمنى أن تسير الأمور على أفضل وجه.\n` +
                `يُرجى الالتزام بالإرشادات التي أعطاها لك الطبيب، ولا تتردد في التواصل معنا. 🦷`;
        } else {
            message =
                `مرحباً ${patient.name}،\nمرت أسبوع على آخر زيارة لـ${clinicName}.\n` +
                `نذكّرك بموعد المتابعة إذا نصح به طبيبك، أو يمكنك حجز موعد جديد عبر الرابط المرسل سابقاً.`;
        }

        MessagingGateway.send(patient.phone, message, 'followup', patient.name)
            .then(() => {
                if (typeof messageLog !== 'undefined') {
                    const lastEntry = messageLog[messageLog.length - 1];
                    if (lastEntry) { lastEntry.referenceId = visit.id; lastEntry.day = daysSince; }
                }
            })
            .catch(err => console.warn('[Followup] Send failed:', err));
    });
}

function startBirthdayChecker() {
    try { _checkBirthdays(); } catch (e) { }
    setInterval(() => { try { _checkBirthdays(); } catch (e) { } }, CONFIG.BIRTHDAY_CHECKER_MS);
}

function _checkLowStock() {
    if (!Array.isArray(inventory)) return;
    const low = inventory.filter(i => i && i.quantity <= (i.min_limit || 5));
    if (!low.length) return;

    const oneHourAgo = Date.now() - 3_600_000;
    const recentExists = notifications.some(n => n.type === 'low_stock' && new Date(n.createdAt).getTime() > oneHourAgo);
    if (!recentExists) {
        triggerNotification('low_stock', {
            count: low.length,
            items: low.slice(0, 3).map(i => i.product_name).join(', ')
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 38. إعدادات التنبيهات ==========
// ─────────────────────────────────────────────────────────────────────────────

function loadNotificationSettings() {
    const container = document.getElementById('settings-list');
    if (!container) return;
    container.innerHTML = `
        <div style="background:white;padding:20px;border-radius:12px;">
            <div class="form-row">
                <label>وقت التذكير (بالدقائق)</label>
                <input type="number" id="reminder-time" value="${notificationSettings.reminderTime || 30}" min="5" max="120">
            </div>
            <div class="form-row">
                <label><input type="checkbox" id="notification-sound" ${notificationSettings.sound ? 'checked' : ''}> تنبيه صوتي</label>
                <label><input type="checkbox" id="notification-popup" ${notificationSettings.popup ? 'checked' : ''}> نافذة منبثقة</label>
            </div>
            <div class="form-row">
                <label><input type="checkbox" id="notification-email" ${notificationSettings.email ? 'checked' : ''}> إرسال بريد إلكتروني</label>
            </div>
        </div>`;
}

function saveNotificationSettings() {
    notificationSettings = {
        reminderTime: parseInt(document.getElementById('reminder-time')?.value) || 30,
        sound: document.getElementById('notification-sound')?.checked ?? true,
        popup: document.getElementById('notification-popup')?.checked ?? true,
        email: document.getElementById('notification-email')?.checked ?? false
    };
    localStorage.setItem('clinic_notificationSettings', JSON.stringify(notificationSettings));
    showToast('✅ تم حفظ الإعدادات');
    loadNotificationSettings();
    updateDashboard();
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 39. قوالب التنبيهات ==========
// ─────────────────────────────────────────────────────────────────────────────

function loadNotificationTemplates() {
    const tbody = document.querySelector('#notification-templates-table tbody');
    if (!tbody) return;

    if (!notificationTemplates.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد قوالب تنبيهات</td></tr>';
        return;
    }

    const eventNames = {
        invoice_unpaid: 'فاتورة غير مدفوعة', appointment_reminder: 'تذكير بموعد',
        low_stock: 'نقص مخزون', task_assigned: 'مهمة جديدة',
        lab_result: 'نتيجة معمل', message_sent: 'رسالة مرسلة',
        message_scheduled: 'رسالة مجدولة', tier_upgrade: 'ترقية ولاء',
        salary_paid: 'صرف مرتب', patient_registered: 'مريض جديد',
        appointment_booked: 'موعد جديد', ai_report_ready: 'تقرير AI'
    };

    tbody.innerHTML = notificationTemplates.map(t => `
        <tr>
            <td>${eventNames[t.eventType || t.event] || t.eventType || t.event}</td>
            <td>${t.title}</td>
            <td>${t.content}</td>
            <td>${t.recipients ? t.recipients.join(', ') : 'الكل'}</td>
            <td><button onclick="deleteNotificationTemplate('${t.id}')" class="btn-stock-del">🗑️</button></td>
        </tr>`).join('');
}

function openNotificationTemplateModal() {
    document.getElementById('notificationTemplateModal').style.display = 'block';
}

function saveNotificationTemplate() {
    const eventVal = document.getElementById('notify-template-event')?.value;
    const title = document.getElementById('notify-template-title')?.value.trim();
    const content = document.getElementById('notify-template-content')?.value.trim();
    const recipients = Array.from(document.getElementById('notify-template-roles')?.selectedOptions || []).map(o => o.value);
    const sound = document.getElementById('notify-template-sound')?.checked ?? false;
    const popup = document.getElementById('notify-template-popup')?.checked ?? true;

    if (!title || !content) { showToast('عنوان التنبيه والمحتوى مطلوبان', 'warning'); return; }

    notificationTemplates.push({
        id: 'tmpl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        eventType: eventVal,
        event: eventVal,
        title, content, recipients, sound, popup,
        isActive: true,
        createdAt: new Date().toISOString()
    });

    saveAllData();
    loadNotificationTemplates();
    closeModal();
    showToast('✅ تم حفظ قالب التنبيه');
}

function deleteNotificationTemplate(id) {
    notificationTemplates = notificationTemplates.filter(t => t.id !== id);
    saveAllData();
    loadNotificationTemplates();
    showToast('تم حذف القالب', 'info');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== 40. سجل التنبيهات ==========
// ─────────────────────────────────────────────────────────────────────────────

function loadNotificationLog() {
    const tbody = document.querySelector('#notification-log-table tbody');
    if (!tbody) return;

    if (!notifications.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">لا توجد تنبيهات مسجلة بعد</td></tr>';
        return;
    }

    const typeNames = {
        invoice_unpaid: 'فاتورة', appointment_reminder: 'موعد', low_stock: 'مخزون',
        task_assigned: 'مهمة', lab_result: 'معمل', message_sent: 'رسالة',
        message_scheduled: 'جدولة', tier_upgrade: 'ولاء', salary_paid: 'مرتب',
        patient_registered: 'مريض جديد', appointment_booked: 'موعد جديد',
        ai_report_ready: 'تقرير AI'
    };

    tbody.innerHTML = [...notifications]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 200) // Issue #19: حماية أداء الـ DOM
        .map(n => `
            <tr>
                <td>${new Date(n.createdAt).toLocaleString('ar-EG')}</td>
                <td>${typeNames[n.type] || n.type}</td>
                <td>${(n.recipientRoles || ['الكل']).join(', ')}</td>
                <td>${n.title}</td>
                <td class="${n.read ? 'status-ok' : 'expiry-warning'}">${n.read ? 'مقروءة' : 'غير مقروءة'}</td>
                <td>${n.readBy?.[0]?.readAt ? new Date(n.readBy[0].readAt).toLocaleString('ar-EG') : '---'}</td>
            </tr>`).join('');
}

function exportNotificationLog() {
    if (!notifications.length) { showToast('لا توجد تنبيهات لتصديرها', 'warning'); return; }

    const typeNames = {
        invoice_unpaid: 'فاتورة', appointment_reminder: 'موعد', low_stock: 'مخزون',
        task_assigned: 'مهمة', lab_result: 'معمل', message_sent: 'رسالة',
        message_scheduled: 'جدولة', tier_upgrade: 'ولاء', salary_paid: 'مرتب',
        ai_report_ready: 'تقرير AI'
    };

    let csv = '\uFEFFالتاريخ,النوع,الفئة,المستلمين,العنوان,الأولوية,الحالة,تاريخ القراءة\n';
    [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(n => {
        csv += [
            new Date(n.createdAt).toLocaleString('ar-EG'),
            typeNames[n.type] || n.type,
            n.category || 'system',
            (n.recipientRoles || ['الكل']).join(' '),
            (n.title || '').replace(/,/g, ' '),
            n.priority || 'medium',
            n.read ? 'مقروءة' : 'غير مقروءة',
            n.readBy?.[0]?.readAt ? new Date(n.readBy[0].readAt).toLocaleString('ar-EG') : '---'
        ].join(',') + '\n';
    });

    _downloadCSV(csv, `سجل_التنبيهات_${getTodayDate()}.csv`);
    showToast('✅ تم تصدير سجل التنبيهات');
}

// ─────────────────────────────────────────────────────────────────────────────
// ========== STARTUP ==========
// ─────────────────────────────────────────────────────────────────────────────

/**
 * تشغيل جميع العمليات المجدولة عند بدء التطبيق
 * Issue #8: تهيئة NotificationBus أيضاً
 */
function startAllCheckers() {
    startScheduledMessagesChecker();
    startBirthdayChecker();
    setInterval(checkAutomaticNotifications, CONFIG.NOTIFICATION_CHECK_MS);
    checkAutomaticNotifications();

    // Issue #8: تهيئة WebSocket (علِّق إذا لم يكن السيرفر جاهزاً)
    // NotificationBus.connectWebSocket('wss://your-clinic-server.com/ws/notifications');

    // Issue #8: مثال على الاشتراك في تنبيهات المخزون لتحديث الـ UI فوراً
    NotificationBus.on('low_stock', (notification) => {
        console.info('[NotificationBus] 📦 Low stock alert received:', notification.title);
        // يمكن إضافة منطق UI هنا مثل: showBanner(notification)
    });

    NotificationBus.on('invoice_unpaid', (notification) => {
        console.info('[NotificationBus] 💰 Unpaid invoice alert:', notification.title);
    });
}