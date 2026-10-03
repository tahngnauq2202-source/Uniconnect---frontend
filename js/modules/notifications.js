/**
 * UniConnect HUCE - Realtime Notification Module
 * Manages Server-Sent Events (SSE), Realtime Drawer, Badges, Chimes & In-App Alerts
 */

(function () {
  'use strict';

  let eventSource = null;
  let isConnected = false;

  const SIMULATION_SCENARIOS = [
    {
      type: 'user_interaction',
      avatarText: 'GV',
      avatarClass: 'notif-avatar-gv',
      badgeText: 'Tương tác với bạn',
      timeText: 'Vừa xong',
      text: '<strong>TS. Nguyễn Thành Nam</strong> vừa phản hồi câu hỏi học thuật của bạn về <em>Cấu trúc dữ liệu & Thuật toán</em>.',
      previewText: '"Chào Linh! Thuật toán Dijkstra rất phù hợp cho bài toán tìm đường ngắn nhất trong mạng lưới xây dựng đô thị."'
    },
    {
      type: 'user_interaction',
      avatarText: '⬆️',
      avatarClass: 'notif-avatar-upvote',
      badgeText: 'Tương tác với bạn',
      timeText: 'Vừa xong',
      text: '<strong>Trần Minh Tuấn</strong> và <strong>5 bạn khác</strong> vừa upvote bài viết mới của bạn (+6 hữu ích).'
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
      avatarText: 'TH',
      avatarClass: 'notif-avatar-dm',
      badgeText: 'Bình luận mới',
      timeText: 'Vừa xong',
      text: '<strong>Hoàng Long</strong> đã bình luận vào câu hỏi của bạn: <em>"Bạn tham khảo tiêu chuẩn TCVN 5574:2018 bảng 12 nhé!"</em>'
    },
    {
      type: 'new_activity',
      avatarText: 'CLB',
      avatarClass: 'notif-avatar-activity',
      badgeText: 'Hoạt động mới',
      timeText: 'Vừa xong',
      text: '<strong>CLB Tin Học Xây Dựng HUCE</strong> mở đăng ký: <em>Workshop Lập trình Python & Phân tích Dữ liệu Kết cấu</em>.'
    }
  ];

  let scenarioIndex = 0;

  function initNotificationsModule() {
    const sidebarNotificationBtn = document.getElementById('sidebarNotificationBtn');
    const bottomNavNotif = document.getElementById('bottomNavNotif');
    const notificationOverlay = document.getElementById('notificationOverlay');
    const notificationDrawer = document.getElementById('notificationDrawer');
    const closeNotifBtn = document.getElementById('closeNotifBtn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const notificationBadge = document.getElementById('notificationBadge');
    const bottomNavNotifBadge = document.getElementById('bottomNavNotifBadge');
    const unreadCountDisplay = document.getElementById('unreadCountDisplay');
    const notifTotalCount = document.getElementById('notifTotalCount');
    const notifItemsList = document.getElementById('notifItemsList');
    const notifTabs = document.querySelectorAll('.notif-tab');
    const btnTestSimulation = document.getElementById('btnTestSimulation');
    const statusTextEl = document.querySelector('.connection-status span:last-child');
    const statusDotEl = document.querySelector('.status-indicator-dot');

    function openNotificationDrawer() {
      if (notificationOverlay) {
        notificationOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeNotificationDrawer() {
      if (notificationOverlay) {
        notificationOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    if (sidebarNotificationBtn) {
      sidebarNotificationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openNotificationDrawer();
      });
    }

    if (bottomNavNotif) {
      bottomNavNotif.addEventListener('click', (e) => {
        e.preventDefault();
        openNotificationDrawer();
      });
    }

    const mobileHeaderNotifBtn = document.getElementById('mobileHeaderNotifBtn');
    if (mobileHeaderNotifBtn) {
      mobileHeaderNotifBtn.addEventListener('click', (e) => {
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

    if (closeNotifBtn) closeNotifBtn.addEventListener('click', closeNotificationDrawer);

    if (notificationOverlay) {
      notificationOverlay.addEventListener('click', (e) => {
        if (e.target === notificationOverlay) closeNotificationDrawer();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && notificationOverlay?.classList.contains('active')) {
        closeNotificationDrawer();
      }
    });

    // Filtering Tabs
    notifTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        notifTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filterType = tab.getAttribute('data-notif-filter');
        const items = notifItemsList ? notifItemsList.querySelectorAll('.notif-item') : [];

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

    function setUnreadBadgeCount(count) {
      const safeCount = Math.max(0, count);

      if (notificationBadge) {
        notificationBadge.textContent = safeCount.toString();
        notificationBadge.style.display = safeCount > 0 ? 'flex' : 'none';
      }
      if (bottomNavNotifBadge) {
        bottomNavNotifBadge.textContent = safeCount.toString();
        bottomNavNotifBadge.style.display = safeCount > 0 ? 'inline-flex' : 'none';
      }
      if (unreadCountDisplay) {
        unreadCountDisplay.textContent = safeCount.toString();
      }

      const unreadStatusText = document.getElementById('unreadStatusText');
      if (unreadStatusText) {
        unreadStatusText.innerHTML = safeCount > 0
          ? `Bạn có <strong>${safeCount}</strong> thông báo chưa đọc`
          : `Bạn đã đọc hết tất cả thông báo`;
      }
    }

    function updateUnreadBadgeCount(delta) {
      let current = parseInt(notificationBadge?.textContent || '0', 10);
      setUnreadBadgeCount(current + delta);
    }

    function bindNotificationItems() {
      if (!notifItemsList) return;

      notifItemsList.querySelectorAll('.notif-item').forEach(item => {
        if (item.dataset.clickBound) return;
        item.dataset.clickBound = 'true';

        item.addEventListener('click', () => {
          if (item.classList.contains('unread')) {
            item.classList.remove('unread');
            const dot = item.querySelector('.unread-dot');
            if (dot) dot.remove();
            updateUnreadBadgeCount(-1);

            const notifId = item.getAttribute('data-notif-id');
            if (notifId && window.API && window.API.notifications) {
              window.API.notifications.markAsRead(notifId).catch(() => {});
            }
          }

          // If linked to a post, scroll to it
          const postId = item.getAttribute('data-post-id');
          if (postId) {
            closeNotificationDrawer();
            const targetPost = document.querySelector(`.post-card[data-post-id="${postId}"]`);
            if (targetPost) {
              targetPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetPost.style.boxShadow = '0 0 0 3px #0066FF';
              setTimeout(() => { targetPost.style.boxShadow = ''; }, 2500);
            }
          }
        });
      });
    }

    bindNotificationItems();

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        if (notifItemsList) {
          notifItemsList.querySelectorAll('.notif-item.unread').forEach(item => {
            item.classList.remove('unread');
            const dot = item.querySelector('.unread-dot');
            if (dot) dot.remove();
          });
        }

        setUnreadBadgeCount(0);
        if (window.showToast) window.showToast('Đã đánh dấu đã đọc tất cả thông báo', 'info');

        if (window.API && window.API.notifications) {
          window.API.notifications.markAllAsRead().catch(() => {});
        }
      });
    }

    /**
     * Add notification to drawer & trigger floating banner + chime
     */
    function addRealtimeNotification({
      id = null,
      type = 'user_interaction',
      avatarText = '🔔',
      avatarClass = 'notif-avatar-upvote',
      badgeText = 'Tương tác mới',
      timeText = 'Vừa xong',
      text = '',
      previewText = '',
      postId = null
    }) {
      if (!notifItemsList) return;

      const itemEl = document.createElement('div');
      itemEl.className = 'notif-item unread';
      itemEl.setAttribute('data-type', type);
      if (id) itemEl.setAttribute('data-notif-id', id.toString());
      if (postId) itemEl.setAttribute('data-post-id', postId.toString());

      let tagClass = 'tag-interaction';
      if (type === 'new_post' || type === 'POST') tagClass = 'tag-post';
      if (type === 'new_activity' || type === 'SYSTEM') tagClass = 'tag-activity';

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
        notifTotalCount.textContent = notifItemsList.querySelectorAll('.notif-item').length;
      }

      // Audio feedback
      if (window.playNotificationSound) window.playNotificationSound();

      // Floating top-right banner
      showRealtimeAlert(badgeText, text, postId);
    }

    function showRealtimeAlert(badgeTitle, text, postId = null) {
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
          box-shadow: 0 16px 36px rgba(0, 30, 43, 0.4);
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
        <div style="width: 34px; height: 34px; border-radius: 50%; background: #0066FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 12px rgba(0, 102, 255, 0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: #60A5FA; text-transform: uppercase; letter-spacing: 0.5px;">● Realtime: ${badgeTitle}</div>
          <div style="color: #F8FAFC; margin-top: 3px; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${text.replace(/<[^>]*>?/gm, '')}
          </div>
        </div>
      `;

      alertBox.style.transform = 'translateX(0)';

      setTimeout(() => {
        alertBox.style.transform = 'translateX(120%)';
      }, 5500);
    }

    // Connect to Server-Sent Events (SSE) Stream
    function connectSSEStream() {
      const token = window.getAuthToken ? window.getAuthToken() : '';
      if (!window.EventSource) return;

      const backendUrl = (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL)
        ? window.APP_CONFIG.BACKEND_URL.replace(/\/+$/, '')
        : '';
      const endpoint = token ? `/api/notifications/stream?token=${encodeURIComponent(token)}` : '/api/notifications/stream';
      const url = `${backendUrl}${endpoint}`;

      try {
        if (eventSource) eventSource.close();
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          isConnected = true;
          if (statusTextEl) statusTextEl.textContent = 'Đã kết nối Realtime HUCE';
          if (statusDotEl) {
            statusDotEl.style.backgroundColor = '#10B981';
            statusDotEl.style.boxShadow = '0 0 8px #10B981';
          }
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type) {
              addRealtimeNotification({
                id: data.id,
                type: data.type === 'UPVOTE' || data.type === 'COMMENT' || data.type === 'REPLY' ? 'user_interaction' : (data.type === 'POST' ? 'new_post' : 'new_activity'),
                avatarText: data.avatarText || (data.type === 'UPVOTE' ? '⬆️' : '🔔'),
                avatarClass: data.type === 'UPVOTE' ? 'notif-avatar-upvote' : 'notif-avatar-notice',
                badgeText: data.badgeText || 'Thông báo mới',
                timeText: 'Vừa xong',
                text: data.message || data.text,
                previewText: data.previewText,
                postId: data.postId
              });
            }
          } catch (_) {}
        };

        eventSource.onerror = () => {
          isConnected = false;
          if (statusTextEl) statusTextEl.textContent = 'Chế độ Realtime nội bộ';
          if (statusDotEl) {
            statusDotEl.style.backgroundColor = '#0066FF';
            statusDotEl.style.boxShadow = '0 0 6px #0066FF';
          }
        };
      } catch (err) {
        console.warn('SSE connection skipped:', err);
      }
    }

    // Connect SSE
    connectSSEStream();

    // Simulation Trigger
    function triggerNextSimulation() {
      const scenario = SIMULATION_SCENARIOS[scenarioIndex % SIMULATION_SCENARIOS.length];
      scenarioIndex++;
      addRealtimeNotification(scenario);
    }

    if (btnTestSimulation) {
      btnTestSimulation.addEventListener('click', () => {
        triggerNextSimulation();
        if (window.showToast) window.showToast('Đã nhận thông báo Realtime tương tác', 'info');
      });
    }

    // Background interactive pulse (every 40 seconds)
    setInterval(() => {
      triggerNextSimulation();
    }, 40000);

    // Expose engine to global window
    window.emitNotificationEvent = function (payload) {
      let typeCategory = 'user_interaction';
      if (payload.type === 'new_post' || payload.type === 'POST') typeCategory = 'new_post';
      if (payload.type === 'new_activity' || payload.type === 'SYSTEM') typeCategory = 'new_activity';

      addRealtimeNotification({
        id: payload.id || Date.now(),
        type: typeCategory,
        avatarText: payload.avatarText || '🔔',
        avatarClass: payload.avatarClass || 'notif-avatar-upvote',
        badgeText: payload.badgeText || 'Thông báo',
        timeText: payload.timeText || 'Vừa xong',
        text: payload.text || '',
        previewText: payload.previewText || '',
        postId: payload.postId || null
      });
    };

    window.addRealtimeNotification = addRealtimeNotification;
    window.triggerNextSimulation = triggerNextSimulation;
    window.openNotificationDrawer = openNotificationDrawer;
    window.closeNotificationDrawer = closeNotificationDrawer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotificationsModule);
  } else {
    initNotificationsModule();
  }

  window.initNotificationsModule = initNotificationsModule;
})();
