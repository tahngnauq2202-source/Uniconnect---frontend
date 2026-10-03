function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalTabLogin = document.getElementById('modalTabLogin');
    const modalTabRegister = document.getElementById('modalTabRegister');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const modalTitle = document.getElementById('modalTitle');
    const registerFields = document.querySelectorAll('.register-only');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const eyeIcon = document.getElementById('eyeIcon');
    const strengthStatusText = document.getElementById('strengthStatusText');
    const strengthBar = document.getElementById('strengthBar');
    const critMinLength = document.getElementById('critMinLength');
    const critUppercase = document.getElementById('critUppercase');
    const critLetterNumber = document.getElementById('critLetterNumber');
    const critSpecialChar = document.getElementById('critSpecialChar');

    if (!authModal) return;

    function updatePasswordStrengthUI(val) {
        if (!strengthBar || !strengthStatusText) return;

        let res;
        if (typeof window.checkPasswordStrength === 'function') {
            res = window.checkPasswordStrength(val);
        } else {
            // Fallback nếu helpers chưa tải
            const minLength = val.length >= 8;
            const hasUppercase = /[A-Z]/.test(val);
            const hasLetterAndNumber = /[a-zA-Z]/.test(val) && /[0-9]/.test(val);
            const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val) || /[^a-zA-Z0-9\s]/.test(val);

            let score = 0;
            if (minLength) score++;
            if (hasUppercase) score++;
            if (hasLetterAndNumber) score++;
            if (hasSpecialChar) score++;

            let percent = val.length === 0 ? 0 : (score === 1 ? 25 : score === 2 ? 50 : score === 3 ? 75 : 100);
            let label = val.length === 0 ? 'Chưa nhập' : (score <= 1 ? 'Yếu' : score === 2 ? 'Trung bình' : score === 3 ? 'Khá' : 'Rất an toàn');
            let color = val.length === 0 ? '#94A3B8' : (score <= 1 ? '#EF4444' : score === 2 ? '#F59E0B' : score === 3 ? '#0284C7' : '#10B981');

            res = {
                isValid: score === 4,
                percent,
                label,
                color,
                passedCriteria: { minLength, hasUppercase, hasLetterAndNumber, hasSpecialChar }
            };
        }

        strengthBar.style.width = `${res.percent}%`;
        strengthBar.style.backgroundColor = res.color;
        strengthStatusText.textContent = res.label;
        strengthStatusText.style.color = res.color;

        if (critMinLength) critMinLength.classList.toggle('valid', !!res.passedCriteria.minLength);
        if (critUppercase) critUppercase.classList.toggle('valid', !!res.passedCriteria.hasUppercase);
        if (critLetterNumber) critLetterNumber.classList.toggle('valid', !!res.passedCriteria.hasLetterAndNumber);
        if (critSpecialChar) critSpecialChar.classList.toggle('valid', !!res.passedCriteria.hasSpecialChar);
    }

    if (authPassword) {
        authPassword.addEventListener('input', (e) => {
            authPassword.classList.remove('input-error');
            const isRegister = modalTabRegister?.classList.contains('active');
            if (isRegister) {
                updatePasswordStrengthUI(e.target.value);
            }
        });
    }

    if (togglePasswordBtn && authPassword) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = authPassword.type === 'password';
            authPassword.type = isPassword ? 'text' : 'password';

            if (eyeIcon) {
                if (isPassword) {
                    // Icon mắt gạch chéo (ẩn mật khẩu)
                    eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          `;
                } else {
                    // Icon mắt mở bình thường
                    eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          `;
                }
            }
        });
    }

    function openAuthModal(mode = 'register') {
        authModal.classList.remove('hidden');
        if (mode === 'login') {
            modalTabLogin?.classList.add('active');