function escapeHtml(str) {
    if (!str) return '';

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function copyToClipboard(text, successMessage = 'Đã sao chép vào clipboard') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                if (typeof showToast === 'function') {
                    showToast(successMessage);
                }
            })
            .catch(err => {
                console.error('Lỗi khi sao chép thông qua Clipboard API:', err);
            });
    } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        if (typeof showToast === 'function') {
            showToast(successMessage);
        }
    }
}

function checkPasswordStrength(password) {
    const str = typeof password === 'string' ? password : '';

    const rules = {
        minLength: str.length >= 8,
        hasUppercase: /[A-Z]/.test(str),
        hasLetter: /[a-zA-Z]/.test(str),
        hasNumber: /[0-9]/.test(str),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(str) || /[^a-zA-Z0-9\s]/.test(str)
    };

    const hasLetterAndNumber = rules.hasLetter && rules.hasNumber;

    const passedCriteria = {
        minLength: rules.minLength,
        hasUppercase: rules.hasUppercase,
        hasLetterAndNumber: hasLetterAndNumber,
        hasSpecialChar: rules.hasSpecialChar
    };

    let score = 0;
    if (passedCriteria.minLength) score++;
    if (passedCriteria.hasUppercase) score++;
    if (passedCriteria.hasLetterAndNumber) score++;
    if (passedCriteria.hasSpecialChar) score++;

    const isValid = score === 4;

    let level = 'empty';
    let label = 'Chưa nhập mật khẩu';
    let color = '#94A3B8';
    let percent = 0;

    if (str.length > 0) {
        if (score <= 1) {
            level = 'weak';
            label = 'Yếu';
            color = '#EF4444';
            percent = 25;
        } else if (score === 2) {
            level = 'fair';
            label = 'Trung bình';
            color = '#F59E0B';
            percent = 50;
        } else if (score === 3) {
            level = 'good';
            label = 'Khá';
            color = '#0284C7';
            percent = 75;
        } else {
            level = 'strong';
            label = 'Rất an toàn';
            color = '#10B981';
            percent = 100;
        }
    }

    const missingMessages = [];
    if (!passedCriteria.minLength) missingMessages.push('Mật khẩu phải có ít nhất 8 ký tự');
    if (!passedCriteria.hasUppercase) missingMessages.push('Phải có ít nhất 1 ký tự viết hoa (A-Z)');
    if (!passedCriteria.hasLetterAndNumber) missingMessages.push('Phải có đủ cả chữ cái và số');
    if (!passedCriteria.hasSpecialChar) missingMessages.push('Phải có ít nhất 1 ký tự đặc biệt (!@#$%...)');

    return {
        isValid,
        score,
        percent,
        level,
        label,
        color,
        passedCriteria,
        missingMessages
    };
}

function validatePassword(password) {
    const result = checkPasswordStrength(password);
    return {
        isValid: result.isValid,
        message: result.missingMessages.length > 0 ? result.missingMessages.join('. ') : 'Mật khẩu đạt chuẩn an toàn',
        details: result
    };
}

window.escapeHtml = escapeHtml;
window.copyToClipboard = copyToClipboard;
window.checkPasswordStrength = checkPasswordStrength;
window.validatePassword = validatePassword;


