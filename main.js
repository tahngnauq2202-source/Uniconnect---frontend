document.addEventListener('DOMContentLoaded', () => {

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
            showToast('Đã upvote bài viết (+1)');
          }
        } else {
          control.classList.remove('has-upvoted');
          scoreEl.textContent = initialScore.toString();
          if (typeof showToast === 'function') {
            showToast('Đã hủy upvote bài viết');
          }
        }
      };

      upBtn.addEventListener('click', toggleUpvote);
      control.addEventListener('click', (e) => {
        if (e.target !== upBtn && !upBtn.contains(e.target)) {
          toggleUpvote(e);
        }
      });
    });
  }

  bindVoteControls();

  const openComposerBtn = document.getElementById('openComposerBtn');
  const quickPostTriggerBtn = document.getElementById('quickPostTriggerBtn');
  const createBoxCollapsed = document.getElementById('createBoxCollapsed');
  const postCreateForm = document.getElementById('postCreateForm');
  const closeComposerBtn = document.getElementById('closeComposerBtn');
  const cancelPostBtn = document.getElementById('cancelPostBtn');
  const submitPostBtn = document.getElementById('submitPostBtn');
  const postTitleInput = document.getElementById('postTitleInput');
  const postContentInput = document.getElementById('postContentInput');
  const composerPurposePills = document.getElementById('composerPurposePills');
  const composerTagPills = document.getElementById('composerTagPills');
  const composerTagsLabel = document.getElementById('composerTagsLabel');
  const selectedTagText = document.getElementById('selectedTagText');
  const composerHintBadge = document.getElementById('composerHintBadge');
  const customTagInput = document.getElementById('customTagInput');
  const btnAddCustomTag = document.getElementById('btnAddCustomTag');
  const composerAttachmentsPreview = document.getElementById('composerAttachmentsPreview');
  const fileInputPhoto = document.getElementById('fileInputPhoto');
  const fileInputDoc = document.getElementById('fileInputDoc');
  const btnAttachPhoto = document.getElementById('btnAttachPhoto');
  const btnAttachDoc = document.getElementById('btnAttachDoc');
  const feedList = document.getElementById('feedList');
  const feedCountSummary = document.getElementById('feedCountSummary');

  const PURPOSE_CONFIG = {
    question: {
      category: 'question',
      name: 'Hỏi đáp học thuật',
      label: 'Thẻ môn học & chủ đề câu hỏi:',
      hint: '💡 Giảng viên & Cố vấn học tập sẽ hỗ trợ giải đáp',
      titlePlaceholder: 'Tiêu đề câu hỏi / chia sẻ học thuật (ví dụ: Cách tính độ võng dầm liên tục...)',
      contentPlaceholder: 'Nhập chi tiết câu hỏi, đính kèm thông số bài toán để giảng viên và cộng đồng HUCE hỗ trợ giải đáp...',
      tagClass: 'tag-blue',
      tags: ['#Bê_tông_cốt_thép', '#Cơ_học_kết_cấu', '#Sức_bền_vật_liệu', '#Địa_kỹ_thuật_Nền_móng', '#Kiến_trúc_HUCE', '#CNTT_HUCE', '#Kinh_tế_xây_dựng', '#Hỏi_bài_tập', '#Đồ_án_môn_học', '#Ôn_thi_học_kỳ']
    },
    resource: {
      category: 'share',
      name: 'Chia sẻ tài liệu',
      label: 'Thẻ phân loại tài liệu & chuyên ngành:',
      hint: '📂 Đóng góp vào kho học liệu số UniConnect HUCE',
      titlePlaceholder: 'Tên tài liệu / giáo trình / file mô phỏng chia sẻ (ví dụ: File SAP2000 dầm liên tục 3 nhịp...)',
      contentPlaceholder: 'Mô tả tóm tắt nội dung tài liệu, môn học áp dụng, hướng dẫn sử dụng...',
      tagClass: 'tag-emerald',
      tags: ['#Tài_liệu_PDF', '#File_mẫu_SAP2000', '#Bản_vẽ_AutoCAD', '#Mô_hình_Revit', '#Giáo_trình_HUCE', '#Slide_bài_giảng', '#Đề_thi_đáp_án', '#Kinh_nghiệm_học']
    },
    group: {
      category: 'group',
      name: 'Tìm nhóm đồ án',
      label: 'Thẻ đồ án / nhóm học tập:',
      hint: '🤝 Tìm bạn đồng hành làm đồ án & nghiên cứu khoa học',
      titlePlaceholder: 'Tiêu đề tìm nhóm / ghép đội làm đồ án (ví dụ: Tìm 2 bạn cùng làm đồ án Tốt nghiệp Cầu đường K66...)',
      contentPlaceholder: 'Nêu rõ yêu cầu thành viên, tiến độ dự kiến, giảng viên hướng dẫn hoặc mục tiêu đề tài...',
      tagClass: 'tag-purple',
      tags: ['#Tìm_nhóm_đồ_án', '#Đồ_án_tốt_nghiệp', '#Nghiên_cứu_khoa_học', '#Nhóm_học_tập', '#Đội_thi_Olympic', '#Trao_đổi_học_phần']
    },
    notice: {
      category: 'notice',
      name: 'Thông báo / Sự kiện',
      label: 'Thẻ thông báo, sự kiện & tuyển dụng:',
      hint: '📢 Thông tin được lan tỏa đến toàn thể sinh viên & giảng viên HUCE',
      titlePlaceholder: 'Tiêu đề thông báo / sự kiện CLB / tin tuyển dụng (ví dụ: Workshop BIM trong thiết kế công trình...)',
      contentPlaceholder: 'Chi tiết thời gian, địa điểm, nội dung sự kiện, đối tượng tham gia hoặc quyền lợi ứng tuyển...',
      tagClass: 'tag-amber',
      tags: ['#Thông_báo_học_vụ', '#Đăng_ký_tín_chỉ', '#Tuyển_thực_tập', '#Việc_làm_kỹ_sư', '#Sự_kiện_CLB', '#Workshop_chuyên_đề', '#Đồ_thất_lạc']
    }
  };

  let currentPurpose = 'question';
  let selectedTag = '#Bê_tông_cốt_thép';
  let attachedFiles = [];

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('uniconnect_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.fullName) {
          const names = u.fullName.trim().split(/\s+/);
          const initials = names.length >= 2 ? (names[names.length - 2][0] + names[names.length - 1][0]).toUpperCase() : u.fullName.slice(0, 2).toUpperCase();
          return {
            fullName: u.fullName,
            role: u.role === 'lecturer' ? 'Giảng viên HUCE' : 'Sinh viên K21 • Khoa Xây dựng HUCE',
            avatar: initials,
            colorClass: u.role === 'lecturer' ? 'author-purple' : 'author-blue'
          };
        }
      }
    } catch (_) {}
    return { fullName: 'Linh Nguyễn', role: 'Sinh viên K21 • Khoa Xây dựng HUCE', avatar: 'LN', colorClass: 'author-blue' };
  }

  function syncAuthorUI() {
    const user = getCurrentUser();
    const composerAvatar = document.getElementById('composerAvatar');
    const collapsedUserAvatar = document.getElementById('collapsedUserAvatar');
    const composerAuthorName = document.getElementById('composerAuthorName');
    const composerAuthorSub = document.getElementById('composerAuthorSub');
    if (composerAvatar) composerAvatar.textContent = user.avatar;
    if (collapsedUserAvatar) collapsedUserAvatar.textContent = user.avatar;
    if (composerAuthorName) composerAuthorName.textContent = user.fullName;
    if (composerAuthorSub) composerAuthorSub.textContent = user.role;
  }
  syncAuthorUI();

  function expandComposer() {
    if (createBoxCollapsed) createBoxCollapsed.style.display = 'none';
    if (postCreateForm) postCreateForm.style.display = 'flex';
    syncAuthorUI();
    if (postTitleInput) setTimeout(() => postTitleInput.focus(), 100);
  }

  function collapseComposer() {
    if (postCreateForm) postCreateForm.style.display = 'none';
    if (createBoxCollapsed) createBoxCollapsed.style.display = 'flex';
    if (postTitleInput) postTitleInput.value = '';
    if (postContentInput) postContentInput.value = '';
    if (customTagInput) customTagInput.value = '';
    attachedFiles = [];
    renderAttachmentsPreview();
    setPurpose('question');
  }

  window.expandComposer = expandComposer;
  window.collapseComposer = collapseComposer;

  if (openComposerBtn) openComposerBtn.addEventListener('click', expandComposer);
  if (quickPostTriggerBtn) quickPostTriggerBtn.addEventListener('click', expandComposer);
  if (closeComposerBtn) closeComposerBtn.addEventListener('click', collapseComposer);
  if (cancelPostBtn) cancelPostBtn.addEventListener('click', collapseComposer);

  function renderTags(tagsList, activeTag) {
    if (!composerTagPills) return;
    composerTagPills.innerHTML = '';
    tagsList.forEach((tag, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tag-select-btn';
      btn.setAttribute('data-tag', tag);
      btn.textContent = tag;
      const isCurrentActive = activeTag ? (tag === activeTag) : (idx === 0);
      if (isCurrentActive) {
        btn.classList.add('active');
        selectedTag = tag;
        if (selectedTagText) selectedTagText.textContent = tag;
      }
      btn.addEventListener('click', () => {
        composerTagPills.querySelectorAll('.tag-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTag = tag;
        if (selectedTagText) selectedTagText.textContent = tag;
      });
      composerTagPills.appendChild(btn);
    });
  }

  function setPurpose(purposeKey) {
    const config = PURPOSE_CONFIG[purposeKey];
    if (!config) return;
    currentPurpose = purposeKey;
    if (composerPurposePills) {
      composerPurposePills.querySelectorAll('.purpose-select-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-purpose') === purposeKey);
      });
    }
    if (composerTagsLabel) composerTagsLabel.textContent = config.label;
    if (composerHintBadge) composerHintBadge.textContent = config.hint;
    if (postTitleInput) postTitleInput.placeholder = config.titlePlaceholder;
    if (postContentInput) postContentInput.placeholder = config.contentPlaceholder;
    renderTags(config.tags, config.tags[0]);
  }

  if (composerPurposePills) {
    composerPurposePills.querySelectorAll('.purpose-select-btn').forEach(btn => {
      btn.addEventListener('click', () => setPurpose(btn.getAttribute('data-purpose')));
    });
  }

  function addCustomTag() {
    if (!customTagInput) return;
    let val = customTagInput.value.trim();
    if (!val) return;
    if (!val.startsWith('#')) val = '#' + val;
    val = val.replace(/\s+/g, '_');
    if (val.length < 2) return;

    if (composerTagPills) {
      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'tag-select-btn active';
      newBtn.setAttribute('data-tag', val);
      newBtn.textContent = val;
      newBtn.addEventListener('click', () => {
        composerTagPills.querySelectorAll('.tag-select-btn').forEach(b => b.classList.remove('active'));
        newBtn.classList.add('active');
        selectedTag = val;
        if (selectedTagText) selectedTagText.textContent = val;
      });
      composerTagPills.querySelectorAll('.tag-select-btn').forEach(b => b.classList.remove('active'));
      composerTagPills.insertBefore(newBtn, composerTagPills.firstChild);
      selectedTag = val;
      if (selectedTagText) selectedTagText.textContent = val;
      showToast(`Đã thêm thẻ mới: ${val}`);
    }
    customTagInput.value = '';
  }

  if (btnAddCustomTag) btnAddCustomTag.addEventListener('click', addCustomTag);
  if (customTagInput) {
    customTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTag();
      }
    });
  }

  function renderAttachmentsPreview() {
    if (!composerAttachmentsPreview) return;
    if (attachedFiles.length === 0) {
      composerAttachmentsPreview.style.display = 'none';
      composerAttachmentsPreview.innerHTML = '';
      return;
    }
    composerAttachmentsPreview.style.display = 'flex';
    composerAttachmentsPreview.innerHTML = '';
    attachedFiles.forEach((file, index) => {
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.innerHTML = `
        <span class="attachment-chip-icon">${file.type === 'image' ? '📷' : '📄'}</span>
        <div class="attachment-chip-info">
          <span class="attachment-chip-name">${file.name}</span>
          <span class="attachment-chip-size">(${file.size})</span>
        </div>
        <button type="button" class="attachment-chip-remove" data-index="${index}">&times;</button>
      `;
      chip.querySelector('.attachment-chip-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        attachedFiles.splice(index, 1);
        renderAttachmentsPreview();
      });
      composerAttachmentsPreview.appendChild(chip);
    });
  }

  if (btnAttachPhoto) {
    btnAttachPhoto.addEventListener('click', () => {
      if (fileInputPhoto) fileInputPhoto.click();
      else {
        attachedFiles.push({ type: 'image', name: 'so-do-tinh-dam.png', size: '1.4 MB' });
        renderAttachmentsPreview();
        showToast('Đã chọn tệp ảnh sơ đồ kết cấu dầm (so-do-tinh-dam.png)');
      }
    });
  }

  if (fileInputPhoto) {
    fileInputPhoto.addEventListener('change', (e) => {
      const f = (e.target.files || [])[0];
      if (f) attachedFiles.push({ type: 'image', name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
      else attachedFiles.push({ type: 'image', name: 'so-do-tinh-dam.png', size: '1.4 MB' });
      renderAttachmentsPreview();
      fileInputPhoto.value = '';
    });
  }

  if (btnAttachDoc) {
    btnAttachDoc.addEventListener('click', () => {
      if (fileInputDoc) fileInputDoc.click();
      else {
        attachedFiles.push({ type: 'doc', name: 'thuyet-minh.pdf', size: '3.8 MB' });
        renderAttachmentsPreview();
        showToast('Đã đính kèm tài liệu học thuật (thuyet-minh.pdf)');
      }
    });
  }

  if (fileInputDoc) {
    fileInputDoc.addEventListener('change', (e) => {
      const f = (e.target.files || [])[0];
      if (f) attachedFiles.push({ type: 'doc', name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
      else attachedFiles.push({ type: 'doc', name: 'thuyet-minh.pdf', size: '3.8 MB' });
      renderAttachmentsPreview();
      fileInputDoc.value = '';
    });
  }

  if (postCreateForm) {
    postCreateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = postTitleInput.value.trim();
      const content = postContentInput.value.trim();

      if (!title || !content) return;

      const config = PURPOSE_CONFIG[currentPurpose] || PURPOSE_CONFIG.question;
      const user = getCurrentUser();

      const newPostEl = document.createElement('article');
      newPostEl.className = 'post-card new-post-highlight';
      newPostEl.setAttribute('data-category', config.category);
      newPostEl.setAttribute('data-score', '1');
      newPostEl.setAttribute('data-timestamp', Date.now().toString());
      newPostEl.setAttribute('data-comments', '0');

      newPostEl.innerHTML = `
        <div class="post-card-header">
          <div class="post-author-box">
            <div class="author-circle ${user.colorClass}">${user.avatar}</div>
            <div class="author-info-group">
              <span class="author-heading">${user.fullName}</span>
              <span class="author-subtext">${user.role} • Vừa xong</span>
            </div>
          </div>
          <span class="post-tag ${config.tagClass}">${selectedTag}</span>
        </div>

        <h2 class="post-heading-title">${escapeHtml(title)}</h2>
        <p class="post-content-body">${escapeHtml(content)}</p>

        <div class="post-action-bar">
          <div class="left-vote-group">
            <div class="vote-control has-upvoted">
              <button class="vote-btn vote-btn-up" title="Upvote">
                <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </button>
              <span class="vote-score" data-score="1">1</span>
            </div>

            <button class="action-text-btn btn-comment-post">
              <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>0 bình luận</span>
            </button>
          </div>

          <button class="action-text-btn btn-share-post" title="Chia sẻ liên kết">
            <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Chia sẻ</span>
          </button>
        </div>
      `;

      feedList.insertBefore(newPostEl, feedList.firstChild);
      bindVoteControls(newPostEl);

      if (feedCountSummary) {
        feedCountSummary.textContent = `${feedList.querySelectorAll('.post-card').length} bài viết`;
      }

      newPostEl.querySelector('.btn-share-post')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        navigator.clipboard?.writeText(window.location.href);
        showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm');
      });

      setTimeout(() => {
        if (typeof addRealtimeNotification === 'function') {
          addRealtimeNotification({
            type: 'new_post',
            avatarText: user.avatar,
            avatarClass: 'notif-avatar-upvote',
            badgeText: 'Bài viết của bạn',
            timeText: 'Vừa xong',
            text: `<strong>Bài viết của bạn</strong> [${safeTitle}] đã được đăng lên Bảng tin HUCE thành công.`
          });
        }
      }, 1500);

      collapseComposer();
      showToast(`🎉 Đã đăng bài viết [${config.name}] thành công lên Bảng tin HUCE!`);
      newPostEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  setPurpose('question');

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const sortBtns = document.querySelectorAll('.sort-btn');

  sortBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const sortType = btn.getAttribute('data-sort');
      const posts = Array.from(feedList.querySelectorAll('.post-card'));

      if (sortType === 'newest') {
        posts.sort((a, b) => parseInt(b.dataset.timestamp || 0, 10) - parseInt(a.dataset.timestamp || 0, 10));
        showToast('Đang hiển thị bài viết mới nhất');
      } else if (sortType === 'rising') {
        posts.sort((a, b) => parseInt(b.dataset.comments || 0, 10) - parseInt(a.dataset.comments || 0, 10));
        showToast('Đang hiển thị bài viết đang lên');
      } else {
        posts.sort((a, b) => parseInt(b.dataset.score || 0, 10) - parseInt(a.dataset.score || 0, 10));
        showToast('Đang hiển thị bài viết nổi bật');
      }

      posts.forEach(post => feedList.appendChild(post));
    });
  });

  const searchInput = document.getElementById('feedSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const posts = document.querySelectorAll('.post-card');

      posts.forEach(post => {
        const title = (post.querySelector('.post-heading-title')?.textContent || '').toLowerCase();
        const content = (post.querySelector('.post-content-body')?.textContent || '').toLowerCase();
        const tag = (post.querySelector('.post-tag')?.textContent || '').toLowerCase();

        if (title.includes(query) || content.includes(query) || tag.includes(query)) {
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
      }
    });
  }

  const sidebarNotificationBtn = document.getElementById('sidebarNotificationBtn');
  const notificationOverlay = document.getElementById('notificationOverlay');
  const notificationDrawer = document.getElementById('notificationDrawer');
  const closeNotifBtn = document.getElementById('closeNotifBtn');
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const notificationBadge = document.getElementById('notificationBadge');
  const unreadCountDisplay = document.getElementById('unreadCountDisplay');
  const notifTotalCount = document.getElementById('notifTotalCount');
  const notifItemsList = document.getElementById('notifItemsList');
  const notifTabs = document.querySelectorAll('.notif-tab');

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

  if (closeNotifBtn) {
    closeNotifBtn.addEventListener('click', closeNotificationDrawer);
  }

  if (notificationOverlay) {
    notificationOverlay.addEventListener('click', (e) => {
      if (e.target === notificationOverlay) {
        closeNotificationDrawer();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationOverlay?.classList.contains('active')) {
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
      showToast('Đã đánh dấu đã đọc tất cả thông báo');
    });
  }

  function updateUnreadBadgeCount(delta) {
    let current = parseInt(notificationBadge?.textContent || '0', 10);
    let next = Math.max(0, current + delta);
    setUnreadBadgeCount(next);
  }

  function setUnreadBadgeCount(count) {
    if (notificationBadge) {
      notificationBadge.textContent = count;
      notificationBadge.style.display = count > 0 ? 'flex' : 'none';
    }
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

  const btnTestSimulation = document.getElementById('btnTestSimulation');
  if (btnTestSimulation) {
    btnTestSimulation.addEventListener('click', () => {
      triggerNextSimulation();
      showToast('Đã nhận thông báo Realtime thử nghiệm');
    });
  }

  setInterval(() => {
    triggerNextSimulation();
  }, 24000);

  document.querySelectorAll('.btn-share-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(window.location.href);
      showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm');
    });
  });

  document.querySelectorAll('.btn-comment-post').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('Mở khung thảo luận học thuật chi tiết');
    });
  });

  const msgLecturerBtn = document.getElementById('msgLecturerBtn');
  if (msgLecturerBtn) {
    msgLecturerBtn.addEventListener('click', () => {
      showToast('Đang kết nối tin nhắn trực tiếp với Giảng viên HUCE...');
    });
  }

  function showToast(message) {
    let toast = document.getElementById('feedToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'feedToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #001E2B;
        color: #FFFFFF;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 600;
        border-left: 4px solid #0066FF;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 16 12 12 12 8"></polyline>
      </svg>
      <span>${message}</span>
    `;

    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3200);
  }

  window.showToast = showToast;
  window.triggerNextSimulation = triggerNextSimulation;
});
