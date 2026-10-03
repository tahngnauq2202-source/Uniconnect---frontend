function initNotifications() {
  const sidebarNotificationBtn = document.getElementById('sidebarNotificationBtn');
  const notificationOverlay = document.getElementById('notificationOverlay');
  const closeNotifBtn = document.getElementById('closeNotifBtn');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const notificationBadge = document.getElementById('notificationBadge');
  const unreadCountDisplay = document.getElementById('unreadCountDisplay');
  const notifTotalCount = document.getElementById('notifTotalCount');
  const notifItemsList = document.getElementById('notifItemsList');
  const notifTabs = document.querySelectorAll('.notif-tab');
  const btnTestSimulation = document.getElementById('btnTestSimulation');

  if (!notificationOverlay || !notifItemsList) return;

  function openNotificationDrawer() {
    notificationOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNotificationDrawer() {
    notificationOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (sidebarNotificationBtn) {
    sidebarNotificationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openNotificationDrawer();
    });
  }

  document.querySelectorAll('[data-open-notifications]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openNotificationDrawer();
    });
  });

  if (closeNotifBtn) {
    closeNotifBtn.addEventListener('click', closeNotificationDrawer);
  }

  notificationOverlay.addEventListener('click', (e) => {
    if (e.target === notificationOverlay) {
      closeNotificationDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationOverlay.classList.contains('active')) {
      closeNotificationDrawer();
    }
  });

  notifTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      notifTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterType = tab.getAttribute('data-notif-filter');
      const items = notifItemsList.querySelectorAll('.notif-item');

      items.forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (filterType === 'all' || itemType === filterType) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  function bindNotificationItems() {
    notifItemsList.querySelectorAll('.notif-item').forEach(item => {
      if (item.dataset.clickBound) return;
      item.dataset.clickBound = "true";

      item.addEventListener('click', () => {
        if (item.classList.contains('unread')) {
          item.classList.remove('unread');

          const dot = item.querySelector('.unread-dot');
          if (dot) dot.remove();

          updateUnreadBadgeCount(-1);
        }
      });
    });
  }

  bindNotificationItems();

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      notifItemsList.querySelectorAll('.notif-item.unread').forEach(item => {
        item.classList.remove('unread');
        const dot = item.querySelector('.unread-dot');
        if (dot) dot.remove();
      });

      setUnreadBadgeCount(0);

      if (typeof showToast === 'function') {
        showToast('Đã đánh dấu đã đọc tất cả thông báo', 'feedToast');
      }
    });
  }

  function updateUnreadBadgeCount(delta) {
    let current = parseInt(document.querySelector('[data-notif-badge]')?.textContent || notificationBadge?.textContent || '0', 10);
    let next = Math.max(0, current + delta);
    setUnreadBadgeCount(next);
  }

  function setUnreadBadgeCount(count) {
    const badges = document.querySelectorAll('[data-notif-badge], #notificationBadge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    if (unreadCountDisplay) {
      unreadCountDisplay.textContent = count;
    }

    const unreadStatusText = document.getElementById('unreadStatusText');
    if (unreadStatusText) {
      unreadStatusText.innerHTML = count > 0
        ? `Bạn có <strong>${count}</strong> thông báo chưa đọc`
        : `Bạn đã đọc hết tất cả thông báo`;
    }
  }

  function addRealtimeNotification({ type, avatarText, avatarClass, badgeText, timeText, text, previewText }) {
    const itemEl = document.createElement('div');
    itemEl.className = 'notif-item unread';
    itemEl.setAttribute('data-type', type);

    let tagClass = 'tag-interaction';
    if (type === 'new_post') tagClass = 'tag-post';
    if (type === 'new_activity') tagClass = 'tag-activity';

    itemEl.innerHTML = `
      <div class="notif-avatar ${avatarClass}">${avatarText}</div>
      <div class="notif-content">
        <div class="notif-header-line">
          <span class="notif-badge-tag ${tagClass}">${badgeText}</span>
          <span class="notif-time">${timeText}</span>
        </div>
        <p class="notif-text">${text}</p>
        ${previewText ? `<div class="notif-action-preview">${previewText}</div>` : ''}
      </div>
      <span class="unread-dot"></span>
    `;

    notifItemsList.insertBefore(itemEl, notifItemsList.firstChild);

    bindNotificationItems();

    updateUnreadBadgeCount(1);

    if (notifTotalCount) {
      const total = notifItemsList.querySelectorAll('.notif-item').length;
      notifTotalCount.textContent = total;
    }

    showRealtimeAlert(badgeText, text);
  }

  function showRealtimeAlert(badgeTitle, text) {
    let alertBox = document.getElementById('realtimeToast');

    if (!alertBox) {
      alertBox = document.createElement('div');
      alertBox.id = 'realtimeToast';
      alertBox.style.cssText = `
        position: fixed;
        top: 80px;
        right: 28px;
        background: #001E2B;
        color: #FFFFFF;
        padding: 14px 18px;
        border-radius: 14px;
        box-shadow: 0 16px 36px rgba(0, 30, 43, 0.35);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13.5px;
        border-left: 4px solid #0066FF;
        z-index: 99999;
        cursor: pointer;
        max-width: 380px;
        transform: translateX(120%);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(alertBox);

      alertBox.addEventListener('click', () => {
        openNotificationDrawer();
        alertBox.style.transform = 'translateX(120%)';
      });
    }

    alertBox.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #0066FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 11px; font-weight: 700; color: #60A5FA; text-transform: uppercase;">● Realtime: ${badgeTitle}</div>
        <div style="color: #F8FAFC; margin-top: 2px; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          ${text.replace(/<[^>]*>?/gm, '')}
        </div>
      </div>
    `;

    alertBox.style.transform = 'translateX(0)';

    setTimeout(() => {
      alertBox.style.transform = 'translateX(120%)';
    }, 5500);
  }

  const simulationScenarios = [
    {
      type: 'user_interaction',
      avatarText: 'GV',
      avatarClass: 'notif-avatar-gv',
      badgeText: 'Tương tác với bạn',
      timeText: 'Vừa xong',
      text: '<strong>TS. Nguyễn Thành Nam</strong> vừa phản hồi câu hỏi học thuật của bạn về <em>Cấu trúc dữ liệu</em>.',
      previewText: '"Chào Linh! Thuật toán Dijkstra rất phù hợp cho bài toán tìm đường ngắn nhất trong mạng lưới xây dựng đô thị."'
    },
    {
      type: 'new_post',
      avatarText: 'PĐ',
      avatarClass: 'notif-avatar-notice',
      badgeText: 'Bài viết mới',
      timeText: 'Vừa xong',
      text: '<strong>Phòng Đào tạo HUCE</strong> vừa cập nhật: <em>Lịch thi lại & chuẩn đầu ra ngoại ngữ đợt 1 năm 2026</em>.'
    },
    {
      type: 'user_interaction',
      avatarText: '⬆️',
      avatarClass: 'notif-avatar-upvote',
      badgeText: 'Tương tác với bạn',
      timeText: 'Vừa xong',
      text: '<strong>Trần Minh Tuấn</strong> và <strong>5 bạn khác</strong> vừa upvote bài viết mới của bạn.'
    },
    {
      type: 'new_activity',
      avatarText: 'CLB',
      avatarClass: 'notif-avatar-activity',
      badgeText: 'Hoạt động mới',
      timeText: 'Vừa xong',
      text: '<strong>CLB Tin Học Xây Dựng</strong> mở đăng ký: <em>Workshop Lập trình Python & Phân tích Dữ liệu Kết cấu</em>.'
    },
    {
      type: 'new_post',
      avatarText: 'TH',
      avatarClass: 'notif-avatar-dm',
      badgeText: 'Bài viết mới',
      timeText: 'Vừa xong',
      text: '<strong>ThS. Trần Thu Hà</strong> vừa chia sẻ tài liệu: <em>Đề cương ôn tập môn Kinh tế Xây dựng & Dự toán</em>.'
    }
  ];

  let scenarioIndex = 0;

  function triggerNextSimulation() {
    const scenario = simulationScenarios[scenarioIndex % simulationScenarios.length];
    scenarioIndex++;
    addRealtimeNotification(scenario);
  }

  if (btnTestSimulation) {
    btnTestSimulation.addEventListener('click', () => {
      triggerNextSimulation();
      if (typeof showToast === 'function') {
        showToast('Đã nhận thông báo Realtime thử nghiệm', 'feedToast');
      }
    });
  }

  setInterval(() => {
    triggerNextSimulation();
  }, 24000);

  window.openNotificationDrawer = openNotificationDrawer;
  window.closeNotificationDrawer = closeNotificationDrawer;
  window.addRealtimeNotification = addRealtimeNotification;
  window.triggerNextSimulation = triggerNextSimulation;
}

window.initNotifications = initNotifications;
