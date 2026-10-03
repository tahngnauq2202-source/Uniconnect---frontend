/**
 * UniConnect HUCE - Main Feed App Coordinator (main.html)
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎓 UniConnect HUCE - Khởi động Bảng tin Học thuật (Feed)', 'color: #0066FF; font-weight: bold; font-size: 14px;');

    // Sync all user UI elements across the page (topbar, drawer, composer, comments)
    if (window.syncAllUserUI) {
      window.syncAllUserUI();
    }

    const user = window.getCurrentUser ? window.getCurrentUser() : null;

    // Add clickable logout to user profile
    const userProfileBtn = document.getElementById('desktopUserProfileBtn') || document.querySelector('.user-profile-btn');
    if (userProfileBtn) {
      userProfileBtn.title = 'Nhấp để Đăng xuất';
      userProfileBtn.addEventListener('click', () => {
        const displayName = (window.getCurrentUser && window.getCurrentUser().fullName) || (user && user.fullName) || 'tài khoản';
        if (confirm(`Bạn có muốn đăng xuất tài khoản "${displayName}" không?`)) {
          if (window.clearAuth) window.clearAuth();
          if (window.showToast) window.showToast('Đã đăng xuất thành công', 'info');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        }
      });
    }

    // Desktop Sidebar Logout
    document.querySelectorAll('.logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.clearAuth) window.clearAuth();
        if (window.showToast) window.showToast('Đã đăng xuất tài khoản', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 400);
      });
    });

    // Bind share buttons on initial cards
    document.querySelectorAll('.btn-share-post').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.copyToClipboard) window.copyToClipboard(window.location.href);
        if (window.showToast) window.showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm', 'info');
      });
    });

    // Message Lecturer Button
    const msgLecturerBtn = document.getElementById('msgLecturerBtn');
    if (msgLecturerBtn) {
      msgLecturerBtn.addEventListener('click', () => {
        if (window.showToast) window.showToast('Đang kết nối tin nhắn trực tiếp với Cố vấn học tập HUCE...', 'info');
      });
    }

    // Fetch real posts from backend via API client
    if (window.API && window.API.posts) {
      window.API.posts.getAll({ limit: 10 })
        .then(resData => {
          const posts = resData.data || resData;
          if (Array.isArray(posts) && posts.length > 0) {
            console.log(`%c[UniConnect API] 📚 Đã tải ${posts.length} bài viết từ cơ sở dữ liệu.`, 'color: #10B981; font-weight: bold;');
          }
        })
        .catch(() => {
          // Backend offline or empty, static posts already populated
        });
    }

    // Sync latest user profile from API if authenticated
    if (window.API && window.API.auth && window.getAuthToken && window.getAuthToken()) {
      window.API.auth.getMe()
        .then(res => {
          if (res && (res.user || res.id)) {
            const userData = res.user || res;
            window.setCurrentUser(userData);
          }
        })
        .catch(() => {});
    }
  });
})();
