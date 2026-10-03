/**
 * UniConnect HUCE - Vote Module
 * Handles Upvoting for both Posts and Comments with Realtime Notification Integration
 */

(function () {
  'use strict';

  function bindVoteControls(container = document) {
    // 1. Post Upvote Controls
    container.querySelectorAll('.vote-control').forEach(control => {
      if (control.dataset.bound) return;
      control.dataset.bound = 'true';

      const upBtn = control.querySelector('.vote-btn-up');
      const scoreEl = control.querySelector('.vote-score');
      if (!upBtn || !scoreEl) return;

      const postCard = control.closest('.post-card');
      const postId = postCard?.getAttribute('data-post-id') || null;
      const postTitle = postCard?.querySelector('.post-heading-title')?.textContent.trim() || 'bài viết';
      const authorName = postCard?.querySelector('.author-heading')?.textContent.trim() || 'Tác giả';

      const initialScore = parseInt(scoreEl.getAttribute('data-score') || scoreEl.textContent, 10) || 0;
      let isUpvoted = control.classList.contains('has-upvoted');

      const toggleUpvote = async (e) => {
        if (e) e.stopPropagation();

        isUpvoted = !isUpvoted;
        const currentScore = parseInt(scoreEl.textContent, 10) || initialScore;
        const newScore = isUpvoted ? currentScore + 1 : Math.max(0, currentScore - 1);

        if (isUpvoted) {
          control.classList.add('has-upvoted');
          scoreEl.textContent = newScore.toString();
          control.style.transform = 'scale(1.08)';
          setTimeout(() => { control.style.transform = ''; }, 200);

          if (window.showToast) window.showToast('Đã upvote bài viết hữu ích (+1)', 'success');

          // Trigger real-time notification to post author
          const currentUser = window.getCurrentUser ? window.getCurrentUser() : { fullName: 'Bạn' };
          if (window.emitNotificationEvent) {
            window.emitNotificationEvent({
              type: 'UPVOTE',
              badgeText: 'Tương tác với bạn',
              avatarText: '⬆️',
              avatarClass: 'notif-avatar-upvote',
              timeText: 'Vừa xong',
              text: `<strong>${currentUser.fullName}</strong> vừa upvote bài viết <em>"${postTitle}"</em> của bạn.`,
              postId: postId
            });
          }

          // Call backend API via API client
          if (postId && window.API && window.API.votes) {
            window.API.votes.togglePost(postId)
              .then(res => {
                if (res && typeof res.voteScore === 'number') {
                  scoreEl.textContent = res.voteScore.toString();
                }
              })
              .catch(err => {
                console.warn('[UniConnect Vote] Toggle post vote notice:', err.message);
              });
          }
        } else {
          control.classList.remove('has-upvoted');
          scoreEl.textContent = newScore.toString();
          if (window.showToast) window.showToast('Đã hủy upvote bài viết', 'info');

          if (postId && window.API && window.API.votes) {
            window.API.votes.togglePost(postId)
              .then(res => {
                if (res && typeof res.voteScore === 'number') {
                  scoreEl.textContent = res.voteScore.toString();
                }
              })
              .catch(err => {
                console.warn('[UniConnect Vote] Cancel post vote notice:', err.message);
              });
          }
        }
      };

      upBtn.addEventListener('click', toggleUpvote);
      control.addEventListener('click', (e) => {
        if (e.target !== upBtn && !upBtn.contains(e.target)) {
          toggleUpvote(e);
        }
      });
    });

    // 2. Comment Upvote Controls
    container.querySelectorAll('.comment-upvote-btn').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isUpvoted = btn.getAttribute('data-upvoted') === 'true';
        const countEl = btn.querySelector('.upvote-count');
        const currentCount = parseInt(countEl?.textContent || '0', 10);
        const commentItem = btn.closest('.comment-item');
        const commentAuthor = commentItem?.querySelector('.comment-author-name')?.textContent.trim() || 'Người dùng';

        if (!isUpvoted) {
          btn.setAttribute('data-upvoted', 'true');
          btn.classList.add('upvoted');
          btn.style.color = '#0066FF';
          if (countEl) countEl.textContent = (currentCount + 1).toString();
          if (window.showToast) window.showToast(`Đã đánh giá bình luận của ${commentAuthor} là hữu ích`, 'success');

          // Trigger real-time notification
          const currentUser = window.getCurrentUser ? window.getCurrentUser() : { fullName: 'Bạn' };
          if (window.emitNotificationEvent) {
            window.emitNotificationEvent({
              type: 'UPVOTE',
              badgeText: 'Tương tác với bạn',
              avatarText: '⬆️',
              avatarClass: 'notif-avatar-upvote',
              timeText: 'Vừa xong',
              text: `<strong>${currentUser.fullName}</strong> vừa upvote phản hồi của bạn.`
            });
          }

          const commentId = commentItem?.getAttribute('data-comment-id');
          if (commentId && window.API && window.API.votes) {
            window.API.votes.toggleComment(commentId)
              .then(res => {
                if (res && typeof res.voteScore === 'number' && countEl) {
                  countEl.textContent = res.voteScore.toString();
                }
              })
              .catch(err => {
                console.warn('[UniConnect Vote] Toggle comment vote notice:', err.message);
              });
          }
        } else {
          btn.setAttribute('data-upvoted', 'false');
          btn.classList.remove('upvoted');
          btn.style.color = '';
          if (countEl) countEl.textContent = Math.max(0, currentCount - 1).toString();
          if (window.showToast) window.showToast('Đã hủy đánh giá bình luận', 'info');

          const commentId = commentItem?.getAttribute('data-comment-id');
          if (commentId && window.API && window.API.votes) {
            window.API.votes.toggleComment(commentId)
              .then(res => {
                if (res && typeof res.voteScore === 'number' && countEl) {
                  countEl.textContent = res.voteScore.toString();
                }
              })
              .catch(err => {
                console.warn('[UniConnect Vote] Cancel comment vote notice:', err.message);
              });
          }
        }
      });
    });
  }

  function initVoteModule() {
    bindVoteControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoteModule);
  } else {
    initVoteModule();
  }

  window.bindVoteControls = bindVoteControls;
  window.initVoteModule = initVoteModule;
})();
