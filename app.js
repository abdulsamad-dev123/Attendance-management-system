const K = {
    students: "ams2_students",
    courses: "ams2_courses",
    lecturers: "ams2_lecturers",
    attendance: "ams2_attendance",
    registrations: "ams2_registrations",
    session: "ams2_session"
};

let students = [];
let courses = [];
let lecturers = [];
let attendance = [];
let registrations = [];
let session = null;

const $ = id => document.getElementById(id);

const today = () => new Date().toISOString().slice(0, 10);

const uid = prefix => prefix + Date.now() + Math.random().toString(36).slice(2, 7);

const esc = value =>
    String(value ?? "")
        .replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character]));

const initials = name =>
    String(name || "?")
        .split(" ")
        .map(x => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

function save() {
    localStorage.setItem(K.students, JSON.stringify(students));
    localStorage.setItem(K.courses, JSON.stringify(courses));
    localStorage.setItem(K.lecturers, JSON.stringify(lecturers));
    localStorage.setItem(K.attendance, JSON.stringify(attendance));
    localStorage.setItem(K.registrations, JSON.stringify(registrations));
}

function load() {
    students = JSON.parse(localStorage.getItem(K.students) || "null") || [];
    courses = JSON.parse(localStorage.getItem(K.courses) || "null") || [];
    lecturers = JSON.parse(localStorage.getItem(K.lecturers) || "null") || [];
    attendance = JSON.parse(localStorage.getItem(K.attendance) || "null") || [];
    registrations = JSON.parse(localStorage.getItem(K.registrations) || "null") || [];
    seed();
}

function seed() {
    if (!courses.length) {
        courses = [
            { id: "c1", code: "CSC101", title: "Introduction to Computer Science", level: "100" },
            { id: "c2", code: "MTH101", title: "Elementary Mathematics I", level: "100" },
            { id: "c3", code: "CSC201", title: "Introduction to Computer Programming", level: "200" },
            { id: "c4", code: "MTH201", title: "Mathematical Methods", level: "200" },
            { id: "c5", code: "CSC301", title: "Data Structures and Algorithms", level: "300" },
            { id: "c6", code: "CSC303", title: "Operating Systems", level: "300" },
            { id: "c7", code: "CSC401", title: "Software Engineering", level: "400" },
            { id: "c8", code: "CSC403", title: "Computer Networks", level: "400" }
        ];
    }
    if (!lecturers.length) {
        lecturers = [
            { id: "l1", name: "Administrator", username: "admin", password: "admin123", role: "Admin", department: "Management" },
            { id: "l2", name: "Demo Lecturer", username: "lecturer", password: "lec123", role: "Lecturer", department: "Computer Science" }
        ];
    }
    
    save();
}

function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2200);
}

function openModal(html) {
    $("modalBox").innerHTML = html;
    $("modal").classList.add("show");
}

function closeModal() {
    $("modal").classList.remove("show");
}

if ($("modal")) {
    $("modal").addEventListener("click", event => {
        if (event.target.id === "modal") {
            closeModal();
        }
    });
}

window.onload = function() {
    load();
    const saved = localStorage.getItem(K.session);
    if (saved) {
        session = JSON.parse(saved);
        startApp();
    } else {
        $("loginScreen").classList.remove("hidden");
    }

    $("loginForm").onsubmit = event => {
        event.preventDefault();
        const username = $("loginUser").value.trim();
        const password = $("loginPass").value;

        // Check staff/admin login
        let foundUser = lecturers.find(item => item.username.toLowerCase() === username.toLowerCase() && item.password === password);

        if (foundUser) {
            session = {
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role || "Lecturer",
                name: foundUser.name
            };
            localStorage.setItem(K.session, JSON.stringify(session));
            startApp();
            return;
        }

        // Check student login using Matric Number as username and password
        let foundStudent = students.find(item => item.studentId.toLowerCase() === username.toLowerCase());
        const studentPassword = foundStudent && foundStudent.password ? foundStudent.password : foundStudent?.studentId;
        
        if (foundStudent && password === studentPassword) {
            session = {
                id: foundStudent.id,
                username: foundStudent.studentId,
                role: "Student",
                name: foundStudent.name
            };
            localStorage.setItem(K.session, JSON.stringify(session));
            startApp();
            return;
        }

        showToast("Invalid credentials or Matric Number");
    };
};

