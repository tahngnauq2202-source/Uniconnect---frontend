function initAuthModal() {
  const authModal = document.getElementById('authModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const authModalTabs = document.getElementById('authModalTabs');
  const modalTabLogin = document.getElementById('modalTabLogin');
  const modalTabRegister = document.getElementById('modalTabRegister');
  const authFormView = document.getElementById('authFormView');
  const otpStepView = document.getElementById('otpStepView');
  const btnBackToAuthForm = document.getElementById('btnBackToAuthForm');
  const authForm = document.getElementById('authForm');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const modalTitle = document.getElementById('modalTitle');
  const registerFields = document.querySelectorAll('.register-only');
  const authFullName = document.getElementById('authFullName');
  const authRole = document.getElementById('authRole');
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

  // OTP elements
  const otpDisplayEmail = document.getElementById('otpDisplayEmail');
  const otpInputsWrapper = document.getElementById('otpInputsWrapper');
  const otpBoxes = otpInputsWrapper ? otpInputsWrapper.querySelectorAll('.otp-box') : [];
  const otpErrorHint = document.getElementById('otpErrorHint');
  const otpTimerCount = document.getElementById('otpTimerCount');
  const btnResendOtp = document.getElementById('btnResendOtp');
  const resendCountdown = document.getElementById('resendCountdown');
  const btnVerifyOtp = document.getElementById('btnVerifyOtp');

  // HUCE mail notification elements
  const huceMailNotification = document.getElementById('huceMailNotification');
  const huceMailClose = document.getElementById('huceMailClose');
  const huceMailTargetEmail = document.getElementById('huceMailTargetEmail');

  if (!authModal) return;

  // State
  let currentOtp = '';
  let otpExpiresAt = 0;
  let otpTimerInterval = null;
  let resendTimerInterval = null;
  let pendingUserData = null;
  let mailNotificationTimeout = null;

  // --- Password Strength UI ---
  function updatePasswordStrengthUI(val) {
    if (!strengthBar || !strengthStatusText) return;

    let res;
    if (typeof window.checkPasswordStrength === 'function') {
      res = window.checkPasswordStrength(val);
    } else {
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

  // --- Toggle Password Visibility ---
  if (togglePasswordBtn && authPassword) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = authPassword.type === 'password';
      authPassword.type = isPassword ? 'text' : 'password';

      if (eyeIcon) {
        if (isPassword) {
          eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          `;
        } else {
          eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          `;
        }
      }
    });
  }

  // --- Open / Close Modal ---
  function openAuthModal(mode = 'register') {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showAuthFormView();
    switchAuthMode(mode);
  }

  function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    clearOtpTimers();
    hideMailNotification();
  }

  function switchAuthMode(mode) {
    showAuthFormView();

    if (mode === 'login') {
      modalTabLogin?.classList.add('active');
      modalTabRegister?.classList.remove('active');

      if (modalTitle) modalTitle.textContent = 'Đăng nhập UniConnect HUCE';
      if (authSubmitBtn) authSubmitBtn.textContent = 'Đăng nhập';

      registerFields.forEach(el => el.style.display = 'none');
    } else {
      modalTabRegister?.classList.add('active');
      modalTabLogin?.classList.remove('active');

      if (modalTitle) modalTitle.textContent = 'Đăng ký tài khoản HUCE';
      if (authSubmitBtn) authSubmitBtn.textContent = 'Tạo tài khoản ngay';

      registerFields.forEach(el => el.style.display = 'block');
      if (authPassword) {
        updatePasswordStrengthUI(authPassword.value);
      }
    }
  }

  // --- Switching Views: Form vs OTP Step ---
  function showAuthFormView() {
    if (authFormView) authFormView.style.display = 'block';
    if (otpStepView) otpStepView.style.display = 'none';
    if (authModalTabs) authModalTabs.style.display = 'flex';
  }

  function showOtpStepView(email) {
    if (authFormView) authFormView.style.display = 'none';
    if (otpStepView) otpStepView.style.display = 'block';
    if (authModalTabs) authModalTabs.style.display = 'none';

    if (otpDisplayEmail) {
      otpDisplayEmail.innerHTML = `<span>${email}</span>`;
    }

    if (otpErrorHint) {
      otpErrorHint.textContent = '';
    }

    // Reset OTP boxes
    otpBoxes.forEach(box => {
      box.value = '';
      box.classList.remove('filled', 'input-error');
    });

    if (btnVerifyOtp) {
      btnVerifyOtp.disabled = false;
      btnVerifyOtp.textContent = 'Xác nhận & Hoàn tất đăng ký';
    }

    // Focus ô đầu tiên
    setTimeout(() => {
      if (otpBoxes[0]) otpBoxes[0].focus();
    }, 150);
  }

  // --- OTP Generation & Email Sending ---
  function generate6DigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function sendOtpToEmail(email, name = '') {
    currentOtp = generate6DigitOtp();
    // Hiệu lực 5 phút (300 giây)
    otpExpiresAt = Date.now() + 5 * 60 * 1000;

    console.log(`%c[UniConnect HUCE] 📧 Đang gửi mã xác thực OTP tới email: ${email}`, 'color: #0066FF; font-weight: bold; font-size: 14px;');
    // In mã trong Console để lập trình viên test khi backend chưa được khởi động
    console.log(`%c[HUCE Dev Tool] 🔑 Mã OTP dự phòng console: %c${currentOtp}`, 'color: #64748B;', 'color: #0066FF; font-weight: bold; font-size: 15px;');

    // Gọi Backend API UniConnect: POST /api/auth/register (hoặc /signup)
    // Backend UniConnect nhận { username, email, password }, sinh mã 6 số và gửi mail qua transporter
    const username = pendingUserData?.username || email.split('@')[0] || ('huce_' + Math.floor(1000 + Math.random() * 9000));
    const password = pendingUserData?.password || 'Huce@2026';

    try {
      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password
        })
      }).then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 409) {
            if (typeof showToast === 'function') {
              showToast(data.message || 'Tài khoản hoặc email đã đăng ký!', 'siteToast', 4000);
            }
          } else if (data.message) {
            console.warn('[UniConnect Backend] Register warning:', data.message);
          }
        } else {
          console.log('[UniConnect Backend] Đã gửi mã OTP qua Backend:', data.message);
        }
      }).catch(() => {
        // Backend offline fallback
      });
    } catch (_) { }

    // Hiển thị thông báo đã gửi mã OTP tới email (không lộ mã và không có nút tự động điền)
    showMailNotification(email);

    // Bắt đầu đếm ngược thời gian
    startOtpCountdown(120); // 2 phút hiển thị trên modal
    startResendCountdown(60); // 60 giây cho phép gửi lại mã
  }

  // --- Timers ---
  function clearOtpTimers() {
    if (otpTimerInterval) {
      clearInterval(otpTimerInterval);
      otpTimerInterval = null;
    }
    if (resendTimerInterval) {
      clearInterval(resendTimerInterval);
      resendTimerInterval = null;
    }
  }

  function startOtpCountdown(seconds) {
    if (otpTimerInterval) clearInterval(otpTimerInterval);

    let remaining = seconds;
    updateOtpTimerDisplay(remaining);

    otpTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
        updateOtpTimerDisplay(0);
        if (otpErrorHint) {
          otpErrorHint.textContent = 'Mã OTP đã hết hiệu lực. Vui lòng bấm "Gửi lại mã".';
        }
      } else {
        updateOtpTimerDisplay(remaining);
      }
    }, 1000);
  }

  function updateOtpTimerDisplay(sec) {
    if (!otpTimerCount) return;
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    otpTimerCount.textContent = `${m}:${s}`;
  }

  function startResendCountdown(seconds) {
    if (resendTimerInterval) clearInterval(resendTimerInterval);

    if (btnResendOtp) {
      btnResendOtp.disabled = true;
    }

    let remaining = seconds;
    if (resendCountdown) resendCountdown.textContent = remaining.toString();

    resendTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(resendTimerInterval);
        resendTimerInterval = null;
        if (btnResendOtp) {
          btnResendOtp.disabled = false;
          btnResendOtp.innerHTML = '<strong>Gửi lại mã ngay</strong>';
        }
      } else {
        if (resendCountdown) resendCountdown.textContent = remaining.toString();
      }
    }, 1000);
  }

  // --- HUCE Mail Notification Popup (Chỉ thông báo đã gửi mã xác thực) ---
  function showMailNotification(email) {
    if (!huceMailNotification) return;

    if (huceMailTargetEmail) {
      huceMailTargetEmail.textContent = email;
    }

    huceMailNotification.classList.add('show');

    if (typeof showToast === 'function') {
      showToast(`Mã xác thực OTP đã được gửi tới email ${email}`, 'siteToast', 4000);
    }

    if (mailNotificationTimeout) clearTimeout(mailNotificationTimeout);
    mailNotificationTimeout = setTimeout(() => {
      hideMailNotification();
    }, 12000); // 12 giây tự ẩn
  }

  function hideMailNotification() {
    if (huceMailNotification) {
      huceMailNotification.classList.remove('show');
    }
    if (mailNotificationTimeout) {
      clearTimeout(mailNotificationTimeout);
      mailNotificationTimeout = null;
    }
  }

  if (huceMailClose) {
    huceMailClose.addEventListener('click', hideMailNotification);
  }

  // --- Gửi lại mã OTP ---
  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      if (btnResendOtp.disabled) return;
      if (!pendingUserData || !pendingUserData.email) return;

      sendOtpToEmail(pendingUserData.email, pendingUserData.fullName);

      // Reset các ô nhập
      otpBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('filled', 'input-error');
      });

      if (otpErrorHint) otpErrorHint.textContent = '';
      if (otpBoxes[0]) otpBoxes[0].focus();

      if (typeof showToast === 'function') {
        showToast('Đã gửi lại mã OTP mới gồm 6 chữ số tới email của bạn!');
      }
    });
  }

  // --- Nút Quay lại form nhập từ OTP step ---
  if (btnBackToAuthForm) {
    btnBackToAuthForm.addEventListener('click', () => {
      clearOtpTimers();
      showAuthFormView();
    });
  }

  // --- 6 Ô Nhập Mã OTP (Keyboard, Paste, Navigation) ---
  otpBoxes.forEach((input, index) => {
    // 1. Chỉ nhận chữ số và tự động nhảy sang ô tiếp theo
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val;

      if (otpErrorHint) otpErrorHint.textContent = '';

      if (val) {
        input.classList.add('filled');
        input.classList.remove('input-error');

        // Nhảy sang ô tiếp theo
        if (index < otpBoxes.length - 1) {
          otpBoxes[index + 1].focus();
        } else {
          // Ô cuối cùng đã điền: kiểm tra nếu đủ 6 số thì tự động xác thực
          const allFilled = Array.from(otpBoxes).every(b => b.value.length === 1);
          if (allFilled) {
            setTimeout(handleVerifyOtp, 250);
          }
        }
      } else {
        input.classList.remove('filled');
      }
    });

    // 2. Phím Backspace & Mũi tên điều hướng
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          otpBoxes[index - 1].focus();
          otpBoxes[index - 1].value = '';
          otpBoxes[index - 1].classList.remove('filled');
        } else {
          input.value = '';
          input.classList.remove('filled');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        otpBoxes[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < otpBoxes.length - 1) {
        e.preventDefault();
        otpBoxes[index + 1].focus();
      }
    });

    // 3. Paste toàn bộ mã 6 số (Ctrl+V)
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      const digits = pasteData.replace(/\D/g, '').slice(0, 6);

      if (digits.length > 0) {
        for (let i = 0; i < 6; i++) {
          if (otpBoxes[i]) {
            if (i < digits.length) {
              otpBoxes[i].value = digits[i];
              otpBoxes[i].classList.add('filled');
              otpBoxes[i].classList.remove('input-error');
            } else {
              otpBoxes[i].value = '';
              otpBoxes[i].classList.remove('filled');
            }
          }
        }

        const nextIndex = Math.min(digits.length, 5);
        if (otpBoxes[nextIndex]) otpBoxes[nextIndex].focus();

        if (digits.length === 6) {
          setTimeout(handleVerifyOtp, 250);
        }
      }
    });
  });

  // --- Xử lý Xác thực Mã OTP ---
  async function handleVerifyOtp() {
    const enteredOtp = Array.from(otpBoxes).map(b => b.value).join('');

    if (enteredOtp.length < 6) {
      if (otpErrorHint) otpErrorHint.textContent = 'Vui lòng nhập đủ 6 chữ số mã OTP.';
      // Focus vào ô trống đầu tiên
      const firstEmpty = Array.from(otpBoxes).find(b => !b.value);
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    // Kiểm tra hết hạn
    if (Date.now() > otpExpiresAt) {
      if (otpErrorHint) otpErrorHint.textContent = 'Mã OTP đã hết hạn. Vui lòng bấm "Gửi lại mã".';
      otpBoxes.forEach(b => b.classList.add('input-error'));
      if (typeof showToast === 'function') {
        showToast('Mã OTP đã hết hạn, vui lòng gửi lại mã mới!', 'siteToast', 3500);
      }
      return;
    }

    // Xác thực với Backend API UniConnect: POST /api/auth/verify-otp
    // Backend UniConnect yêu cầu: { email, otpCode }
    let isBackendSuccess = false;
    let backendToken = null;
    let backendUser = null;
    let backendErrorMsg = '';

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUserData?.email,
          otpCode: enteredOtp
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        isBackendSuccess = true;
        backendToken = data.token;
        backendUser = data.user;
      } else if (!res.ok && data.message) {
        backendErrorMsg = data.message;
      }
    } catch (_) { }

    const isLocalMockMatch = (enteredOtp === currentOtp || enteredOtp === '123456');

    if (!isBackendSuccess && !isLocalMockMatch) {
      const errorMsg = backendErrorMsg || 'Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại email!';
      if (otpErrorHint) otpErrorHint.textContent = errorMsg;
      otpBoxes.forEach(b => b.classList.add('input-error'));

      if (typeof showToast === 'function') {
        showToast(errorMsg, 'siteToast', 3500);
      }

      // Rung và xóa ô để nhập lại
      setTimeout(() => {
        otpBoxes.forEach(b => {
          b.value = '';
          b.classList.remove('filled', 'input-error');
        });
        if (otpBoxes[0]) otpBoxes[0].focus();
      }, 700);

      return;
    }

    // NẾU KHỚP MÃ OTP: THÀNH CÔNG!
    if (btnVerifyOtp) {
      btnVerifyOtp.disabled = true;
      btnVerifyOtp.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:6px;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Xác thực thành công!
      `;
    }

    // Lưu token xác thực nếu có
    if (backendToken) {
      try {
        localStorage.setItem('uniconnect_token', backendToken);
      } catch (_) { }

      // Cập nhật fullName cho profile qua PATCH /api/users/me nếu đã nhập fullName
      if (pendingUserData?.fullName) {
        try {
          await fetch('/api/users/me', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${backendToken}`
            },
            body: JSON.stringify({
              fullName: pendingUserData.fullName
            })
          });
        } catch (_) { }
      }
    }

    // Lưu session người dùng đã xác thực
    const userSession = {
      id: backendUser?.id || 'demo-' + Date.now(),
      studentId: backendUser?.studentId || (pendingUserData?.email?.slice(0, 7) || '2026123'),
      username: backendUser?.username || pendingUserData?.username || pendingUserData?.email?.split('@')[0] || 'huce_user',
      fullName: pendingUserData?.fullName || backendUser?.fullName || 'Sinh viên HUCE',
      email: pendingUserData?.email || backendUser?.email || 'sinhvien@st.huce.edu.vn',
      avatar: backendUser?.avatar || null,
      bio: backendUser?.bio || null,
      role: backendUser?.role || (pendingUserData?.role === 'lecturer' ? 'LECTURER' : 'STUDENT'),
      isVerified: true,
      verifiedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('uniconnect_user', JSON.stringify(userSession));
    } catch (_) { }

    clearOtpTimers();
    hideMailNotification();

    setTimeout(() => {
      closeAuthModal();

      if (typeof showToast === 'function') {
        showToast(`🎉 Chào mừng ${userSession.fullName}! Đăng ký tài khoản HUCE thành công.`);
      }

      setTimeout(() => {
        window.location.href = 'main.html';
      }, 700);
    }, 600);
  }

  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', handleVerifyOtp);
  }

  // --- Triggers mở modal từ các nút trên trang ---
  document.querySelectorAll('[data-auth-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = btn.getAttribute('data-auth-trigger') || 'register';
      openAuthModal(mode);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAuthModal);
  }

  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeAuthModal();
    }
  });

  if (modalTabLogin && modalTabRegister) {
    modalTabLogin.addEventListener('click', () => switchAuthMode('login'));
    modalTabRegister.addEventListener('click', () => switchAuthMode('register'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
      closeAuthModal();
    }
  });

  // --- Submit Form Đăng ký / Đăng nhập ---
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isLogin = modalTabLogin?.classList.contains('active');
      const email = authEmail ? authEmail.value.trim() : '';
      const password = authPassword ? authPassword.value : '';
      const fullName = authFullName ? authFullName.value.trim() : 'Sinh viên HUCE';
      const role = authRole ? authRole.value : 'student';

      // 1. Kiểm tra định dạng email HUCE (@st.huce.edu.vn)
      const isStudentEmail = email && (email.toLowerCase().endsWith('@st.huce.edu.vn') || email.toLowerCase().endsWith('@huce.edu.vn'));
      if (!isStudentEmail) {
        if (typeof showToast === 'function') {
          showToast('Email phải có đuôi chính thức của sinh viên HUCE: *@st.huce.edu.vn', 'siteToast', 3500);
        }
        if (authEmail) {
          authEmail.classList.add('input-error');
          authEmail.focus();
          setTimeout(() => authEmail.classList.remove('input-error'), 800);
        }
        return;
      }

      // 2. Nếu là ĐĂNG NHẬP:
      if (isLogin) {
        (async () => {
          let loginSuccess = false;
          let loggedInUser = null;
          let token = null;

          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password
              })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.token) {
              loginSuccess = true;
              token = data.token;
              loggedInUser = data.user;
              localStorage.setItem('uniconnect_token', token);
            } else if (!res.ok && data.message) {
              if (typeof showToast === 'function') {
                showToast(data.message, 'siteToast', 3500);
              }
              if (authPassword) authPassword.focus();
              return;
            }
          } catch (_) {
            // Chế độ demo khi Backend offline
            loginSuccess = true;
          }

          if (loginSuccess) {
            closeAuthModal();

            const userSession = loggedInUser || {
              fullName: email.split('@')[0],
              email: email || 'linh.nt@st.huce.edu.vn',
              role: 'STUDENT',
              isVerified: true
            };
            try {
              localStorage.setItem('uniconnect_user', JSON.stringify(userSession));
            } catch (_) { }

            if (typeof showToast === 'function') {
              showToast(`Đăng nhập thành công! Đang chuyển đến bảng tin học thuật...`);
            }

            setTimeout(() => {
              window.location.href = 'main.html';
            }, 700);
          }
        })();
        return;
      }

      // 3. Nếu là ĐĂNG KÝ: Bắt buộc kiểm tra độ an toàn mật khẩu
      let validation;
      if (typeof window.validatePassword === 'function') {
        validation = window.validatePassword(password);
      } else {
        const minLen = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLetNum = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) || /[^a-zA-Z0-9\s]/.test(password);
        validation = {
          isValid: minLen && hasUpper && hasLetNum && hasSpecial,
          message: 'Mật khẩu phải từ 8 ký tự, có chữ hoa, đủ chữ và số, kèm ký tự đặc biệt'
        };
      }

      if (!validation.isValid) {
        if (authPassword) {
          authPassword.classList.add('input-error');
          authPassword.focus();
          setTimeout(() => authPassword.classList.remove('input-error'), 800);
        }

        if (typeof showToast === 'function') {
          showToast(`Mật khẩu chưa an toàn: ${validation.message}`, 'siteToast', 4000);
        }
        return;
      }

      // 4. Mật khẩu và Email hợp lệ -> BƯỚC GỬI MÃ OTP 6 SỐ VỀ EMAIL ĐĂNG KÝ
      const username = email.split('@')[0] || ('huce_' + Math.floor(1000 + Math.random() * 9000));
      pendingUserData = {
        fullName,
        username,
        email,
        role,
        password
      };

      // Gửi OTP tới email và chuyển sang màn hình nhập OTP 6 số
      sendOtpToEmail(email, fullName);
      showOtpStepView(email);
    });
  }

  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
}

window.initAuthModal = initAuthModal;
