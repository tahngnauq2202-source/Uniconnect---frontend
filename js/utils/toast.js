/**
 * UniConnect HUCE - Toast Notification Utility
 * Provides unified, beautiful toast notifications across all pages
 */

(function () {
  'use strict';

  function ensureToastContainer() {
    let container = document.getElementById('uniconnectToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'uniconnectToastContainer';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 99999;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    info: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `,
    success: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `,
    warning: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `,
    error: `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `
  };

  const BORDER_COLORS = {
    info: '#0066FF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  function showToast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    const borderColor = BORDER_COLORS[type] || BORDER_COLORS.info;
    const iconSvg = ICONS[type] || ICONS.info;

    toast.className = 'uniconnect-toast';
    toast.style.cssText = `
      pointer-events: auto;
      background: #001E2B;
      color: #FFFFFF;
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      border-left: 4px solid ${borderColor};
      transform: translateY(40px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 420px;
    `;

    toast.innerHTML = `
      <div style="flex-shrink: 0; display: flex; align-items: center;">${iconSvg}</div>
      <div style="flex: 1; line-height: 1.4;">${message}</div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  window.showToast = showToast;
})();
