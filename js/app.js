/* ==========================================================================
   KUET ESE 3-2 Portal — Main Application Logic (js/app.js)
   ========================================================================== */

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
        const currentSlots = currentRoutine[day] || Array(9).fill(null);
        const baseSlots = (fallbackRegularRoutine && fallbackRegularRoutine[day]) ? fallbackRegularRoutine[day] : Array(9).fill(null);

        refreshed[day] = currentSlots.map((slot, idx) => {
            if (!slot) return null;
            if (slot.kind === "extra") {
                const underlyingRegular = baseSlots[idx];
                if (underlyingRegular && underlyingRegular.kind === "regular") {
                    return {
                        ...underlyingRegular,
                        kind: "regular",
                        status: "active",
                        note: ""
                    };
                }
                return null;
            }
            return {
                ...slot,
                kind: "regular",
                status: "active",
                note: ""
            };
        });
    });
    return refreshed;
}

// ================= STATE & ADMIN STORAGE =================
let isAdmin = false;
let currentSelectedDay = "Sunday";
let adminPin = localStorage.getItem('kuet_ese32_pin') || '2022';
let masterDriveUrl = localStorage.getItem('kuet_ese32_master_drive') || 'https://drive.google.com';
let courseDriveLinks = JSON.parse(localStorage.getItem('kuet_ese32_course_drives') || '{}');
let customResources = JSON.parse(localStorage.getItem('kuet_ese32_resources') || '[]');

let baseRegularRoutine = JSON.parse(localStorage.getItem('kuet_ese32_base_routine') || JSON.stringify(getInitialSeedRoutine()));
let masterRoutine = JSON.parse(localStorage.getItem('kuet_ese32_master_routine') || JSON.stringify(baseRegularRoutine));

let notices = JSON.parse(localStorage.getItem('kuet_ese32_notices') || JSON.stringify([
    { date: "Pinned", type: "info", persistent: true, text: "All theory classes are held in Room ESE-506 (Block-D, Academic Building 1)." },
    { date: "Lab Update", type: "info", persistent: true, text: "Wednesday 2:30 PM Lab alternates between ESE 3204 (MSH+AA) and ESE 3218 (MR+KS)." }
]));

let ctData = JSON.parse(localStorage.getItem('kuet_ese32_cts') || JSON.stringify(getDefaultCTData()));
let activeCourseModalCode = null;
let prevCalcMode = 'terms';
let generalCalcRows = JSON.parse(localStorage.getItem('kuet_general_cgpa_rows') || 'null') ||
                      JSON.parse(JSON.stringify(ESE_SEMESTER_PRESETS["3-2"].courses));

function checkAndRunWeeklyAutoRefresh() {
    const { weekId, rangeText } = getCurrentAcademicWeekInfo();
    const savedWeekId = localStorage.getItem('kuet_ese32_week_id');

    const labelEl = document.getElementById('currentWeekRangeLabel');
    if (labelEl) labelEl.textContent = rangeText;

    if (savedWeekId !== weekId) {
        masterRoutine = refreshRoutineKeepEditedRegulars(masterRoutine, baseRegularRoutine);
        baseRegularRoutine = JSON.parse(JSON.stringify(masterRoutine));

        localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));
        localStorage.setItem('kuet_ese32_base_routine', JSON.stringify(baseRegularRoutine));
        localStorage.setItem('kuet_ese32_week_id', weekId);

        notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
        localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));
    }
}

function manualWeeklyRefresh() {
    if (!isAdmin) return;
    if (!confirm("Run Weekly Refresh now?\n\n• Extra Classes will be removed.\n• Canceled Regular Classes will become Active again.\n• All your edited Regular Classes will remain as the default.")) return;

    masterRoutine = refreshRoutineKeepEditedRegulars(masterRoutine, baseRegularRoutine);
    baseRegularRoutine = JSON.parse(JSON.stringify(masterRoutine));

    localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));
    localStorage.setItem('kuet_ese32_base_routine', JSON.stringify(baseRegularRoutine));

    notices = notices.filter(n => n.persistent || (n.type !== 'canceled' && n.type !== 'extra' && !n.isWeeklyTemp));
    localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));

    renderMasterRoutineTable();
    renderDaySchedule(currentSelectedDay);
    renderNotices();
}

