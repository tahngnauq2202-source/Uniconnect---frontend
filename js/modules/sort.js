function initSort() {
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
                    const timeA = parseInt(a.dataset.timestamp || 0, 10);
                    const timeB = parseInt(b.dataset.timestamp || 0, 10);
                    return timeB - timeA;
                });
                if (typeof showToast === 'function') {
                    showToast('Đang hiển thị bài viết mới nhất', 'feedToast');
                }
            }
            else if (sortType === 'rising') {
                posts.sort((a, b) => {
                    const commentsA = parseInt(a.dataset.comments || 0, 10);
                    const commentsB = parseInt(b.dataset.comments || 0, 10);
                    return commentsB - commentsA;
                });
                if (typeof showToast === 'function') {
                    showToast('Đang hiển thị bài viết đang lên (nhiều thảo luận)', 'feedToast');
                }
            }
            else {
                posts.sort((a, b) => {
                    const scoreA = parseInt(a.dataset.score || 0, 10);
                    const scoreB = parseInt(b.dataset.score || 0, 10);
                    return scoreB - scoreA;
                });
                if (typeof showToast === 'function') {
                    showToast('Đang hiển thị bài viết nổi bật (điểm vote cao)', 'feedToast');
                }
            }

            posts.forEach(post => feedList.appendChild(post));
        });
    });
}

window.initSort = initSort;
