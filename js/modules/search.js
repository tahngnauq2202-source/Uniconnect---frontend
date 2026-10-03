function initSearch() {
    const searchInput = document.getElementById('feedSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        const posts = document.querySelectorAll('.post-card');

        posts.forEach(post => {
            const title = (post.querySelector('.post-heading-title')?.textContent || '').toLowerCase();
            const content = (post.querySelector('.post-content-body')?.textContent || '').toLowerCase();
            const tags = Array.from(post.querySelectorAll('.post-tag')).map(t => t.textContent).join(' ').toLowerCase();

            if (title.includes(query) || content.includes(query) || tags.includes(query)) {
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
    });
}

window.initSearch = initSearch;
