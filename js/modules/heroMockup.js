function initHeroMockup() {
    const upvoteButton = document.getElementById('upvoteButton');
    const upvoteCount = document.getElementById('mockupUpvoteCount');
    const upvoteStatus = document.getElementById('mockupStatus');

    let isUpvoted = false;

    if (upvoteButton && upvoteCount && upvoteStatus) {
        let baseCount = parseInt(upvoteCount.textContent, 10) || 0;

        upvoteButton.addEventListener('click', () => {
            isUpvoted = !isUpvoted;

            const newCount = isUpvoted ? baseCount + 1 : baseCount;
            upvoteCount.textContent = newCount.toString();

            upvoteStatus.textContent = isUpvoted ? 'Upvoted' : 'Upvote';

            if (isUpvoted) {
                upvoteButton.classList.add('upvoted');
            } else {
                upvoteButton.classList.remove('upvoted');
            }
        });
    }
}

window.initHeroMockup = initHeroMockup;