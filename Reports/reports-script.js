// نظام التقارير والحضور والغياب
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة البيانات عند التحميل
    initializeData();
    
    // تعيين التاريخ الحالي
    document.getElementById('attendanceDate').valueAsDate = new Date();
    
    // تعيين الشهر الحالي
    const currentMonth = new Date().getMonth() + 1;
    document.getElementById('monthSelect').value = currentMonth;
    
    // إضافة مستمعي الأحداث للنماذج
    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    document.getElementById('attendanceForm').addEventListener('submit', handleAttendance);
    
    // تحميل الطلاب عند تغيير الفلاتر
    document.getElementById('monthSelect').addEventListener('change', loadStudents);
    document.getElementById('gradeSelect').addEventListener('change', loadStudents);
    
    // تحميل الطلاب عند التحميل
    loadStudents();
    updateStudentSelects();
});

// تهيئة البيانات
function initializeData() {
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify([]));
    }
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify([]));
    }
}

// إضافة طالب جديد
function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const student = {
        id: Date.now(),
        name: formData.get('studentName'),
        grade: formData.get('studentGrade'),
        parent: formData.get('studentParent') || '',
        createdAt: new Date().toISOString()
    };
    
    // إضافة الطالب إلى التخزين المحلي
    const students = getStoredStudents();
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    // تحديث الواجهة
    updateStudentSelects();
    loadStudents();
    
    // إعادة تعيين النموذج
    e.target.reset();
    
    // رسالة نجاح
    showMessage('تم إضافة الطالب بنجاح!', 'success');
}

// تسجيل الحضور والغياب
function handleAttendance(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const attendance = {
        id: Date.now(),
        studentId: parseInt(formData.get('attendanceStudent')),
        date: formData.get('attendanceDate'),
        status: formData.get('attendanceStatus'),
        notes: formData.get('attendanceNotes') || '',
        createdAt: new Date().toISOString()
    };
    
    // إضافة سجل الحضور
    const attendanceRecords = getStoredAttendance();
    attendanceRecords.push(attendance);
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    
    // تحديث الواجهة
    loadStudents();
    
    // إعادة تعيين النموذج
    e.target.reset();
    document.getElementById('attendanceDate').valueAsDate = new Date();
    
    // رسالة نجاح
    showMessage('تم تسجيل الحضور بنجاح!', 'success');
}

// تحميل الطلاب في الجدول
function loadStudents() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const grade = document.getElementById('gradeSelect').value;
    
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    // فلترة الطلاب حسب المرحلة
    let filteredStudents = students;
    if (grade) {
        filteredStudents = students.filter(student => student.grade === grade);
    }
    
    // حساب إحصائيات الحضور لكل طالب
    const studentsWithStats = filteredStudents.map(student => {
        const studentAttendance = attendanceRecords.filter(record => 
            record.studentId === student.id && 
            new Date(record.date).getMonth() + 1 === month
        );
        
        const presentDays = studentAttendance.filter(record => record.status === 'present').length;
        const absentDays = studentAttendance.filter(record => record.status === 'absent').length;
        const totalDays = studentAttendance.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        return {
            ...student,
            presentDays,
            absentDays,
            totalDays,
            attendanceRate
        };
    });
    
    displayStudents(studentsWithStats);
}

// عرض الطلاب في الجدول
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    
    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    لا يوجد طلاب في هذه المرحلة
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${getGradeName(student.grade)}</td>
            <td>${student.parent || '-'}</td>
            <td>${student.presentDays}</td>
            <td>${student.absentDays}</td>
            <td>
                <span class="attendance-status ${getAttendanceStatusClass(student.attendanceRate)}">
                    ${student.attendanceRate}%
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editStudent(${student.id})">تعديل</button>
                    <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// تحديث قوائم اختيار الطلاب
function updateStudentSelects() {
    const students = getStoredStudents();
    const studentSelect = document.getElementById('attendanceStudent');
    
    // حفظ القيمة المحددة
    const selectedValue = studentSelect.value;
    
    // إعادة ملء القائمة
    studentSelect.innerHTML = '<option value="">اختر الطالب</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} - ${getGradeName(student.grade)}`;
        studentSelect.appendChild(option);
    });
    
    // إعادة تحديد القيمة السابقة
    if (selectedValue) {
        studentSelect.value = selectedValue;
    }
}

