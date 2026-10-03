/**
 * UniConnect HUCE - Hero Mockup Interaction Module
 */

(function () {
  'use strict';

  function initHeroMockup() {
    const upvoteBtn = document.getElementById('mockupUpvoteBtn');
    const upvoteCount = document.getElementById('mockupUpvoteCount');
    const upvoteStatus = document.getElementById('mockupStatus');
    if (!upvoteBtn || !upvoteCount) return;

    let isUpvoted = false;
    let baseCount = 142;

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
        if (typeof window.showToast === 'function') {
          window.showToast('Bạn đã upvote câu hỏi học thuật thành công (+1)', 'success');
        }
      } else {
        upvoteBtn.classList.remove('upvoted');
        upvoteCount.textContent = baseCount.toString();

        if (upvoteStatus) {
          upvoteStatus.textContent = '142 sinh viên & giảng viên thấy hữu ích';
        }
        if (typeof window.showToast === 'function') {
          window.showToast('Đã hủy upvote', 'info');
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroMockup);
  } else {
    initHeroMockup();
  }

  window.initHeroMockup = initHeroMockup;
})();
