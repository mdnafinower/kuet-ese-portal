/* ==========================================================================
   KUET ESE 3-2 Portal — Main Application Logic with Firebase Realtime Sync
   ========================================================================== */

// ================= FIREBASE CONFIG & INITIALIZATION =================
// 1. Create a free project at https://console.firebase.google.com/
// 2. Enable Realtime Database (Test Mode) and paste your config details below:
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase if config is filled, otherwise fallback seamlessly to localStorage
let isFirebaseConnected = false;
let db = null;
try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        isFirebaseConnected = true;
    }
} catch (e) {
    console.warn("Firebase initialization skipped, running local-first mode.", e);
}

// ================= SAFE STORAGE & CLOUD SYNC HELPERS =================
function saveSync(key, value) {
    try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        if (isFirebaseConnected && db) {
            // Push changes instantly to Firebase Cloud Database so everyone sees it live
            db.ref(`portal_state/${key}`).set(value);
        }
    } catch (e) {
        console.warn('Storage sync error:', e);
    }
}

function loadLocal(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}

// Listen for live updates from Firebase Cloud for all clients
function initCloudRealtimeSync() {
    if (!isFirebaseConnected || !db) return;

    db.ref('portal_state').on('value', (snapshot) => {
        const cloudData = snapshot.val();
        if (!cloudData) return;

        let needsUIRefresh = false;

        if (cloudData.kuet_ese32_master_routine) {
            masterRoutine = cloudData.kuet_ese32_master_routine;
            localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));
            needsUIRefresh = true;
        }
        if (cloudData.kuet_ese32_notices) {
            notices = cloudData.kuet_ese32_notices;
            localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));
            renderNotices();
        }
        if (cloudData.kuet_ese32_course_drives) {
            courseDriveLinks = cloudData.kuet_ese32_course_drives;
            localStorage.setItem('kuet_ese32_course_drives', JSON.stringify(courseDriveLinks));
            renderCourses();
        }

        if (needsUIRefresh) {
            renderMasterRoutineTable();
            renderDaySchedule(currentSelectedDay);
        }
    });
}

// ================= WEEKLY AUTO-REFRESH ENGINE (FRIDAY 12:00 AM) =================
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
        const currentSlots = currentRoutine[day] || Array(9).fill(null);
        const baseSlots = (fallbackRegularRoutine && fallbackRegularRoutine[day]) ? fallbackRegularRoutine[day] : Array(9).fill(null);

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

// ================= STATE & STORAGE =================
let isAdmin = false;
let currentSelectedDay = "Sunday";
let adminPin = localStorage.getItem('kuet_ese32_pin') || '2022';
let masterDriveUrl = localStorage.getItem('kuet_ese32_master_drive') || 'https://drive.google.com';
let courseDriveLinks = loadLocal('kuet_ese32_course_drives', {});
let customResources = loadLocal('kuet_ese32_resources', []);

let baseRegularRoutine = loadLocal('kuet_ese32_base_routine', getInitialSeedRoutine());
let masterRoutine = loadLocal('kuet_ese32_master_routine', baseRegularRoutine);

let notices = loadLocal('kuet_ese32_notices', [
    { date: "Pinned", type: "info", persistent: true, text: "All theory classes are held in Room ESE-506 (Block-D, Academic Building 1)." },
    { date: "Lab Update", type: "info", persistent: true, text: "Wednesday 2:30 PM Lab alternates between ESE 3204 (MSH+AA) and ESE 3218 (MR+KS)." }
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

        saveSync('kuet_ese32_master_routine', masterRoutine);
        saveSync('kuet_ese32_base_routine', baseRegularRoutine);
        localStorage.setItem('kuet_ese32_week_id', weekId);

        notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
        saveSync('kuet_ese32_notices', notices);
    }
}

