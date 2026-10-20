/* ==========================================================================
   KUET ESE 3-2 Portal — Crash-Proof Main Application Logic (js/app.js)
   Includes built-in data fallbacks so the routine NEVER renders blank!
   ========================================================================== */

// 🔴 PASTE YOUR FIREBASE REALTIME DATABASE URL INSIDE THE QUOTES BELOW FOR LIVE SYNC:
const DEFAULT_FIREBASE_DB_URL = ""; 

// ================= BUILT-IN FALLBACK DATA (PREVENTS BLANK PAGE IF data.js FAILS) =================
if (typeof PERIOD_INFO === 'undefined') {
    window.PERIOD_INFO = [
        { index: 0, label: "1st Period", time: "08:00 AM - 08:50 AM", short: "08:00 - 08:50" },
        { index: 1, label: "2nd Period", time: "08:50 AM - 09:40 AM", short: "08:50 - 09:40" },
        { index: 2, label: "3rd Period", time: "09:40 AM - 10:30 AM", short: "09:40 - 10:30" },
        { index: 3, label: "4th Period", time: "10:40 AM - 11:30 AM", short: "10:40 - 11:30" },
        { index: 4, label: "5th Period", time: "11:30 AM - 12:20 PM", short: "11:30 - 12:20" },
        { index: 5, label: "6th Period", time: "12:20 PM - 01:10 PM", short: "12:20 - 01:10" },
        { index: 6, label: "7th Period", time: "02:30 PM - 03:20 PM", short: "02:30 - 03:20", labTime: "02:30 PM - 05:00 PM" },
        { index: 7, label: "8th Period", time: "03:20 PM - 04:10 PM", short: "03:20 - 04:10" },
        { index: 8, label: "9th Period", time: "04:10 PM - 05:00 PM", short: "04:10 - 05:00" }
    ];
}

if (typeof FACULTY === 'undefined') {
    window.FACULTY = {
        "MAI":  { code: "MAI",  name: "Dr. Mohammad Ariful Islam", role: "Professor / Course Teacher", courses: ["ESE 3221"] },
        "MHA":  { code: "MHA",  name: "Dr. Md. Hasan Ali", role: "Faculty Member", courses: ["ESE 3211"] },
        "MSH":  { code: "MSH",  name: "Dr. Md. Shameem Hossain", role: "Faculty Member", courses: ["ESE 3203", "ESE 3204"] },
        "MMA":  { code: "MMA",  name: "Md. Mahmodul Alam", role: "Faculty Member", courses: ["ESE 3211", "ESE 3222"] },
        "AA":   { code: "AA",   name: "Adnan Abedeen", role: "Faculty Member", courses: ["ESE 3203", "ESE 3204"] },
        "MR":   { code: "MR",   name: "Mostafizur Rahaman", role: "Faculty Member", courses: ["ESE 3217", "ESE 3218"] },
        "KS":   { code: "KS",   name: "Khaza Shahriar", role: "Faculty Member", courses: ["ESE 3217", "ESE 3218"] },
        "GSF":  { code: "GSF",  name: "Golam Sharoar Fahim", role: "Faculty Member", courses: ["ESE 3221", "ESE 3222"] },
        "NL":   { code: "NL",   name: "Nafisa Lubaba", role: "Faculty Member", courses: ["ESE 3207", "ESE 3208"] },
        "NAP":  { code: "NAP",  name: "Nahyan Ahnaf Pratik", role: "Faculty Member", courses: ["ESE 3207", "ESE 3208"] },
        "HEAD": { code: "HEAD", name: "Prof. Dr. Md. Shahidul Islam", role: "Head of the Department (ESE)", courses: ["Department Head"] }
    };
}

if (typeof COURSES === 'undefined') {
    window.COURSES = [
        { code: "ESE 3203", title: "Petroleum and Natural Gas Processing", credit: 3.00, type: "Theory", teachers: ["MSH", "AA"], schedule: "Sun (09:40), Mon (11:30), Tue (09:40)", materials: [] },
        { code: "ESE 3207", title: "Solar Photovoltaic Systems", credit: 3.00, type: "Theory", teachers: ["NL", "NAP"], schedule: "Sun (12:20), Mon (12:20), Wed (10:40)", materials: [] },
        { code: "ESE 3211", title: "Coal Power Generation", credit: 4.00, type: "Theory", teachers: ["MHA", "MMA"], schedule: "Sun (11:30), Tue (11:30), Wed (12:20), Thu (12:20)", materials: [] },
        { code: "ESE 3217", title: "Instrumentation and Control", credit: 3.00, type: "Theory", teachers: ["MR", "KS"], schedule: "Mon (09:40), Tue (08:50), Wed (11:30)", materials: [] },
        { code: "ESE 3221", title: "Energy Storage Systems", credit: 3.00, type: "Theory", teachers: ["MAI", "GSF"], schedule: "Sun (10:40), Mon (10:40), Tue (10:40)", materials: [] },
        { code: "ESE 3200", title: "Seminar on Special Topics", credit: 0.75, type: "Sessional", teachers: ["All Faculty"], schedule: "Department Scheduled Slot", materials: [] },
        { code: "ESE 3202", title: "Energy Innovation Lab", credit: 0.75, type: "Sessional", teachers: ["ESE Faculty"], schedule: "Thursday (02:30 PM - 05:00 PM)", materials: [] },
        { code: "ESE 3204", title: "Sessional on ESE 3203 (Petroleum & Gas Lab)", credit: 0.75, type: "Sessional", teachers: ["MSH", "AA"], schedule: "Wednesday (02:30 PM - 05:00 PM)", materials: [] },
        { code: "ESE 3208", title: "Sessional on ESE 3207 (Solar PV Lab)", credit: 0.75, type: "Sessional", teachers: ["NL", "NAP"], schedule: "Monday (02:30 PM - 05:00 PM)", materials: [] },
        { code: "ESE 3218", title: "Sessional on ESE 3217 (Instrumentation Lab)", credit: 0.75, type: "Sessional", teachers: ["MR", "KS"], schedule: "Wednesday (02:30 PM - 05:00 PM)", materials: [] },
        { code: "ESE 3222", title: "Sessional on ESE 3221 (Energy Storage Lab)", credit: 0.75, type: "Sessional", teachers: ["MMA", "GSF"], schedule: "Tuesday (02:30 PM - 05:00 PM)", materials: [] },
        { code: "ESE 3250", title: "Industrial Attachment", credit: 0.00, type: "Sessional", teachers: ["Industrial Training Committee"], schedule: "End of Term", materials: [] }
    ];
}

