/**
 * UniConnect HUCE - Search Module
 * Instant feed search & keyboard shortcuts (Ctrl+K)
 */

(function () {
  'use strict';

  function initSearchModule() {
    const searchInput = document.getElementById('feedSearchInput');
    const feedList = document.getElementById('feedList');
    if (!searchInput || !feedList) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const posts = feedList.querySelectorAll('.post-card');

      posts.forEach(post => {
        const title = (post.querySelector('.post-heading-title')?.textContent || '').toLowerCase();
        const content = (post.querySelector('.post-content-body')?.textContent || '').toLowerCase();
        const tag = (post.querySelector('.post-tag')?.textContent || '').toLowerCase();
        const author = (post.querySelector('.author-heading')?.textContent || '').toLowerCase();

        if (!query || title.includes(query) || content.includes(query) || tag.includes(query) || author.includes(query)) {
          post.style.display = 'flex';
        } else {
          post.style.display = 'none';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchModule);
  } else {
    initSearchModule();
  }

  window.initSearchModule = initSearchModule;
})();
