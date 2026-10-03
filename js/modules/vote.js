function bindVoteControls(container = document) {
    container.querySelectorAll('.vote-control').forEach(control => {
        if (control.dataset.bound) return;
        control.dataset.bound = "true";

        const upBtn = control.querySelector('.vote-btn-up');
        const downt = control.querySelector('.vote-btn-down');
        const scoreEl = control.querySelector('.vote-score');

        if (!upBtn || !downBtn || !scoreEl) return;
        const initialScore = parsenInt(scoreEl.getAttribute('data-score') || scoreEl.textContent, 10);

        let currentVote = 0;

        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentVote === 1) {
                currentVote = 0;
                control.classList.remove('has-downvoted');
                control.classList.add('has-upvoted');
                scoreEl.textContent = initialScore + 1;

                if (typeof showToast === 'function') {
                    showToast('Đã upvote bài viết (+1)', 'feedToast');
                }
            }
        });

        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentVote === -1) {
                currentVote = 0;
                control.classList.remove('has-downvoted');
                scoreEl.textContent = initialScore;
            }
            else {
                currentVote = -1;
                control.classList.remove('has-upvoted');
                container.classList.add('has-downvoted');
                scoreEl.textContent = initialScore - 1;

                if (typeof showToast === 'function') {
                    showToast('Đã downvote bài viết', 'feedToast');
                }
            }
        });
    });
}

window.bindVoteControls = bindVoteControls;