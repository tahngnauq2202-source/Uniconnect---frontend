function initMobileNavigation() {
  const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
  const closeMobileDrawerBtn = document.getElementById('closeMobileDrawerBtn');
  const mobileHeaderMenuBtn = document.getElementById('mobileHeaderMenuBtn');
  const bottomNavMenu = document.getElementById('bottomNavMenu');
  const bottomNavHome = document.getElementById('bottomNavHome');
  const bottomNavExplore = document.getElementById('bottomNavExplore');
  const bottomNavPost = document.getElementById('bottomNavPost');
  const bottomNavNotif = document.getElementById('bottomNavNotif');
  const mobileBrandLink = document.getElementById('mobileBrandLink');
  const mobileHeaderNotifBtn = document.getElementById('mobileHeaderNotifBtn');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item:not(.bottom-nav-fab)');

  function openMobileDrawer() {
    if (!mobileDrawerOverlay) return;
    mobileDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawerOverlay) return;
    mobileDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileHeaderMenuBtn) {
    mobileHeaderMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileDrawer();
    });
  }

  if (bottomNavMenu) {
    bottomNavMenu.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileDrawer();
    });
  }

  if (closeMobileDrawerBtn) {
    closeMobileDrawerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
    });
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === mobileDrawerOverlay) {
        closeMobileDrawer();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawerOverlay?.classList.contains('active')) {
      closeMobileDrawer();
    }
  });

  function setActiveBottomNav(activeItem) {
    bottomNavItems.forEach(item => item.classList.remove('active'));
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  if (bottomNavHome) {
    bottomNavHome.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveBottomNav(bottomNavHome);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (mobileBrandLink) {
    mobileBrandLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveBottomNav(bottomNavHome);
    });
  }

  if (bottomNavExplore) {
    bottomNavExplore.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveBottomNav(bottomNavExplore);
      const searchInput = document.getElementById('feedSearchInput');
      if (searchInput) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          searchInput.focus();
        }, 300);
      }
    });
  }

  if (bottomNavPost) {
    bottomNavPost.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.expandComposer === 'function') {
        window.expandComposer();
      } else {
        const openComposerBtn = document.getElementById('openComposerBtn');
        if (openComposerBtn) openComposerBtn.click();
      }

      const postCreateBox = document.getElementById('postCreateBox');
      if (postCreateBox) {
        postCreateBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if (bottomNavNotif) {
    bottomNavNotif.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openNotificationDrawer === 'function') {
        window.openNotificationDrawer();
      } else {
        document.getElementById('sidebarNotificationBtn')?.click();
      }
    });
  }

  if (mobileHeaderNotifBtn) {
    mobileHeaderNotifBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openNotificationDrawer === 'function') {
        window.openNotificationDrawer();
      } else {
        document.getElementById('sidebarNotificationBtn')?.click();
      }
    });
  }

  const mobileTagBtns = document.querySelectorAll('[data-subject-filter]');
  mobileTagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-subject-filter');
      closeMobileDrawer();

      const searchInput = document.getElementById('feedSearchInput');
      if (searchInput) {
        searchInput.value = tag;

        searchInput.dispatchEvent(new Event('input', { bubbles: true }));

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (typeof showToast === 'function') {
        showToast(`Đang lọc bài viết theo môn: ${tag}`, 'feedToast');
      }
    });
  });

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (window.scrollY < 120 && bottomNavHome && !bottomNavHome.classList.contains('active')) {
        setActiveBottomNav(bottomNavHome);
      }
    }, 150);
  }, { passive: true });

  window.openMobileDrawer = openMobileDrawer;
  window.closeMobileDrawer = closeMobileDrawer;
}

window.initMobileNavigation = initMobileNavigation;