function manualWeeklyRefresh() {
    if (!isAdmin) return;
    if (!confirm("Run Weekly Refresh now?\n\n• Extra Classes will be removed.\n• Canceled Regular Classes will become Active again.")) return;

    masterRoutine = refreshRoutineKeepEditedRegulars(masterRoutine, baseRegularRoutine);
    baseRegularRoutine = JSON.parse(JSON.stringify(masterRoutine));

    saveSync('kuet_ese32_master_routine', masterRoutine);
    saveSync('kuet_ese32_base_routine', baseRegularRoutine);

    notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
    saveSync('kuet_ese32_notices', notices);

    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
}

// ================= INITIALIZATION =================
function initPortal() {
    applySavedTheme();
    checkAndRunWeeklyAutoRefresh();
    initCloudRealtimeSync();

    lucide.createIcons();
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
        banner.classList.remove('hidden');
        btnText.textContent = "Admin Active (Exit)";
        toggleBtn.className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-sm transition";
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        if (subtext) subtext.innerHTML = "<strong>Admin Mode:</strong> Click any slot to Edit, Cancel, or Add an Extra Class. Changes sync live to everyone's apps instantly.";
    } else {
        banner.classList.add('hidden');
        btnText.textContent = "Admin";
        toggleBtn.className = "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition";
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        if (subtext) subtext.textContent = "Click any course in the routine to open its Google Drive folder and study materials.";
    }

    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
    renderCourses();
    renderCTTracker();
    lucide.createIcons();
}

function logoutAdmin() {
    setAdminMode(false);
}

// ================= NOTICES & LIVE PUSH NOTIFICATIONS =================
function postAutomatedNotice(text, type = "info", isWeeklyTemp = false) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    notices.unshift({ date: today, type, text, isWeeklyTemp });
    saveSync('kuet_ese32_notices', notices);
    renderNotices();

    // Trigger Web Push Notification if browser supports it and permission is granted
    if ("Notification" in window && Notification.permission === "granted") {
        try {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification("📢 ESE 3-2 Class Notice", {
                    body: text,
                    icon: "./manifest.json"
                });
            });
        } catch (err) {
            console.log("Push notification trigger error:", err);
        }
    }
}

async function requestPushNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop/mobile push notifications.");
        return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        alert("✅ Notifications enabled successfully! You will now receive alerts for class cancellations and updates.");
    } else {
        alert("Notifications permission denied.");
    }
}

