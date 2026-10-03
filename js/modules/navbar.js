/**
 * UniConnect HUCE - Navbar Module
 */

(function () {
  'use strict';

  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

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

    // Check if user is logged in and adjust navbar actions
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    const token = window.getAuthToken ? window.getAuthToken() : '';
    if (user && user.isLoggedIn && token) {
      const navActions = document.querySelector('.nav-actions');
      if (navActions) {
        navActions.innerHTML = `
          <a href="main.html" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
            <span>Vào Bảng Tin</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }

  window.initNavbar = initNavbar;
})();
