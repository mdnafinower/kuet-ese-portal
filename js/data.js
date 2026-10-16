/* ==========================================================================
   KUET ESE 3-2 Portal — Official Curriculum & Routine Data (js/data.js)
   ========================================================================== */

const PERIOD_INFO = [
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

const FACULTY = {
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

const COURSES = [
    {
        code: "ESE 3203",
        title: "Petroleum and Natural Gas Processing",
        credit: 3.00,
        type: "Theory",
        teachers: ["MSH", "AA"],
        schedule: "Sun (09:40), Mon (11:30), Tue (09:40)",
        materials: [
            { title: "Natural Gas Sweetening & Dehydration Lecture Notes", category: "Lecture Slides", section: "Sec A (MSH)", url: "https://drive.google.com" },
            { title: "Crude Oil Distillation & Fractionation Handnotes (Chotha)", category: "Chotha / Handnotes", section: "Sec B (AA)", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3207",
        title: "Solar Photovoltaic Systems",
        credit: 3.00,
        type: "Theory",
        teachers: ["NL", "NAP"],
        schedule: "Sun (12:20), Mon (12:20), Wed (10:40)",
        materials: [
            { title: "Solar Cell Physics, P-N Junction & I-V Curve Slides", category: "Lecture Slides", section: "NL", url: "https://drive.google.com" },
            { title: "Standalone & Grid-Connected PV Sizing Calculation Chotha", category: "Chotha / Handnotes", section: "NAP", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3211",
        title: "Coal Power Generation",
        credit: 4.00,
        type: "Theory",
        teachers: ["MHA", "MMA"],
        schedule: "Sun (11:30), Tue (11:30), Wed (12:20), Thu (12:20)",
        materials: [
            { title: "Coal Ranks, Pulverized Coal Boilers & Supercritical Cycles", category: "Lecture Slides", section: "MHA", url: "https://drive.google.com" },
            { title: "Flue Gas Desulfurization (FGD) & Ash Handling Notes", category: "Chotha / Handnotes", section: "MMA", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3217",
        title: "Instrumentation and Control",
        credit: 3.00,
        type: "Theory",
        teachers: ["MR", "KS"],
        schedule: "Mon (09:40), Tue (08:50), Wed (11:30)",
        materials: [
            { title: "Block Diagrams, Transfer Functions & PID Controllers", category: "Lecture Slides", section: "MR", url: "https://drive.google.com" },
            { title: "Sensors, Transducers & Industrial Measurement Notes", category: "Chotha / Handnotes", section: "KS", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3221",
        title: "Energy Storage Systems",
        credit: 3.00,
        type: "Theory",
        teachers: ["MAI", "GSF"],
        schedule: "Sun (10:40), Mon (10:40), Tue (10:40)",
        materials: [
            { title: "Thermal & Mechanical Energy Storage (Pumped Hydro, CAES)", category: "Lecture Slides", section: "MAI", url: "https://drive.google.com" },
            { title: "Electrochemical Battery Storage (Li-Ion, Lead-Acid, Supercapacitors)", category: "Chotha / Handnotes", section: "GSF", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3200",
        title: "Seminar on Special Topics",
        credit: 0.75,
        type: "Sessional",
        teachers: ["All Faculty"],
        schedule: "Department Scheduled Slot",
        materials: [
            { title: "KUET ESE Seminar Presentation Slide Template & IEEE Format", category: "Lab Manual / Report", section: "2K22 Batch", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3202",
        title: "Energy Innovation Lab",
        credit: 0.75,
        type: "Sessional",
        teachers: ["ESE Faculty"],
        schedule: "Thursday (02:30 PM - 05:00 PM)",
        materials: [
            { title: "Energy Innovation Project Proposal Guidelines", category: "Lab Manual / Report", section: "Lab", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3204",
        title: "Sessional on ESE 3203 (Petroleum & Gas Lab)",
        credit: 0.75,
        type: "Sessional",
        teachers: ["MSH", "AA"],
        schedule: "Wednesday (02:30 PM - 05:00 PM)",
        materials: [
            { title: "Flash Point, Fire Point, Viscosity & Cloud Point Lab Sheets", category: "Lab Manual / Report", section: "MSH + AA", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3208",
        title: "Sessional on ESE 3207 (Solar PV Lab)",
        credit: 0.75,
        type: "Sessional",
        teachers: ["NL", "NAP"],
        schedule: "Monday (02:30 PM - 05:00 PM)",
        materials: [
            { title: "PV Module Shading, Tilt Angle & MPPT Experiment Manual", category: "Lab Manual / Report", section: "NL + NAP", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3218",
        title: "Sessional on ESE 3217 (Instrumentation Lab)",
        credit: 0.75,
        type: "Sessional",
        teachers: ["MR", "KS"],
        schedule: "Wednesday (02:30 PM - 05:00 PM)",
        materials: [
            { title: "PID Tuning & Temperature/Pressure Transducer Calibration Sheets", category: "Lab Manual / Report", section: "MR + KS", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3222",
        title: "Sessional on ESE 3221 (Energy Storage Lab)",
        credit: 0.75,
        type: "Sessional",
        teachers: ["MMA", "GSF"],
        schedule: "Tuesday (02:30 PM - 05:00 PM)",
        materials: [
            { title: "Battery Charge-Discharge Characteristics & SOC Lab Manual", category: "Lab Manual / Report", section: "MMA + GSF", url: "https://drive.google.com" }
        ]
    },
    {
        code: "ESE 3250",
        title: "Industrial Attachment",
        credit: 0.00,
        type: "Sessional",
        teachers: ["Industrial Training Committee"],
        schedule: "End of Term / Industrial Visit",
        materials: [
            { title: "Power Plant / Gas Field Attachment Logbook & Report Template", category: "Lab Manual / Report", section: "2K22", url: "https://drive.google.com" }
        ]
    }
];

const ESE_SEMESTER_PRESETS = {
    "1-1": {
        label: "1st Year 1st Term (1-1) — 20.50 Credits",
        courses: [
            { name: "Ch 1113 — Chemistry I", credit: 3.00, gp: 4.00 },
            { name: "Ch 1114 — Sessional on Ch 1113", credit: 0.75, gp: 4.00 },
            { name: "ESE 1100 — Engineering Drawing I", credit: 1.50, gp: 4.00 },
            { name: "ESE 1101 — Fundamentals of Energy Resources", credit: 3.00, gp: 4.00 },
            { name: "ESE 1102 — Sessional on ESE 1101", credit: 0.75, gp: 4.00 },
            { name: "HUM 1000 — History of Bengali Language & Emergence of Bangladesh (Non-Credit)", credit: 0.00, gp: 0.00 },
            { name: "Hum 1113 — Sociology and Behavioural Science", credit: 3.00, gp: 4.00 },
            { name: "Math 1113 — Differential and Integral Calculus", credit: 3.00, gp: 4.00 },
            { name: "MES 1114 — Workshop Practice", credit: 0.75, gp: 4.00 },
            { name: "Ph 1113 — Physics", credit: 4.00, gp: 4.00 },
            { name: "Ph 1114 — Sessional on Ph 1113", credit: 0.75, gp: 4.00 }
        ]
    },
    "1-2": {
        label: "1st Year 2nd Term (1-2) — 20.75 Credits",
        courses: [
            { name: "Ch 1213 — Chemistry II", credit: 3.00, gp: 4.00 },
            { name: "EE 1213 — Electrical Circuits and Electronics", credit: 4.00, gp: 4.00 },
            { name: "EE 1214 — Sessional on EE 1213", credit: 0.75, gp: 4.00 },
            { name: "ESE 1200 — Engineering Drawing II", credit: 1.50, gp: 4.00 },
            { name: "ESE 1205 — Thermodynamics for Energy Engineering", credit: 4.00, gp: 4.00 },
            { name: "ESE 1206 — Sessional on ESE 1205", credit: 0.75, gp: 4.00 },
            { name: "Hum 1213 — Technical English", credit: 3.00, gp: 4.00 },
            { name: "Hum 1214 — Sessional on Hum 1213", credit: 0.75, gp: 4.00 },
            { name: "Math 1213 — Differential Equation and Co-ordinate Geometry", credit: 3.00, gp: 4.00 }
        ]
    },
    "2-1": {
        label: "2nd Year 1st Term (2-1) — 19.75 Credits",
        courses: [
            { name: "CSE 2113 — Computer Programming", credit: 3.00, gp: 4.00 },
            { name: "CSE 2114 — Sessional on CSE 2113", credit: 1.50, gp: 4.00 },
            { name: "EE 2113 — Electrical Machines", credit: 3.00, gp: 4.00 },
            { name: "EE 2114 — Sessional on EE 2113", credit: 0.75, gp: 4.00 },
            { name: "Math 2113 — Linear Algebra and Vector Analysis", credit: 4.00, gp: 4.00 },
            { name: "ME 2113 — Statics and Solid Mechanics", credit: 3.00, gp: 4.00 },
            { name: "ME 2114 — Sessional on ME 2113", credit: 0.75, gp: 4.00 },
            { name: "ME 2115 — Fluid Mechanics", credit: 3.00, gp: 4.00 },
            { name: "ME 2116 — Sessional on ME 2115", credit: 0.75, gp: 4.00 }
        ]
    },
    "2-2": {
        label: "2nd Year 2nd Term (2-2) — 19.00 Credits",
        courses: [
            { name: "EE 2213 — Power Electronics", credit: 4.00, gp: 4.00 },
            { name: "EE 2214 — Sessional on EE 2213", credit: 0.75, gp: 4.00 },
            { name: "ESE 2209 — Bio and Wind Energy Engineering", credit: 3.00, gp: 4.00 },
            { name: "ESE 2210 — Sessional on ESE 2209", credit: 0.75, gp: 4.00 },
            { name: "ESE 2230 — Energy Engineering Simulation I", credit: 0.75, gp: 4.00 },
            { name: "Hum 2213 — Economics and Accounting", credit: 3.00, gp: 4.00 },
            { name: "Math 2213 — Complex Variables and Fourier Analysis", credit: 3.00, gp: 4.00 },
            { name: "ME 2213 — Dynamics and Kinematics of Machineries", credit: 3.00, gp: 4.00 },
            { name: "ME 2214 — Sessional on ME 2213", credit: 0.75, gp: 4.00 }
        ]
    },
    "3-1": {
        label: "3rd Year 1st Term (3-1) — 20.50 Credits",
        courses: [
            { name: "Math 3114 — Sessional on Math 3113", credit: 1.50, gp: 4.00 },
            { name: "EE 3113 — Power System Engineering", credit: 3.00, gp: 4.00 },
            { name: "EE 3114 — Sessional on EE 3113", credit: 0.75, gp: 4.00 },
            { name: "ESE 3105 — Heat and Mass Transfer", credit: 4.00, gp: 4.00 },
            { name: "ESE 3106 — Sessional on ESE 3105", credit: 0.75, gp: 4.00 },
            { name: "ESE 3107 — Solar Thermal Engineering", credit: 3.00, gp: 4.00 },
            { name: "ESE 3108 — Sessional on ESE 3107", credit: 0.75, gp: 4.00 },
            { name: "ESE 3123 — Thermo-Fluid Devices", credit: 3.00, gp: 4.00 },
            { name: "ESE 3124 — Sessional on ESE 3123", credit: 0.75, gp: 4.00 },
            { name: "Math 3113 — Statistics and Numerical Methods", credit: 3.00, gp: 4.00 }
        ]
    },
    "3-2": {
        label: "3rd Year 2nd Term (3-2) — 20.50 Credits",
        courses: [
            { name: "ESE 3200 — Seminar on Special Topics", credit: 0.75, gp: 4.00 },
            { name: "ESE 3202 — Energy Innovation Lab", credit: 0.75, gp: 4.00 },
            { name: "ESE 3203 — Petroleum and Natural Gas Processing", credit: 3.00, gp: 4.00 },
            { name: "ESE 3204 — Sessional on ESE 3203", credit: 0.75, gp: 4.00 },
            { name: "ESE 3207 — Solar Photovoltaic Systems", credit: 3.00, gp: 4.00 },
            { name: "ESE 3208 — Sessional on ESE 3207", credit: 0.75, gp: 4.00 },
            { name: "ESE 3211 — Coal Power Generation", credit: 4.00, gp: 4.00 },
            { name: "ESE 3217 — Instrumentation and Control", credit: 3.00, gp: 4.00 },
            { name: "ESE 3218 — Sessional on ESE 3217", credit: 0.75, gp: 4.00 },
            { name: "ESE 3221 — Energy Storage Systems", credit: 3.00, gp: 4.00 },
            { name: "ESE 3222 — Sessional on ESE 3221", credit: 0.75, gp: 4.00 },
            { name: "ESE 3250 — Industrial Attachment (Non-Credit)", credit: 0.00, gp: 0.00 }
        ]
    }
};

const PREVIOUS_TERM_CREDITS = [
    { id: "termGpa_1_1", label: "1-1", credit: 20.50 },
    { id: "termGpa_1_2", label: "1-2", credit: 20.75 },
    { id: "termGpa_2_1", label: "2-1", credit: 19.75 },
    { id: "termGpa_2_2", label: "2-2", credit: 19.00 },
    { id: "termGpa_3_1", label: "3-1", credit: 20.50 }
];

const GRADE_OPTIONS = [
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

function getInitialSeedRoutine() {
    return {
        "Sunday": [
            null,
            null,
            { code: "ESE 3203", teacher: "MSH", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3221", teacher: "MAI", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3211", teacher: "MHA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3207", teacher: "NL",  type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            null, null, null
        ],
        "Monday": [
            null,
            null,
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
            null,
            null,
            null,
            { code: "ESE 3207", teacher: "NL / NAP", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3217", teacher: "MR / KS", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3211", teacher: "MMA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3204 / ESE 3218", teacher: "MSH+AA / MR+KS", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
            null, null
        ],
        "Thursday": [
            null,
            null,
            null,
            null,
            null,
            { code: "ESE 3211", teacher: "MMA", type: "Theory", kind: "regular", status: "active", span: 1, note: "" },
            { code: "ESE 3202", teacher: "ESE Faculty", type: "Sessional", kind: "regular", status: "active", span: 3, note: "" },
            null, null
        ]
    };
}

function getDefaultCTData() {
    return {
        "ESE 3203": [
            { name: "CT-1", teacher: "MSH", status: "Upcoming", syllabus: "Natural Gas Properties & Phase Behavior", marks: "" },
            { name: "CT-2", teacher: "AA", status: "Upcoming", syllabus: "Crude Oil Fractionation", marks: "" },
            { name: "CT-3", teacher: "MSH / AA", status: "Pending", syllabus: "Gas Dehydration & Sweetening", marks: "" }
        ],
        "ESE 3207": [
            { name: "CT-1", teacher: "NL", status: "Upcoming", syllabus: "Solar Radiation & P-N Junction", marks: "" },
            { name: "CT-2", teacher: "NAP", status: "Upcoming", syllabus: "PV Array Sizing & Inverters", marks: "" },
            { name: "CT-3", teacher: "NL / NAP", status: "Pending", syllabus: "MPPT & Grid Integration", marks: "" }
        ],
        "ESE 3211": [
            { name: "CT-1", teacher: "MHA", status: "Upcoming", syllabus: "Coal Analysis & Pulverized Firing", marks: "" },
            { name: "CT-2", teacher: "MMA", status: "Upcoming", syllabus: "Steam Generators & Draught System", marks: "" },
            { name: "CT-3", teacher: "MHA", status: "Pending", syllabus: "Ash Handling & Electrostatic Precipitator", marks: "" },
            { name: "CT-4 (4 Cr)", teacher: "MMA", status: "Pending", syllabus: "Clean Coal Tech & IGCC", marks: "" }
        ],
        "ESE 3217": [
            { name: "CT-1", teacher: "MR", status: "Upcoming", syllabus: "Open/Closed Loop & Transfer Functions", marks: "" },
            { name: "CT-2", teacher: "KS", status: "Upcoming", syllabus: "Measurement Error & Sensors", marks: "" },
            { name: "CT-3", teacher: "MR / KS", status: "Pending", syllabus: "Stability Analysis & PID Control", marks: "" }
        ],
        "ESE 3221": [
            { name: "CT-1", teacher: "MAI", status: "Upcoming", syllabus: "Sensible & Latent Thermal Storage", marks: "" },
            { name: "CT-2", teacher: "GSF", status: "Upcoming", syllabus: "Li-ion & Lead-Acid Battery Kinetics", marks: "" },
            { name: "CT-3", teacher: "MAI / GSF", status: "Pending", syllabus: "Flywheel, Pumped Hydro & Hydrogen Storage", marks: "" }
        ]
    };
}