function renderNotices() {
    const list = document.getElementById('noticeList');
    list.innerHTML = notices.map((n, idx) => {
        let badgeStyle = "bg-amber-500/15 text-amber-600 dark:text-amber-400";
        let cardBorder = "border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60";

        if (n.type === "canceled" || n.text.includes("CANCELED")) {
            badgeStyle = "bg-rose-600 text-white";
            cardBorder = "border-rose-300 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/30";
        } else if (n.type === "extra" || n.text.includes("EXTRA CLASS")) {
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
    lucide.createIcons();
}

function promptNewNotice() {
    if (!isAdmin) return;
    const text = prompt("Enter new announcement / notice for 2K22 Batch:");
    if (!text || !text.trim()) return;
    postAutomatedNotice(text.trim(), "info", false);
}

function deleteNotice(idx) {
    if (!isAdmin) return;
    notices.splice(idx, 1);
    saveSync('kuet_ese32_notices', notices);
    renderNotices();
}

// ================= RENDER TABLES & ROUTINE =================
function getSlotThemeClasses(slot) {
    const isCanceled = slot.status === "canceled";
    const isExtra = slot.kind === "extra";
    const isLab = slot.type === "Sessional";

    if (isCanceled) {
        return {
            cardBg: "canceled-stripes bg-rose-50/90 dark:bg-rose-950/60 border-2 border-rose-500/80 dark:border-rose-500/70",
            codeText: "line-through text-rose-700 dark:text-rose-300",
            subText: "text-rose-600 dark:text-rose-300 font-semibold",
            badge: isExtra ? `<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider">EXTRA CANCELED</span>` : `<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-extrabold uppercase tracking-wider">CANCELED</span>`
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
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    tbody.innerHTML = days.map((day, dayIdx) => {
        const rowSlots = masterRoutine[day] || Array(9).fill(null);
        let cellsHtml = `<td class="p-3 font-bold text-left bg-slate-50/60 dark:bg-slate-900/60">${day}</td>`;

        let p = 0;
        while (p < 9) {
            if (p === 3 && dayIdx === 0) cellsHtml += `<td rowspan="5" class="bg-amber-50/40 dark:bg-amber-950/10 text-[10px] font-mono text-amber-600 dark:text-amber-400 select-none px-1">BREAK</td>`;
            if (p === 6 && dayIdx === 0) cellsHtml += `<td rowspan="5" class="bg-amber-50/40 dark:bg-amber-950/10 text-[10px] font-mono text-amber-600 dark:text-amber-400 select-none px-1">LUNCH & PRAYER</td>`;

            const slot = rowSlots[p];
            if (!slot) {
                cellsHtml += `
                    <td class="p-1.5">
                        ${isAdmin
                            ? `<button onclick="openRoutineSlotModal('${day}',${p})" class="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition text-[11px] font-mono flex flex-col items-center justify-center gap-0.5"><span>+ Slot</span></button>`
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
    lucide.createIcons();
}

function handleRoutineCellClick(day, periodIdx, courseCode) {
    if (isAdmin) openRoutineSlotModal(day, periodIdx);
    else openCourseDetail(courseCode);
}

function renderDaySchedule(day) {
    currentSelectedDay = day;
    document.getElementById('selectedDayTitle').textContent = `${day}'s Classes`;
    document.querySelectorAll('.day-pill').forEach(btn => {
        if (btn.dataset.day === day) {
            btn.className = "day-pill px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm transition";
        } else {
            btn.className = "day-pill px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition";
        }
    });

    const container = document.getElementById('dayScheduleContainer');
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
                            <button onclick="quickToggleCancelSlot('${day}',${periodIdx})" class="font-bold ${isCanceled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} hover:underline">${isCanceled ? 'Make Active' : 'Cancel Class'}</button>
                            <button onclick="openRoutineSlotModal('${day}',${periodIdx})" class="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">Edit</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function openRoutineSlotModal(day, periodIdx) {
    if (!isAdmin) return;
    document.getElementById('slotDaySelect').value = day || currentSelectedDay;
    document.getElementById('slotPeriodSelect').value = String(periodIdx ?? 0);
    loadSlotIntoModal();
    document.getElementById('routineSlotModal').classList.remove('hidden');
    lucide.createIcons();
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
    saveSync('kuet_ese32_master_routine', masterRoutine);

    if (kind === "regular") {
        for (let i = 0; i < span && (pIdx + i) < 9; i++) {
            baseRegularRoutine[day][pIdx + i] = null;
        }
        baseRegularRoutine[day][pIdx] = { code, teacher, type, kind: "regular", status: "active", span, note: "" };
        saveSync('kuet_ese32_base_routine', baseRegularRoutine);
    }

    const shouldNotify = document.getElementById('slotAutoNoticeCheck').checked;
    if (shouldNotify) {
        const pInfo = PERIOD_INFO[pIdx];
        const reasonText = note ? ` (${note})` : '';
        let noticeMsg = "";

        if (status === "canceled" && kind === "extra") {
            noticeMsg = `[EXTRA CLASS CANCELED] ${day} ${pInfo.label}: ${code} (${teacher}) extra class is CANCELED${reasonText}.`;
        } else if (status === "canceled") {
            noticeMsg = `[CLASS CANCELED] ${day} ${pInfo.label}: ${code} (${teacher}) routine class is CANCELED${reasonText}.`;
        } else if (kind === "extra") {
            noticeMsg = `[EXTRA CLASS SCHEDULED] ${day} ${pInfo.label}: ${code} (${teacher})${reasonText}.`;
        } else {
            noticeMsg = `[ROUTINE UPDATED] ${day} ${pInfo.label}: ${code} (${teacher})${reasonText}.`;
        }

        postAutomatedNotice(noticeMsg, status === "canceled" ? "canceled" : kind, true);
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
        saveSync('kuet_ese32_base_routine', baseRegularRoutine);
    }
    saveSync('kuet_ese32_master_routine', masterRoutine);
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
        postAutomatedNotice(`[ACTIVE] ${day} ${pInfo.label}: ${slot.code} (${slot.teacher}) is active as scheduled.`, "info", true);
    } else {
        const reason = prompt(`Cancel ${slot.code} (${slot.teacher}) on ${day} ${pInfo.label}?\nOptional reason:`, "Professor busy / Postponed");
        if (reason === null) return;
        slot.status = "canceled";
        slot.note = reason.trim();
        const prefix = slot.kind === "extra" ? "[EXTRA CLASS CANCELED]" : "[CLASS CANCELED]";
        postAutomatedNotice(`${prefix} ${day} ${pInfo.label}: ${slot.code} (${slot.teacher}) is CANCELED.${slot.note ? ' Note: ' + slot.note : ''}`, "canceled", true);
    }

    saveSync('kuet_ese32_master_routine', masterRoutine);
    renderMasterRoutineTable();
    renderDaySchedule(day);
}

// ================= OTHER TABS & UTILS =================
function switchTab(tabId) {
    ['dashboard', 'courses', 'ct-tracker', 'faculty', 'sgpa'].forEach(id => {
        document.getElementById(`tab-${id}`).classList.add('hidden');
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.className = "tab-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm";
        } else {
            btn.className = "tab-btn shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";
        }
    });
    lucide.createIcons();
}

function getMergedMaterials(courseCode) {
    const base = COURSES.find(c => c.code === courseCode)?.materials || [];
    const extra = customResources.filter(r => r.courseCode === courseCode);
    return [...extra, ...base];
}

function renderCourses() {
    const query = (document.getElementById('courseSearchInput')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('courseTypeFilter')?.value || 'ALL';
    const grid = document.getElementById('coursesGrid');

    const filtered = COURSES.filter(c => {
        const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
        return matchesType && (c.code.toLowerCase().includes(query) || c.title.toLowerCase().includes(query));
    });

    grid.innerHTML = filtered.map(c => {
        const materials = getMergedMaterials(c.code);
        const driveUrl = getCourseDriveUrl(c.code);
        return `
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">${c.code}</span>
                        <span class="text-xs font-mono font-semibold text-slate-500">${c.credit.toFixed(2)} Cr</span>
                    </div>
                    <h3 class="font-extrabold text-base mt-2.5 text-slate-900 dark:text-white">${c.title}</h3>
                    <div class="mt-4">
                        <a href="${driveUrl}" target="_blank" class="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2">
                            <i data-lucide="hard-drive" class="w-4 h-4"></i>
                            <span>Open ${c.code} Google Drive</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function renderFaculty() {
    const grid = document.getElementById('facultyGrid');
    grid.innerHTML = Object.values(FACULTY).map(f => `
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 shadow-sm">
            <div class="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-sm flex items-center justify-center shrink-0">${f.code}</div>
            <div>
                <h3 class="font-bold text-sm text-slate-900 dark:text-white">${f.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">${f.role}</p>
            </div>
        </div>
    `).join('');
}

// ================= CGPA CALCULATOR =================
function initGeneralCGPACalculator() {
    PREVIOUS_TERM_CREDITS.forEach(t => {
        const el = document.getElementById(t.id);
        if (el && personalCGPAState.termGPAs && personalCGPAState.termGPAs[t.id] !== undefined) {
            el.value = personalCGPAState.termGPAs[t.id];
        }
    });
    setPrevCalcMode(personalCGPAState.mode || 'terms');
    renderGeneralCalcRows();
}

function setPrevCalcMode(mode) {
    prevCalcMode = mode;
    personalCGPAState.mode = mode;
    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);
    calculateGeneralCGPA();
}

function loadSemesterPreset(termKey) {
    const preset = ESE_SEMESTER_PRESETS[termKey];
    if (!preset) return;
    generalCalcRows = JSON.parse(JSON.stringify(preset.courses));
    personalCGPAState.activePresetLabel = preset.label;
    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);
    renderGeneralCalcRows();
}

function renderGeneralCalcRows() {
    const container = document.getElementById('generalCalcRowsContainer');
    container.innerHTML = generalCalcRows.map((row, idx) => `
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div class="sm:col-span-5"><input type="text" value="${row.name}" oninput="updateGeneralRow(${idx}, 'name', this.value)" class="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"></div>
            <div class="sm:col-span-2"><input type="number" step="0.25" min="0" value="${row.credit}" oninput="updateGeneralRow(${idx}, 'credit', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-center"></div>
            <div class="sm:col-span-2"><select onchange="syncRowGradeSelect(${idx}, this.value)" class="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-semibold">${GRADE_OPTIONS.map(g => `<option value="${g.val}" ${Math.abs(row.gp - g.val) < 0.001 ? 'selected' : ''}>${g.label}</option>`).join('')}</select></div>
            <div class="sm:col-span-2"><input type="number" step="0.01" min="0" max="4" value="${row.gp}" oninput="updateGeneralRow(${idx}, 'gp', this.value)" class="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-center"></div>
            <div class="sm:col-span-1 flex justify-end"><button onclick="removeGeneralCourseRow(${idx})" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>
        </div>
    `).join('');
    lucide.createIcons();
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
    if (field === 'name') generalCalcRows[idx].name = val;
    else if (field === 'credit') generalCalcRows[idx].credit = parseFloat(val) || 0;
    else if (field === 'gp') generalCalcRows[idx].gp = parseFloat(val) || 0;
    saveGeneralRows();
    calculateGeneralCGPA();
}

function syncRowGradeSelect(idx, val) {
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
        if (cr > 0) { termCredits += cr; termPoints += (cr * gp); }
    });

    const sgpa = termCredits > 0 ? (termPoints / termCredits) : 0;
    document.getElementById('calculatedSGPA').textContent = sgpa.toFixed(2);
    document.getElementById('calculatedCreditsText').textContent = `${termCredits.toFixed(2)} Credits Counted`;
    document.getElementById('calcCourseCount').textContent = String(generalCalcRows.length);
    document.getElementById('calcTotalPoints').textContent = termPoints.toFixed(2);

    let prevCr = 0;
    let prevPoints = 0;
    if (!personalCGPAState.termGPAs) personalCGPAState.termGPAs = {};

    PREVIOUS_TERM_CREDITS.forEach(t => {
        const rawVal = document.getElementById(t.id)?.value;
        personalCGPAState.termGPAs[t.id] = rawVal !== undefined ? rawVal : "";
        if (rawVal !== undefined && rawVal !== "") {
            const gpa = parseFloat(rawVal);
            if (!isNaN(gpa)) { prevCr += t.credit; prevPoints += (t.credit * gpa); }
        }
    });

    saveLocal('kuet_ese32_personal_cgpa_state', personalCGPAState);
    document.getElementById('calcPrevCreditsStat').textContent = prevCr.toFixed(2);

    const totalCredits = prevCr + termCredits;
    const totalPoints = prevPoints + termPoints;
    const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    document.getElementById('calculatedOverallCGPA').textContent = overallCgpa.toFixed(2);
    document.getElementById('calculatedTotalCreditsText').textContent = `Total Combined Credits: ${totalCredits.toFixed(2)}`;
}

// ================= THEME =================
function applySavedTheme() {
    const savedTheme = localStorage.getItem('kuet_ese32_theme');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else if (savedTheme === 'light') document.documentElement.classList.remove('dark');
}

function toggleTheme() {
    const isNowDark = document.documentElement.classList.toggle('dark');
    saveLocal('kuet_ese32_theme', isNowDark ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', initPortal);
