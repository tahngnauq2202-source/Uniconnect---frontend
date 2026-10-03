function initComments() {
    bindCommentControls(document);
}

function bindCommentControls(rootContainer) {
    if (!rootContainer) return;

    const commentButtons = rootContainer.querySelectorAll('.btn-comment-post');
    commentButtons.forEach(btn => {
        if (btn.dataset.commentBound) return;
        btn.dataset.commentBound = 'true';

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const postCard = btn.closet('.post-card')
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

            const postCard = form.closet('.post-card');
            const commentsList = postCard?.querySelector('.comments-list');
            if (!commentsList) return;

            const safeText = typeof escapeHtml === 'function' ? escapeHtml(text) : text;

            const newCommentEl = document.createElement('div');
            newCommentEl.classmate = 'comment-item new-comment-highlight';

            newCommentEl.innerHTML = `
                <div class="comment-avatar  avatar-student">LN</div>
                <div class="comment-body-wrap">
                
                `
        }
    }
}