// ================= INITIALIZATION =================
function initPortal() {
    checkAndRunWeeklyAutoRefresh();
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
    document.getElementById('liveClock').textContent = str;
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
        if (subtext) subtext.innerHTML = "<strong>Admin Mode:</strong> Click any slot to Edit, Cancel, or Add an Extra Class. Regular class edits are saved permanently as your new default routine.";
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
                            ? `<button onclick="openRoutineSlotModal('${day}',${p})" class="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition text-[11px] font-mono flex flex-col items-center justify-center gap-0.5" title="Add Extra Class or Regular Slot">
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

    lucide.createIcons();
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
                            <button onclick="quickToggleCancelSlot('${day}', ${periodIdx})" class="font-bold ${isCanceled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} hover:underline">
                                ${isCanceled ? 'Make Active' : 'Cancel Class'}
                            </button>
                            <button onclick="openRoutineSlotModal('${day}',${periodIdx})" class="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold">
                                Edit
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ================= ADMIN SLOT EDITOR =================
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
        const radios = document.getElementsByName('slotStatusRadio');
        radios.forEach(r => r.checked = (r.value === (slot.status || 'active')));
    } else {
        document.getElementById('slotCourseSelect').value = "ESE 3203";
        document.getElementById('slotSpanSelect').value = (pIdx === 6) ? "3" : "1";
        document.getElementById('slotTeacherInput').value = "MSH";
        document.getElementById('slotKindSelect').value = "extra";
        document.getElementById('slotNoteInput').value = "";
        const radios = document.getElementsByName('slotStatusRadio');
        radios.forEach(r => r.checked = (r.value === 'active'));
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

    const newSlotObj = { code, teacher, type, kind, status, span, note };
    masterRoutine[day][pIdx] = newSlotObj;
    localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));

    if (kind === "regular") {
        for (let i = 0; i < span && (pIdx + i) < 9; i++) {
            baseRegularRoutine[day][pIdx + i] = null;
        }
        baseRegularRoutine[day][pIdx] = {
            code,
            teacher,
            type,
            kind: "regular",
            status: "active",
            span,
            note: ""
        };
        localStorage.setItem('kuet_ese32_base_routine', JSON.stringify(baseRegularRoutine));
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
        localStorage.setItem('kuet_ese32_base_routine', JSON.stringify(baseRegularRoutine));
    } else if (existing && existing.kind === "extra" && baseRegularRoutine[day][pIdx]) {
        masterRoutine[day][pIdx] = { ...baseRegularRoutine[day][pIdx], status: "active", note: "" };
    }

    localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));

    if (existing && document.getElementById('slotAutoNoticeCheck').checked) {
        const pInfo = PERIOD_INFO[pIdx];
        postAutomatedNotice(`[SLOT REMOVED] ${day} ${pInfo.label}: ${existing.code} (${existing.teacher}) removed from schedule.`, "info", true);
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
        postAutomatedNotice(`[ACTIVE] ${day} ${pInfo.label} (${pInfo.short}): ${slot.kind === 'extra' ? 'Extra class' : 'Regular class'} ${slot.code} (${slot.teacher}) is active as scheduled.`, "info", true);
    } else {
        const reason = prompt(`Cancel ${slot.code} (${slot.teacher}) on ${day} ${pInfo.label} for this week?\nOptional reason (shown to students & posted in Notice Board):`, "Professor busy / Class postponed");
        if (reason === null) return;
        slot.status = "canceled";
        slot.note = reason.trim();
        const prefix = slot.kind === "extra" ? "[EXTRA CLASS CANCELED]" : "[CLASS CANCELED]";
        postAutomatedNotice(`${prefix} ${day} ${pInfo.label} (${pInfo.short}): ${slot.code} (${slot.teacher}) is CANCELED.${slot.note ? ' Note: ' + slot.note : ''}`, "canceled", true);
    }

    localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));
    renderMasterRoutineTable();
    renderDaySchedule(day);
}

// ================= NOTICES & AUTOMATED ALERTS =================
function postAutomatedNotice(text, type = "info", isWeeklyTemp = false) {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    notices.unshift({ date: today, type, text, isWeeklyTemp });
    localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));
    renderNotices();
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
    const text = prompt("Enter new announcement / CT notice for 2K22 Batch:");
    if (!text || !text.trim()) return;
    postAutomatedNotice(text.trim(), "info", false);
}

function deleteNotice(idx) {
    if (!isAdmin) return;
    notices.splice(idx, 1);
    localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));
    renderNotices();
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
    lucide.createIcons();
}

function closeAdminDriveManager() {
    document.getElementById('adminDriveModal').classList.add('hidden');
}

function saveAllAdminDriveLinks() {
    if (!isAdmin) return;
    const newMaster = document.getElementById('adminMasterDriveInput').value.trim();
    masterDriveUrl = newMaster || 'https://drive.google.com';
    localStorage.setItem('kuet_ese32_master_drive', masterDriveUrl);

    document.querySelectorAll('[data-course-drive]').forEach(inp => {
        const code = inp.dataset.courseDrive;
        const val = inp.value.trim();
        if (val) {
            courseDriveLinks[code] = val;
        } else {
            delete courseDriveLinks[code];
        }
    });

    localStorage.setItem('kuet_ese32_course_drives', JSON.stringify(courseDriveLinks));
    syncMasterDriveButtons();
    renderCourses();
    closeAdminDriveManager();
}

function promptSingleCourseDriveLink(courseCode) {
    if (!isAdmin) return;
    const current = courseDriveLinks[courseCode] || '';
    const nextUrl = prompt(`Paste the Google Drive Folder link for ${courseCode}:`, current);
    if (nextUrl === null) return;
    if (nextUrl.trim()) {
        courseDriveLinks[courseCode] = nextUrl.trim();
    } else {
        delete courseDriveLinks[courseCode];
    }
    localStorage.setItem('kuet_ese32_course_drives', JSON.stringify(courseDriveLinks));
    renderCourses();
    if (activeCourseModalCode === courseCode) {
        openCourseDetail(courseCode);
    }
}

// ================= CLOUD SYNC / EXPORT JSON MODAL =================
function openCloudSyncModal() {
    if (!isAdmin) return;
    const exportPayload = {
        masterDriveUrl,
        courseDriveLinks,
        baseRegularRoutine,
        masterRoutine,
        customResources,
        notices
    };
    document.getElementById('configJsonBox').value = JSON.stringify(exportPayload, null, 2);
    document.getElementById('cloudSyncModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeCloudSyncModal() {
    document.getElementById('cloudSyncModal').classList.add('hidden');
}

function updateAdminPin() {
    if (!isAdmin) return;
    const val = document.getElementById('newAdminPinInput').value.trim();
    if (!val) return alert("Enter a new PIN first.");
    adminPin = val;
    localStorage.setItem('kuet_ese32_pin', adminPin);
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
        if (parsed.masterDriveUrl) {
            masterDriveUrl = parsed.masterDriveUrl;
            localStorage.setItem('kuet_ese32_master_drive', masterDriveUrl);
        }
        if (parsed.courseDriveLinks) {
            courseDriveLinks = parsed.courseDriveLinks;
            localStorage.setItem('kuet_ese32_course_drives', JSON.stringify(courseDriveLinks));
        }
        if (parsed.baseRegularRoutine) {
            baseRegularRoutine = parsed.baseRegularRoutine;
            localStorage.setItem('kuet_ese32_base_routine', JSON.stringify(baseRegularRoutine));
        }
        if (parsed.masterRoutine) {
            masterRoutine = parsed.masterRoutine;
            localStorage.setItem('kuet_ese32_master_routine', JSON.stringify(masterRoutine));
        }
        if (Array.isArray(parsed.customResources)) {
            customResources = parsed.customResources;
            localStorage.setItem('kuet_ese32_resources', JSON.stringify(customResources));
        }
        if (Array.isArray(parsed.notices)) {
            notices = parsed.notices;
            localStorage.setItem('kuet_ese32_notices', JSON.stringify(notices));
        }
        syncMasterDriveButtons();
        renderMasterRoutineTable();
        renderDaySchedule(currentSelectedDay);
        renderNotices();
        renderCourses();
        closeCloudSyncModal();
        alert("All routine changes, Drive links, notices, and materials imported!");
    } catch (e) {
        alert("Invalid JSON format.");
    }
}

// ================= TAB NAVIGATION =================
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
    lucide.createIcons();
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
    lucide.createIcons();
}

function deleteCustomResource(courseCode, title) {
    if (!isAdmin) return;
    customResources = customResources.filter(r => !(r.courseCode === courseCode && r.title === title));
    localStorage.setItem('kuet_ese32_resources', JSON.stringify(customResources));
    renderCourses();
    openCourseDetail(courseCode);
}

function closeCourseDetail() {
    document.getElementById('courseDetailModal').classList.add('hidden');
}

// ================= ADD RESOURCE MODAL =================
function populateResourceCourseDropdown() {
    const select = document.getElementById('resCourseCode');
    select.innerHTML = COURSES.map(c => `<option value="${c.code}">${c.code} — ${c.title}</option>`).join('');
}

function openResourceModal(preselectedCode) {
    if (!isAdmin) return;
    if (preselectedCode) {
        document.getElementById('resCourseCode').value = preselectedCode;
    }
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
    localStorage.setItem('kuet_ese32_resources', JSON.stringify(customResources));
    closeResourceModal();
    renderCourses();
    openCourseDetail(courseCode);
    e.target.reset();
}

// ================= CT & EXAM TRACKER =================
function renderCTTracker() {
    const container = document.getElementById('ctTrackerContainer');
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
                    ${cts.map((ct, idx) => `
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 space-y-2">
                            <div class="flex items-center justify-between">
                                <span class="font-mono font-bold text-xs">${ct.name} (${ct.teacher})</span>${isAdmin ? `
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
                                <input type="text" placeholder="-- / 20" value="${ct.marks}" onchange="updateCTField('${course.code}',${idx}, 'marks', this.value)" class="w-20 text-center font-mono text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function updateCTField(courseCode, idx, field, value) {
    ctData[courseCode][idx][field] = value;
    localStorage.setItem('kuet_ese32_cts', JSON.stringify(ctData));
}

function resetCTData() {
    if (!isAdmin) return;
    ctData = getDefaultCTData();
    localStorage.setItem('kuet_ese32_cts', JSON.stringify(ctData));
    renderCTTracker();
}

// ================= FACULTY DIRECTORY =================
function renderFaculty() {
    const grid = document.getElementById('facultyGrid');
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
    renderGeneralCalcRows();
}

function setPrevCalcMode(mode) {
    prevCalcMode = mode;
    const termsWrapper = document.getElementById('prevTermsGridWrapper');
    const directWrapper = document.getElementById('prevDirectWrapper');
    const termsBtn = document.getElementById('prevModeTermsBtn');
    const directBtn = document.getElementById('prevModeDirectBtn');

    if (mode === 'terms') {
        termsWrapper.classList.remove('hidden');
        directWrapper.classList.add('hidden');
        termsBtn.className = "px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm transition";
        directBtn.className = "px-2.5 py-1 rounded-lg font-bold text-slate-500 transition";
    } else {
        termsWrapper.classList.add('hidden');
        directWrapper.classList.remove('hidden');
        directBtn.className = "px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm transition";
        termsBtn.className = "px-2.5 py-1 rounded-lg font-bold text-slate-500 transition";
    }
    calculateGeneralCGPA();
}

function clearPreviousTermsInputs() {
    PREVIOUS_TERM_CREDITS.forEach(t => {
        const el = document.getElementById(t.id);
        if (el) el.value = "";
    });
    calculateGeneralCGPA();
}

function loadSemesterPreset(termKey) {
    const preset = ESE_SEMESTER_PRESETS[termKey];
    if (!preset) return;
    generalCalcRows = JSON.parse(JSON.stringify(preset.courses));
    const badge = document.getElementById('loadedPresetBadge');
    if (badge) badge.textContent = preset.label;
    saveGeneralRows();
    renderGeneralCalcRows();
}

function renderGeneralCalcRows() {
    const container = document.getElementById('generalCalcRowsContainer');
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

    lucide.createIcons();
    calculateGeneralCGPA();
}

function addGeneralCourseRow() {
    generalCalcRows.push({
        name: `Course ${generalCalcRows.length + 1}`,
        credit: 3.00,
        gp: 4.00
    });
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
    localStorage.setItem('kuet_general_cgpa_rows', JSON.stringify(generalCalcRows));
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
    document.getElementById('calculatedSGPA').textContent = sgpa.toFixed(2);
    document.getElementById('calculatedCreditsText').textContent = `${termCredits.toFixed(2)} Credits Counted`;
    document.getElementById('calcCourseCount').textContent = String(generalCalcRows.length);
    document.getElementById('calcTotalPoints').textContent = termPoints.toFixed(2);

    let prevCr = 0;
    let prevPoints = 0;

    if (prevCalcMode === 'terms') {
        PREVIOUS_TERM_CREDITS.forEach(t => {
            const rawVal = document.getElementById(t.id)?.value;
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
        prevCr = parseFloat(document.getElementById('prevCreditsInput')?.value) || 0;
        const prevCg = parseFloat(document.getElementById('prevCGPAInput')?.value) || 0;
        prevPoints = prevCr * prevCg;
    }

    document.getElementById('calcPrevCreditsStat').textContent = prevCr.toFixed(2);

    const totalCredits = prevCr + termCredits;
    const totalPoints = prevPoints + termPoints;
    const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    document.getElementById('calculatedOverallCGPA').textContent = overallCgpa.toFixed(2);
    document.getElementById('calculatedTotalCreditsText').textContent = `Total Combined Credits: ${totalCredits.toFixed(2)}`;
}

// ================= DARK MODE =================
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

window.addEventListener('DOMContentLoaded', initPortal);