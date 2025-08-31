// نظام تسجيل دخول المدرسين
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('teacherForm');
    const registerForm = document.getElementById('registerForm');
    
    // التحقق من تسجيل الدخول عند تحميل الصفحة
    checkLoginStatus();
    
    // تسجيل الدخول
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // إنشاء حساب جديد
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // التحقق من حالة تسجيل الدخول
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('teacherLoggedIn');
        const teacherData = localStorage.getItem('teacherData');
        
        if (isLoggedIn === 'true' && teacherData) {
            // المستخدم مسجل دخول بالفعل، إعادة توجيه أو إخفاء النموذج
            showAlreadyLoggedIn();
        }
    }
    
    // معالجة تسجيل الدخول
    function handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value;
        
        // التحقق من البيانات
        if (!validateLoginData(email, password, fullName)) {
            return;
        }
        
        // البحث عن المستخدم في قاعدة البيانات المحلية
        const teachers = getStoredTeachers();
        const teacher = teachers.find(t => 
            t.email === email && 
            t.password === password && 
            t.fullName === fullName
        );
        
        if (teacher) {
            // تسجيل الدخول ناجح
            localStorage.setItem('teacherLoggedIn', 'true');
            localStorage.setItem('teacherData', JSON.stringify(teacher));
            showSuccessMessage('تم تسجيل الدخول بنجاح!', () => {
                // إعادة توجيه إلى لوحة التحكم أو الصفحة الرئيسية
            });
            window.location.href = '/Reports/index.html';
            
        } else {
            showErrorMessage('بيانات الدخول غير صحيحة. تحقق من البيانات أو أنشئ حساب جديد.');
        }
    }
    
    // معالجة إنشاء حساب جديد
    function handleRegister() {
        const fullName = document.getElementById('regFullName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // التحقق من البيانات
        if (!validateRegisterData(fullName, email, password, confirmPassword)) {
            return;
        }
        
        // التحقق من عدم وجود حساب بنفس الإيميل
        const teachers = getStoredTeachers();
        const existingTeacher = teachers.find(t => t.email === email);
        
        if (existingTeacher) {
            showErrorMessage('يوجد حساب بالفعل بهذا البريد الإلكتروني');
            return;
        }
        
        // إنشاء حساب جديد
        const newTeacher = {
            id: Date.now(),
            fullName: fullName,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        teachers.push(newTeacher);
        localStorage.setItem('teachers', JSON.stringify(teachers));
        
        showSuccessMessage('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.', () => {
            showLoginForm();
        });
    }
    
    // التحقق من بيانات تسجيل الدخول
    function validateLoginData(email, password, fullName) {
        removeErrorMessages();
        let isValid = true;
        
        if (!fullName.trim()) {
            showError(document.getElementById('fullName').closest('.form-group'), 'الاسم مطلوب');
            isValid = false;
        }
        
        if (!email.trim()) {
            showError(document.getElementById('email').closest('.form-group'), 'البريد الإلكتروني مطلوب');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(document.getElementById('email').closest('.form-group'), 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }
        
        if (!password.trim()) {
            showError(document.getElementById('password').closest('.form-group'), 'كلمة المرور مطلوبة');
            isValid = false;
        }
        
        return isValid;
    }
    
    // التحقق من بيانات التسجيل
    function validateRegisterData(fullName, email, password, confirmPassword) {
        removeErrorMessages();
        let isValid = true;
        
        if (!fullName.trim()) {
            showError(document.getElementById('regFullName').closest('.form-group'), 'الاسم مطلوب');
            isValid = false;
        }
        
        if (!email.trim()) {
            showError(document.getElementById('regEmail').closest('.form-group'), 'البريد الإلكتروني مطلوب');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showError(document.getElementById('regEmail').closest('.form-group'), 'البريد الإلكتروني غير صحيح');
            isValid = false;
        }
        
        if (!password.trim()) {
            showError(document.getElementById('regPassword').closest('.form-group'), 'كلمة المرور مطلوبة');
            isValid = false;
        } else if (password.length < 6) {
            showError(document.getElementById('regPassword').closest('.form-group'), 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            showError(document.getElementById('confirmPassword').closest('.form-group'), 'كلمة المرور غير متطابقة');
            isValid = false;
        }
        
        return isValid;
    }
    
    // التحقق من صحة البريد الإلكتروني
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // عرض رسالة خطأ
    function showError(formGroup, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
    
    // إزالة رسائل الخطأ
    function removeErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }
    
    // عرض رسالة خطأ عامة
    function showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    // عرض رسالة نجاح
    function showSuccessMessage(message, callback) {
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
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;">✓</div>
                    <h3 style="color: #333; margin-bottom: 1rem;">${message}</h3>
                    <button onclick="this.closest('div').remove(); ${callback ? 'setTimeout(() => { ' + callback.toString() + ' }, 100)' : ''}" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 0.75rem 2rem;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">حسناً</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // عرض رسالة للمستخدم المسجل دخول بالفعل
    function showAlreadyLoggedIn() {
        const teacherData = JSON.parse(localStorage.getItem('teacherData'));
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
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <div style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #333; margin-bottom: 1rem;">مسجل دخول بالفعل</h3>
                    <p style="color: #666; margin-bottom: 2rem;">
                        مرحباً ${teacherData.fullName}!<br>
                        أنت مسجل دخول بالفعل. هل تريد تسجيل الخروج؟
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="logout()" style="
                            background: #e74c3c;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">تسجيل الخروج</button>
                        <button onclick="this.closest('div').remove()" style="
                            background: #667eea;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">البقاء مسجل دخول</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // الحصول على المدرسين المحفوظين
    function getStoredTeachers() {
        const teachers = localStorage.getItem('teachers');
        return teachers ? JSON.parse(teachers) : [];
    }
    
    // إضافة تأثيرات تفاعلية للحقول
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// دوال عامة للاستخدام في HTML
function showRegisterForm() {
    document.getElementById('teacherForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('teacherForm').style.display = 'block';
}

function logout() {
    localStorage.removeItem('teacherLoggedIn');
    localStorage.removeItem('teacherData');
    location.reload();
} 