/**
 * UniConnect HUCE - Auth Modal & OTP Verification Module
 * Đồng bộ xác thực trực tiếp với Backend Express API (POST /api/auth/*)
 * Xử lý Loading states, Error handling, In-form alerts & Toast notifications.
 */

(function () {
  'use strict';

  let isAuthModalInitialized = false;

  function initAuthModal() {
    if (isAuthModalInitialized) return;
    const authModal = document.getElementById('authModal');
    if (!authModal) return;
    isAuthModalInitialized = true;

    // DOM Elements - Navigation & Views
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

    // Form Inputs
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

    // In-form Error Alert Elements
    const authErrorAlert = document.getElementById('authErrorAlert');
    const authErrorText = document.getElementById('authErrorText');

    // OTP Elements
    const otpDisplayEmail = document.getElementById('otpDisplayEmail');
    const otpInputsWrapper = document.getElementById('otpInputsWrapper');
    const otpBoxes = otpInputsWrapper ? Array.from(otpInputsWrapper.querySelectorAll('.otp-box')) : [];
    const otpErrorHint = document.getElementById('otpErrorHint');
    const otpTimerCount = document.getElementById('otpTimerCount');
    const btnResendOtp = document.getElementById('btnResendOtp');
    const resendCountdown = document.getElementById('resendCountdown');
    const btnVerifyOtp = document.getElementById('btnVerifyOtp');

    // Floating Mail Notification
    const huceMailNotification = document.getElementById('huceMailNotification');
    const huceMailClose = document.getElementById('huceMailClose');
    const huceMailTargetEmail = document.getElementById('huceMailTargetEmail');

    // Module State
    let pendingUserData = null;
    let otpTimerInterval = null;
    let resendTimerInterval = null;
    let mailNotificationTimeout = null;

    // ==========================================
    // UI HELPER FUNCTIONS
    // ==========================================

    /**
     * Hiển thị thông báo lỗi rõ ràng trực tiếp trên Form và qua Toast
     */
    function showAuthError(message) {
      if (authErrorAlert) {
        if (authErrorText) {
          authErrorText.textContent = message;
        } else {
          authErrorAlert.textContent = message;
        }
        authErrorAlert.style.display = 'flex';
        authErrorAlert.style.animation = 'none';
        void authErrorAlert.offsetWidth;
        authErrorAlert.style.animation = 'shakeInput 0.35s ease-in-out';
      }

      if (window.showToast) {
        window.showToast(message, 'error');
      }
    }

    /**
     * Xóa thông báo lỗi và viền đỏ cảnh báo khi người dùng sửa dữ liệu
     */
    function clearAuthError() {
      if (authErrorAlert) {
        authErrorAlert.style.display = 'none';
      }
      if (authErrorText) {
        authErrorText.textContent = '';
      }
      if (authEmail) authEmail.classList.remove('input-error');
      if (authPassword) authPassword.classList.remove('input-error');
      if (authFullName) authFullName.classList.remove('input-error');
    }

    /**
     * Quản lý trạng thái Loading và chống spam click trên nút bấm
     */
    function setButtonLoading(button, isLoading, loadingText = '') {
      if (!button) return;
      if (isLoading) {
        if (!button.dataset.originalHtml) {
          button.dataset.originalHtml = button.innerHTML;
        }
        button.disabled = true;
        button.classList.add('is-loading');
        if (loadingText) {
          button.setAttribute('aria-label', loadingText);
        }
      } else {
        button.disabled = false;
        button.classList.remove('is-loading');
        if (button.dataset.originalHtml) {
          button.innerHTML = button.dataset.originalHtml;
          delete button.dataset.originalHtml;
        }
      }
    }

    // Lắng nghe thao tác nhập liệu để tự động xóa cảnh báo lỗi
    [authEmail, authPassword, authFullName].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          clearAuthError();
        });
      }
    });

    // ==========================================
    // MODAL & VIEW SWITCHING
    // ==========================================

    function openAuthModal(mode = 'register') {
      clearAuthError();
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Xóa sạch toàn bộ thông tin đã nhập trước đó
      if (authFullName) authFullName.value = '';
      if (authEmail) authEmail.value = '';
      if (authPassword) {
        authPassword.value = '';
        authPassword.type = 'password';
      }
      if (togglePasswordBtn) {
        togglePasswordBtn.classList.remove('is-active');
        togglePasswordBtn.setAttribute('title', 'Hiện mật khẩu');
        togglePasswordBtn.setAttribute('aria-label', 'Hiện mật khẩu');
      }
      if (eyeIcon) {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
      updatePasswordStrengthUI('');

      showAuthFormView();
      switchAuthMode(mode);
    }

    function closeAuthModal() {
      authModal.classList.remove('active');
      document.body.style.overflow = '';
      clearAuthError();
      clearOtpTimers();
      hideMailNotification();
    }

    function switchAuthMode(mode) {
      clearAuthError();
      showAuthFormView();

      // Đặt lại password về ẩn khi đổi tab
      if (authPassword) {
        authPassword.type = 'password';
      }
      if (togglePasswordBtn) {
        togglePasswordBtn.classList.remove('is-active');
        togglePasswordBtn.setAttribute('title', 'Hiện mật khẩu');
      }
      if (eyeIcon) {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }

      if (mode === 'login') {
        if (modalTabLogin) modalTabLogin.classList.add('active');
        if (modalTabRegister) modalTabRegister.classList.remove('active');
        if (modalTitle) modalTitle.textContent = 'Đăng nhập UniConnect HUCE';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Đăng nhập';
        registerFields.forEach(el => (el.style.display = 'none'));
      } else {
        if (modalTabRegister) modalTabRegister.classList.add('active');
        if (modalTabLogin) modalTabLogin.classList.remove('active');
        if (modalTitle) modalTitle.textContent = 'Đăng ký tài khoản HUCE';
        if (authSubmitBtn) authSubmitBtn.textContent = 'Tạo tài khoản ngay';
        registerFields.forEach(el => (el.style.display = 'block'));
        if (authPassword) updatePasswordStrengthUI(authPassword.value);
      }
    }

    function showAuthFormView() {
      if (authFormView) authFormView.style.display = 'block';
      if (otpStepView) otpStepView.style.display = 'none';
      if (authModalTabs) authModalTabs.style.display = 'flex';
      clearAuthError();
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

      otpBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('filled', 'input-error');
      });

      if (btnVerifyOtp) {
        btnVerifyOtp.disabled = false;
        btnVerifyOtp.classList.remove('is-loading');
        btnVerifyOtp.textContent = 'Xác nhận & Hoàn tất đăng ký';
      }

      setTimeout(() => {
        if (otpBoxes[0]) {
          otpBoxes[0].focus();
          otpBoxes[0].select();
        }
      }, 150);
    }

    // ==========================================
    // PASSWORD STRENGTH & VISIBILITY
    // ==========================================

    function updatePasswordStrengthUI(val) {
      if (!strengthBar || !strengthStatusText) return;

      const minLength = val.length >= 8;
      const hasUppercase = /[A-Z]/.test(val);
      const hasLetterAndNumber = /[a-zA-Z]/.test(val) && /[0-9]/.test(val);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val) || /[^a-zA-Z0-9\s]/.test(val);

      let score = 0;
      if (minLength) score++;
      if (hasUppercase) score++;
      if (hasLetterAndNumber) score++;
      if (hasSpecialChar) score++;

      const percent = val.length === 0 ? 0 : (score === 1 ? 25 : score === 2 ? 50 : score === 3 ? 75 : 100);
      const label = val.length === 0 ? 'Chưa nhập' : (score <= 1 ? 'Yếu' : score === 2 ? 'Trung bình' : score === 3 ? 'Khá' : 'Rất an toàn');
      const color = val.length === 0 ? '#94A3B8' : (score <= 1 ? '#EF4444' : score === 2 ? '#F59E0B' : score === 3 ? '#0284C7' : '#10B981');

      strengthBar.style.width = `${percent}%`;
      strengthBar.style.backgroundColor = color;
      strengthStatusText.textContent = label;
      strengthStatusText.style.color = color;

      if (critMinLength) critMinLength.classList.toggle('valid', minLength);
      if (critUppercase) critUppercase.classList.toggle('valid', hasUppercase);
      if (critLetterNumber) critLetterNumber.classList.toggle('valid', hasLetterAndNumber);
      if (critSpecialChar) critSpecialChar.classList.toggle('valid', hasSpecialChar);
    }

    if (authPassword) {
      authPassword.addEventListener('input', (e) => {
        authPassword.classList.remove('input-error');
        const isRegister = modalTabRegister?.classList.contains('active');
        if (isRegister) updatePasswordStrengthUI(e.target.value);
      });
    }

    if (togglePasswordBtn && authPassword) {
      togglePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyPassword = authPassword.type === 'password';
        authPassword.type = isCurrentlyPassword ? 'text' : 'password';

        if (eyeIcon) {
          if (isCurrentlyPassword) {
            // Mật khẩu đang HIỆN -> Hiển thị icon mắt gạch chéo để bấm ẩn đi
            eyeIcon.innerHTML = `
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
            togglePasswordBtn.classList.add('is-active');
            togglePasswordBtn.setAttribute('title', 'Ẩn mật khẩu');
            togglePasswordBtn.setAttribute('aria-label', 'Ẩn mật khẩu');
          } else {
            // Mật khẩu đang ẨN -> Hiển thị icon mắt thường để bấm hiện lên
            eyeIcon.innerHTML = `
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            `;
            togglePasswordBtn.classList.remove('is-active');
            togglePasswordBtn.setAttribute('title', 'Hiện mật khẩu');
            togglePasswordBtn.setAttribute('aria-label', 'Hiện mật khẩu');
          }
        }

        authPassword.focus();
      });
    }

    // ==========================================
    // FLOATING EMAIL HUCE NOTIFICATION
    // ==========================================

    function showMailNotification(email) {
      if (!huceMailNotification) return;
      if (huceMailTargetEmail) huceMailTargetEmail.textContent = email;

      huceMailNotification.classList.add('show');
      if (mailNotificationTimeout) clearTimeout(mailNotificationTimeout);
      mailNotificationTimeout = setTimeout(hideMailNotification, 12000);
    }

    function hideMailNotification() {
      if (huceMailNotification) huceMailNotification.classList.remove('show');
      if (mailNotificationTimeout) {
        clearTimeout(mailNotificationTimeout);
        mailNotificationTimeout = null;
      }
    }

    if (huceMailClose) huceMailClose.addEventListener('click', hideMailNotification);

    // ==========================================
    // OTP TIMERS & COUNTDOWN
    // ==========================================

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
            otpErrorHint.style.color = '#EF4444';
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

    // Gửi lại mã OTP qua backend API
    if (btnResendOtp) {
      btnResendOtp.addEventListener('click', async () => {
        if (btnResendOtp.disabled || !pendingUserData?.email) return;

        setButtonLoading(btnResendOtp, true, 'Đang gửi lại...');
        if (otpErrorHint) otpErrorHint.textContent = '';

        try {
          const username = pendingUserData.email.split('@')[0];
          const data = await window.API.auth.register({
            username,
            email: pendingUserData.email,
            password: pendingUserData.password || 'Huce@2026',
            fullName: pendingUserData.fullName || username
          });

          otpBoxes.forEach(box => {
            box.value = '';
            box.classList.remove('filled', 'input-error');
          });

          if (otpBoxes[0]) {
            otpBoxes[0].focus();
            otpBoxes[0].select();
          }
          showMailNotification(pendingUserData.email);
          startOtpCountdown(120);
          startResendCountdown(60);

          if (window.showToast) {
            window.showToast('Đã gửi lại mã OTP vào email của bạn. Vui lòng kiểm tra hộp thư!', 'info');
          }
        } catch (resendErr) {
          console.error('[UniConnect Auth] Resend OTP error:', resendErr);
          const msg = resendErr.message || 'Không thể gửi lại mã OTP lúc này. Vui lòng thử lại sau.';
          if (otpErrorHint) {
            otpErrorHint.textContent = msg;
            otpErrorHint.style.color = '#EF4444';
          }
          if (window.showToast) {
            window.showToast(msg, 'error');
          }
        } finally {
          setButtonLoading(btnResendOtp, false);
        }
      });
    }

    if (btnBackToAuthForm) {
      btnBackToAuthForm.addEventListener('click', () => {
        clearOtpTimers();
        showAuthFormView();
      });
    }

    // ==========================================
    // OTP INPUT BOXES EVENT HANDLING
    // ==========================================

    otpBoxes.forEach((input, index) => {
      // Khi ô nhận focus, bôi đen ký tự để gõ đè ngay
      input.addEventListener('focus', () => {
        input.select();
      });

      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        // Lấy ký tự số cuối cùng được gõ
        const digit = val ? val[val.length - 1] : '';
        e.target.value = digit;
        if (otpErrorHint) otpErrorHint.textContent = '';

        if (digit) {
          input.classList.add('filled');
          input.classList.remove('input-error');
          // Tự động chuyển tiêu điểm sang ô tiếp theo
          if (index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
            otpBoxes[index + 1].select();
          } else {
            const allFilled = otpBoxes.every(b => b.value.length === 1);
            if (allFilled) setTimeout(handleVerifyOtp, 200);
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
          otpBoxes[index - 1].select();
        } else if (e.key === 'ArrowRight' && index < otpBoxes.length - 1) {
          e.preventDefault();
          otpBoxes[index + 1].focus();
          otpBoxes[index + 1].select();
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
          if (otpBoxes[nextIndex]) {
            otpBoxes[nextIndex].focus();
            otpBoxes[nextIndex].select();
          }
          if (digits.length === 6) setTimeout(handleVerifyOtp, 200);
        }
      });
    });

    // ==========================================
    // XỬ LÝ XÁC THỰC MÃ OTP (POST /api/auth/verify-otp)
    // ==========================================

    async function handleVerifyOtp() {
      const enteredOtp = otpBoxes.map(b => b.value).join('');

      if (enteredOtp.length < 6) {
        if (otpErrorHint) {
          otpErrorHint.textContent = 'Vui lòng nhập đủ 6 chữ số mã OTP.';
          otpErrorHint.style.color = '#EF4444';
        }
        const firstEmpty = otpBoxes.find(b => !b.value);
        if (firstEmpty) firstEmpty.focus();
        return;
      }

      setButtonLoading(btnVerifyOtp, true, 'Đang xác thực OTP...');
      if (otpErrorHint) otpErrorHint.textContent = '';

      try {
        if (!window.API || !window.API.auth) {
          throw new Error('Dịch vụ API chưa được khởi tạo. Vui lòng tải lại trang.');
        }

        const data = await window.API.auth.verifyOtp({
          email: pendingUserData?.email,
          otpCode: enteredOtp
        });

        // Xác thực thành công từ backend
        if (data && data.token) {
          // Lưu token & user vào localStorage
          window.setAuthToken(data.token);
          const userObj = {
            ...(data.user || {}),
            fullName: (data.user && data.user.fullName) || pendingUserData?.fullName || data.user?.username || 'Sinh viên HUCE',
            role: (data.user && data.user.role) || (pendingUserData && pendingUserData.role === 'lecturer' ? 'LECTURER' : 'STUDENT')
          };
          window.setCurrentUser(userObj);

          btnVerifyOtp.classList.remove('is-loading');
          btnVerifyOtp.disabled = true;
          btnVerifyOtp.innerHTML = '✓ Xác thực thành công!';

          clearOtpTimers();
          hideMailNotification();

          const userName = data.user?.fullName || pendingUserData?.fullName || 'Sinh viên HUCE';
          if (window.showToast) {
            window.showToast(`🎉 Chúc mừng ${userName}! Đăng ký tài khoản UniConnect HUCE thành công.`, 'success');
          }

          // Chuyển hướng sang Trang chủ
          setTimeout(() => {
            closeAuthModal();
            window.location.href = 'main.html';
          }, 700);
          return;
        } else {
          throw new Error('Phản hồi từ máy chủ không hợp lệ.');
        }
      } catch (err) {
        console.error('[UniConnect Auth] Verify OTP Error:', err);
        setButtonLoading(btnVerifyOtp, false);

        let errorMsg = 'Mã xác thực OTP không chính xác hoặc đã hết hạn.';
        if (err.status === 400) {
          errorMsg = err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.';
        } else if (err.status === 404) {
          errorMsg = 'Không tìm thấy tài khoản sinh viên tương ứng.';
        } else if (err.status === 500) {
          errorMsg = 'Lỗi hệ thống máy chủ khi xác thực OTP (500). Vui lòng thử lại sau.';
        } else if (!err.status || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          errorMsg = 'Mất kết nối tới máy chủ. Vui lòng kiểm tra lại đường truyền mạng.';
        } else if (err.message) {
          errorMsg = err.message;
        }

        // GIỮ NGƯỜI DÙNG Ở LẠI VIEW OTP - KHÔNG ĐƯỢC CHUYỂN TRANG
        if (otpErrorHint) {
          otpErrorHint.textContent = errorMsg;
          otpErrorHint.style.color = '#EF4444';
        }
        otpBoxes.forEach(b => b.classList.add('input-error'));
        if (window.showToast) {
          window.showToast(errorMsg, 'error');
        }

        setTimeout(() => {
          otpBoxes.forEach(b => {
            b.value = '';
            b.classList.remove('filled', 'input-error');
          });
          if (otpBoxes[0]) {
            otpBoxes[0].focus();
            otpBoxes[0].select();
          }
        }, 800);
      }
    }

    if (btnVerifyOtp) {
      btnVerifyOtp.addEventListener('click', handleVerifyOtp);
    }

    // ==========================================
    // XỬ LÝ SUBMIT FORM (ĐĂNG NHẬP / ĐĂNG KÝ)
    // ==========================================

    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAuthError();

        const isLogin = modalTabLogin?.classList.contains('active');
        const email = authEmail ? authEmail.value.trim() : '';
        const password = authPassword ? authPassword.value : '';
        const fullName = authFullName ? authFullName.value.trim() : '';
        const role = authRole ? authRole.value : 'student';

        // 1. Kiểm tra trường bắt buộc
        if (!email) {
          showAuthError('Vui lòng nhập địa chỉ email của bạn.');
          if (authEmail) {
            authEmail.classList.add('input-error');
            authEmail.focus();
          }
          return;
        }

        if (!password) {
          showAuthError('Vui lòng nhập mật khẩu.');
          if (authPassword) {
            authPassword.classList.add('input-error');
            authPassword.focus();
          }
          return;
        }

        // 2. Kiểm tra định dạng email HUCE
        const isSchoolEmail = email.toLowerCase().endsWith('@st.huce.edu.vn') || email.toLowerCase().endsWith('@huce.edu.vn');
        if (!isSchoolEmail) {
          showAuthError('Email phải có đuôi trường HUCE: *@st.huce.edu.vn hoặc *@huce.edu.vn');
          if (authEmail) {
            authEmail.classList.add('input-error');
            authEmail.focus();
          }
          return;
        }

        // ------------------------------------------
        // A. XỬ LÝ ĐĂNG NHẬP (POST /api/auth/login)
        // ------------------------------------------
        if (isLogin) {
          setButtonLoading(authSubmitBtn, true, 'Đang đăng nhập...');

          try {
            if (!window.API || !window.API.auth) {
              throw new Error('Dịch vụ API chưa được khởi tạo. Vui lòng tải lại trang.');
            }

            const response = await window.API.auth.login({ email, password });

            // Đăng nhập thành công (Status 200)
            if (response && response.token) {
              window.setAuthToken(response.token);
              if (response.user) {
                const userObj = {
                  ...response.user,
                  fullName: response.user.fullName || response.user.username || 'Sinh viên HUCE'
                };
                window.setCurrentUser(userObj);
              }

              authSubmitBtn.classList.remove('is-loading');
              authSubmitBtn.innerHTML = '✓ Đăng nhập thành công!';
              authSubmitBtn.disabled = true;

              if (window.showToast) {
                window.showToast(`🎉 Đăng nhập thành công! Chào mừng ${response.user?.fullName || 'bạn'}.`, 'success');
              }

              // Chuyển hướng sang Trang chủ
              setTimeout(() => {
                closeAuthModal();
                window.location.href = 'main.html';
              }, 600);
              return;
            } else {
              throw new Error('Dữ liệu đăng nhập từ máy chủ không hợp lệ.');
            }
          } catch (loginErr) {
            console.error('[UniConnect Auth] Login Error:', loginErr);
            setButtonLoading(authSubmitBtn, false);

            let errorMsg = 'Đăng nhập không thành công. Vui lòng thử lại.';
            if (loginErr.status === 400) {
              errorMsg = loginErr.message || 'Vui lòng kiểm tra lại email và mật khẩu.';
            } else if (loginErr.status === 401) {
              errorMsg = 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!';
              if (authPassword) authPassword.classList.add('input-error');
            } else if (loginErr.status === 403) {
              errorMsg = 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước khi đăng nhập.';
            } else if (loginErr.status === 404) {
              errorMsg = 'Tài khoản không tồn tại trên hệ thống UniConnect.';
              if (authEmail) authEmail.classList.add('input-error');
            } else if (loginErr.status === 500) {
              errorMsg = 'Lỗi hệ thống máy chủ (500). Vui lòng thử lại sau giây lát.';
            } else if (loginErr.status === 408) {
              errorMsg = 'Hết thời gian chờ phản hồi máy chủ (Timeout). Vui lòng kiểm tra kết nối mạng.';
            } else if (!loginErr.status || loginErr.message?.includes('Failed to fetch') || loginErr.message?.includes('NetworkError')) {
              errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo máy chủ backend đang hoạt động.';
            } else if (loginErr.message) {
              errorMsg = loginErr.message;
            }

            // TUYỆT ĐỐI KHÔNG CHUYỂN TRANG KHI ĐĂNG NHẬP THẤT BẠI
            showAuthError(errorMsg);
            return;
          }
        }

        // ------------------------------------------
        // B. XỬ LÝ ĐĂNG KÝ (POST /api/auth/register)
        // ------------------------------------------
        if (!fullName) {
          showAuthError('Vui lòng nhập họ và tên của bạn.');
          if (authFullName) {
            authFullName.classList.add('input-error');
            authFullName.focus();
          }
          return;
        }

        // Kiểm tra độ an toàn mật khẩu
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLetNum = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password) || /[^a-zA-Z0-9\s]/.test(password);

        if (!(minLength && hasUpper && hasLetNum && hasSpecial)) {
          showAuthError('Mật khẩu phải từ 8 ký tự, gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$...).');
          if (authPassword) {
            authPassword.classList.add('input-error');
            authPassword.focus();
          }
          return;
        }

        setButtonLoading(authSubmitBtn, true, 'Đang gửi thông tin đăng ký...');

        try {
          if (!window.API || !window.API.auth) {
            throw new Error('Dịch vụ API chưa được khởi tạo. Vui lòng tải lại trang.');
          }

          const username = email.split('@')[0];
          const response = await window.API.auth.register({
            username,
            email,
            password,
            fullName
          });

          setButtonLoading(authSubmitBtn, false);

          // Đăng ký bước đầu thành công (201 / 200) -> Chuyển sang bước OTP
          pendingUserData = { fullName, email, role, password };

          showMailNotification(email);
          startOtpCountdown(120);
          startResendCountdown(60);

          if (window.showToast) {
            window.showToast('Đã gửi mã xác thực OTP vào email của bạn. Vui lòng kiểm tra hòm thư!', 'success');
          }

          // Chuyển sang giao diện nhập mã OTP
          showOtpStepView(email);
        } catch (regErr) {
          console.error('[UniConnect Auth] Register Error:', regErr);
          setButtonLoading(authSubmitBtn, false);

          let errorMsg = 'Đăng ký tài khoản không thành công. Vui lòng thử lại.';
          if (regErr.status === 409) {
            errorMsg = 'Email hoặc tài khoản này đã được đăng ký và xác thực. Vui lòng đăng nhập hoặc dùng email khác.';
            if (authEmail) authEmail.classList.add('input-error');
          } else if (regErr.status === 400) {
            errorMsg = regErr.message || 'Thông tin đăng ký không hợp lệ.';
          } else if (regErr.status === 500) {
            errorMsg = 'Lỗi hệ thống máy chủ khi đăng ký (500). Vui lòng thử lại sau.';
          } else if (!regErr.status || regErr.message?.includes('Failed to fetch') || regErr.message?.includes('NetworkError')) {
            errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.';
          } else if (regErr.message) {
            errorMsg = regErr.message;
          }

          // GIỮ NGƯỜI DÙNG Ở LẠI FORM ĐĂNG KÝ - KHÔNG CHUYỂN BƯỚC
          showAuthError(errorMsg);
          return;
        }
      });
    }

    // ==========================================
    // MODAL TRIGGER BUTTONS & SHORTCUTS
    // ==========================================

    document.querySelectorAll('[data-auth-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mode = btn.getAttribute('data-auth-trigger');
        openAuthModal(mode);
      });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeAuthModal);

    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
      });
    }

    if (modalTabLogin && modalTabRegister) {
      modalTabLogin.addEventListener('click', () => switchAuthMode('login'));
      modalTabRegister.addEventListener('click', () => switchAuthMode('register'));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && authModal && authModal.classList.contains('active')) {
        closeAuthModal();
      }
    });

    // Expose helpers globally
    window.openAuthModal = openAuthModal;
    window.closeAuthModal = closeAuthModal;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthModal);
  } else {
    initAuthModal();
  }

  window.initAuthModal = initAuthModal;
})();
