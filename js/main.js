document.addEventListener('DOMContentLoaded', () => {

    if (typeof bindVoteControls === 'function') {
        bindVoteControls();
    }

    if (typeof initPostComposer === 'function') {
        initPostComposer();
    }

    if (typeof initSort === 'function') {
        initSort();
    }

    if (typeof initSearch === 'function') {
        initSearch();
    }

    if (typeof initNotifications === 'function') {
        initNotifications();
    }

    if (typeof initMobileNavigation === 'function') {
        initMobileNavigation();
    }

    document.querySelectorAll('.btn-share-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (typeof copyToClipboard === 'function') {
                copyToClipboard(window.location.href, 'Đã sao chép liên kết bài viết vào bộ nhớ tạm');
            }
        });
    });

    if (typeof initComments === 'function') {
        initComments();
    }

    const msgLecturerBtn = document.getElementById('msgLecturerBtn');
    if (msgLecturerBtn) {
        msgLecturerBtn.addEventListener('click', () => {
            if (typeof showToast === 'function') {
                showToast('Đang kết nối tin nhắn trực tiếp với Giảng viên HUCE...', 'feedToast');
            }
        });
    }

});