// الحصول على اسم المرحلة
function getGradeName(grade) {
    const grades = {
        'prep1': 'الأول الإعدادي',
        'prep2': 'الثاني الإعدادي',
        'prep3': 'الثالث الإعدادي',
        'sec1': 'الأول الثانوي',
        'sec2': 'الثاني الثانوي',
        'sec3': 'الثالث الثانوي'
    };
    return grades[grade] || grade;
}

// الحصول على فئة حالة الحضور
function getAttendanceStatusClass(rate) {
    if (rate >= 90) return 'status-present';
    if (rate >= 70) return 'status-late';
    if (rate >= 50) return 'status-excused';
    return 'status-absent';
}

// الحصول على الطلاب المحفوظين
function getStoredStudents() {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
}

// الحصول على سجلات الحضور المحفوظة
function getStoredAttendance() {
    const attendance = localStorage.getItem('attendance');
    return attendance ? JSON.parse(attendance) : [];
}

// تعديل بيانات الطالب
function editStudent(studentId) {
    const students = getStoredStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) return;
    
    // إنشاء نموذج التعديل
    const newName = prompt('اسم الطالب الجديد:', student.name);
    if (newName === null) return;
    
    const newGrade = prompt('المرحلة الجديدة (prep1, prep2, prep3, sec1, sec2, sec3):', student.grade);
    if (newGrade === null) return;
    
    const newPhone = prompt('رقم الهاتف الجديد:', student.phone);
    if (newPhone === null) return;
    
    const newParent = prompt('ولي الأمر الجديد:', student.parent);
    if (newParent === null) return;
    
    // تحديث بيانات الطالب
    student.name = newName;
    student.grade = newGrade;
    student.parent = newParent;
    
    // حفظ التغييرات
    localStorage.setItem('students', JSON.stringify(students));
    
    // تحديث الواجهة
    updateStudentSelects();
    loadStudents();
    
    showMessage('تم تحديث بيانات الطالب بنجاح!', 'success');
}

// حذف الطالب
function deleteStudent(studentId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    // حذف الطالب
    const updatedStudents = students.filter(s => s.id !== studentId);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // حذف سجلات الحضور الخاصة بالطالب
    const updatedAttendance = attendanceRecords.filter(a => a.studentId !== studentId);
    localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    
    // تحديث الواجهة
    updateStudentSelects();
    loadStudents();
    
    showMessage('تم حذف الطالب بنجاح!', 'success');
}

// إنشاء التقرير الشهري
function generateMonthlyReport() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const monthName = document.getElementById('monthSelect').options[month - 1].text;
    
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    const monthAttendance = attendanceRecords.filter(record => 
        new Date(record.date).getMonth() + 1 === month
    );
    
    const totalStudents = students.length;
    const totalPresent = monthAttendance.filter(record => record.status === 'present').length;
    const totalAbsent = monthAttendance.filter(record => record.status === 'absent').length;
    const totalLate = monthAttendance.filter(record => record.status === 'late').length;
    const totalExcused = monthAttendance.filter(record => record.status === 'excused').length;
    
    const report = `
تقرير الحضور الشهري - ${monthName}

إجمالي الطلاب: ${totalStudents}
إجمالي أيام الحضور: ${monthAttendance.length}

الحضور:
- حاضر: ${totalPresent} يوم
- غائب: ${totalAbsent} يوم
- متأخر: ${totalLate} يوم
- غائب بعذر: ${totalExcused} يوم

نسبة الحضور الإجمالية: ${monthAttendance.length > 0 ? Math.round((totalPresent / monthAttendance.length) * 100) : 0}%
    `;
    
    showReportModal('التقرير الشهري', report);
}

