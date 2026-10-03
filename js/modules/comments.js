function initComments() {
    bindCommentControls(document);
}

function bindCommentControls(rootContainer) {
    if (!rootContainer) return;

    const commentButtons = rootContainer.querySelectorAll('.btn-comment-post');
    commentButtons.forEach(btn => {
        if (btn.dataset.commentBound) return;
        btn.dataset.commentBound = "true";

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const postCard = btn.closest('.post-card');
            if (!postCard) return;

            const commentsContainer = postCard.querySelector('.post-comments-container');
            if (!commentsContainer) return;

            const isHidden = window.getComputedStyle(commentsContainer).display === 'none';

            if (isHidden) {
                commentsContainer.style.display = 'block';
                btn.classList.add('active');

                const textarea = commentsContainer.querySelector('.comment-textarea');
                if (textarea) {
                    setTimeout(() => textarea.focus(), 150);
                }
            }
            else {
                commentsContainer.style.display = 'none';
                btn.classList.remove('active');
            }
        });
    });

    const commentForms = rootContainer.querySelectorAll('.comment-input-form');
    commentForms.forEach(form => {
        if (form.dataset.submitBound) return;
        form.dataset.submitBound = "true";

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const textarea = form.querySelector('.comment-textarea');
            const text = textarea?.value.trim();

            if (!text) return;

            const postCard = form.closest('.post-card');
            const commentsList = postCard?.querySelector('.comments-list');
            if (!commentsList) return;

            const safeText = typeof escapeHtml === 'function' ? escapeHtml(text) : text;

            const newCommentEl = document.createElement('div');
            newCommentEl.className = 'comment-item new-comment-highlight';

            let authorName = 'Linh Nguyễn';
            let authorAvatar = 'LN';
            let roleBadge = 'Sinh viên K21 • HUCE';
            let roleClass = 'badge-role-student';
            let avatarClass = 'avatar-student';
            try {
                const stored = localStorage.getItem('uniconnect_user');
                if (stored) {
                    const u = JSON.parse(stored);
                    if (u && u.fullName) {
                        authorName = u.fullName;
                        const names = u.fullName.trim().split(/\s+/);
                        authorAvatar = names.length >= 2
                            ? (names[names.length - 2][0] + names[names.length - 1][0]).toUpperCase()
                            : u.fullName.slice(0, 2).toUpperCase();
                        if (u.role === 'LECTURER' || u.role === 'lecturer') {
                            roleBadge = 'Giảng viên HUCE';
                            roleClass = 'badge-role-lecturer';
                            avatarClass = 'avatar-lecturer';
                        }
                    }
                }
            } catch (_) { }

            newCommentEl.innerHTML = `
            <div class="comment-avatar ${avatarClass}">${authorAvatar}</div>
            <div class="comment-body-wrap">
            <div class="comment-meta-row">
                <div class="comment-author-meta">
                <span class="comment-author-name">${authorName}</span>
                <span class="${roleClass}">${roleBadge}</span>
                </div>
                <span class="comment-timestamp">Vừa xong</span>
            </div>
            <div class="comment-text">${safeText}</div>
            <div class="comment-action-row">
                <button type="button" class="comment-upvote-btn" data-upvoted="false" title="Đánh giá bình luận hữu ích">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span class="upvote-count">1</span>
                </button>
                <button type="button" class="comment-reply-btn" data-reply-to="Linh Nguyễn" title="Trả lời bình luận này">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 17 4 12 9 7"></polyline>
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                </svg>
                <span>Trả lời</span>
                </button>
            </div>
            </div>
        `;

            commentsList.insertBefore(newCommentEl, commentsList.firstChild);

            bindSingleCommentActions(newCommentEl, form);

            incrementPostCommentCount(postCard);

            textarea.value = '';
            textarea.style.height = 'auto';

            if (typeof showToast === 'function') {
                showToast('🎉 Đã đăng bình luận công khai thành công!', 'feedToast');
            }
        });
    });

    const textareas = rootContainer.querySelectorAll('.comment-textarea');
    textareas.forEach(ta => {
        if (ta.dataset.autoGrowBound) return;
        ta.dataset.autoGrowBound = "true";

        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
        });
    });

    const quickTagChips = rootContainer.querySelectorAll('.quick-tag-chip');
    quickTagChips.forEach(chip => {
        if (chip.dataset.tagBound) return;
        chip.dataset.tagBound = "true";

        chip.addEventListener('click', () => {
            const tagText = chip.getAttribute('data-insert-tag');
            const form = chip.closest('.comment-input-form');
            const textarea = form?.querySelector('.comment-textarea');

            if (textarea && tagText) {
                const val = textarea.value.trim();
                textarea.value = val ? `${val} ${tagText} ` : `${tagText} `;
                textarea.focus();
            }
        });
    });

    const commentItems = rootContainer.querySelectorAll('.comment-item');
    commentItems.forEach(item => {
        const form = item.closest('.post-comments-container')?.querySelector('.comment-input-form');
        bindSingleCommentActions(item, form);
    });
}

function bindSingleCommentActions(commentItem, relatedForm) {
    const upvoteBtn = commentItem.querySelector('.comment-upvote-btn');
    if (upvoteBtn && !upvoteBtn.dataset.upvoteBound) {
        upvoteBtn.dataset.upvoteBound = "true";

        upvoteBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const countEl = upvoteBtn.querySelector('.upvote-count');
            let currentScore = parseInt(countEl?.textContent || '0', 10);
            const isUpvoted = upvoteBtn.classList.contains('has-upvoted');

            if (isUpvoted) {
                upvoteBtn.classList.remove('has-upvoted');
                currentScore = Math.max(0, currentScore - 1);
                if (typeof showToast === 'function') {
                    showToast('Đã hủy bình chọn bình luận', 'feedToast');
                }
            }
            else {
                upvoteBtn.classList.add('has-upvoted');
                currentScore += 1;
                if (typeof showToast === 'function') {
                    showToast('Đã bình chọn bình luận hữu ích (+1)', 'feedToast');
                }
            }

            if (countEl) countEl.textContent = currentScore;
        });
    }

    const replyBtn = commentItem.querySelector('.comment-reply-btn');
    if (replyBtn && !replyBtn.dataset.replyBound) {
        replyBtn.dataset.replyBound = "true";

        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const authorName = replyBtn.getAttribute('data-reply-to') || 'Bạn';
            const form = relatedForm || replyBtn.closest('.post-comments-container')?.querySelector('.comment-input-form');
            const textarea = form?.querySelector('.comment-textarea');

            if (textarea) {
                textarea.value = `@${authorName}: `;
                textarea.focus();

                form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
}

function incrementPostCommentCount(postCard) {
    if (!postCard) return;

    let currentCount = parseInt(postCard.getAttribute('data-comments') || '0', 10);
    let nextCount = currentCount + 1;
    postCard.setAttribute('data-comments', nextCount.toString());

    const commentBtnSpan = postCard.querySelector('.btn-comment-post span');
    if (commentBtnSpan) {
        commentBtnSpan.textContent = `${nextCount} bình luận`;
    }

    const counterBadge = postCard.querySelector('.comments-counter-badge');
    if (counterBadge) {
        counterBadge.textContent = `${nextCount} bình luận`;
    }
}

window.initComments = initComments;
window.bindCommentControls = bindCommentControls;
window.incrementPostCommentCount = incrementPostCommentCount;
