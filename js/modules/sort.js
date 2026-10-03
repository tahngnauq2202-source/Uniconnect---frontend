/**
 * UniConnect HUCE - Feed Sorting & Category Filter Module
 */

(function () {
  'use strict';

  function initSortModule() {
    const sortBtns = document.querySelectorAll('.sort-btn');
    const feedList = document.getElementById('feedList');
    if (!feedList) return;

    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sortBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const sortType = btn.getAttribute('data-sort');
        const posts = Array.from(feedList.querySelectorAll('.post-card'));

        if (sortType === 'newest') {
          posts.sort((a, b) => {
            const timeA = parseInt(a.getAttribute('data-timestamp') || '0', 10);
            const timeB = parseInt(b.getAttribute('data-timestamp') || '0', 10);
            return timeB - timeA;
          });
          if (window.showToast) window.showToast('Đang hiển thị bài viết mới nhất', 'info');
        } else if (sortType === 'rising') {
          posts.sort((a, b) => {
            const commentsA = parseInt(a.getAttribute('data-comments') || '0', 10);
            const commentsB = parseInt(b.getAttribute('data-comments') || '0', 10);
            return commentsB - commentsA;
          });
          if (window.showToast) window.showToast('Đang hiển thị bài viết đang sôi nổi thảo luận', 'info');
        } else {
          posts.sort((a, b) => {
            const scoreA = parseInt(a.getAttribute('data-score') || '0', 10);
            const scoreB = parseInt(b.getAttribute('data-score') || '0', 10);
            return scoreB - scoreA;
          });
          if (window.showToast) window.showToast('Đang hiển thị bài viết nổi bật nhiều upvote', 'info');
        }

        posts.forEach(post => feedList.appendChild(post));
      });
    });

    // Subject/tag filtering
    document.querySelectorAll('[data-subject-filter]').forEach(tagBtn => {
      tagBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTag = tagBtn.getAttribute('data-subject-filter').toLowerCase().replace('#', '');
        const posts = feedList.querySelectorAll('.post-card');
        let matched = 0;

        posts.forEach(post => {
          const postTag = (post.querySelector('.post-tag')?.textContent || '').toLowerCase().replace('#', '');
          if (postTag.includes(targetTag) || targetTag === 'all') {
            post.style.display = 'flex';
            matched++;
          } else {
            post.style.display = 'none';
          }
        });

        if (window.showToast) {
          window.showToast(`Đã lọc theo chủ đề #${targetTag} (${matched} bài viết)`, 'info');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSortModule);
  } else {
    initSortModule();
  }

  window.initSortModule = initSortModule;
})();