function startApp() {
    $("loginScreen").classList.add("hidden");
    $("app").classList.remove("hidden");
    $("sessionName").textContent = session.name;
    $("sessionRole").textContent = session.role;
    $("sessionAvatar").textContent = initials(session.name);
    
    setupSidebarNav();
    if (session.role === "Student") {
        go("studentDashboard");
    } else {
        go("dashboard");
    }
}

function setupSidebarNav() {
    let navHtml = "";
    if (session.role === "Student") {
        navHtml = `
            <div class="nav-title">Student Portal</div>
            <button data-page="studentDashboard" onclick="go('studentDashboard')">▣ &nbsp; My Dashboard</button>
            <button data-page="studentRegister" onclick="go('studentRegister')">▤ &nbsp; Register Courses</button>
            <button data-page="studentMark" onclick="go('studentMark')">✓ &nbsp; Mark Attendance</button>
            <button data-page="studentPassword" onclick="go('studentPassword')">🔑 &nbsp; Change Password</button>
            <div class="nav-title">System</div>
            <button onclick="logout()">↪ &nbsp; Logout</button>
        `;
    } else {
        navHtml = `
            <div class="nav-title">Main</div>
            <button data-page="dashboard" onclick="go('dashboard')">▣ &nbsp; Dashboard</button>
            <button data-page="students" onclick="go('students')">◉ &nbsp; Students</button>
            <button data-page="attendance" onclick="go('attendance')">✓ &nbsp; Attendance Records</button>
            <button data-page="courses" onclick="go('courses')">▤ &nbsp; Courses / Subjects</button>
            <button data-page="lecturers" onclick="go('lecturers')">♙ &nbsp; Accounts</button>
            <div class="nav-title">Analysis</div>
            <button data-page="reports" onclick="go('reports')">▥ &nbsp; Reports</button>
            <div class="nav-title">System</div>
            <button data-page="settings" onclick="go('settings')">⚙ &nbsp; Settings</button>
            <button onclick="logout()">↪ &nbsp; Logout</button>
        `;
    }
    $("sidebarNav").innerHTML = navHtml;
}

function logout() {
    localStorage.removeItem(K.session);
    location.reload();
}

function toggleSidebar() {
    $("sidebar").classList.toggle("open");
}