// إنشاء تقرير الطلاب المتأخرين
function generateLateReport() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const monthName = document.getElementById('monthSelect').options[month - 1].text;
    
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    const monthAttendance = attendanceRecords.filter(record => 
        new Date(record.date).getMonth() + 1 === month
    );
    
    const lateStudents = students.filter(student => {
        const studentAttendance = monthAttendance.filter(record => record.studentId === student.id);
        const lateCount = studentAttendance.filter(record => record.status === 'late').length;
        return lateCount > 0;
    });
    
    let report = `تقرير الطلاب المتأخرين - ${monthName}\n\n`;
    
    if (lateStudents.length === 0) {
        report += 'لا يوجد طلاب متأخرين هذا الشهر.';
    } else {
        report += `عدد الطلاب المتأخرين: ${lateStudents.length}\n\n`;
        
        lateStudents.forEach(student => {
            const studentAttendance = monthAttendance.filter(record => record.studentId === student.id);
            const lateCount = studentAttendance.filter(record => record.status === 'late').length;
            report += `${student.name} (${getGradeName(student.grade)}) - تأخر ${lateCount} مرات\n`;
        });
    }
    
    showReportModal('تقرير الطلاب المتأخرين', report);
}

// إنشاء تقرير الغياب المتكرر
function generateAbsentReport() {
    const month = parseInt(document.getElementById('monthSelect').value);
    const monthName = document.getElementById('monthSelect').options[month - 1].text;
    
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    const monthAttendance = attendanceRecords.filter(record => 
        new Date(record.date).getMonth() + 1 === month
    );
    
    const frequentlyAbsentStudents = students.filter(student => {
        const studentAttendance = monthAttendance.filter(record => record.studentId === student.id);
        const absentCount = studentAttendance.filter(record => record.status === 'absent').length;
        return absentCount > 3;
    });
    
    let report = `تقرير الغياب المتكرر - ${monthName}\n\n`;
    
    if (frequentlyAbsentStudents.length === 0) {
        report += 'لا يوجد طلاب تغيبوا أكثر من 3 مرات هذا الشهر.';
    } else {
        report += `عدد الطلاب المتغيبين: ${frequentlyAbsentStudents.length}\n\n`;
        
        frequentlyAbsentStudents.forEach(student => {
            const studentAttendance = monthAttendance.filter(record => record.studentId === student.id);
            const absentCount = studentAttendance.filter(record => record.status === 'absent').length;
            report += `${student.name} (${getGradeName(student.grade)}) - غاب ${absentCount} مرات\n`;
        });
    }
    
    showReportModal('تقرير الغياب المتكرر', report);
}

// تصدير البيانات إلى Excel
function exportToExcel() {
    const students = getStoredStudents();
    const attendanceRecords = getStoredAttendance();
    
    if (students.length === 0) {
        showMessage('لا توجد بيانات للتصدير!', 'error');
        return;
    }
    
    // إنشاء بيانات CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // رأس الجدول
    csvContent += 'اسم الطالب,المرحلة,ولي الأمر,أيام الحضور,أيام الغياب,نسبة الحضور\n';
    
    // بيانات الطلاب
    students.forEach(student => {
        const studentAttendance = attendanceRecords.filter(record => record.studentId === student.id);
        const presentDays = studentAttendance.filter(record => record.status === 'present').length;
        const absentDays = studentAttendance.filter(record => record.status === 'absent').length;
        const totalDays = studentAttendance.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        csvContent += `${student.name},${getGradeName(student.grade)},${student.parent || ''},${presentDays},${absentDays},${attendanceRate}%\n`;
    });
    
    // تحميل الملف
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تقرير_الطلاب_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('تم تصدير البيانات بنجاح!', 'success');
}

// عرض التقرير في نافذة منبثقة
function showReportModal(title, content) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div style="
                background: #0c1343;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                border: 1px solid #535C91;
            ">
                <h3 style="color: #fff; margin-bottom: 1rem;">${title}</h3>
                <pre style="
                    color: #dfe3ff;
                    text-align: right;
                    direction: rtl;
                    white-space: pre-wrap;
                    font-family: 'Cairo', sans-serif;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                ">${content}</pre>
                <button onclick="this.closest('div').remove()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                ">إغلاق</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// عرض رسالة
function showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#e74c3c' : '#667eea'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        font-family: 'Cairo', sans-serif;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
} 