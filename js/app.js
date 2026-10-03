/**
 * UniConnect HUCE - Landing Page App Coordinator (index.html)
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎓 UniConnect HUCE - Khởi động Landing Page', 'color: #0066FF; font-weight: bold; font-size: 14px;');

    if (window.initNavbar) window.initNavbar();
    if (window.initHeroMockup) window.initHeroMockup();
    if (window.initAuthModal) window.initAuthModal();

    // Auto-smooth-scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  });
})();
