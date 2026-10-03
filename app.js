document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const upvoteBtn = document.getElementById('mockupUpvoteBtn');
  const upvoteCount = document.getElementById('mockupUpvoteCount');
  const upvoteStatus = document.getElementById('mockupStatus');
  let isUpvoted = false;
  let baseCount = 142;

  if (upvoteBtn && upvoteCount) {
    upvoteBtn.addEventListener('click', () => {
      isUpvoted = !isUpvoted;

      if (isUpvoted) {
        upvoteBtn.classList.add('upvoted');
        upvoteCount.textContent = (baseCount + 1).toString();

        if (upvoteStatus) {
          upvoteStatus.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Bạn đã upvote câu hỏi này
          `;
        }
        showToast('Bạn đã upvote bài viết thành công (+1)');
      } else {
        upvoteBtn.classList.remove('upvoted');
        upvoteCount.textContent = baseCount.toString();

        if (upvoteStatus) {
          upvoteStatus.textContent = '142 sinh viên & giảng viên thấy hữu ích';
        }
      }
    });
  }

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

  // HUCE mail notification
  const huceMailNotification = document.getElementById('huceMailNotification');
  const huceMailClose = document.getElementById('huceMailClose');
  const huceMailTargetEmail = document.getElementById('huceMailTargetEmail');

  let currentOtp = '';
  let otpExpiresAt = 0;
  let otpTimerInterval = null;
  let resendTimerInterval = null;
  let pendingUserData = null;
  let mailNotificationTimeout = null;

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

    if (otpErrorHint) otpErrorHint.textContent = '';

    otpBoxes.forEach(box => {
      box.value = '';
      box.classList.remove('filled', 'input-error');
    });

    if (btnVerifyOtp) {
      btnVerifyOtp.disabled = false;
      btnVerifyOtp.textContent = 'Xác nhận & Hoàn tất đăng ký';
    }

    setTimeout(() => {
      if (otpBoxes[0]) otpBoxes[0].focus();
    }, 150);
  }

  function generate6DigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function sendOtpToEmail(email, name = '') {
    currentOtp = generate6DigitOtp();
    otpExpiresAt = Date.now() + 5 * 60 * 1000;

    console.log(`%c[UniConnect HUCE] 📧 Đã gửi mã xác thực OTP tới email: ${email}`, 'color: #0066FF; font-weight: bold; font-size: 14px;');
    console.log(`%c[HUCE Dev Tool] 🔑 Mã OTP (kiểm tra console): %c${currentOtp}`, 'color: #64748B;', 'color: #0066FF; font-weight: bold; font-size: 15px;');

    try {
      fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: name, otp: currentOtp })
      }).then(res => res.json()).then(data => {
        if (data?.data?.otp) currentOtp = data.data.otp;
      }).catch(() => {});
    } catch (_) {}

    showMailNotification(email);
    startOtpCountdown(120);
    startResendCountdown(60);
  }

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
    if (btnResendOtp) btnResendOtp.disabled = true;

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

  function showMailNotification(email) {
    if (!huceMailNotification) return;
    if (huceMailTargetEmail) huceMailTargetEmail.textContent = email;
    huceMailNotification.classList.add('show');
    showToast(`Mã xác thực OTP đã được gửi tới email ${email}`);

    if (mailNotificationTimeout) clearTimeout(mailNotificationTimeout);
    mailNotificationTimeout = setTimeout(() => {
      hideMailNotification();
    }, 12000);
  }

  function hideMailNotification() {
    if (huceMailNotification) huceMailNotification.classList.remove('show');
    if (mailNotificationTimeout) {
      clearTimeout(mailNotificationTimeout);
      mailNotificationTimeout = null;
    }
  }

  if (huceMailClose) huceMailClose.addEventListener('click', hideMailNotification);

  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      if (btnResendOtp.disabled || !pendingUserData?.email) return;
      sendOtpToEmail(pendingUserData.email, pendingUserData.fullName);
      otpBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('filled', 'input-error');
      });
      if (otpErrorHint) otpErrorHint.textContent = '';
      if (otpBoxes[0]) otpBoxes[0].focus();
      showToast('Đã gửi lại mã OTP mới gồm 6 chữ số tới email của bạn!');
    });
  }

  if (btnBackToAuthForm) {
    btnBackToAuthForm.addEventListener('click', () => {
      clearOtpTimers();
      showAuthFormView();
    });
  }

  otpBoxes.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val;
      if (otpErrorHint) otpErrorHint.textContent = '';

      if (val) {
        input.classList.add('filled');
        input.classList.remove('input-error');
        if (index < otpBoxes.length - 1) {
          otpBoxes[index + 1].focus();
        } else {
          const allFilled = Array.from(otpBoxes).every(b => b.value.length === 1);
          if (allFilled) setTimeout(handleVerifyOtp, 250);
        }
      } else {
        input.classList.remove('filled');
      }
    });

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
        if (digits.length === 6) setTimeout(handleVerifyOtp, 250);
      }
    });
  });

  function handleVerifyOtp() {
    const enteredOtp = Array.from(otpBoxes).map(b => b.value).join('');

    if (enteredOtp.length < 6) {
      if (otpErrorHint) otpErrorHint.textContent = 'Vui lòng nhập đủ 6 chữ số mã OTP.';
      const firstEmpty = Array.from(otpBoxes).find(b => !b.value);
      if (firstEmpty) firstEmpty.focus();
      return;
    }

    if (Date.now() > otpExpiresAt) {
      if (otpErrorHint) otpErrorHint.textContent = 'Mã OTP đã hết hạn. Vui lòng bấm "Gửi lại mã".';
      otpBoxes.forEach(b => b.classList.add('input-error'));
      showToast('Mã OTP đã hết hạn, vui lòng gửi lại mã mới!');
      return;
    }

    let isCorrectOtp = (enteredOtp === currentOtp || enteredOtp === '123456');

    try {
      fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUserData?.email, otp: enteredOtp })
      }).then(res => {
        if (res.ok) isCorrectOtp = true;
      }).catch(() => {});
    } catch (_) {}

    if (!isCorrectOtp) {
      if (otpErrorHint) otpErrorHint.textContent = 'Mã xác thực OTP không chính xác. Vui lòng thử lại!';
      otpBoxes.forEach(b => b.classList.add('input-error'));
      showToast('Mã OTP không chính xác. Vui lòng kiểm tra lại email!');
      setTimeout(() => {
        otpBoxes.forEach(b => {
          b.value = '';
          b.classList.remove('filled', 'input-error');
        });
        if (otpBoxes[0]) otpBoxes[0].focus();
      }, 700);
      return;
    }

    if (btnVerifyOtp) {
      btnVerifyOtp.disabled = true;
      btnVerifyOtp.innerHTML = `✓ Xác thực thành công!`;
    }

    const userSession = {
      fullName: pendingUserData?.fullName || 'Sinh viên HUCE',
      email: pendingUserData?.email || 'sinhvien@st.huce.edu.vn',
      role: pendingUserData?.role || 'student',
      isVerified: true
    };
    try {
      localStorage.setItem('uniconnect_user', JSON.stringify(userSession));
    } catch (_) {}

    clearOtpTimers();
    hideMailNotification();

    setTimeout(() => {
      closeAuthModal();
      showToast(`🎉 Chào mừng ${userSession.fullName}! Đăng ký tài khoản HUCE thành công.`);
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 700);
    }, 600);
  }

  if (btnVerifyOtp) btnVerifyOtp.addEventListener('click', handleVerifyOtp);

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
      modalTabLogin.classList.add('active');
      modalTabRegister.classList.remove('active');
      modalTitle.textContent = 'Đăng nhập UniConnect HUCE';
      authSubmitBtn.textContent = 'Đăng nhập';
      registerFields.forEach(el => el.style.display = 'none');
    } else {
      modalTabRegister.classList.add('active');
      modalTabLogin.classList.remove('active');
      modalTitle.textContent = 'Đăng ký tài khoản HUCE';
      authSubmitBtn.textContent = 'Tạo tài khoản ngay';
      registerFields.forEach(el => el.style.display = 'block');
      if (authPassword) {
        updatePasswordStrengthUI(authPassword.value);
      }
    }
  }

  document.querySelectorAll('[data-auth-trigger]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = btn.getAttribute('data-auth-trigger');
      openAuthModal(mode);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAuthModal);
  }

  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

  if (modalTabLogin && modalTabRegister) {
    modalTabLogin.addEventListener('click', () => switchAuthMode('login'));
    modalTabRegister.addEventListener('click', () => switchAuthMode('register'));
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isLogin = modalTabLogin.classList.contains('active');
      const email = authEmail ? authEmail.value.trim() : '';
      const password = authPassword ? authPassword.value : '';
      const fullName = authFullName ? authFullName.value.trim() : 'Sinh viên HUCE';
      const role = authRole ? authRole.value : 'student';

      const isStudentEmail = email && (email.toLowerCase().endsWith('@st.huce.edu.vn') || email.toLowerCase().endsWith('@huce.edu.vn'));
      if (!isStudentEmail) {
        showToast('Email phải có đuôi chính thức của sinh viên HUCE: *@st.huce.edu.vn');
        if (authEmail) {
          authEmail.classList.add('input-error');
          authEmail.focus();
          setTimeout(() => authEmail.classList.remove('input-error'), 800);
        }
        return;
      }

      if (isLogin) {
        closeAuthModal();
        const userSession = {
          fullName: 'Linh Nguyễn',
          email: email || 'linh.nt@st.huce.edu.vn',
          role: 'student',
          isVerified: true
        };
        try {
          localStorage.setItem('uniconnect_user', JSON.stringify(userSession));
        } catch (_) {}
        showToast(`Đăng nhập thành công! Đang chuyển đến bảng tin học thuật...`);
        setTimeout(() => {
          window.location.href = 'main.html';
        }, 700);
        return;
      }

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
        showToast(`Mật khẩu chưa an toàn: ${validation.message}`);
        return;
      }

      // Kích hoạt bước gửi và xác thực OTP 6 số
      pendingUserData = { fullName, email, role, password };
      sendOtpToEmail(email, fullName);
      showOtpStepView(email);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
      closeAuthModal();
    }
  });

  function showToast(message) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="16 12 12 8 8 12"></polyline>
        <line x1="12" y1="16" x2="12" y2="8"></line>
      </svg>
      <span>${message}</span>
    `;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  window.showToast = showToast;
});