function go(page) {
    document.querySelectorAll(".nav button[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });
    $("sidebar").classList.remove("open");

    const titles = {
        dashboard: "Dashboard",
        students: "Students Management",
        attendance: "Attendance Records",
        courses: "Courses / Subjects Management",
        lecturers: "User Accounts Management",
        reports: "Attendance Reports",
        settings: "Settings",
        studentDashboard: "Student Dashboard",
        studentRegister: "Course Registration",
        studentMark: "Mark Attendance",
        studentPassword: "Change Password"
    };

    $("topTitle").textContent = titles[page] || "Dashboard";

    const pages = {
        dashboard: dashboard,
        students: studentsPage,
        attendance: attendancePage,
        courses: coursesPage,
        lecturers: lecturersPage,
        reports: reportsPage,
        settings: settingsPage,
        studentDashboard: studentDashboardPage,
        studentRegister: studentRegisterPage,
        studentMark: studentMarkPage,
        studentPassword: studentPasswordPage
    };

    if (pages[page]) pages[page]();
}

/* ================= FORGOT PASSWORD MODAL ================= */

function openForgotPasswordModal(event) {
    if (event) event.preventDefault();
    openModal(`
        <div class="modal-head">
            <h3>Reset Password</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="handleForgotPasswordReset(event)">
            <p class="muted" style="font-size:13px; margin-bottom: 12px;">Enter your Username or Matric Number to reset your password.</p>
            <div class="form-group">
                <label>Username / Matric No.</label>
                <input id="resetUser" type="text" placeholder="e.g. STU001 or admin" required>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input id="resetPass" type="password" placeholder="Enter new password" required>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Reset Password</button>
        </form>
    `);
}

function handleForgotPasswordReset(event) {
    event.preventDefault();
    const username = $("resetUser").value.trim().toLowerCase();
    const newPassword = $("resetPass").value.trim();

    // Check if account is a staff/lecturer/admin
    let staffAccount = lecturers.find(l => l.username.toLowerCase() === username);
    if (staffAccount) {
        staffAccount.password = newPassword;
        save();
        closeModal();
        showToast("Password reset successfully! Please sign in.");
        $("loginUser").value = staffAccount.username;
        $("loginPass").value = "";
        return;
    }

    // Check if account is a student
    let studentAccount = students.find(s => s.studentId.toLowerCase() === username);
    if (studentAccount) {
        studentAccount.password = newPassword;
        save();
        closeModal();
        showToast("Password reset successfully! Please sign in.");
        $("loginUser").value = studentAccount.studentId;
        $("loginPass").value = "";
        return;
    }

    showToast("Username or Matric Number not found!");
}

function dashboard() {
    const currentDate = today();
    const present = attendance.filter(item => item.date === currentDate && item.status === "Present").length;
    const absent = attendance.filter(item => item.date === currentDate && item.status === "Absent").length;
    const marked = attendance.filter(item => ["Present", "Late", "Absent"].includes(item.status)).length;
    const average = attendance.length
        ? Math.round((attendance.filter(item => item.status !== "Absent").length / attendance.length) * 100)
        : 0;

    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Dashboard</h1>
                <p class="muted">Overview of your attendance system.</p>
            </div>
        </div>
        <div class="stats">
            <div class="stat">
                <div class="stat-top">Total Students <span class="stat-icon">◉</span></div>
                <div class="stat-value">${students.length}</div>
                <small class="muted">Registered students</small>
            </div>
            <div class="stat">
                <div class="stat-top">Present Today <span class="stat-icon">✓</span></div>
                <div class="stat-value">${present}</div>
                <small class="muted">${currentDate}</small>
            </div>
            <div class="stat">
                <div class="stat-top">Absent Today <span class="stat-icon">!</span></div>
                <div class="stat-value">${absent}</div>
                <small class="muted">${currentDate}</small>
            </div>
            <div class="stat">
                <div class="stat-top">Average Attendance <span class="stat-icon">%</span></div>
                <div class="stat-value">${average}%</div>
                <small class="muted">${marked} records</small>
            </div>
        </div>
        <div class="card">
            <h3>Recent Attendance</h3>
            ${recentTable(10)}
        </div>
    `;
}

function recentTable(limit = 10) {
    const records = [...attendance]
        .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id))
        .slice(0, limit);

    if (!records.length) {
        return `<div class="empty">No attendance records yet.</div>`;
    }

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => {
                        const student = students.find(s => s.id === record.studentId) || { name: "Unknown" };
                        const course = courses.find(c => c.id === record.courseId) || { code: "General" };
                        const badgeClass = record.status === "Present" ? "present" : record.status === "Late" ? "late" : "absent";
                        return `
                            <tr>
                                <td>${record.date}</td>
                                <td>${esc(student.name)}</td>
                                <td>${esc(course.code)}</td>
                                <td><span class="badge ${badgeClass}">${record.status}</span></td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}


/* ================= PUBLIC STUDENT ATTENDANCE & REGISTRATION ================= */

function openStudentPortal() {
    openModal(`
        <div class="modal-head">
            <h3>Student Self Attendance Check-In</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form id="studentPortalForm" onsubmit="submitStudentAttendance(event)">
            <div class="form-group">
                <label>Select Course</label>
                <select id="stuPortalCourse" required>
                    ${courses.map(c => `<option value="${c.id}">${c.code} -${c.title}</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Matric Number</label>
                <input id="stuPortalId" type="text" placeholder="e.g. STU001" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input id="stuPortalDate" type="date" value="${today()}" required>
            </div>
            <button class="btn btn-success" style="width:100%; margin-top:10px;" type="submit">Submit Attendance</button>
        </form>
    `);
}

function submitStudentAttendance(event) {
    event.preventDefault();
    const courseId = $("stuPortalCourse").value;
    const inputId = $("stuPortalId").value.trim();
    const date = $("stuPortalDate").value;

    const foundStudent = students.find(s => s.studentId.toLowerCase() === inputId.toLowerCase());
    if (!foundStudent) {
        showToast("Matric Number not found in system records!");
        return;
    }

    const isRegistered = registrations.some(r => r.studentId === foundStudent.id && r.courseId === courseId);
    if (!isRegistered) {
        showToast("You are not registered for this course! Please register first.");
        return;
    }

    const existingIndex = attendance.findIndex(a => a.studentId === foundStudent.id && a.courseId === courseId && a.date === date);

    if (existingIndex > -1) {
        attendance[existingIndex].status = "Present";
    } else {
        attendance.push({
            id: uid("att_"),
            studentId: foundStudent.id,
            courseId: courseId,
            date: date,
            status: "Present"
        });
    }

    save();
    closeModal();
    showToast(`Attendance marked successfully for ${foundStudent.name}!`);
}

function openStudentRegModal() {
    openModal(`
        <div class="modal-head">
            <h3>Student Course Registration</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="submitPublicRegistration(event)">
            <div class="form-group">
                <label>Matric Number</label>
                <input id="pubRegId" type="text" placeholder="e.g. STU001" required>
            </div>
            <div class="form-group">
                <label>Select Course to Register</label>
                <select id="pubRegCourse" required>
                    ${courses.map(c => `<option value="${c.id}">${c.code} -${c.title}</option>`).join("")}
                </select>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Register Course</button>
        </form>
    `);
}

function submitPublicRegistration(event) {
    event.preventDefault();
    const inputId = $("pubRegId").value.trim();
    const courseId = $("pubRegCourse").value;

    const foundStudent = students.find(s => s.studentId.toLowerCase() === inputId.toLowerCase());
    if (!foundStudent) {
        showToast("Matric Number not found!");
        return;
    }

    const alreadyReg = registrations.some(r => r.studentId === foundStudent.id && r.courseId === courseId);
    if (alreadyReg) {
        showToast("Course already registered!");
        return;
    }

    registrations.push({
        id: uid("reg_"),
        studentId: foundStudent.id,
        courseId: courseId
    });

    save();
    closeModal();
    showToast("Course registered successfully!");
}


/* ================= STUDENT LOGGED-IN VIEWS ================= */

function studentDashboardPage() {
    const student = students.find(s => s.id === session.id);
    const myRegs = registrations.filter(r => r.studentId === session.id);
    const myAtt = attendance.filter(a => a.studentId === session.id);

    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Welcome, ${esc(student ? student.name : session.name)}</h1>
                <p class="muted">Matric Number: <b>${esc(student ? student.studentId : session.username)}</b> | Email: <b>${esc(student ? student.email : 'N/A')}</b></p>
            </div>
        </div>
        <div class="stats">
            <div class="stat">
                <div class="stat-top">Registered Courses <span class="stat-icon">▤</span></div>
                <div class="stat-value">${myRegs.length}</div>
            </div>
            <div class="stat">
                <div class="stat-top">Classes Attended <span class="stat-icon">✓</span></div>
                <div class="stat-value">${myAtt.filter(a => a.status === "Present").length}</div>
            </div>
        </div>
        <div class="card">
            <h3>My Registered Courses</h3>
            ${myRegs.length ? `
                <table>
                    <thead><tr><th>Code</th><th>Title</th><th>Level</th></tr></thead>
                    <tbody>
                        ${myRegs.map(r => {
                            const c = courses.find(item => item.id === r.courseId) || {};
                            return `<tr><td>${esc(c.code)}</td><td>${esc(c.title)}</td><td>${esc(c.level)}</td></tr>`;
                        }).join("")}
                    </tbody>
                </table>
            ` : `<div class="empty">You have not registered for any courses yet. Go to "Register Courses".</div>`}
        </div>
    `;
}

function studentRegisterPage() {
    const myRegs = registrations.filter(r => r.studentId === session.id);

    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Course Registration</h1>
                <p class="muted">Select courses to register for the current session.</p>
            </div>
        </div>
        <div class="card">
            <h3>Available Courses</h3>
            <table>
                <thead><tr><th>Code</th><th>Title</th><th>Level</th><th style="text-align:right;">Action</th></tr></thead>
                <tbody>
                    ${courses.map(c => {
                        const isReg = myRegs.some(r => r.courseId === c.id);
                        return `
                            <tr>
                                <td>${esc(c.code)}</td>
                                <td>${esc(c.title)}</td>
                                <td>${esc(c.level)}</td>
                                <td style="text-align:right;">
                                    ${isReg ? '<span class="badge present">Registered</span>' : `<button class="btn btn-primary btn-sm" onclick="studentRegisterCourse('${c.id}')">Register</button>`}
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function studentRegisterCourse(courseId) {
    const alreadyReg = registrations.some(r => r.studentId === session.id && r.courseId === courseId);
    if (alreadyReg) return;

    registrations.push({
        id: uid("reg_"),
        studentId: session.id,
        courseId: courseId
    });
    save();
    showToast("Course registered successfully!");
    studentRegisterPage();
}

function studentMarkPage() {
    const myRegs = registrations.filter(r => r.studentId === session.id);

    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Mark Attendance</h1>
                <p class="muted">Check in for your registered courses.</p>
            </div>
        </div>
        <div class="card">
            ${myRegs.length ? `
                <form onsubmit="studentSubmitSelfAtt(event)">
                    <div class="form-group">
                        <label>Select Course</label>
                        <select id="stuSelfCourse" required>
                            ${myRegs.map(r => {
                                const c = courses.find(item => item.id === r.courseId) || {};
                                return `<option value="${c.id}">${c.code} - ${c.title}</option>`;
                            }).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input id="stuSelfDate" type="date" value="${today()}" required>
                    </div>
                    <button class="btn btn-success" type="submit" style="width:100%; margin-top:10px;">Check In / Mark Present</button>
                </form>
            ` : `<div class="empty">Please register for courses first before marking attendance.</div>`}
        </div>
    `;
}

function studentSubmitSelfAtt(event) {
    event.preventDefault();
    const courseId = $("stuSelfCourse").value;
    const date = $("stuSelfDate").value;

    const existingIndex = attendance.findIndex(a => a.studentId === session.id && a.courseId === courseId && a.date === date);

    if (existingIndex > -1) {
        attendance[existingIndex].status = "Present";
    } else {
        attendance.push({
            id: uid("att_"),
            studentId: session.id,
            courseId: courseId,
            date: date,
            status: "Present"
        });
    }

    save();
    showToast("Attendance marked successfully!");
}

function studentPasswordPage() {
    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Change Password</h1>
                <p class="muted">Update your account login password.</p>
            </div>
        </div>
        <div class="card" style="max-width: 500px;">
            <form onsubmit="submitStudentPasswordChange(event)">
                <div class="form-group">
                    <label>New Password</label>
                    <input id="newStudentPass" type="password" placeholder="Enter new password" required>
                </div>
                <button class="btn btn-primary" type="submit" style="width:100%; margin-top:10px;">Update Password</button>
            </form>
        </div>
    `;
}

function submitStudentPasswordChange(event) {
    event.preventDefault();
    const newPass = $("newStudentPass").value;
    const student = students.find(s => s.id === session.id);
    if (student) {
        student.password = newPass;
        save();
        showToast("Password updated successfully!");
        $("newStudentPass").value = "";
    }
}


/* ================= STUDENTS MANAGEMENT (EDIT, PASSWORDS & IMPORT) ================= */

function autoRegisterCoursesForStudent(studentInternalId, studentLevel) {
    const matchingCourses = courses.filter(c => c.level === studentLevel);
    matchingCourses.forEach(course => {
        const exists = registrations.some(r => r.studentId === studentInternalId && r.courseId === course.id);
        if (!exists) {
            registrations.push({
                id: uid("reg_"),
                studentId: studentInternalId,
                courseId: course.id
            });
        }
    });
    save();
}

function addStudent(matricNumber, fullName, level, department, password = null) {
    const email = `${matricNumber.toLowerCase()}@institution.edu.ng`;
    const studentId = uid("s_");
    
    students.push({
        id: studentId,
        studentId: matricNumber,
        name: fullName,
        email: email,
        password: password || matricNumber,
        level: level,
        department: department
    });
    save();
    autoRegisterCoursesForStudent(studentId, level);
}

function presentStudents() {
    console.clear();
    console.log(`%c--- Student Database Summary (Total: ${students.length}) ---`, "color: #2563eb; font-weight: bold; font-size: 14px;");
    console.table(students);

    let csvRows = ["Matric Number,Full Name,Email,Password,Level,Department"];
    students.forEach(s => {
        csvRows.push(`${s.studentId},"${s.name}",${s.email},${s.password || s.studentId},${s.level},"${s.department}"`);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students_directory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Student list downloaded as Excel/CSV!");
}

function studentsPage() {
    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Students Management</h1>
                <p class="muted">Add students, view passwords, edit profiles, or import lists.</p>
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="openAddStudentModal()">+ Add Student</button>
                <button class="btn btn-success" onclick="presentStudents()">📊 Download Excel Directory</button>
                <button class="btn btn-warning" onclick="openImportModal()">📁 Import Excel/CSV</button>
            </div>
        </div>
        <div class="card">
            ${students.length ? `
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Matric Number</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Password</th>
                                <th>Level</th>
                                <th>Department</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => `
                                <tr>
                                    <td><b>${esc(s.studentId)}</b></td>
                                    <td>${esc(s.name)}</td>
                                    <td>${esc(s.email)}</td>
                                    <td><code>${esc(s.password || s.studentId)}</code></td>
                                    <td>${esc(s.level)}</td>
                                    <td>${esc(s.department)}</td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-primary btn-sm" onclick="openEditStudentModal('${s.id}')">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="removeStudent('${s.id}')">Remove</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="empty">No students found. Click "+ Add Student" or "Import Excel/CSV".</div>`}
        </div>
    `;
}

function openAddStudentModal() {
    let nextNum = 1;
    if (students.length > 0) {
        const nums = students.map(s => {
            const match = s.studentId.match(/STU(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
        });
        nextNum = Math.max(...nums) + 1;
    }
    const autoMatric = "STU" + String(nextNum).padStart(3, "0");

    openModal(`
        <div class="modal-head">
            <h3>Add New Student</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="saveNewStudent(event)">
            <div class="form-group">
                <label>Matric Number (Auto-Generated)</label>
                <input id="newStuId" type="text" value="${autoMatric}" readonly style="background:#f1f5f9; font-weight:bold;">
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input id="newStuName" type="text" placeholder="e.g. John Doe" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input id="newStuPass" type="text" placeholder="Defaults to Matric No. if blank">
            </div>
            <div class="form-group">
                <label>Level</label>
                <select id="newStuLevel">
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                </select>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select id="newStuDept">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Save Student</button>
        </form>
    `);
}

function saveNewStudent(event) {
    event.preventDefault();
    const matric = $("newStuId").value.trim();
    const name = $("newStuName").value.trim();
    const password = $("newStuPass").value.trim() || matric;
    const level = $("newStuLevel").value;
    const dept = $("newStuDept").value;

    addStudent(matric, name, level, dept, password);
    closeModal();
    showToast("Student added successfully!");
    studentsPage();
}

function openEditStudentModal(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    openModal(`
        <div class="modal-head">
            <h3>Edit Student Profile</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="saveEditedStudent(event, '${student.id}')">
            <div class="form-group">
                <label>Matric Number</label>
                <input type="text" value="${esc(student.studentId)}" readonly style="background:#f1f5f9; font-weight:bold;">
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input id="editStuName" type="text" value="${esc(student.name)}" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input id="editStuPass" type="text" value="${esc(student.password || student.studentId)}" required>
            </div>
            <div class="form-group">
                <label>Level</label>
                <select id="editStuLevel">
                    <option value="100" ${student.level === '100' ? 'selected' : ''}>100 Level</option>
                    <option value="200" ${student.level === '200' ? 'selected' : ''}>200 Level</option>
                    <option value="300" ${student.level === '300' ? 'selected' : ''}>300 Level</option>
                    <option value="400" ${student.level === '400' ? 'selected' : ''}>400 Level</option>
                </select>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select id="editStuDept">
                    <option value="Computer Science" ${student.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                    <option value="Electrical & Electronic Engineering" ${student.department === 'Electrical & Electronic Engineering' ? 'selected' : ''}>Electrical & Electronic Engineering</option>
                    <option value="Mechanical Engineering" ${student.department === 'Mechanical Engineering' ? 'selected' : ''}>Mechanical Engineering</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Update Profile</button>
        </form>
    `);
}

function saveEditedStudent(event, id) {
    event.preventDefault();
    const student = students.find(s => s.id === id);
    if (!student) return;

    const oldLevel = student.level;
    student.name = $("editStuName").value.trim();
    student.password = $("editStuPass").value.trim();
    student.level = $("editStuLevel").value;
    student.department = $("editStuDept").value;

    // If level changed, ensure courses match the new level
    if (oldLevel !== student.level) {
        autoRegisterCoursesForStudent(student.id, student.level);
    }

    save();
    closeModal();
    showToast("Student profile updated successfully!");
    studentsPage();
}

function openImportModal() {
    openModal(`
        <div class="modal-head">
            <h3>Import Students from Excel / CSV</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <p class="muted" style="font-size: 13px; margin-bottom: 15px;">
            Upload a CSV file ordered as: <b>Name, Level, Department</b>.<br>
            <i>Matric numbers and emails will be generated automatically.</i>
        </p>
        <form onsubmit="processImportFile(event)">
            <div class="form-group">
                <label>Select CSV File</label>
                <input id="importFile" type="file" accept=".csv, .txt" required>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Upload & Import</button>
        </form>
    `);
}

function processImportFile(event) {
    event.preventDefault();
    const fileInput = $("importFile");
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/);
        let importedCount = 0;

        let nextNum = 1;
        if (students.length > 0) {
            const nums = students.map(s => {
                const match = s.studentId.match(/STU(\d+)/i);
                return match ? parseInt(match[1], 10) : 0;
            });
            nextNum = Math.max(...nums) + 1;
        }

        lines.forEach((line, index) => {
            if (!line.trim()) return;
            const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
            
            if (index === 0 && (cols[0].toLowerCase().includes("name") || cols[0].toLowerCase().includes("matric"))) {
                return;
            }

            const name = cols[0];
            if (!name) return;

            const level = cols[1] && ["100", "200", "300", "400"].includes(cols[1]) ? cols[1] : "100";
            const department = cols[2] || "Computer Science";

            const autoMatric = "STU" + String(nextNum).padStart(3, "0");
            addStudent(autoMatric, name, level, department);
            nextNum++;
            importedCount++;
        });

        closeModal();
        showToast(`Successfully imported ${importedCount} students!`);
        studentsPage();
    };

    reader.readAsText(file);
}

function removeStudent(id) {
    if (confirm("Remove this student?")) {
        students = students.filter(s => s.id !== id);
        registrations = registrations.filter(r => r.studentId !== id);
        save();
        showToast("Student removed.");
        studentsPage();
    }
}


/* ================= COURSES / SUBJECTS MANAGEMENT ================= */

function coursesPage() {
    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>Courses / Subjects Management</h1>
                <p class="muted">Add or delete system courses.</p>
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="openAddCourseModal()">+ Add Course</button>
            </div>
        </div>
        <div class="card">
            ${courses.length ? `
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>Course Title</th>
                                <th>Level</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${courses.map(c => `
                                <tr>
                                    <td>${esc(c.code)}</td>
                                    <td>${esc(c.title)}</td>
                                    <td>${esc(c.level)}</td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-danger btn-sm" onclick="removeCourse('${c.id}')">Delete</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<div class="empty">No courses available.</div>`}
        </div>
    `;
}

function openAddCourseModal() {
    openModal(`
        <div class="modal-head">
            <h3>Add New Course</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="saveNewCourse(event)">
            <div class="form-group">
                <label>Course Code</label>
                <input id="newCourseCode" type="text" placeholder="e.g. CSC202" required>
            </div>
            <div class="form-group">
                <label>Course Title</label>
                <input id="newCourseTitle" type="text" placeholder="e.g. Object-Oriented Programming" required>
            </div>
            <div class="form-group">
                <label>Level</label>
                <select id="newCourseLevel">
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Save Course</button>
        </form>
    `);
}

function saveNewCourse(event) {
    event.preventDefault();
    courses.push({
        id: uid("c_"),
        code: $("newCourseCode").value.trim().toUpperCase(),
        title: $("newCourseTitle").value.trim(),
        level: $("newCourseLevel").value
    });
    save();
    closeModal();
    showToast("Course added successfully!");
    coursesPage();
}

function removeCourse(id) {
    if (confirm("Are you sure you want to delete this course?")) {
        courses = courses.filter(c => c.id !== id);
        registrations = registrations.filter(r => r.courseId !== id);
        save();
        showToast("Course deleted.");
        coursesPage();
    }
}


/* ================= LECTURER & ADMIN ACCOUNTS MANAGEMENT ================= */

function lecturersPage() {
    const isAdmin = session.role === "Admin";

    $("content").innerHTML = `
        <div class="page-head">
            <div>
                <h1>User Accounts Management</h1>
                <p class="muted">View staff accounts and passwords. ${isAdmin ? '' : '<i>(Note: Only Admins can delete accounts)</i>'}</p>
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="openAddAccountModal()">+ Add Account</button>
            </div>
        </div>
        <div class="card">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th style="text-align: right;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lecturers.map(acc => `
                            <tr>
                                <td>${esc(acc.name)}</td>
                                <td>${esc(acc.username)}</td>
                                <td><code>${esc(acc.password)}</code></td>
                                <td><span class="badge ${acc.role === 'Admin' ? 'present' : 'late'}">${esc(acc.role)}</span></td>
                                <td>${esc(acc.department)}</td>
                                <td style="text-align: right;">
                                    ${isAdmin ? 
                                        (acc.username === session.username ? '<span class="muted" style="font-size:12px;">(Active)</span>' : `<button class="btn btn-danger btn-sm" onclick="removeAccount('${acc.id}')">Delete</button>`) 
                                        : '<span class="muted" style="font-size:12px;">Admin only</span>'}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openAddAccountModal() {
    openModal(`
        <div class="modal-head">
            <h3>Add New Account</h3>
            <button class="close" onclick="closeModal()">×</button>
        </div>
        <form onsubmit="saveNewAccount(event)">
            <div class="form-group">
                <label>Full Name</label>
                <input id="newAccName" type="text" placeholder="e.g. Dr. John Smith" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="newAccRole">
                    <option value="Lecturer">Lecturer</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label>Username</label>
                <input id="newAccUser" type="text" placeholder="e.g. jsmith" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input id="newAccPass" type="text" placeholder="Enter password" required>
            </div>
            <div class="form-group">
                <label>Department</label>
                <select id="newAccDept">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
            </div>
            <button class="btn btn-primary" style="width:100%; margin-top:10px;" type="submit">Create Account</button>
        </form>
    `);
}

function saveNewAccount(event) {
    event.preventDefault();
    const username = $("newAccUser").value.trim();

    if (lecturers.some(l => l.username.toLowerCase() === username.toLowerCase())) {
        showToast("Username already exists!");
        return;
    }

    lecturers.push({
        id: uid("acc_"),
        name: $("newAccName").value.trim(),
        role: $("newAccRole").value,
        username: username,
        password: $("newAccPass").value,
        department: $("newAccDept").value.trim()
    });

    save();
    closeModal();
    showToast("Account created successfully!");
    lecturersPage();
}

function removeAccount(id) {
    if (session.role !== "Admin") {
        showToast("Access denied! Only admins can delete accounts.");
        return;
    }

    if (confirm("Are you sure you want to delete this account?")) {
        lecturers = lecturers.filter(acc => acc.id !== id);
        save();
        showToast("Account removed.");
        lecturersPage();
    }
}


/* ================= OTHER ADMIN PAGES ================= */

function attendancePage() {
    $("content").innerHTML = `
        <div class="page-head"><div><h1>Attendance Records</h1><p class="muted">System logs.</p></div></div>
        <div class="card">${recentTable(25)}</div>
    `;
}

function reportsPage() { dashboard(); }

function settingsPage() {
    $("content").innerHTML = `
        <div class="page-head"><div><h1>Settings</h1><p class="muted">System controls.</p></div></div>
        <div class="card"><button class="btn btn-danger" onclick="localStorage.clear(); location.reload();">Reset All Data</button></div>
    `;
}
