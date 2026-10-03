/**
 * UniConnect HUCE - Common Helper Functions
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTimeAgo(dateInput) {
    if (!dateInput) return 'Vừa xong';
    const now = new Date();
    const date = new Date(dateInput);
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 45) return 'Vừa xong';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      return false;
    }
  }

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('uniconnect_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.fullName || u.username)) {
          const name = u.fullName || u.username;
          const names = name.trim().split(/\s+/);
          const initials = names.length >= 2
            ? (names[names.length - 2][0] + names[names.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();

          const isLecturer = u.role === 'LECTURER' || u.role === 'lecturer';
          const isAdmin = u.role === 'ADMIN' || u.role === 'admin';

          let roleDisplay = 'Sinh viên K21 • HUCE';
          let colorClass = 'author-blue';

          if (isAdmin) {
            roleDisplay = 'Quản trị viên hệ thống HUCE';
            colorClass = 'author-purple';
          } else if (isLecturer) {
            roleDisplay = 'Giảng viên HUCE';
            colorClass = 'author-purple';
          } else if (u.role && typeof u.role === 'string' && (u.role.includes('•') || u.role.includes('HUCE'))) {
            roleDisplay = u.role;
          }

          return {
            id: u.id || 'current-user-id',
            fullName: name,
            username: u.username || '',
            email: u.email || 'sinhvien@st.huce.edu.vn',
            role: roleDisplay,
            rawRole: u.role || 'STUDENT',
            avatar: u.avatar || initials,
            colorClass: colorClass,
            isLoggedIn: true
          };
        }
      }
    } catch (_) {}

    return {
      id: 'default-user',
      fullName: 'Linh Nguyễn',
      username: 'linh.nt',
      email: 'linh.nt@st.huce.edu.vn',
      role: 'Sinh viên K21 • Khoa Xây dựng HUCE',
      rawRole: 'STUDENT',
      avatar: 'LN',
      colorClass: 'author-blue',
      isLoggedIn: false
    };
  }

  function syncAllUserUI() {
    const user = getCurrentUser();
    if (!user) return;

    // 1. Desktop Topbar Profile (#desktopUserProfileBtn)
    const topAvatar = document.querySelector('#desktopUserProfileBtn .user-avatar') || document.querySelector('.user-profile-btn .user-avatar');
    const topName = document.querySelector('#desktopUserProfileBtn .user-name') || document.querySelector('.user-profile-btn .user-name');
    const topRole = document.querySelector('#desktopUserProfileBtn .user-role') || document.querySelector('.user-profile-btn .user-role');

    if (topAvatar) topAvatar.textContent = user.avatar;
    if (topName) topName.textContent = user.fullName;
    if (topRole) topRole.textContent = user.role;

    // 2. Mobile Header Avatar (#mobileHeaderMenuBtn)
    const mobileHeaderAvatar = document.querySelector('#mobileHeaderMenuBtn .user-avatar-sm') || document.querySelector('.mobile-avatar-btn .user-avatar-sm');
    if (mobileHeaderAvatar) mobileHeaderAvatar.textContent = user.avatar;

    // 3. Post Composer (Collapsed & Expanded)
    const collapsedUserAvatar = document.getElementById('collapsedUserAvatar');
    if (collapsedUserAvatar) collapsedUserAvatar.textContent = user.avatar;

    const composerAvatar = document.getElementById('composerAvatar');
    if (composerAvatar) composerAvatar.textContent = user.avatar;

    const composerAuthorName = document.getElementById('composerAuthorName');
    if (composerAuthorName) composerAuthorName.textContent = user.fullName;

    const composerAuthorSub = document.getElementById('composerAuthorSub');
    if (composerAuthorSub) composerAuthorSub.textContent = user.role;

    // 4. Mobile Drawer Profile
    const drawerAvatar = document.querySelector('.mobile-drawer-user .user-avatar-lg');
    if (drawerAvatar) drawerAvatar.textContent = user.avatar;

    const drawerName = document.querySelector('.mobile-drawer-user .drawer-user-name');
    if (drawerName) drawerName.textContent = user.fullName;

    const drawerRole = document.querySelector('.mobile-drawer-user .drawer-user-role');
    if (drawerRole) drawerRole.textContent = user.role;

    // 5. Comment Inputs Current User Avatars
    document.querySelectorAll('.comment-input-form .comment-author-avatar').forEach(avatarEl => {
      avatarEl.textContent = user.avatar;
    });
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem('uniconnect_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('uniconnect_user');
      }
      syncAllUserUI();
    } catch (_) {}
  }

  function getAuthToken() {
    return localStorage.getItem('uniconnect_token') || '';
  }

  function setAuthToken(token) {
    if (token) {
      localStorage.setItem('uniconnect_token', token);
    } else {
      localStorage.removeItem('uniconnect_token');
    }
  }

  function clearAuth() {
    localStorage.removeItem('uniconnect_token');
    localStorage.removeItem('uniconnect_user');
    syncAllUserUI();
  }

  // Web Audio chime for real-time notification
  let audioCtx = null;
  function playNotificationSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio playback might be blocked until user gesture, ignore silently
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAllUserUI);
  } else {
    syncAllUserUI();
  }

  window.escapeHtml = escapeHtml;
  window.formatTimeAgo = formatTimeAgo;
  window.copyToClipboard = copyToClipboard;
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.syncAllUserUI = syncAllUserUI;
  window.getAuthToken = getAuthToken;
  window.setAuthToken = setAuthToken;
  window.clearAuth = clearAuth;
  window.playNotificationSound = playNotificationSound;
})();
