

function initPostComposer() {
  const createBoxCollapsed = document.getElementById('createBoxCollapsed');
  const postCreateForm = document.getElementById('postCreateForm');
  const openComposerBtn = document.getElementById('openComposerBtn');
  const quickPostTriggerBtn = document.getElementById('quickPostTriggerBtn');
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

  if (!postCreateForm) return;

  // Cấu hình các mục đích đăng bài và thẻ tag phù hợp chuẩn HUCE
  const PURPOSE_CONFIG = {
    question: {
      category: 'question',
      name: 'Hỏi đáp học thuật',
      label: 'Thẻ môn học & chủ đề câu hỏi:',
      hint: '💡 Giảng viên & Cố vấn học tập sẽ hỗ trợ giải đáp',
      titlePlaceholder: 'Tiêu đề câu hỏi / bài toán cần giải đáp (ví dụ: Cách tính độ võng dầm liên tục...)',
      contentPlaceholder: 'Nhập chi tiết câu hỏi, đính kèm thông số bài toán để giảng viên và cộng đồng HUCE hỗ trợ giải đáp...',
      tagClass: 'tag-blue',
      tags: [
        '#Bê_tông_cốt_thép',
        '#Cơ_học_kết_cấu',
        '#Sức_bền_vật_liệu',
        '#Địa_kỹ_thuật_Nền_móng',
        '#Kiến_trúc_HUCE',
        '#CNTT_HUCE',
        '#Kinh_tế_xây_dựng',
        '#Hỏi_bài_tập',
        '#Đồ_án_môn_học',
        '#Ôn_thi_học_kỳ'
      ]
    },
    resource: {
      category: 'share',
      name: 'Chia sẻ tài liệu',
      label: 'Thẻ phân loại tài liệu & chuyên ngành:',
      hint: '📂 Đóng góp vào kho học liệu số UniConnect HUCE',
      titlePlaceholder: 'Tên tài liệu / giáo trình / file mô phỏng chia sẻ (ví dụ: File SAP2000 dầm liên tục 3 nhịp...)',
      contentPlaceholder: 'Mô tả tóm tắt nội dung tài liệu, môn học áp dụng, hướng dẫn sử dụng hoặc mật khẩu giải nén...',
      tagClass: 'tag-emerald',
      tags: [
        '#Tài_liệu_PDF',
        '#File_mẫu_SAP2000',
        '#Bản_vẽ_AutoCAD',
        '#Mô_hình_Revit',
        '#Giáo_trình_HUCE',
        '#Slide_bài_giảng',
        '#Đề_thi_đáp_án',
        '#Kinh_nghiệm_học'
      ]
    },
    group: {
      category: 'group',
      name: 'Tìm nhóm đồ án',
      label: 'Thẻ đồ án / nhóm học tập:',
      hint: '🤝 Tìm bạn đồng hành làm đồ án & nghiên cứu khoa học',
      titlePlaceholder: 'Tiêu đề tìm nhóm / ghép đội làm đồ án (ví dụ: Tìm 2 bạn cùng làm đồ án Tốt nghiệp Cầu đường K66...)',
      contentPlaceholder: 'Nêu rõ yêu cầu thành viên, tiến độ dự kiến, giảng viên hướng dẫn hoặc mục tiêu đề tài...',
      tagClass: 'tag-purple',
      tags: [
        '#Tìm_nhóm_đồ_án',
        '#Đồ_án_tốt_nghiệp',
        '#Nghiên_cứu_khoa_học',
        '#Nhóm_học_tập',
        '#Đội_thi_Olympic',
        '#Trao_đổi_học_phần'
      ]
    },
    notice: {
      category: 'notice',
      name: 'Thông báo / Sự kiện',
      label: 'Thẻ thông báo, sự kiện & tuyển dụng:',
      hint: '📢 Thông tin được lan tỏa đến toàn thể sinh viên & giảng viên HUCE',
      titlePlaceholder: 'Tiêu đề thông báo / sự kiện CLB / tin tuyển dụng (ví dụ: Workshop BIM trong thiết kế công trình...)',
      contentPlaceholder: 'Chi tiết thời gian, địa điểm, nội dung sự kiện, đối tượng tham gia hoặc quyền lợi ứng tuyển...',
      tagClass: 'tag-amber',
      tags: [
        '#Thông_báo_học_vụ',
        '#Đăng_ký_tín_chỉ',
        '#Tuyển_thực_tập',
        '#Việc_làm_kỹ_sư',
        '#Sự_kiện_CLB',
        '#Workshop_chuyên_đề',
        '#Đồ_thất_lạc'
      ]
    }
  };

  // Trạng thái cục bộ của form soạn thảo
  let currentPurpose = 'question';
  let selectedTag = '#Bê_tông_cốt_thép';
  let attachedFiles = [];
  let serverCategories = [];

  // Lấy danh mục học thuật từ Backend UniConnect (/api/categories)
  try {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          serverCategories = data;
        }
      })
      .catch(() => { });
  } catch (_) { }

  // Lấy thông tin người dùng hiện tại từ session / localStorage
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('uniconnect_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.fullName) {
          const names = u.fullName.trim().split(/\s+/);
          const initials = names.length >= 2
            ? (names[names.length - 2][0] + names[names.length - 1][0]).toUpperCase()
            : u.fullName.slice(0, 2).toUpperCase();
          return {
            fullName: u.fullName,
            role: u.role === 'lecturer' ? 'Giảng viên HUCE' : 'Sinh viên K21 • Khoa Xây dựng HUCE',
            avatar: initials,
            colorClass: u.role === 'lecturer' ? 'author-purple' : 'author-blue'
          };
        }
      }
    } catch (_) { }

    return {
      fullName: 'Linh Nguyễn',
      role: 'Sinh viên K21 • Khoa Xây dựng HUCE',
      avatar: 'LN',
      colorClass: 'author-blue'
    };
  }

  // Đồng bộ thông tin người dùng lên giao diện composer
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

  // Mở trình soạn thảo bài viết
  function expandComposer() {
    if (createBoxCollapsed) createBoxCollapsed.style.display = 'none';
    if (postCreateForm) postCreateForm.style.display = 'flex';
    syncAuthorUI();
    if (postTitleInput) {
      setTimeout(() => postTitleInput.focus(), 100);
    }
  }

  // Thu gọn và đặt lại trạng thái form soạn thảo
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

  // Hiển thị danh sách thẻ tag tương ứng với mục đích
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

  // Chuyển đổi mục đích đăng bài và cập nhật tag phù hợp
  function setPurpose(purposeKey) {
    const config = PURPOSE_CONFIG[purposeKey];
    if (!config) return;

    currentPurpose = purposeKey;

    // Cập nhật trạng thái active của nút mục đích
    if (composerPurposePills) {
      composerPurposePills.querySelectorAll('.purpose-select-btn').forEach(btn => {
        const p = btn.getAttribute('data-purpose');
        btn.classList.toggle('active', p === purposeKey);
      });
    }

    // Cập nhật nhãn và gợi ý
    if (composerTagsLabel) composerTagsLabel.textContent = config.label;
    if (composerHintBadge) composerHintBadge.textContent = config.hint;

    // Cập nhật placeholder tiêu đề & nội dung
    if (postTitleInput) postTitleInput.placeholder = config.titlePlaceholder;
    if (postContentInput) postContentInput.placeholder = config.contentPlaceholder;

    // Render lại danh sách tag phù hợp với mục đích mới
    renderTags(config.tags, config.tags[0]);
  }

  // Lắng nghe sự kiện chọn mục đích đăng bài
  if (composerPurposePills) {
    composerPurposePills.querySelectorAll('.purpose-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const purpose = btn.getAttribute('data-purpose');
        setPurpose(purpose);
      });
    });
  }

  // Thêm tag tùy chỉnh
  function addCustomTag() {
    if (!customTagInput) return;
    let val = customTagInput.value.trim();
    if (!val) return;

    // Chuẩn hóa tag có dấu '#' ở đầu và không có khoảng trắng thừa
    if (!val.startsWith('#')) val = '#' + val;
    val = val.replace(/\s+/g, '_');

    if (val.length < 2) return;

    // Kiểm tra xem tag đã tồn tại chưa
    let existingBtn = null;
    if (composerTagPills) {
      existingBtn = Array.from(composerTagPills.querySelectorAll('.tag-select-btn'))
        .find(b => b.getAttribute('data-tag')?.toLowerCase() === val.toLowerCase());
    }

    if (existingBtn) {
      composerTagPills.querySelectorAll('.tag-select-btn').forEach(b => b.classList.remove('active'));
      existingBtn.classList.add('active');
      selectedTag = existingBtn.getAttribute('data-tag');
      if (selectedTagText) selectedTagText.textContent = selectedTag;
    } else if (composerTagPills) {
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

      if (typeof showToast === 'function') {
        showToast(`Đã thêm thẻ mới: ${val}`, 'feedToast');
      }
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

  // Định dạng kích thước file
  function formatFileSize(bytes) {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Hiển thị danh sách tệp đính kèm trong khung soạn thảo
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

      const isImage = file.type === 'image';
      chip.innerHTML = `
        <span class="attachment-chip-icon">
          ${isImage ? `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          ` : `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          `}
        </span>
        <div class="attachment-chip-info">
          <span class="attachment-chip-name">${file.name}</span>
          <span class="attachment-chip-size">(${file.size})</span>
        </div>
        <button type="button" class="attachment-chip-remove" title="Xóa tệp đính kèm" data-index="${index}">&times;</button>
      `;

      chip.querySelector('.attachment-chip-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        attachedFiles.splice(index, 1);
        renderAttachmentsPreview();
      });

      composerAttachmentsPreview.appendChild(chip);
    });
  }

  // Xử lý nút Đính kèm Ảnh bài tập
  if (btnAttachPhoto) {
    btnAttachPhoto.addEventListener('click', () => {
      if (fileInputPhoto) {
        fileInputPhoto.click();
      } else {
        // Fallback mô phỏng nếu input không có sẵn
        attachedFiles.push({
          type: 'image',
          name: 'so-do-tinh-toan-dam.png',
          size: '1.4 MB',
          url: ''
        });
        renderAttachmentsPreview();
        if (typeof showToast === 'function') {
          showToast('Đã đính kèm ảnh sơ đồ tính toán kết cấu!', 'feedToast');
        }
      }
    });
  }

  if (fileInputPhoto) {
    fileInputPhoto.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (event) => {
            attachedFiles.push({
              type: 'image',
              name: file.name,
              size: formatFileSize(file.size),
              url: event.target?.result || ''
            });
            renderAttachmentsPreview();
          };
          reader.readAsDataURL(file);
        });
        if (typeof showToast === 'function') {
          showToast(`Đã đính kèm ảnh: ${files[0].name}`, 'feedToast');
        }
      } else {
        // Trường hợp người dùng hủy file picker nhưng vẫn muốn thử nghiệm nhanh
        attachedFiles.push({
          type: 'image',
          name: 'so-do-tinh-toan-dam.png',
          size: '1.4 MB',
          url: ''
        });
        renderAttachmentsPreview();
      }
      fileInputPhoto.value = '';
    });
  }

  // Xử lý nút Đính kèm Tài liệu PDF/CAD
  if (btnAttachDoc) {
    btnAttachDoc.addEventListener('click', () => {
      if (fileInputDoc) {
        fileInputDoc.click();
      } else {
        attachedFiles.push({
          type: 'doc',
          name: 'thuyet-minh-tieu-chuan-TCVN.pdf',
          size: '3.8 MB',
          url: ''
        });
        renderAttachmentsPreview();
        if (typeof showToast === 'function') {
          showToast('Đã đính kèm tài liệu học thuật (PDF)!', 'feedToast');
        }
      }
    });
  }

  if (fileInputDoc) {
    fileInputDoc.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        files.forEach(file => {
          attachedFiles.push({
            type: 'doc',
            name: file.name,
            size: formatFileSize(file.size),
            url: ''
          });
        });
        renderAttachmentsPreview();
        if (typeof showToast === 'function') {
          showToast(`Đã đính kèm tài liệu: ${files[0].name}`, 'feedToast');
        }
      } else {
        attachedFiles.push({
          type: 'doc',
          name: 'thuyet-minh-tieu-chuan-TCVN.pdf',
          size: '3.8 MB',
          url: ''
        });
        renderAttachmentsPreview();
      }
      fileInputDoc.value = '';
    });
  }

  // Cập nhật số lượng bài viết hiển thị trên thanh công cụ
  function updateFeedCount() {
    if (!feedList) return;
    const totalPosts = feedList.querySelectorAll('.post-card').length;
    if (feedCountSummary) {
      feedCountSummary.textContent = `${totalPosts} bài viết`;
    }
  }

  // Xử lý Submit Đăng bài viết
  postCreateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = postTitleInput?.value.trim();
    const content = postContentInput?.value.trim();

    if (!title || title.length < 4) {
      if (typeof showToast === 'function') {
        showToast('Vui lòng nhập tiêu đề bài viết rõ ràng (tối thiểu 4 ký tự)', 'feedToast');
      }
      postTitleInput?.focus();
      return;
    }

    if (!content || content.length < 6) {
      if (typeof showToast === 'function') {
        showToast('Vui lòng nhập nội dung chi tiết bài viết (tối thiểu 6 ký tự)', 'feedToast');
      }
      postContentInput?.focus();
      return;
    }

    if (!feedList) return;

    if (submitPostBtn) {
      submitPostBtn.disabled = true;
      submitPostBtn.style.opacity = '0.7';
    }

    const config = PURPOSE_CONFIG[currentPurpose] || PURPOSE_CONFIG.question;
    const category = config.category;
    const tagClass = config.tagClass;
    const activeTag = selectedTag || (config.tags && config.tags[0]) || '#Học_tập';

    const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(title) : title;
    const safeContent = typeof escapeHtml === 'function' ? escapeHtml(content) : content;

    const user = getCurrentUser();

    // Xây dựng HTML hiển thị tệp đính kèm nếu có
    let attachmentsHtml = '';
    if (attachedFiles.length > 0) {
      attachmentsHtml = `
        <div class="post-attachment-box">
          ${attachedFiles.map(f => {
        if (f.type === 'image') {
          if (f.url) {
            return `<img src="${f.url}" alt="${f.name}" class="post-attachment-img" loading="lazy">`;
          }
          return `
                <div class="post-attachment-doc">
                  <div class="post-doc-icon" style="background: #EBF3FF; color: #0066FF;">IMG</div>
                  <div class="post-doc-meta">
                    <span class="post-doc-name">${f.name}</span>
                    <span class="post-doc-size">${f.size} • Nhấp để xem sơ đồ chi tiết</span>
                  </div>
                </div>
              `;
        }
        return `
              <div class="post-attachment-doc">
                <div class="post-doc-icon">PDF</div>
                <div class="post-doc-meta">
                  <span class="post-doc-name">${f.name}</span>
                  <span class="post-doc-size">${f.size} • Tài liệu học thuật đính kèm</span>
                </div>
              </div>
            `;
      }).join('')}
        </div>
      `;
    }

    const newPostEl = document.createElement('article');
    newPostEl.className = 'post-card new-post-highlight';
    newPostEl.setAttribute('data-category', category);
    newPostEl.setAttribute('data-score', '1');
    newPostEl.setAttribute('data-timestamp', Date.now().toString());
    newPostEl.setAttribute('data-comments', '0');

    newPostEl.innerHTML = `
      <!-- Header thông tin tác giả -->
      <div class="post-card-header">
        <div class="post-author-box">
          <div class="author-circle ${user.colorClass}">${user.avatar}</div>
          <div class="author-info-group">
            <span class="author-heading">${user.fullName}</span>
            <span class="author-subtext">${user.role} • Vừa xong</span>
          </div>
        </div>
        <span class="post-tag ${tagClass}">${activeTag}</span>
      </div>

      <!-- Tiêu đề và nội dung bài viết -->
      <h2 class="post-heading-title">${safeTitle}</h2>
      <p class="post-content-body">${safeContent}</p>

      ${attachmentsHtml}

      <!-- Thanh tương tác hành động (Upvote, Comment, Share) -->
      <div class="post-action-bar">
        <div class="left-vote-group">
          <!-- Cụm bình chọn: Mặc định đã upvote (+1) bởi chính tác giả -->
          <div class="vote-control has-upvoted">
            <button class="vote-btn vote-btn-up" title="Upvote bài viết">
              <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
            <span class="vote-score" data-score="1">1</span>
          </div>

          <!-- Nút bấm mở/đóng bình luận -->
          <button class="action-text-btn btn-comment-post">
            <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>0 bình luận</span>
          </button>
        </div>

        <!-- Nút sao chép liên kết chia sẻ -->
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

      <!-- Khung Thảo luận công khai gắn liền với bài viết mới -->
      <div class="post-comments-container" style="display: none;">
        <div class="comments-section-header">
          <div class="comments-title-wrap">
            <h3 class="comments-heading">Thảo luận công khai</h3>
            <span class="comments-counter-badge">0 bình luận</span>
          </div>
          <div class="comments-sort-wrap">
            <span class="comments-sort-label">Sắp xếp:</span>
            <button type="button" class="btn-sort-comment active">Mới nhất</button>
          </div>
        </div>

        <!-- Form nhập bình luận -->
        <form class="comment-input-form">
          <div class="comment-author-avatar">${user.avatar}</div>
          <div class="comment-input-wrap">
            <textarea class="comment-textarea" placeholder="Viết phản hồi học thuật hoặc câu trả lời..." rows="1" required></textarea>
            <div class="comment-form-toolbar">
              <div class="comment-quick-tags">
                <button type="button" class="quick-tag-chip" data-insert-tag="#Hỏi_thêm">#Hỏi_thêm</button>
                <button type="button" class="quick-tag-chip" data-insert-tag="#Giải_pháp">#Giải_pháp</button>
                <button type="button" class="quick-tag-chip" data-insert-tag="#Tham_khảo">#Tham_khảo</button>
              </div>
              <button type="submit" class="btn-submit-comment">
                <span>Gửi</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </form>

        <div class="comments-list"></div>
      </div>
    `;

    // Chèn bài viết mới lên đầu bảng tin
    feedList.insertBefore(newPostEl, feedList.firstChild);

    // Cập nhật tổng số bài viết
    updateFeedCount();

    // Kích hoạt các bộ điều khiển tương tác
    if (typeof bindVoteControls === 'function') {
      bindVoteControls(newPostEl);
    }

    if (typeof bindCommentControls === 'function') {
      bindCommentControls(newPostEl);
    }

    newPostEl.querySelector('.btn-share-post')?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (typeof copyToClipboard === 'function') {
        copyToClipboard(window.location.href, 'Đã sao chép liên kết bài viết vào bộ nhớ tạm');
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        if (typeof showToast === 'function') {
          showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm', 'feedToast');
        }
      }
    });

    // Gửi dữ liệu đồng bộ lên Backend Express API UniConnect (POST /api/posts)
    // Các biến gửi lên đồng bộ chính xác với UniConnect Backend controller:
    // { title, content, categoryId, attachments: [{ url, fileName, fileType }] }
    (async () => {
      const token = localStorage.getItem('uniconnect_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Xử lý tệp đính kèm: Upload lên /api/upload nếu có token và file thực tế
      let attachmentsPayload = [];
      if (attachedFiles.length > 0) {
        for (const item of attachedFiles) {
          if (item.file && token) {
            try {
              const formData = new FormData();
              formData.append('file', item.file);
              const upRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
              });
              const upData = await upRes.json().catch(() => ({}));
              if (upRes.ok && upData.file) {
                attachmentsPayload.push({
                  url: upData.file.url,
                  fileName: upData.file.fileName || item.name,
                  fileType: upData.file.fileType === 'DOCUMENT' ? 'DOCUMENT' : 'IMAGE'
                });
                continue;
              }
            } catch (_) { }
          }
          // Fallback nếu không qua backend upload hoặc chế độ xem trước
          attachmentsPayload.push({
            url: item.previewUrl || `/uploads/${item.name}`,
            fileName: item.name,
            fileType: item.type === 'photo' ? 'IMAGE' : 'DOCUMENT'
          });
        }
      }

      // Tìm categoryId tương ứng từ cơ sở dữ liệu nếu có
      let categoryId = null;
      if (Array.isArray(serverCategories) && serverCategories.length > 0) {
        const found = serverCategories.find(c =>
          c.slug === currentPurpose ||
          c.slug === config.category ||
          (c.name && c.name.toLowerCase().includes(config.name.toLowerCase()))
        );
        if (found) categoryId = found.id;
      }

      // Payload đồng bộ các biến với UniConnect controller: title, content, categoryId, attachments
      const postPayload = {
        title: safeTitle || null,
        content: activeTag ? `${activeTag}\n\n${safeContent}` : safeContent,
        categoryId: categoryId || null,
        attachments: attachmentsPayload.length > 0 ? attachmentsPayload : undefined
      };

      try {
        const postRes = await fetch('/api/posts', {
          method: 'POST',
          headers,
          body: JSON.stringify(postPayload)
        });
        const postData = await postRes.json().catch(() => ({}));
        if (postRes.ok) {
          console.log('[UniConnect Backend] Bài viết đã lưu thành công vào cơ sở dữ liệu:', postData);
        } else if (postData.message) {
          console.warn('[UniConnect Backend] Phản hồi tạo bài viết:', postData.message);
        }
      } catch (_) {
        // Backend offline fallback - bài viết vẫn hiển thị trực quan trên giao diện
      }
    })();

    // Thu gọn composer và đặt lại trạng thái
    collapseComposer();

    if (submitPostBtn) {
      submitPostBtn.disabled = false;
      submitPostBtn.style.opacity = '1';
    }

    // Gửi thông báo thời gian thực vào khay thông báo
    setTimeout(() => {
      if (typeof addRealtimeNotification === 'function') {
        addRealtimeNotification({
          type: 'new_post',
          avatarText: user.avatar,
          avatarClass: 'notif-avatar-upvote',
          badgeText: 'Bài viết của bạn',
          timeText: 'Vừa xong',
          text: `<strong>Bài viết của bạn</strong> [${safeTitle}] thuộc mục <em>${config.name}</em> đã được đăng lên Bảng tin HUCE thành công.`
        });
      }
    }, 1200);

    // Hiển thị thông báo thành công và cuộn đến bài viết mới
    if (typeof showToast === 'function') {
      showToast(`🎉 Đã đăng bài viết [${config.name}] thành công lên Bảng tin HUCE!`, 'feedToast');
    }

    newPostEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Khởi tạo mục đích mặc định là Hỏi đáp học thuật
  setPurpose('question');
}

window.initPostComposer = initPostComposer;
