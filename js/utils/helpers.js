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

          let roleDisplay = 'Sinh viên K21 • Khoa Xây dựng HUCE';
          let colorClass = 'author-blue';

          if (isAdmin) {
            roleDisplay = 'Quản trị viên hệ thống HUCE';
            colorClass = 'author-purple';
          } else if (isLecturer) {
            roleDisplay = 'Giảng viên HUCE';
            colorClass = 'author-purple';
          }

          return {
            id: u.id || 'current-user-id',
            fullName: name,
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
      email: 'linh.nt@st.huce.edu.vn',
      role: 'Sinh viên K21 • Khoa Xây dựng HUCE',
      rawRole: 'STUDENT',
      avatar: 'LN',
      colorClass: 'author-blue',
      isLoggedIn: false
    };
  }

  function setCurrentUser(user) {
    try {
      localStorage.setItem('uniconnect_user', JSON.stringify(user));
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

  window.escapeHtml = escapeHtml;
  window.formatTimeAgo = formatTimeAgo;
  window.copyToClipboard = copyToClipboard;
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.getAuthToken = getAuthToken;
  window.setAuthToken = setAuthToken;
  window.clearAuth = clearAuth;
  window.playNotificationSound = playNotificationSound;
})();