if (typeof getInitialSeedRoutine === 'undefined') {
    window.getInitialSeedRoutine = function() {
        return {
            "Sunday": [
                null, null,
                { code: "ESE 3203", teacher: "MSH", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3221", teacher: "MAI", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3211", teacher: "MHA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3207", teacher: "NL",  type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                null, null, null
            ],
            "Monday": [
                null, null,
                { code: "ESE 3217", teacher: "MR", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3221", teacher: "MAI / GSF", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3203", teacher: "AA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3207", teacher: "NAP", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3208", teacher: "NL + NAP", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
                null, null
            ],
            "Tuesday": [
                null,
                { code: "ESE 3217", teacher: "KS", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3203", teacher: "MSH / AA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3221", teacher: "GSF", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3211", teacher: "MHA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                null,
                { code: "ESE 3222", teacher: "MMA + GSF", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
                null, null
            ],
            "Wednesday": [
                null, null, null,
                { code: "ESE 3207", teacher: "NL / NAP", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3217", teacher: "MR / KS", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3211", teacher: "MMA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3204 / ESE 3218", teacher: "MSH+AA / MR+KS", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
                null, null
            ],
            "Thursday": [
                null, null, null, null, null,
                { code: "ESE 3211", teacher: "MMA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
                { code: "ESE 3202", teacher: "ESE Faculty", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
                null, null
            ]
        };
    };
}

if (typeof getDefaultCTData === 'undefined') {
    window.getDefaultCTData = function() {
        return {
            "ESE 3203": [{ name: "CT-1", teacher: "MSH", status: "Upcoming", syllabus: "Natural Gas Properties", marks: "" }, { name: "CT-2", teacher: "AA", status: "Upcoming", syllabus: "Crude Oil Fractionation", marks: "" }, { name: "CT-3", teacher: "MSH / AA", status: "Pending", syllabus: "Gas Dehydration", marks: "" }],
            "ESE 3207": [{ name: "CT-1", teacher: "NL", status: "Upcoming", syllabus: "Solar Radiation & P-N Junction", marks: "" }, { name: "CT-2", teacher: "NAP", status: "Upcoming", syllabus: "PV Sizing", marks: "" }, { name: "CT-3", teacher: "NL / NAP", status: "Pending", syllabus: "MPPT & Grid", marks: "" }],
            "ESE 3211": [{ name: "CT-1", teacher: "MHA", status: "Upcoming", syllabus: "Coal Analysis", marks: "" }, { name: "CT-2", teacher: "MMA", status: "Upcoming", syllabus: "Steam Generators", marks: "" }, { name: "CT-3", teacher: "MHA", status: "Pending", syllabus: "Ash Handling", marks: "" }, { name: "CT-4 (4 Cr)", teacher: "MMA", status: "Pending", syllabus: "Clean Coal Tech", marks: "" }],
            "ESE 3217": [{ name: "CT-1", teacher: "MR", status: "Upcoming", syllabus: "Transfer Functions", marks: "" }, { name: "CT-2", teacher: "KS", status: "Upcoming", syllabus: "Sensors & Error", marks: "" }, { name: "CT-3", teacher: "MR / KS", status: "Pending", syllabus: "PID Control", marks: "" }],
            "ESE 3221": [{ name: "CT-1", teacher: "MAI", status: "Upcoming", syllabus: "Thermal Storage", marks: "" }, { name: "CT-2", teacher: "GSF", status: "Upcoming", syllabus: "Battery Kinetics", marks: "" }, { name: "CT-3", teacher: "MAI / GSF", status: "Pending", syllabus: "Pumped Hydro & H2", marks: "" }]
        };
    };
}

if (typeof ESE_SEMESTER_PRESETS === 'undefined') {
    window.ESE_SEMESTER_PRESETS = {
        "1-1": { label: "1st Year 1st Term (1-1) — 20.50 Credits", courses: [{ name: "Ch 1113 — Chemistry I", credit: 3.00, gp: 4.00 }, { name: "Ch 1114 — Sessional on Ch 1113", credit: 0.75, gp: 4.00 }, { name: "ESE 1100 — Engineering Drawing I", credit: 1.50, gp: 4.00 }, { name: "ESE 1101 — Fundamentals of Energy Resources", credit: 3.00, gp: 4.00 }, { name: "ESE 1102 — Sessional on ESE 1101", credit: 0.75, gp: 4.00 }, { name: "HUM 1000 — History of Bengali Language (Non-Credit)", credit: 0.00, gp: 0.00 }, { name: "Hum 1113 — Sociology and Behavioural Science", credit: 3.00, gp: 4.00 }, { name: "Math 1113 — Differential and Integral Calculus", credit: 3.00, gp: 4.00 }, { name: "MES 1114 — Workshop Practice", credit: 0.75, gp: 4.00 }, { name: "Ph 1113 — Physics", credit: 4.00, gp: 4.00 }, { name: "Ph 1114 — Sessional on Ph 1113", credit: 0.75, gp: 4.00 }] },
        "1-2": { label: "1st Year 2nd Term (1-2) — 20.75 Credits", courses: [{ name: "Ch 1213 — Chemistry II", credit: 3.00, gp: 4.00 }, { name: "EE 1213 — Electrical Circuits and Electronics", credit: 4.00, gp: 4.00 }, { name: "EE 1214 — Sessional on EE 1213", credit: 0.75, gp: 4.00 }, { name: "ESE 1200 — Engineering Drawing II", credit: 1.50, gp: 4.00 }, { name: "ESE 1205 — Thermodynamics for Energy Engineering", credit: 4.00, gp: 4.00 }, { name: "ESE 1206 — Sessional on ESE 1205", credit: 0.75, gp: 4.00 }, { name: "Hum 1213 — Technical English", credit: 3.00, gp: 4.00 }, { name: "Hum 1214 — Sessional on Hum 1213", credit: 0.75, gp: 4.00 }, { name: "Math 1213 — Differential Equation and Co-ordinate Geometry", credit: 3.00, gp: 4.00 }] },
        "2-1": { label: "2nd Year 1st Term (2-1) — 19.75 Credits", courses: [{ name: "CSE 2113 — Computer Programming", credit: 3.00, gp: 4.00 }, { name: "CSE 2114 — Sessional on CSE 2113", credit: 1.50, gp: 4.00 }, { name: "EE 2113 — Electrical Machines", credit: 3.00, gp: 4.00 }, { name: "EE 2114 — Sessional on EE 2113", credit: 0.75, gp: 4.00 }, { name: "Math 2113 — Linear Algebra and Vector Analysis", credit: 4.00, gp: 4.00 }, { name: "ME 2113 — Statics and Solid Mechanics", credit: 3.00, gp: 4.00 }, { name: "ME 2114 — Sessional on ME 2113", credit: 0.75, gp: 4.00 }, { name: "ME 2115 — Fluid Mechanics", credit: 3.00, gp: 4.00 }, { name: "ME 2116 — Sessional on ME 2115", credit: 0.75, gp: 4.00 }] },
        "2-2": { label: "2nd Year 2nd Term (2-2) — 19.00 Credits", courses: [{ name: "EE 2213 — Power Electronics", credit: 4.00, gp: 4.00 }, { name: "EE 2214 — Sessional on EE 2213", credit: 0.75, gp: 4.00 }, { name: "ESE 2209 — Bio and Wind Energy Engineering", credit: 3.00, gp: 4.00 }, { name: "ESE 2210 — Sessional on ESE 2209", credit: 0.75, gp: 4.00 }, { name: "ESE 2230 — Energy Engineering Simulation I", credit: 0.75, gp: 4.00 }, { name: "Hum 2213 — Economics and Accounting", credit: 3.00, gp: 4.00 }, { name: "Math 2213 — Complex Variables and Fourier Analysis", credit: 3.00, gp: 4.00 }, { name: "ME 2213 — Dynamics and Kinematics of Machineries", credit: 3.00, gp: 4.00 }, { name: "ME 2214 — Sessional on ME 2213", credit: 0.75, gp: 4.00 }] },
        "3-1": { label: "3rd Year 1st Term (3-1) — 20.50 Credits", courses: [{ name: "Math 3114 — Sessional on Math 3113", credit: 1.50, gp: 4.00 }, { name: "EE 3113 — Power System Engineering", credit: 3.00, gp: 4.00 }, { name: "EE 3114 — Sessional on EE 3113", credit: 0.75, gp: 4.00 }, { name: "ESE 3105 — Heat and Mass Transfer", credit: 4.00, gp: 4.00 }, { name: "ESE 3106 — Sessional on ESE 3105", credit: 0.75, gp: 4.00 }, { name: "ESE 3107 — Solar Thermal Engineering", credit: 3.00, gp: 4.00 }, { name: "ESE 3108 — Sessional on ESE 3107", credit: 0.75, gp: 4.00 }, { name: "ESE 3123 — Thermo-Fluid Devices", credit: 3.00, gp: 4.00 }, { name: "ESE 3124 — Sessional on ESE 3123", credit: 0.75, gp: 4.00 }, { name: "Math 3113 — Statistics and Numerical Methods", credit: 3.00, gp: 4.00 }] },
        "3-2": { label: "3rd Year 2nd Term (3-2) — 20.50 Credits", courses: [{ name: "ESE 3200 — Seminar on Special Topics", credit: 0.75, gp: 4.00 }, { name: "ESE 3202 — Energy Innovation Lab", credit: 0.75, gp: 4.00 }, { name: "ESE 3203 — Petroleum and Natural Gas Processing", credit: 3.00, gp: 4.00 }, { name: "ESE 3204 — Sessional on ESE 3203", credit: 0.75, gp: 4.00 }, { name: "ESE 3207 — Solar Photovoltaic Systems", credit: 3.00, gp: 4.00 }, { name: "ESE 3208 — Sessional on ESE 3207", credit: 0.75, gp: 4.00 }, { name: "ESE 3211 — Coal Power Generation", credit: 4.00, gp: 4.00 }, { name: "ESE 3217 — Instrumentation and Control", credit: 3.00, gp: 4.00 }, { name: "ESE 3218 — Sessional on ESE 3217", credit: 0.75, gp: 4.00 }, { name: "ESE 3221 — Energy Storage Systems", credit: 3.00, gp: 4.00 }, { name: "ESE 3222 — Sessional on ESE 3221", credit: 0.75, gp: 4.00 }, { name: "ESE 3250 — Industrial Attachment (Non-Credit)", credit: 0.00, gp: 0.00 }] }
    };
}

if (typeof PREVIOUS_TERM_CREDITS === 'undefined') {
    window.PREVIOUS_TERM_CREDITS = [
        { id: "termGpa_1_1", label: "1-1", credit: 20.50 },
        { id: "termGpa_1_2", label: "1-2", credit: 20.75 },
        { id: "termGpa_2_1", label: "2-1", credit: 19.75 },
        { id: "termGpa_2_2", label: "2-2", credit: 19.00 },
        { id: "termGpa_3_1", label: "3-1", credit: 20.50 }
    ];
}

if (typeof GRADE_OPTIONS === 'undefined') {
    window.GRADE_OPTIONS = [
        { label: "A+ (4.00)", val: 4.00 },
        { label: "A  (3.75)", val: 3.75 },
        { label: "A- (3.50)", val: 3.50 },
        { label: "B+ (3.25)", val: 3.25 },
        { label: "B  (3.00)", val: 3.00 },
        { label: "B- (2.75)", val: 2.75 },
        { label: "C+ (2.50)", val: 2.50 },
        { label: "C  (2.25)", val: 2.25 },
        { label: "D  (2.00)", val: 2.00 },
        { label: "F  (0.00)", val: 0.00 }
    ];
}

// ================= SAFE LOCAL STORAGE HELPERS =================
function saveLocal(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
        console.warn('Local storage error:', e);
    }
}

function loadLocal(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null || raw === "undefined") return fallback;
        const parsed = JSON.parse(raw);
        return parsed || fallback;
    } catch (e) {
        return fallback;
    }
}

// ================= CLOUD DATABASE SYNC ENGINE =================
let firebaseDbUrl = (localStorage.getItem('kuet_ese32_firebase_url') || DEFAULT_FIREBASE_DB_URL || '').trim().replace(/\/$/, '');
let lastSeenNoticeId = localStorage.getItem('kuet_ese32_last_notice_id') || '';

async function pushStateToCloud() {
    if (!firebaseDbUrl) return;
    const payload = {
        updatedAt: Date.now(),
        masterDriveUrl,
        courseDriveLinks,
        baseRegularRoutine,
        masterRoutine,
        customResources,
        notices,
        ctSyllabus: extractCTSyllabusOnly()
    };

    try {
        await fetch(`${firebaseDbUrl}/portal_state.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        updateCloudStatusIndicator(true);
    } catch (err) {
        console.warn('Cloud push failed:', err);
        updateCloudStatusIndicator(false);
    }
}

async function pullStateFromCloud(isInitialLoad = false) {
    if (!firebaseDbUrl) {
        updateCloudStatusIndicator(false);
        return;
    }

    try {
        const res = await fetch(`${firebaseDbUrl}/portal_state.json?t=${Date.now()}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const cloudData = await res.json();
        updateCloudStatusIndicator(true);

        if (!cloudData) {
            await pushStateToCloud();
            return;
        }

        let uiNeedsUpdate = false;

        if (cloudData.masterDriveUrl && cloudData.masterDriveUrl !== masterDriveUrl) {
            masterDriveUrl = cloudData.masterDriveUrl;
            saveLocal('kuet_ese32_master_drive', masterDriveUrl);
            syncMasterDriveButtons();
        }

        if (cloudData.courseDriveLinks) {
            courseDriveLinks = cloudData.courseDriveLinks;
            saveLocal('kuet_ese32_course_drives', courseDriveLinks);
            uiNeedsUpdate = true;
        }

        if (cloudData.baseRegularRoutine && cloudData.baseRegularRoutine.Sunday) {
            baseRegularRoutine = cloudData.baseRegularRoutine;
            saveLocal('kuet_ese32_base_routine', baseRegularRoutine);
        }

        if (cloudData.masterRoutine && cloudData.masterRoutine.Sunday) {
            masterRoutine = cloudData.masterRoutine;
            saveLocal('kuet_ese32_master_routine', masterRoutine);
            uiNeedsUpdate = true;
        }

        if (Array.isArray(cloudData.customResources)) {
            customResources = cloudData.customResources;
            saveLocal('kuet_ese32_resources', customResources);
            uiNeedsUpdate = true;
        }

        if (cloudData.ctSyllabus) {
            mergeCloudCTSyllabus(cloudData.ctSyllabus);
            renderCTTracker();
        }

        if (Array.isArray(cloudData.notices) && cloudData.notices.length > 0) {
            const newestNotice = cloudData.notices[0];
            const newestId = newestNotice.id || newestNotice.text;

            if (lastSeenNoticeId && newestId !== lastSeenNoticeId && !isInitialLoad) {
                triggerIncomingNoticeNotification(newestNotice);
            }

            lastSeenNoticeId = newestId;
            localStorage.setItem('kuet_ese32_last_notice_id', newestId);

            notices = cloudData.notices;
            saveLocal('kuet_ese32_notices', notices);
            renderNotices();
        }

        if (uiNeedsUpdate) {
            renderMasterRoutineTable();
            renderDaySchedule(currentSelectedDay);
            renderCourses();
        }
    } catch (err) {
        console.warn('Cloud pull error:', err);
        updateCloudStatusIndicator(false);
    }
}

function updateCloudStatusIndicator(connected) {
    const badge = document.getElementById('weekCycleBadge');
    if (!badge) return;
    if (firebaseDbUrl && connected) {
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span><span>Live Cloud Sync Active</span>`;
    }
}

function extractCTSyllabusOnly() {
    const clean = {};
    Object.keys(ctData).forEach(code => {
        clean[code] = ctData[code].map(ct => ({
            name: ct.name,
            teacher: ct.teacher,
            status: ct.status,
            syllabus: ct.syllabus
        }));
    });
    return clean;
}

function mergeCloudCTSyllabus(cloudSyllabus) {
    Object.keys(cloudSyllabus).forEach(code => {
        if (!ctData[code]) ctData[code] = [];
        cloudSyllabus[code].forEach((item, idx) => {
            const existingMark = getPersonalCTMark(code, idx, ctData[code][idx]?.marks || "");
            ctData[code][idx] = { ...item, marks: existingMark };
        });
    });
    saveLocal('kuet_ese32_cts', ctData);
}

// ================= PUSH NOTIFICATIONS =================
function updateNotificationButtonUI() {
    const btn = document.getElementById('enableNotifyBtn');
    const txt = document.getElementById('notifyBtnText');
    if (!btn || !txt || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
        txt.textContent = "Alerts On";
        btn.className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition";
    } else if (Notification.permission === "denied") {
        txt.textContent = "Alerts Blocked";
    } else {
        txt.textContent = "Enable Alerts";
    }
}

async function requestPushNotificationPermission() {
    if (!("Notification" in window)) {
        alert("📲 On iPhone (iOS): Tap 'Share' -> 'Add to Home Screen' first, then open the app from your Home Screen to enable notifications!");
        return;
    }

    const permission = await Notification.requestPermission();
    updateNotificationButtonUI();

    if (permission === "granted") {
        triggerIncomingNoticeNotification({
            date: "Active",
            type: "info",
            text: "Notifications are now active! You will receive alerts whenever a class is canceled or an extra class is scheduled."
        });
    } else {
        alert("⚠️ Notification permission was blocked. Please allow notifications in your browser site settings.");
    }
}

async function triggerIncomingNoticeNotification(noticeObj) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const title = noticeObj.type === "canceled"
        ? "🚨 Class Canceled — ESE 3-2"
        : noticeObj.type === "extra"
        ? "📅 Extra Class Scheduled — ESE 3-2"
        : "📢 New Notice — KUET ESE 3-2";

    const options = {
        body: noticeObj.text,
        tag: noticeObj.id || 'ese32-notice-' + Date.now(),
        renotify: true,
        vibrate: [200, 100, 200]
    };

    try {
        if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg && reg.showNotification) {
                await reg.showNotification(title, options);
                return;
            }
        }
        new Notification(title, options);
    } catch (e) {
        try { new Notification(title, options); } catch (err) {}
    }
}

// ================= WEEKLY AUTO-REFRESH ENGINE (RESETS FRIDAY 12:00 AM) =================
function getCurrentAcademicWeekInfo() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceFriday = (dayOfWeek + 2) % 7;
    const cycleStartFriday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceFriday);

    const classSunday = new Date(cycleStartFriday.getFullYear(), cycleStartFriday.getMonth(), cycleStartFriday.getDate() + 2);
    const classThursday = new Date(cycleStartFriday.getFullYear(), cycleStartFriday.getMonth(), cycleStartFriday.getDate() + 6);

    const weekId = `FRI-${cycleStartFriday.getFullYear()}-${String(cycleStartFriday.getMonth() + 1).padStart(2, '0')}-${String(cycleStartFriday.getDate()).padStart(2, '0')}`;
    const rangeText = `Week: ${classSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${classThursday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    return { weekId, rangeText };
}

function refreshRoutineKeepEditedRegulars(currentRoutine, fallbackRegularRoutine) {
    const refreshed = {};
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].forEach(day => {
        const currentSlots = (currentRoutine && Array.isArray(currentRoutine[day])) ? currentRoutine[day] : Array(9).fill(null);
        const baseSlots = (fallbackRegularRoutine && Array.isArray(fallbackRegularRoutine[day])) ? fallbackRegularRoutine[day] : Array(9).fill(null);

        refreshed[day] = currentSlots.map((slot, idx) => {
            if (!slot) return null;
            if (slot.kind === "extra") {
                const underlyingRegular = baseSlots[idx];
                if (underlyingRegular && underlyingRegular.kind === "regular") {
                    return { ...underlyingRegular, kind: "regular", status: "active", note: "" };
                }
                return null;
            }
            return { ...slot, kind: "regular", status: "active", note: "" };
        });
    });
    return refreshed;
}

// ================= STATE & INDIVIDUAL USER STORAGE =================
let isAdmin = false;
let currentSelectedDay = "Sunday";
let adminPin = localStorage.getItem('kuet_ese32_pin') || '2022';
let masterDriveUrl = localStorage.getItem('kuet_ese32_master_drive') || 'https://drive.google.com';
let courseDriveLinks = loadLocal('kuet_ese32_course_drives', {});
let customResources = loadLocal('kuet_ese32_resources', []);

let baseRegularRoutine = loadLocal('kuet_ese32_base_routine', getInitialSeedRoutine());
if (!baseRegularRoutine || !baseRegularRoutine.Sunday) baseRegularRoutine = getInitialSeedRoutine();

let masterRoutine = loadLocal('kuet_ese32_master_routine', baseRegularRoutine);
if (!masterRoutine || !masterRoutine.Sunday) masterRoutine = JSON.parse(JSON.stringify(baseRegularRoutine));

let notices = loadLocal('kuet_ese32_notices', [
    { id: "seed-1", date: "Pinned", type: "info", persistent: true, text: "All theory classes are held in Room ESE-506 (Block-D, Academic Building 1)." },
    { id: "seed-2", date: "Lab Update", type: "info", persistent: true, text: "Wednesday 2:30 PM Lab alternates between ESE 3204 (MSH+AA) and ESE 3218 (MR+KS)." }
]);

let ctData = loadLocal('kuet_ese32_cts', getDefaultCTData());
let personalCTMarks = loadLocal('kuet_ese32_personal_marks', {});

let personalCGPAState = loadLocal('kuet_ese32_personal_cgpa_state', {
    mode: 'terms',
    termGPAs: { termGpa_1_1: "", termGpa_1_2: "", termGpa_2_1: "", termGpa_2_2: "", termGpa_3_1: "" },
    directCredits: "",
    directCGPA: "",
    activePresetLabel: "3rd Year 2nd Term (3-2) — 20.50 Credits"
});

let prevCalcMode = personalCGPAState.mode || 'terms';
let generalCalcRows = loadLocal('kuet_general_cgpa_rows', JSON.parse(JSON.stringify(ESE_SEMESTER_PRESETS["3-2"].courses)));
let activeCourseModalCode = null;

function checkAndRunWeeklyAutoRefresh() {
    const { weekId, rangeText } = getCurrentAcademicWeekInfo();
    const savedWeekId = localStorage.getItem('kuet_ese32_week_id');

    const labelEl = document.getElementById('currentWeekRangeLabel');
    if (labelEl) labelEl.textContent = rangeText;

    if (savedWeekId !== weekId) {
        masterRoutine = refreshRoutineKeepEditedRegulars(masterRoutine, baseRegularRoutine);
        baseRegularRoutine = JSON.parse(JSON.stringify(masterRoutine));

        saveLocal('kuet_ese32_master_routine', masterRoutine);
        saveLocal('kuet_ese32_base_routine', baseRegularRoutine);
        localStorage.setItem('kuet_ese32_week_id', weekId);

        notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
        saveLocal('kuet_ese32_notices', notices);
        pushStateToCloud();
    }
}

function manualWeeklyRefresh() {
    if (!isAdmin) return;
    if (!confirm("Run Weekly Refresh now?\n\n• Extra Classes will be removed.\n• Canceled Regular Classes will become Active again.\n• All your edited Regular Classes will remain as the default.")) return;

    masterRoutine = refreshRoutineKeepEditedRegulars(masterRoutine, baseRegularRoutine);
    baseRegularRoutine = JSON.parse(JSON.stringify(masterRoutine));

    saveLocal('kuet_ese32_master_routine', masterRoutine);
    saveLocal('kuet_ese32_base_routine', baseRegularRoutine);

    notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
    saveLocal('kuet_ese32_notices', notices);

    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
    pushStateToCloud();
}

// ================= INITIALIZATION =================
function initPortal() {
    applySavedTheme();
    checkAndRunWeeklyAutoRefresh();
    updateNotificationButtonUI();

    if (typeof lucide !== 'undefined') lucide.createIcons();
    updateClock();
    setInterval(updateClock, 30000);

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[new Date().getDay()];
    currentSelectedDay = masterRoutine[todayName] ? todayName : "Sunday";

    syncMasterDriveButtons();
    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
    renderCourses();
    renderCTTracker();
    renderFaculty();
    initGeneralCGPACalculator();
    populateResourceCourseDropdown();

    pullStateFromCloud(true);
    setInterval(() => pullStateFromCloud(false), 8000);
}

function updateClock() {
    const now = new Date();
    const str = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' • ' +
                now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const clockEl = document.getElementById('liveClock');
    if (clockEl) clockEl.textContent = str;
}

function syncMasterDriveButtons() {
    ['topMasterDriveBtn', 'dashboardMasterDriveBtn', 'materialsMasterDriveBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.href = masterDriveUrl || 'https://drive.google.com';
    });
}

function getCourseDriveUrl(courseCode) {
    return courseDriveLinks[courseCode] || masterDriveUrl || 'https://drive.google.com';
}

function hasCustomCourseDrive(courseCode) {
    return Boolean(courseDriveLinks[courseCode] && courseDriveLinks[courseCode] !== 'https://drive.google.com');
}

function extractDriveFolderId(url) {
    if (!url) return null;
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

function getCourseTitle(code) {
    if (code === "ESE 3204 / ESE 3218") return "Alternate Sessional (ESE 3204 / ESE 3218)";
    const c = COURSES.find(x => x.code === code);
    return c ? c.title : code;
}

// ================= ADMIN AUTHENTICATION =================
function handleAdminToggle() {
    if (isAdmin) {
        logoutAdmin();
        return;
    }
    const entered = prompt("Enter Admin PIN to unlock customization (Default PIN: 2022):");
    if (entered === null) return;
    if (entered.trim() === adminPin) {
        setAdminMode(true);
    } else {
        alert("Incorrect Admin PIN!");
    }
}

function setAdminMode(state) {
    isAdmin = state;
    const banner = document.getElementById('adminControlBanner');
    const btnText = document.getElementById('adminBtnText');
    const toggleBtn = document.getElementById('adminToggleBtn');
    const subtext = document.getElementById('routineTableSubtext');

    if (isAdmin) {
        if (banner) banner.classList.remove('hidden');
        if (btnText) btnText.textContent = "Admin Active (Exit)";
        if (toggleBtn) toggleBtn.className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition";
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        if (subtext) subtext.innerHTML = "<strong>Admin Mode:</strong> Click any slot to Edit, Cancel, or Add an Extra Class. Regular class edits are saved permanently as your new default routine.";
    } else {
        if (banner) banner.classList.add('hidden');
        if (btnText) btnText.textContent = "Admin";
        if (toggleBtn) toggleBtn.className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition";
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        if (subtext) subtext.textContent = "Click any course in the routine to open its Google Drive folder and study materials.";
    }

    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
    renderCourses();
    renderCTTracker();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function logoutAdmin() {
    setAdminMode(false);
}

// ================= DYNAMIC MASTER ROUTINE TABLE =================
function getSlotThemeClasses(slot) {
    const isCanceled = slot.status === "canceled";
    const isExtra = slot.kind === "extra";
    const isLab = slot.type === "Sessional";

    if (isCanceled) {
        return {
            cardBg: "canceled-stripes bg-rose-50/90 dark:bg-rose-950/60 border-2 border-rose-500/80 dark:border-rose-500/70",
            codeText: "line-through text-rose-700 dark:text-rose-300",
            subText: "text-rose-600 dark:text-rose-300 font-semibold",
            badge: isExtra
                ? `<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider">EXTRA CANCELED</span>`
                : `<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider">CANCELED</span>`
        };
    }

    if (isExtra) {
        return {
            cardBg: "bg-purple-50 dark:bg-purple-950/50 border-2 border-purple-400 dark:border-purple-600 shadow-sm",
            codeText: "text-purple-700 dark:text-purple-300",
            subText: "text-purple-600 dark:text-purple-300",
            badge: `<span class="px-1.5 py-0.5 rounded bg-purple-600 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider">EXTRA CLASS</span>`
        };
    }

    if (isLab) {
        return {
            cardBg: "bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/70",
            codeText: "text-sky-700 dark:text-sky-300",
            subText: "text-slate-500 dark:text-slate-400",
            badge: `<span class="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono text-[9px] font-bold">LAB</span>`
        };
    }

    return {
        cardBg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70",
        codeText: "text-emerald-700 dark:text-emerald-300",
        subText: "text-slate-500 dark:text-slate-400",
        badge: ""
    };
}

function renderMasterRoutineTable() {
    const tbody = document.getElementById('masterRoutineTbody');
    if (!tbody) return;
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    tbody.innerHTML = days.map((day, dayIdx) => {
        const rowSlots = masterRoutine[day] || Array(9).fill(null);
        let cellsHtml = `<td class="p-3 font-bold text-left bg-slate-50/60 dark:bg-slate-900/60">${day}</td>`;

        let p = 0;
        while (p < 9) {
            if (p === 3 && dayIdx === 0) {
                cellsHtml += `<td rowspan="5" class="bg-amber-50/40 dark:bg-amber-950/10 text-[10px] font-mono text-amber-600 dark:text-amber-400 select-none px-1">BREAK</td>`;
            }
            if (p === 6 && dayIdx === 0) {
                cellsHtml += `<td rowspan="5" class="bg-amber-50/40 dark:bg-amber-950/10 text-[10px] font-mono text-amber-600 dark:text-amber-400 select-none px-1">LUNCH & PRAYER</td>`;
            }

            const slot = rowSlots[p];
            if (!slot) {
                cellsHtml += `
                    <td class="p-1.5">
                        ${isAdmin
                            ? `<button onclick="openRoutineSlotModal('${day}', ${p})" class="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition text-[11px] font-mono flex flex-col items-center justify-center gap-0.5">
                                <span>+ Slot</span>
                               </button>`
                            : `<span class="text-slate-300 dark:text-slate-700 select-none">—</span>`
                        }
                    </td>
                `;
                p++;
            } else {
                const span = Math.min(slot.span || 1, 9 - p);
                const theme = getSlotThemeClasses(slot);
                const primaryCode = `${slot.code.split(' ')[0]} ${slot.code.split(' ')[1]}`;

                cellsHtml += `
                    <td colspan="${span}" class="p-1.5 align-top">
                        <div onclick="handleRoutineCellClick('${day}', ${p}, '${primaryCode}')" class="cursor-pointer p-2 rounded-xl ${theme.cardBg} hover:scale-[1.01] transition relative group">
                            ${theme.badge ? `<div class="mb-1 flex justify-center">${theme.badge}</div>` : ''}
                            <div class="font-mono font-extrabold ${theme.codeText}">${slot.code}</div>
                            <div class="text-[10px] ${theme.subText} mt-0.5">${slot.teacher || ''}</div>
                            ${slot.note ? `<div class="text-[9px] mt-1 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-medium truncate">${slot.note}</div>` : ''}
                            ${isAdmin ? `<div class="mt-1 text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-0.5"><i data-lucide="edit-3" class="w-2.5 h-2.5"></i> Edit / Cancel</div>` : ''}
                        </div>
                    </td>
                `;
                p += span;
            }
        }

        return `<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">${cellsHtml}</tr>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleRoutineCellClick(day, periodIdx, courseCode) {
    if (isAdmin) {
        openRoutineSlotModal(day, periodIdx);
    } else {
        openCourseDetail(courseCode);
    }
}

// ================= DAILY SCHEDULE RENDERER =================
function renderDaySchedule(day) {
    currentSelectedDay = day;
    const titleEl = document.getElementById('selectedDayTitle');
    if (titleEl) titleEl.textContent = `${day}'s Classes`;

    document.querySelectorAll('.day-pill').forEach(btn => {
        if (btn.dataset.day === day) {
            btn.className = "day-pill px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm transition";
        } else {
            btn.className = "day-pill px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition";
        }
    });

    const container = document.getElementById('dayScheduleContainer');
    if (!container) return;
    const rowSlots = masterRoutine[day] || [];
    const activeCards = [];

    let p = 0;
    while (p < 9) {
        const slot = rowSlots[p];
        if (slot) {
            const span = slot.span || 1;
            const pInfo = PERIOD_INFO[p];
            const timeStr = span === 3 && pInfo.labTime ? pInfo.labTime : pInfo.time;
            const periodStr = span > 1 ? `${pInfo.label} (${span} Periods)` : pInfo.label;
            activeCards.push({ slot, periodIdx: p, timeStr, periodStr });
            p += span;
        } else {
            p++;
        }
    }

    if (activeCards.length === 0) {
        container.innerHTML = `<div class="col-span-2 p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400">No classes scheduled for ${day}.</div>`;
        return;
    }

    container.innerHTML = activeCards.map(({ slot, periodIdx, timeStr, periodStr }) => {
        const theme = getSlotThemeClasses(slot);
        const cleanCode = `${slot.code.split(' ')[0]} ${slot.code.split(' ')[1]}`;
        const title = getCourseTitle(slot.code);
        const isCanceled = slot.status === "canceled";

        return `
            <div class="p-3.5 rounded-xl ${theme.cardBg} transition flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-1.5">
                        <span onclick="openCourseDetail('${cleanCode}')" class="cursor-pointer px-2 py-0.5 rounded text-[11px] font-mono font-extrabold bg-white/80 dark:bg-slate-900/80 ${theme.codeText}">${slot.code}</span>
                        ${theme.badge}
                    </div>
                    <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">${timeStr}</span>
                </div>

                <div onclick="openCourseDetail('${cleanCode}')" class="cursor-pointer">
                    <div class="font-bold text-xs ${isCanceled ? 'line-through text-rose-700 dark:text-rose-300' : 'text-slate-800 dark:text-slate-100'}">${title}</div>
                    <div class="text-[11px] ${theme.subText} mt-0.5">Teacher: <strong>${slot.teacher}</strong> • <span class="font-mono">${periodStr}</span></div>
                    ${slot.note ? `<div class="mt-1.5 text-[11px] px-2 py-1 rounded-lg bg-white/70 dark:bg-slate-900/70 text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-1"><i data-lucide="info" class="w-3 h-3 shrink-0"></i><span>${slot.note}</span></div>` : ''}
                </div>

                <div class="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                    <button onclick="openCourseDetail('${cleanCode}')" class="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                        <i data-lucide="folder-open" class="w-3 h-3"></i>
                        <span>Drive Materials</span>
                    </button>
                    ${isAdmin ? `
                        <div class="flex items-center gap-2">
                            <button onclick="quickToggleCancelSlot('${day}', ${periodIdx})" class="font-bold ${isCanceled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} hover:underline">
                                ${isCanceled ? 'Make Active' : 'Cancel Class'}
                            </button>
                            <button onclick="openRoutineSlotModal('${day}', ${periodIdx})" class="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">
                                Edit
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ================= ADMIN SLOT EDITOR =================
function openRoutineSlotModal(day, periodIdx) {
    if (!isAdmin) return;
    document.getElementById('slotDaySelect').value = day || currentSelectedDay;
    document.getElementById('slotPeriodSelect').value = String(periodIdx ?? 0);
    loadSlotIntoModal();
    document.getElementById('routineSlotModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeRoutineSlotModal() {
    document.getElementById('routineSlotModal').classList.add('hidden');
}

function loadSlotIntoModal() {
    const day = document.getElementById('slotDaySelect').value;
    const pIdx = parseInt(document.getElementById('slotPeriodSelect').value, 10);
    const slot = (masterRoutine[day] && masterRoutine[day][pIdx]) ? masterRoutine[day][pIdx] : null;

    if (slot) {
        document.getElementById('slotCourseSelect').value = slot.code;
        document.getElementById('slotSpanSelect').value = String(slot.span || 1);
        document.getElementById('slotTeacherInput').value = slot.teacher || '';
        document.getElementById('slotKindSelect').value = slot.kind || 'regular';
        document.getElementById('slotNoteInput').value = slot.note || '';
        document.getElementsByName('slotStatusRadio').forEach(r => r.checked = (r.value === (slot.status || 'active')));
    } else {
        document.getElementById('slotCourseSelect').value = "ESE 3203";
        document.getElementById('slotSpanSelect').value = (pIdx === 6) ? "3" : "1";
        document.getElementById('slotTeacherInput').value = "MSH";
        document.getElementById('slotKindSelect').value = "extra";
        document.getElementById('slotNoteInput').value = "";
        document.getElementsByName('slotStatusRadio').forEach(r => r.checked = (r.value === 'active'));
    }
}

function autoFillSlotCourseDefaults() {
    const code = document.getElementById('slotCourseSelect').value;
    if (code === "EMPTY") return;
    const found = COURSES.find(c => c.code === code);
    if (found) {
        document.getElementById('slotTeacherInput').value = found.teachers.join(' / ');
        document.getElementById('slotSpanSelect').value = found.type === "Sessional" ? "3" : "1";
    }
}

function saveRoutineSlotChanges(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const day = document.getElementById('slotDaySelect').value;
    const pIdx = parseInt(document.getElementById('slotPeriodSelect').value, 10);
    const code = document.getElementById('slotCourseSelect').value;

    if (code === "EMPTY") {
        clearSlotCompletely();
        return;
    }

    const span = parseInt(document.getElementById('slotSpanSelect').value, 10) || 1;
    const teacher = document.getElementById('slotTeacherInput').value.trim() || "TBA";
    const kind = document.getElementById('slotKindSelect').value;
    const note = document.getElementById('slotNoteInput').value.trim();

    let status = "active";
    document.getElementsByName('slotStatusRadio').forEach(r => {
        if (r.checked) status = r.value;
    });

    const courseObj = COURSES.find(c => c.code === code);
    const type = courseObj ? courseObj.type : (span > 1 ? "Sessional" : "Theory");

    for (let i = 0; i < span && (pIdx + i) < 9; i++) {
        masterRoutine[day][pIdx + i] = null;
    }

    masterRoutine[day][pIdx] = { code, teacher, type, kind, status, span, note };
    saveLocal('kuet_ese32_master_routine', masterRoutine);

    if (kind === "regular") {
        for (let i = 0; i < span && (pIdx + i) < 9; i++) {
            baseRegularRoutine[day][pIdx + i] = null;
        }
        baseRegularRoutine[day][pIdx] = { code, teacher, type, kind: "regular", status: "active", span, note: "" };
        saveLocal('kuet_ese32_base_routine', baseRegularRoutine);
    }

    const shouldNotify = document.getElementById('slotAutoNoticeCheck').checked;
    if (shouldNotify) {
        const pInfo = PERIOD_INFO[pIdx];
        const reasonText = note ? ` (${note})` : '';
        let noticeMsg = "";
        let noticeType = "info";

        if (status === "canceled" && kind === "extra") {
            noticeType = "canceled";
            noticeMsg = `[EXTRA CLASS CANCELED] ${day} ${pInfo.label} (${pInfo.short}): Extra class of ${code} (${teacher}) is CANCELED${reasonText}.`;
        } else if (status === "canceled") {
            noticeType = "canceled";
            noticeMsg = `[CLASS CANCELED] ${day} ${pInfo.label} (${pInfo.short}): Regular class ${code} (${teacher}) is CANCELED for this week${reasonText}.`;
        } else if (kind === "extra") {
            noticeType = "extra";
            noticeMsg = `[EXTRA CLASS] ${day} ${pInfo.label} (${pInfo.short}): ${code} (${teacher}) extra class scheduled for this week${reasonText}.`;
        } else {
            noticeType = "info";
            noticeMsg = `[ROUTINE UPDATED] ${day} ${pInfo.label} (${pInfo.short}): Regular class ${code} (${teacher}) updated${reasonText}.`;
        }

        postAutomatedNotice(noticeMsg, noticeType, true);
    } else {
        pushStateToCloud();
    }

    closeRoutineSlotModal();
    renderMasterRoutineTable();
    renderDaySchedule(day);
}

function clearSlotCompletely() {
    if (!isAdmin) return;
    const day = document.getElementById('slotDaySelect').value;
    const pIdx = parseInt(document.getElementById('slotPeriodSelect').value, 10);
    const existing = masterRoutine[day][pIdx];

    masterRoutine[day][pIdx] = null;
    if (!existing || existing.kind === "regular") {
        baseRegularRoutine[day][pIdx] = null;
        saveLocal('kuet_ese32_base_routine', baseRegularRoutine);
    } else if (existing && existing.kind === "extra" && baseRegularRoutine[day][pIdx]) {
        masterRoutine[day][pIdx] = { ...baseRegularRoutine[day][pIdx], status: "active", note: "" };
    }

    saveLocal('kuet_ese32_master_routine', masterRoutine);

    if (existing && document.getElementById('slotAutoNoticeCheck').checked) {
        const pInfo = PERIOD_INFO[pIdx];
        postAutomatedNotice(`[SLOT REMOVED] ${day} ${pInfo.label}: ${existing.code} (${existing.teacher}) removed from schedule.`, "info", true);
    } else {
        pushStateToCloud();
    }

    closeRoutineSlotModal();
    renderMasterRoutineTable();
    renderDaySchedule(day);
}

function quickToggleCancelSlot(day, periodIdx) {
    if (!isAdmin) return;
    const slot = masterRoutine[day]?.[periodIdx];
    if (!slot) return;

    const pInfo = PERIOD_INFO[periodIdx];
    if (slot.status === "canceled") {
        slot.status = "active";
        slot.note = "";
        saveLocal('kuet_ese32_master_routine', masterRoutine);
        postAutomatedNotice(`[ACTIVE] ${day} ${pInfo.label} (${pInfo.short}): ${slot.kind === 'extra' ? 'Extra class' : 'Regular class'} ${slot.code} (${slot.teacher}) is active as scheduled.`, "info", true);
    } else {
        const reason = prompt(`Cancel ${slot.code} (${slot.teacher}) on ${day} ${pInfo.label} for this week?\nOptional reason (shown to students & posted in Notice Board):`, "Professor busy / Class postponed");
        if (reason === null) return;
        slot.status = "canceled";
        slot.note = reason.trim();
        saveLocal('kuet_ese32_master_routine', masterRoutine);
        const prefix = slot.kind === "extra" ? "[EXTRA CLASS CANCELED]" : "[CLASS CANCELED]";
        postAutomatedNotice(`${prefix} ${day} ${pInfo.label} (${pInfo.short}): ${slot.code} (${slot.teacher}) is CANCELED.${slot.note ? ' Note: ' + slot.note : ''}`, "canceled", true);
    }

    renderMasterRoutineTable();
    renderDaySchedule(day);
}

// ================= NOTICES & AUTOMATED ALERTS =================
function postAutomatedNotice(text, type = "info", isWeeklyTemp = false) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const newNotice = {
        id: 'notice-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        date: today,
        type,
        text,
        isWeeklyTemp
    };

    lastSeenNoticeId = newNotice.id;
    localStorage.setItem('kuet_ese32_last_notice_id', newNotice.id);

    notices.unshift(newNotice);
    saveLocal('kuet_ese32_notices', notices);
    renderNotices();
    pushStateToCloud();
    triggerIncomingNoticeNotification(newNotice);
}

function renderNotices() {
    const list = document.getElementById('noticeList');
    if (!list) return;
    list.innerHTML = notices.map((n, idx) => {
        let badgeStyle = "bg-amber-500/15 text-amber-600 dark:text-amber-400";
        let cardBorder = "border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60";

        if (n.type === "canceled" || (n.text && n.text.includes("CANCELED"))) {
            badgeStyle = "bg-rose-600 text-white";
            cardBorder = "border-rose-300 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/30";
        } else if (n.type === "extra" || (n.text && n.text.includes("EXTRA CLASS"))) {
            badgeStyle = "bg-purple-600 text-white";
            cardBorder = "border-purple-300 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/30";
        }

        return `
            <div class="p-2.5 rounded-xl border ${cardBorder} text-xs flex items-start justify-between gap-2">
                <div>
                    <span class="inline-block px-1.5 py-0.5 rounded ${badgeStyle} font-mono text-[10px] font-bold mr-1">${n.date}</span>
                    <span class="text-slate-800 dark:text-slate-200 font-medium">${n.text}</span>
                </div>
                ${isAdmin ? `<button onclick="deleteNotice(${idx})" class="text-slate-400 hover:text-rose-500 shrink-0" title="Remove"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>` : ''}
            </div>
        `;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function promptNewNotice() {
    if (!isAdmin) return;
    const text = prompt("Enter new announcement / CT notice for 2K22 Batch:");
    if (!text || !text.trim()) return;
    postAutomatedNotice(text.trim(), "info", false);
}

function deleteNotice(idx) {
    if (!isAdmin) return;
    notices.splice(idx, 1);
    saveLocal('kuet_ese32_notices', notices);
    renderNotices();
    pushStateToCloud();
}

// ================= ADMIN DRIVE LINKS MANAGER =================
function openAdminDriveManager() {
    if (!isAdmin) return;
    document.getElementById('adminMasterDriveInput').value = masterDriveUrl;
    const container = document.getElementById('adminCourseDriveInputs');
    container.innerHTML = COURSES.map(c => `
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="sm:w-1/3">
                <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">${c.code}</span>
                <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">${c.title}</div>
            </div>
            <div class="sm:w-2/3 flex items-center gap-2">
                <input type="url" data-course-drive="${c.code}" value="${courseDriveLinks[c.code] || ''}" placeholder="Paste ${c.code} Google Drive Folder URL..." class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs">
            </div>
        </div>
    `).join('');
    document.getElementById('adminDriveModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeAdminDriveManager() {
    document.getElementById('adminDriveModal').classList.add('hidden');
}

function saveAllAdminDriveLinks() {
    if (!isAdmin) return;
    const newMaster = document.getElementById('adminMasterDriveInput').value.trim();
    masterDriveUrl = newMaster || 'https://drive.google.com';
    saveLocal('kuet_ese32_master_drive', masterDriveUrl);

    document.querySelectorAll('[data-course-drive]').forEach(inp => {
        const code = inp.dataset.courseDrive;
        const val = inp.value.trim();
        if (val) courseDriveLinks[code] = val;
        else delete courseDriveLinks[code];
    });

    saveLocal('kuet_ese32_course_drives', courseDriveLinks);
    syncMasterDriveButtons();
    renderCourses();
    closeAdminDriveManager();
    pushStateToCloud();
}

function promptSingleCourseDriveLink(courseCode) {
    if (!isAdmin) return;
    const current = courseDriveLinks[courseCode] || '';
    const nextUrl = prompt(`Paste the Google Drive Folder link for ${courseCode}:`, current);
    if (nextUrl === null) return;
    if (nextUrl.trim()) courseDriveLinks[courseCode] = nextUrl.trim();
    else delete courseDriveLinks[courseCode];
    saveLocal('kuet_ese32_course_drives', courseDriveLinks);
    renderCourses();
    if (activeCourseModalCode === courseCode) openCourseDetail(courseCode);
    pushStateToCloud();
}

// ================= CLOUD SYNC / EXPORT JSON MODAL =================
function openCloudSyncModal() {
    if (!isAdmin) return;
    const exportPayload = {
        firebaseDbUrl,
        masterDriveUrl,
        courseDriveLinks,
        baseRegularRoutine,
        masterRoutine,
        customResources,
        notices
    };
    document.getElementById('configJsonBox').value = JSON.stringify(exportPayload, null, 2);

    const newFbUrl = prompt(
        "☁️ LIVE CLOUD SYNC SETUP (Firebase Realtime Database URL):\n\n" +
        "Paste your Firebase Realtime Database URL (e.g. https://your-project-default-rtdb.firebaseio.com) so notices & routine edits sync live:",
        firebaseDbUrl
    );
    if (newFbUrl !== null && newFbUrl.trim() !== firebaseDbUrl) {
        firebaseDbUrl = newFbUrl.trim().replace(/\/$/, '');
        localStorage.setItem('kuet_ese32_firebase_url', firebaseDbUrl);
        pushStateToCloud();
        alert("✅ Firebase Database URL connected! Don't forget to also paste this URL into DEFAULT_FIREBASE_DB_URL (Line 7 of js/app.js) on GitHub so all students' phones connect automatically!");
    }

    document.getElementById('cloudSyncModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeCloudSyncModal() {
    document.getElementById('cloudSyncModal').classList.add('hidden');
}

function updateAdminPin() {
    if (!isAdmin) return;
    const val = document.getElementById('newAdminPinInput').value.trim();
    if (!val) return alert("Enter a new PIN first.");
    adminPin = val;
    saveLocal('kuet_ese32_pin', adminPin);
    alert(`Admin PIN updated to: ${adminPin}`);
}

function copyConfigJson() {
    const box = document.getElementById('configJsonBox');
    box.select();
    navigator.clipboard.writeText(box.value);
    alert("Configuration JSON copied to clipboard!");
}

function importConfigJson() {
    if (!isAdmin) return;
    try {
        const raw = document.getElementById('configJsonBox').value.trim();
        const parsed = JSON.parse(raw);
        if (parsed.firebaseDbUrl) {
            firebaseDbUrl = parsed.firebaseDbUrl.replace(/\/$/, '');
            localStorage.setItem('kuet_ese32_firebase_url', firebaseDbUrl);
        }
        if (parsed.masterDriveUrl) {
            masterDriveUrl = parsed.masterDriveUrl;
            saveLocal('kuet_ese32_master_drive', masterDriveUrl);
        }
        if (parsed.courseDriveLinks) {
            courseDriveLinks = parsed.courseDriveLinks;
            saveLocal('kuet_ese32_course_drives', courseDriveLinks);
        }
        if (parsed.baseRegularRoutine) {
            baseRegularRoutine = parsed.baseRegularRoutine;
            saveLocal('kuet_ese32_base_routine', baseRegularRoutine);
        }
        if (parsed.masterRoutine) {
            masterRoutine = parsed.masterRoutine;
            saveLocal('kuet_ese32_master_routine', masterRoutine);
        }
        if (Array.isArray(parsed.customResources)) {
            customResources = parsed.customResources;
            saveLocal('kuet_ese32_resources', customResources);
        }
        if (Array.isArray(parsed.notices)) {
            notices = parsed.notices;
            saveLocal('kuet_ese32_notices', notices);
        }
        syncMasterDriveButtons();
        renderMasterRoutineTable();
        renderDaySchedule(currentSelectedDay);
        renderNotices();
        renderCourses();
        pushStateToCloud();
        closeCloudSyncModal();
        alert("All routine changes, Drive links, notices, and materials imported & synced!");
    } catch (e) {
        alert("Invalid JSON format.");
    }
}

// ================= TAB NAVIGATION =================
function switchTab(tabId) {
    ['dashboard', 'courses', 'ct-tracker', 'faculty', 'sgpa'].forEach(id => {
        const el = document.getElementById(`tab-${id}`);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.className = "tab-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm";
        } else {
            btn.className = "tab-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";
        }
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ================= COURSES & GOOGLE DRIVE REPOSITORY =================
function getMergedMaterials(courseCode) {
    const base = COURSES.find(c => c.code === courseCode)?.materials || [];
    const extra = customResources.filter(r => r.courseCode === courseCode);
    return [...extra, ...base];
}

function renderCourses() {
    const query = (document.getElementById('courseSearchInput')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('courseTypeFilter')?.value || 'ALL';
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    const filtered = COURSES.filter(c => {
        const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
        const teacherNames = c.teachers.map(t => FACULTY[t]?.name || t).join(' ').toLowerCase();
        const matchesQuery = c.code.toLowerCase().includes(query) ||
                             c.title.toLowerCase().includes(query) ||
                             c.teachers.join(' ').toLowerCase().includes(query) ||
                             teacherNames.includes(query);
        return matchesType && matchesQuery;
    });

    grid.innerHTML = filtered.map(c => {
        const materials = getMergedMaterials(c.code);
        const isTheory = c.type === 'Theory';
        const driveUrl = getCourseDriveUrl(c.code);
        const isCustomLinked = hasCustomCourseDrive(c.code);

        return `
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                            <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${isTheory ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'}">${c.code}</span>
                            ${isCustomLinked ? `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold">Drive Linked</span>` : ''}
                        </div>
                        <span class="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">${c.credit.toFixed(2)} Cr</span>
                    </div>

                    <h3 class="font-extrabold text-base mt-2.5 text-slate-900 dark:text-white">${c.title}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <i data-lucide="users" class="w-3.5 h-3.5 text-emerald-500"></i>
                        <span><strong>${c.teachers.map(t => FACULTY[t] ? `${t} (${FACULTY[t].name})` : t).join(', ')}</strong></span>
                    </p>

                    <div class="mt-4">
                        <a href="${driveUrl}" target="_blank" class="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2">
                            <i data-lucide="hard-drive" class="w-4 h-4"></i>
                            <span>Open ${c.code} Google Drive</span>
                            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                        </a>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            <span>Pinned Files (${materials.length})</span>
                            ${isAdmin ? `<button onclick="promptSingleCourseDriveLink('${c.code}')" class="text-amber-500 hover:underline font-mono">Edit Drive URL</button>` : ''}
                        </div>
                        ${materials.slice(0, 2).map(m => `
                            <a href="${m.url}" target="_blank" class="block p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-800 text-xs transition">
                                <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">${m.title}</div>
                                <div class="text-[10px] text-slate-500 flex justify-between mt-0.5">
                                    <span>${m.category}</span>
                                    <span class="font-mono text-emerald-600 dark:text-emerald-400">${m.section || ''}</span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button onclick="openCourseDetail('${c.code}')" class="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1">
                        <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                        View All Files / Embed (${materials.length})
                    </button>
                    ${isAdmin ? `
                        <button onclick="openResourceModal('${c.code}')" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition flex items-center gap-1">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                            <span>Add Link</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openCourseDetail(courseCode) {
    const course = COURSES.find(c => c.code === courseCode);
    if (!course) return;
    activeCourseModalCode = courseCode;

    const driveUrl = getCourseDriveUrl(courseCode);
    document.getElementById('modalCourseCode').textContent = course.code;
    document.getElementById('modalCourseCredit').textContent = `${course.credit.toFixed(2)} Credits • ${course.type}`;
    document.getElementById('modalCourseTitle').textContent = course.title;
    document.getElementById('modalCourseTeachers').textContent = `Instructors: ${course.teachers.map(t => FACULTY[t] ? `${FACULTY[t].name} (${t})` : t).join(' • ')} | Routine: ${course.schedule}`;
    document.getElementById('modalPrimaryDriveBtn').href = driveUrl;

    const folderId = extractDriveFolderId(driveUrl);
    const embedSec = document.getElementById('modalDriveEmbedSection');
    const iframe = document.getElementById('modalDriveIframe');
    if (folderId) {
        iframe.src = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
        embedSec.classList.remove('hidden');
    } else {
        iframe.src = "";
        embedSec.classList.add('hidden');
    }

    const materials = getMergedMaterials(courseCode);
    const body = document.getElementById('modalCourseBody');
    body.innerHTML = materials.map(m => `
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 transition gap-3">
            <div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">${m.category}</span>
                    <span class="text-[11px] font-mono text-slate-500">${m.section || 'All Sections'}</span>
                </div>
                <div class="font-bold text-sm mt-1 text-slate-900 dark:text-white">${m.title}</div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <a href="${m.url}" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                    <span>Open Drive</span>
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                </a>
                ${isAdmin && m.isCustom ? `<button onclick="deleteCustomResource('${courseCode}', '${m.title}')" class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
            </div>
        </div>
    `).join('');

    document.getElementById('courseDetailModal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function deleteCustomResource(courseCode, title) {
    if (!isAdmin) return;
    customResources = customResources.filter(r => !(r.courseCode === courseCode && r.title === title));
    saveLocal('kuet_ese32_resources', customResources);
    renderCourses();
    openCourseDetail(courseCode);
    pushStateToCloud();
}

function closeCourseDetail() {
    document.getElementById('courseDetailModal').classList.add('hidden');
}

function populateResourceCourseDropdown() {
    const select = document.getElementById('resCourseCode');
    if (!select) return;
    select.innerHTML = COURSES.map(c => `<option value="${c.code}">${c.code} — ${c.title}</option>`).join('');
}

function openResourceModal(preselectedCode) {
    if (!isAdmin) return;
    if (preselectedCode) document.getElementById('resCourseCode').value = preselectedCode;
    document.getElementById('addResourceModal').classList.remove('hidden');
}

function openResourceModalFromCourse() {
    if (!isAdmin) return;
    closeCourseDetail();
    openResourceModal(activeCourseModalCode);
}

function closeResourceModal() {
    document.getElementById('addResourceModal').classList.add('hidden');
}

function saveNewResource(e) {
    e.preventDefault();
    if (!isAdmin) return;
    const courseCode = document.getElementById('resCourseCode').value;
    const category = document.getElementById('resCategory').value;
    const section = document.getElementById('resSection').value.trim();
    const title = document.getElementById('resTitle').value.trim();
    const url = document.getElementById('resUrl').value.trim();

    customResources.unshift({ courseCode, category, section, title, url, isCustom: true });
    saveLocal('kuet_ese32_resources', customResources);
    closeResourceModal();
    renderCourses();
    openCourseDetail(courseCode);
    pushStateToCloud();
    e.target.reset();
}

// ================= CT & EXAM TRACKER =================
function getPersonalCTMark(courseCode, idx, fallbackMark) {
    const key = `${courseCode}_${idx}`;
    if (personalCTMarks[key] !== undefined) return personalCTMarks[key];
    return fallbackMark || "";
}

function renderCTTracker() {
    const container = document.getElementById('ctTrackerContainer');
    if (!container) return;
    const theoryCourses = COURSES.filter(c => c.type === 'Theory');

    container.innerHTML = theoryCourses.map(course => {
        const cts = ctData[course.code] || [];
        return `
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
                <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                        <span class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">${course.code} (${course.credit.toFixed(2)} Cr)</span>
                        <h3 class="font-extrabold text-base">${course.title}</h3>
                    </div>
                    <span class="text-xs text-slate-500">Teachers: <strong>${course.teachers.join(' & ')}</strong></span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cts.length} gap-3">
                    ${cts.map((ct, idx) => {
                        const savedMark = getPersonalCTMark(course.code, idx, ct.marks);
                        return `
                            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="font-mono font-bold text-xs">${ct.name} (${ct.teacher})</span>
                                    ${isAdmin ? `
                                        <select onchange="updateCTField('${course.code}', ${idx}, 'status', this.value)" class="text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                            <option value="Upcoming" ${ct.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
                                            <option value="Done" ${ct.status === 'Done' ? 'selected' : ''}>Done</option>
                                            <option value="Pending" ${ct.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                        </select>
                                    ` : `
                                        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">${ct.status}</span>
                                    `}
                                </div>
                                <div>
                                    <label class="text-[10px] uppercase font-mono text-slate-400">Syllabus / Topic</label>
                                    ${isAdmin ? `
                                        <input type="text" value="${ct.syllabus}" onchange="updateCTField('${course.code}', ${idx}, 'syllabus', this.value)" class="w-full mt-0.5 px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    ` : `
                                        <div class="mt-0.5 text-xs font-medium text-slate-800 dark:text-slate-200">${ct.syllabus}</div>
                                    `}
                                </div>
                                <div class="flex items-center justify-between pt-1">
                                    <span class="text-[11px] text-slate-500">My Marks (/20):</span>
                                    <input type="text" placeholder="-- / 20" value="${savedMark}" oninput="savePersonalCTMark('${course.code}', ${idx}, this.value)" class="w-24 text-center font-mono text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function savePersonalCTMark(courseCode, idx, value) {
    const key = `${courseCode}_${idx}`;
    personalCTMarks[key] = value;
    saveLocal('kuet_ese32_personal_marks', personalCTMarks);

    if (ctData[courseCode] && ctData[courseCode][idx]) {
        ctData[courseCode][idx].marks = value;
        saveLocal('kuet_ese32_cts', ctData);
    }
}

function updateCTField(courseCode, idx, field, value) {
    ctData[courseCode][idx][field] = value;
    saveLocal('kuet_ese32_cts', ctData);
    pushStateToCloud();
}

function resetCTData() {
    if (!isAdmin) return;
    ctData = getDefaultCTData();
    saveLocal('kuet_ese32_cts', ctData);
    renderCTTracker();
    pushStateToCloud();
}

// ================= FACULTY DIRECTORY =================
function renderFaculty() {
    const grid = document.getElementById('facultyGrid');
    if (!grid) return;
    grid.innerHTML = Object.values(FACULTY).map(f => `
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
            <div class="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-sm flex items-center justify-center shrink-0 border border-emerald-500/20">
                ${f.code}
            </div>
            <div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">${f.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">${f.role}</p>
                <div class="flex flex-wrap gap-1 mt-2">
                    ${f.courses.map(c => `<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">${c}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// ================= GENERAL & KUET CURRICULUM CGPA CALCULATOR =================
function initGeneralCGPACalculator() {
    PREVIOUS_TERM_CREDITS.forEach(t => {
        const el = document.getElementById(t.id);
        if (el && personalCGPAState.termGPAs && personalCGPAState.termGPAs[t.id] !== undefined) {
            el.value = personalCGPAState.termGPAs[t.id];
        }
    });

    const directCrEl = document.getElementById('prevCreditsInput');
    const directCgEl = document.getElementById('prevCGPAInput');
    if (directCrEl && personalCGPAState.directCredits !== undefined) directCrEl.value = personalCGPAState.directCredits;
    if (directCgEl && personalCGPAState.directCGPA !== undefined) directCgEl.value = personalCGPAState.directCGPA;

    const badge = document.getElementById('loadedPresetBadge');
    if (badge && personalCGPAState.activePresetLabel) {
        badge.textContent = personalCGPAState.activePresetLabel;
    }

    setPrevCalcMode(personalCGPAState.mode || 'terms');
    renderGeneralCalcRows();
}

function setPrevCalcMode(mode) {
    prevCalcMode = mode;
    personalCGPAState.mode = mode;
    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);

    const termsWrapper = document.getElementById('prevTermsGridWrapper');
    const directWrapper = document.getElementById('prevDirectWrapper');
    const termsBtn = document.getElementById('prevModeTermsBtn');
    const directBtn = document.getElementById('prevModeDirectBtn');

    if (!termsWrapper || !directWrapper) return;

    if (mode === 'terms') {
        termsWrapper.classList.remove('hidden');
        directWrapper.classList.add('hidden');
        if (termsBtn) termsBtn.className = "px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm transition";
        if (directBtn) directBtn.className = "px-2.5 py-1 rounded-lg font-bold text-slate-500 transition";
    } else {
        termsWrapper.classList.add('hidden');
        directWrapper.classList.remove('hidden');
        if (directBtn) directBtn.className = "px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm transition";
        if (termsBtn) termsBtn.className = "px-2.5 py-1 rounded-lg font-bold text-slate-500 transition";
    }
    calculateGeneralCGPA();
}

function clearPreviousTermsInputs() {
    PREVIOUS_TERM_CREDITS.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) el.value = "";
        if (personalCGPAState.termGPAs) personalCGPAState.termGPAs[t.id] = "";
    });
    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);
    calculateGeneralCGPA();
}

function loadSemesterPreset(termKey) {
    const preset = ESE_SEMESTER_PRESETS[termKey];
    if (!preset) return;
    generalCalcRows = JSON.parse(JSON.stringify(preset.courses));
    personalCGPAState.activePresetLabel = preset.label;
    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);

    const badge = document.getElementById('loadedPresetBadge');
    if (badge) badge.textContent = preset.label;
    saveGeneralRows();
    renderGeneralCalcRows();
}

function renderGeneralCalcRows() {
    const container = document.getElementById('generalCalcRowsContainer');
    if (!container) return;
    if (generalCalcRows.length === 0) {
        container.innerHTML = `<div class="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400">No courses in active list. Click any semester button above (1-1 to 3-2) or click <strong>"Add Course"</strong>.</div>`;
        calculateGeneralCGPA();
        return;
    }

    container.innerHTML = generalCalcRows.map((row, idx) => {
        const isNonCredit = parseFloat(row.credit) === 0;
        return `
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 rounded-xl ${isNonCredit ? 'bg-slate-100/70 dark:bg-slate-900/40 opacity-75' : 'bg-slate-50 dark:bg-slate-800/60'} border border-slate-200/70 dark:border-slate-800 text-xs">
                <div class="sm:col-span-5">
                    <label class="sm:hidden text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Course No. & Title</label>
                    <input type="text" value="${row.name}" oninput="updateGeneralRow(${idx}, 'name', this.value)" placeholder="e.g. ESE 3203" class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold">
                </div>
                <div class="sm:col-span-2">
                    <label class="sm:hidden text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Credit Hours</label>
                    <input type="number" step="0.25" min="0" value="${row.credit}" oninput="updateGeneralRow(${idx}, 'credit', this.value)" placeholder="3.00" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center">
                </div>
                <div class="sm:col-span-2">
                    <label class="sm:hidden text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Letter Grade</label>
                    ${isNonCredit ? `
                        <div class="px-2 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-center font-mono text-[11px] font-bold text-slate-500">S (Non-Credit)</div>
                    ` : `
                        <select onchange="syncRowGradeSelect(${idx}, this.value)" class="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-semibold">
                            ${GRADE_OPTIONS.map(g => `<option value="${g.val}" ${Math.abs(row.gp - g.val) < 0.001 ? 'selected' : ''}>${g.label}</option>`).join('')}
                            <option value="custom" ${!GRADE_OPTIONS.some(g => Math.abs(row.gp - g.val) < 0.001) ? 'selected' : ''}>Custom GP</option>
                        </select>
                    `}
                </div>
                <div class="sm:col-span-2">
                    <label class="sm:hidden text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Grade Point (0.00 - 4.00)</label>
                    <input type="number" step="0.01" min="0" max="4" value="${row.gp}" ${isNonCredit ? 'disabled' : ''} oninput="updateGeneralRow(${idx}, 'gp', this.value)" placeholder="4.00" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-center">
                </div>
                <div class="sm:col-span-1 flex justify-end">
                    <button onclick="removeGeneralCourseRow(${idx})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition" title="Remove Course">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
    calculateGeneralCGPA();
}

function addGeneralCourseRow() {
    generalCalcRows.push({ name: `Course ${generalCalcRows.length + 1}`, credit: 3.00, gp: 4.00 });
    saveGeneralRows();
    renderGeneralCalcRows();
}

function removeGeneralCourseRow(idx) {
    generalCalcRows.splice(idx, 1);
    saveGeneralRows();
    renderGeneralCalcRows();
}

function updateGeneralRow(idx, field, val) {
    if (field === 'name') {
        generalCalcRows[idx].name = val;
    } else if (field === 'credit') {
        generalCalcRows[idx].credit = parseFloat(val) || 0;
        saveGeneralRows();
        renderGeneralCalcRows();
        return;
    } else if (field === 'gp') {
        let num = parseFloat(val);
        if (isNaN(num)) num = 0;
        if (num > 4) num = 4;
        if (num < 0) num = 0;
        generalCalcRows[idx].gp = num;
    }
    saveGeneralRows();
    calculateGeneralCGPA();
}

function syncRowGradeSelect(idx, val) {
    if (val === 'custom') return;
    generalCalcRows[idx].gp = parseFloat(val) || 0;
    saveGeneralRows();
    renderGeneralCalcRows();
}

function clearGeneralCalcRows() {
    generalCalcRows = [{ name: "Course 1", credit: 3.00, gp: 4.00 }];
    saveGeneralRows();
    renderGeneralCalcRows();
}

function saveGeneralRows() {
    saveLocal('kuet_general_cgpa_rows', generalCalcRows);
}

function calculateGeneralCGPA() {
    let termCredits = 0;
    let termPoints = 0;

    generalCalcRows.forEach(r => {
        const cr = parseFloat(r.credit) || 0;
        const gp = parseFloat(r.gp) || 0;
        if (cr > 0) {
            termCredits += cr;
            termPoints += (cr * gp);
        }
    });

    const sgpa = termCredits > 0 ? (termPoints / termCredits) : 0;
    const sgpaEl = document.getElementById('calculatedSGPA');
    if (sgpaEl) sgpaEl.textContent = sgpa.toFixed(2);
    const crTextEl = document.getElementById('calculatedCreditsText');
    if (crTextEl) crTextEl.textContent = `${termCredits.toFixed(2)} Credits Counted`;
    const countEl = document.getElementById('calcCourseCount');
    if (countEl) countEl.textContent = String(generalCalcRows.length);
    const ptsEl = document.getElementById('calcTotalPoints');
    if (ptsEl) ptsEl.textContent = termPoints.toFixed(2);

    let prevCr = 0;
    let prevPoints = 0;

    if (!personalCGPAState.termGPAs) personalCGPAState.termGPAs = {};

    if (prevCalcMode === 'terms') {
        PREVIOUS_TERM_CREDITS.forEach(t => {
            const rawVal = document.getElementById(t.id)?.value;
            personalCGPAState.termGPAs[t.id] = rawVal !== undefined ? rawVal : "";
            if (rawVal !== undefined && rawVal !== "") {
                const gpa = parseFloat(rawVal);
                if (!isNaN(gpa) && gpa >= 0 && gpa <= 4) {
                    prevCr += t.credit;
                    prevPoints += (t.credit * gpa);
                }
            }
        });
        const prevCgpaCalc = prevCr > 0 ? (prevPoints / prevCr) : 0;
        const summaryEl = document.getElementById('prevTermsSummaryText');
        if (summaryEl) {
            summaryEl.textContent = `Previous Completed: ${prevCr.toFixed(2)} Credits | Previous CGPA: ${prevCgpaCalc.toFixed(2)}`;
        }
    } else {
        const rawCr = document.getElementById('prevCreditsInput')?.value || "";
        const rawCg = document.getElementById('prevCGPAInput')?.value || "";
        personalCGPAState.directCredits = rawCr;
        personalCGPAState.directCGPA = rawCg;

        prevCr = parseFloat(rawCr) || 0;
        const prevCg = parseFloat(rawCg) || 0;
        prevPoints = prevCr * prevCg;
    }

    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);
    const prevStatEl = document.getElementById('calcPrevCreditsStat');
    if (prevStatEl) prevStatEl.textContent = prevCr.toFixed(2);

    const totalCredits = prevCr + termCredits;
    const totalPoints = prevPoints + termPoints;
    const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    const overallEl = document.getElementById('calculatedOverallCGPA');
    if (overallEl) overallEl.textContent = overallCgpa.toFixed(2);
    const totCrTextEl = document.getElementById('calculatedTotalCreditsText');
    if (totCrTextEl) totCrTextEl.textContent = `Total Combined Credits: ${totalCredits.toFixed(2)}`;
}

// ================= PERSISTENT DARK / LIGHT MODE PER USER =================
function applySavedTheme() {
    const savedTheme = localStorage.getItem('kuet_ese32_theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const isNowDark = document.documentElement.classList.toggle('dark');
    saveLocal('kuet_ese32_theme', isNowDark ? 'dark' : 'light');
}

// ================= PWA SERVICE WORKER & INSTALL APP LOGIC =================
let deferredInstallPrompt = null;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.update();
        }).catch(() => {});
    });
}

if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    window.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('installAppBtn');
        if (btn) btn.classList.add('hidden');
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('installAppBtn');
    if (btn) btn.classList.remove('hidden');
});

async function triggerInstallApp() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            const btn = document.getElementById('installAppBtn');
            if (btn) btn.classList.add('hidden');
        }
        deferredInstallPrompt = null;
    } else {
        alert(
            "📲 To install ESE 3-2 Hub as an App on your device:\n\n" +
            "• Android (Chrome): Tap the 3 dots (⋮) at the top-right and select 'Add to Home screen' or 'Install app'.\n\n" +
            "• iPhone (Safari): Tap the 'Share' button at the bottom and select 'Add to Home Screen'."
        );
    }
}

window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('installAppBtn');
    if (btn) btn.classList.add('hidden');
});

// Run initPortal whether DOMContentLoaded has already fired or not
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initPortal);
} else {
    initPortal();
}
