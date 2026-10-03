/**
 * UniConnect HUCE - Mobile Navigation & Drawer Module
 */

(function () {
  'use strict';

  function initMobileNavigation() {
    const bottomNavMenu = document.getElementById('bottomNavMenu');
    const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
    const closeMobileDrawerBtn = document.getElementById('closeMobileDrawerBtn');
    const mobileBottomNav = document.getElementById('mobileBottomNav');

    function openMobileDrawer() {
      if (mobileDrawerOverlay) {
        mobileDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileDrawer() {
      if (mobileDrawerOverlay) {
        mobileDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    if (bottomNavMenu) {
      bottomNavMenu.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileDrawer();
      });
    }

    const mobileHeaderMenuBtn = document.getElementById('mobileHeaderMenuBtn');
    if (mobileHeaderMenuBtn) {
      mobileHeaderMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileDrawer();
      });
    }

    if (closeMobileDrawerBtn) {
      closeMobileDrawerBtn.addEventListener('click', closeMobileDrawer);
    }

    if (mobileDrawerOverlay) {
      mobileDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === mobileDrawerOverlay) closeMobileDrawer();
      });
    }

    // Sync mobile drawer profile
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    if (user) {
      const avatarLg = document.querySelector('.mobile-drawer-user .user-avatar-lg');
      const drawerName = document.querySelector('.mobile-drawer-user .drawer-user-name');
      const drawerRole = document.querySelector('.mobile-drawer-user .drawer-user-role');

      if (avatarLg) avatarLg.textContent = user.avatar;
      if (drawerName) drawerName.textContent = user.fullName;
      if (drawerRole) drawerRole.textContent = user.role;
    }

    // Mobile Logout link
    document.querySelectorAll('.mobile-logout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.clearAuth) window.clearAuth();
        if (window.showToast) window.showToast('Đã đăng xuất tài khoản', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      });
    });

    // Mobile bottom navigation switching
    if (mobileBottomNav) {
      const items = mobileBottomNav.querySelectorAll('.bottom-nav-item:not(.bottom-nav-fab)');
      items.forEach(item => {
        item.addEventListener('click', () => {
          if (item.id === 'bottomNavMenu' || item.id === 'bottomNavNotif') return;
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavigation);
  } else {
    initMobileNavigation();
  }

  window.initMobileNavigation = initMobileNavigation;
})();
