function bindVoteControls(container = document) {
  container.querySelectorAll('.vote-control').forEach(control => {

    if (control.dataset.bound) return;
    control.dataset.bound = "true";

    const upBtn = control.querySelector('.vote-btn-up');
    const scoreEl = control.querySelector('.vote-score');

    if (!upBtn || !scoreEl) return;

    const initialScore = parseInt(scoreEl.getAttribute('data-score') || scoreEl.textContent, 10) || 0;
    let isUpvoted = control.classList.contains('has-upvoted');

    const toggleUpvote = (e) => {
      if (e) e.stopPropagation();

      isUpvoted = !isUpvoted;

      if (isUpvoted) {
        control.classList.add('has-upvoted');
        scoreEl.textContent = (initialScore + 1).toString();
        if (typeof showToast === 'function') {
          showToast('Đã upvote bài viết (+1)', 'feedToast');
        }
      } else {
        control.classList.remove('has-upvoted');
        scoreEl.textContent = initialScore.toString();
        if (typeof showToast === 'function') {
          showToast('Đã hủy upvote bài viết', 'feedToast');
        }
      }
    };

    // Hỗ trợ bấm vào nút mũi tên hoặc bấm cả khối vote-control để upvote thuận tiện
    upBtn.addEventListener('click', toggleUpvote);
    control.addEventListener('click', (e) => {
      if (e.target !== upBtn && !upBtn.contains(e.target)) {
        toggleUpvote(e);
      }
    });

  });
}

window.bindVoteControls = bindVoteControls;

