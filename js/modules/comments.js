/**
 * UniConnect HUCE - Comments Module
 * Handles Comment Box Expansion, Submitting Comments & Replies with Realtime Notifications
 */

(function () {
  'use strict';

  function bindCommentControls(container = document) {
    // 1. Toggle comment section visibility
    container.querySelectorAll('.btn-comment-post').forEach(btn => {
      if (btn.dataset.boundComments) return;
      btn.dataset.boundComments = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postCard = btn.closest('.post-card');
        if (!postCard) return;

        const commentsContainer = postCard.querySelector('.post-comments-container');
        if (!commentsContainer) return;

        const isHidden = commentsContainer.style.display === 'none' || !commentsContainer.style.display;
        if (isHidden) {
          commentsContainer.style.display = 'block';
          commentsContainer.style.animation = 'fadeIn 0.25s ease';
          const textarea = commentsContainer.querySelector('.comment-textarea');
          if (textarea) textarea.focus();
        } else {
          commentsContainer.style.display = 'none';
        }
      });
    });

    // 2. Quick tags insertion
    container.querySelectorAll('.quick-tag-chip').forEach(chip => {
      if (chip.dataset.boundTag) return;
      chip.dataset.boundTag = 'true';

      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = chip.getAttribute('data-insert-tag');
        const form = chip.closest('.comment-input-form');
        const textarea = form?.querySelector('.comment-textarea');
        if (textarea && tag) {
          const curVal = textarea.value;
          textarea.value = curVal ? `${curVal.trim()} ${tag} ` : `${tag} `;
          textarea.focus();
        }
      });
    });

    // 3. Comment input form submission
    container.querySelectorAll('.comment-input-form').forEach(form => {
      if (form.dataset.boundSubmit) return;
      form.dataset.boundSubmit = 'true';

      // Sync avatar with current user
      const avatarEl = form.querySelector('.comment-author-avatar');
      const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
      if (avatarEl && currentUser) {
        avatarEl.textContent = currentUser.avatar;
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = form.querySelector('.comment-textarea');
        const content = textarea?.value.trim();
        if (!content) return;

        const postCard = form.closest('.post-card');
        const postId = postCard?.getAttribute('data-post-id') || null;
        const postTitle = postCard?.querySelector('.post-heading-title')?.textContent.trim() || 'bài viết';
        const postAuthor = postCard?.querySelector('.author-heading')?.textContent.trim() || 'Tác giả';
        const commentsList = postCard?.querySelector('.comments-list');
        const user = window.getCurrentUser ? window.getCurrentUser() : { fullName: 'Sinh viên HUCE', avatar: 'SV', role: 'Sinh viên' };

        // Create new comment element
        const newCommentItem = document.createElement('div');
        newCommentItem.className = 'comment-item new-comment-item';
        newCommentItem.style.animation = 'fadeIn 0.3s ease';

        const roleBadge = user.rawRole === 'LECTURER'
          ? `<span class="badge-role-lecturer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> Giảng viên HUCE</span>`
          : `<span class="badge-role-student">${window.escapeHtml(user.role)}</span>`;

        newCommentItem.innerHTML = `
          <div class="comment-avatar ${user.rawRole === 'LECTURER' ? 'avatar-gv' : 'avatar-student'}">${user.avatar}</div>
          <div class="comment-body-wrap">
            <div class="comment-meta-row">
              <div class="comment-author-meta">
                <span class="comment-author-name">${window.escapeHtml(user.fullName)}</span>
                ${roleBadge}
              </div>
              <span class="comment-timestamp">Vừa xong</span>
            </div>
            <div class="comment-text">
              ${window.escapeHtml(content)}
            </div>
            <div class="comment-action-row">
              <button type="button" class="comment-upvote-btn" data-upvoted="false" title="Đánh giá bình luận hữu ích">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span class="upvote-count">0</span>
              </button>
              <button type="button" class="comment-reply-btn" data-reply-to="${window.escapeHtml(user.fullName)}" title="Trả lời bình luận này">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 17 4 12 9 7"></polyline>
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                </svg>
                <span>Trả lời</span>
              </button>
            </div>
          </div>
        `;

        if (commentsList) {
          commentsList.insertBefore(newCommentItem, commentsList.firstChild);
        }

        // Update comment counts
        const actionBtnText = postCard?.querySelector('.btn-comment-post span');
        const counterBadge = postCard?.querySelector('.comments-counter-badge');
        let currentCount = parseInt(postCard?.getAttribute('data-comments') || '0', 10);
        currentCount++;
        if (postCard) postCard.setAttribute('data-comments', currentCount.toString());
        if (actionBtnText) actionBtnText.textContent = `${currentCount} bình luận`;
        if (counterBadge) counterBadge.textContent = `${currentCount} bình luận`;

        textarea.value = '';
        if (window.showToast) window.showToast('Đã gửi phản hồi học thuật thành công!', 'success');

        // Trigger real-time notification
        if (window.emitNotificationEvent) {
          window.emitNotificationEvent({
            type: 'COMMENT',
            badgeText: 'Tương tác với bạn',
            avatarText: user.avatar,
            avatarClass: user.rawRole === 'LECTURER' ? 'notif-avatar-gv' : 'notif-avatar-dm',
            timeText: 'Vừa xong',
            text: `<strong>${window.escapeHtml(user.fullName)}</strong> vừa bình luận vào bài viết <em>"${window.escapeHtml(postTitle)}"</em> của bạn.`,
            previewText: `"${window.escapeHtml(content.slice(0, 100))}${content.length > 100 ? '...' : ''}"`,
            postId: postId
          });
        }

        // Bind vote & reply controls on the new item
        if (window.bindVoteControls) window.bindVoteControls(newCommentItem);
        bindReplyButtons(newCommentItem);

        // API call via unified API service
        if (postId && window.API && window.API.comments) {
          window.API.comments.create(postId, content)
            .then(res => {
              if (res && res.comment && res.comment.id) {
                newCommentItem.setAttribute('data-comment-id', res.comment.id.toString());
              }
            })
            .catch(err => {
              console.warn('[UniConnect Comment] Post comment API notice:', err.message);
            });
        }
      });
    });

    bindReplyButtons(container);
  }

  function bindReplyButtons(container = document) {
    container.querySelectorAll('.comment-reply-btn').forEach(btn => {
      if (btn.dataset.boundReply) return;
      btn.dataset.boundReply = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const replyTo = btn.getAttribute('data-reply-to') || 'bạn';
        const postCard = btn.closest('.post-card');
        const textarea = postCard?.querySelector('.comment-textarea');
        if (textarea) {
          textarea.value = `@${replyTo} `;
          textarea.focus();
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function initCommentsModule() {
    bindCommentControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommentsModule);
  } else {
    initCommentsModule();
  }

  window.bindCommentControls = bindCommentControls;
  window.initCommentsModule = initCommentsModule;
})();
