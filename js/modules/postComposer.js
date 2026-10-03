/**
 * UniConnect HUCE - Post Composer Module
 * Handles Creating Posts, Category/Purpose Selection, Tag Management, File Attachments & Realtime Broadcast
 */

(function () {
  'use strict';

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

  function initPostComposer() {
    const openComposerBtn = document.getElementById('openComposerBtn');
    const quickPostTriggerBtn = document.getElementById('quickPostTriggerBtn');
    const createBoxCollapsed = document.getElementById('createBoxCollapsed');
    const postCreateForm = document.getElementById('postCreateForm');
    const closeComposerBtn = document.getElementById('closeComposerBtn');
    const cancelPostBtn = document.getElementById('cancelPostBtn');
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

    function syncAuthorUI() {
      const user = window.getCurrentUser ? window.getCurrentUser() : null;
      if (!user) return;
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

    if (openComposerBtn) openComposerBtn.addEventListener('click', expandComposer);
    if (quickPostTriggerBtn) quickPostTriggerBtn.addEventListener('click', expandComposer);
    if (closeComposerBtn) closeComposerBtn.addEventListener('click', collapseComposer);
    if (cancelPostBtn) cancelPostBtn.addEventListener('click', collapseComposer);

    // Bottom nav fab button on mobile
    const bottomNavPost = document.getElementById('bottomNavPost');
    if (bottomNavPost) {
      bottomNavPost.addEventListener('click', () => {
        expandComposer();
        postCreateForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

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
        if (window.showToast) window.showToast(`Đã thêm thẻ mới: ${val}`, 'info');
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
        const pill = document.createElement('div');
        pill.className = 'attachment-pill';
        const isImage = file.type === 'image';
        const iconSvg = isImage
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

        pill.innerHTML = `
          ${iconSvg}
          <span class="attachment-name">${window.escapeHtml(file.name)}</span>
          <span class="attachment-size">(${file.size})</span>
          <button type="button" class="btn-remove-attachment" aria-label="Xóa đính kèm">&times;</button>
        `;

        pill.querySelector('.btn-remove-attachment')?.addEventListener('click', () => {
          attachedFiles.splice(index, 1);
          renderAttachmentsPreview();
        });

        composerAttachmentsPreview.appendChild(pill);
      });
    }

    if (btnAttachPhoto) {
      btnAttachPhoto.addEventListener('click', () => {
        if (fileInputPhoto) fileInputPhoto.click();
      });
    }

    if (fileInputPhoto) {
      fileInputPhoto.addEventListener('change', (e) => {
        const f = (e.target.files || [])[0];
        if (f) attachedFiles.push({ type: 'image', name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
        renderAttachmentsPreview();
        fileInputPhoto.value = '';
      });
    }

    if (btnAttachDoc) {
      btnAttachDoc.addEventListener('click', () => {
        if (fileInputDoc) fileInputDoc.click();
      });
    }

    if (fileInputDoc) {
      fileInputDoc.addEventListener('change', (e) => {
        const f = (e.target.files || [])[0];
        if (f) attachedFiles.push({ type: 'doc', name: f.name, size: (f.size / 1024).toFixed(1) + ' KB' });
        renderAttachmentsPreview();
        fileInputDoc.value = '';
      });
    }

    // Submit post
    if (postCreateForm) {
      postCreateForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = postTitleInput.value.trim();
        const content = postContentInput.value.trim();

        if (!title || !content) {
          if (window.showToast) window.showToast('Vui lòng nhập cả tiêu đề và nội dung bài viết', 'warning');
          return;
        }

        const config = PURPOSE_CONFIG[currentPurpose] || PURPOSE_CONFIG.question;
        const user = window.getCurrentUser ? window.getCurrentUser() : { fullName: 'Sinh viên HUCE', avatar: 'SV', role: 'Sinh viên', colorClass: 'author-blue' };
        const safeTitle = window.escapeHtml(title);
        const safeContent = window.escapeHtml(content);
        const newPostId = Date.now();

        // Create new post card
        const newPostEl = document.createElement('article');
        newPostEl.className = 'post-card new-post-highlight';
        newPostEl.setAttribute('data-post-id', newPostId.toString());
        newPostEl.setAttribute('data-category', config.category);
        newPostEl.setAttribute('data-score', '1');
        newPostEl.setAttribute('data-timestamp', newPostId.toString());
        newPostEl.setAttribute('data-comments', '0');

        newPostEl.innerHTML = `
          <div class="post-card-header">
            <div class="post-author-box">
              <div class="author-circle ${user.colorClass}">${user.avatar}</div>
              <div class="author-info-group">
                <span class="author-heading">${window.escapeHtml(user.fullName)}</span>
                <span class="author-subtext">${window.escapeHtml(user.role)} • Vừa xong</span>
              </div>
            </div>
            <span class="post-tag ${config.tagClass}">${selectedTag}</span>
          </div>

          <h2 class="post-heading-title">${safeTitle}</h2>
          <p class="post-content-body">${safeContent}</p>

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

          <div class="post-comments-container" style="display: none;">
            <div class="comments-section-header">
              <div class="comments-title-wrap">
                <h3 class="comments-heading">Thảo luận công khai</h3>
                <span class="comments-counter-badge">0 bình luận</span>
              </div>
            </div>

            <form class="comment-input-form">
              <div class="comment-author-avatar">${user.avatar}</div>
              <div class="comment-input-wrap">
                <textarea class="comment-textarea" placeholder="Viết phản hồi học thuật hoặc câu hỏi..." rows="1" required></textarea>
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

        if (feedList) feedList.insertBefore(newPostEl, feedList.firstChild);

        if (feedCountSummary) {
          const total = feedList ? feedList.querySelectorAll('.post-card').length : 1;
          feedCountSummary.textContent = `${total} bài viết`;
        }

        // Bind vote, comment, and share handlers on new post
        if (window.bindVoteControls) window.bindVoteControls(newPostEl);
        if (window.bindCommentControls) window.bindCommentControls(newPostEl);
        newPostEl.querySelector('.btn-share-post')?.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (window.copyToClipboard) window.copyToClipboard(window.location.href);
          if (window.showToast) window.showToast('Đã sao chép liên kết bài viết vào bộ nhớ tạm', 'info');
        });

        // Trigger Realtime Notification for new post publication
        if (window.emitNotificationEvent) {
          window.emitNotificationEvent({
            type: 'POST',
            badgeText: 'Bài viết của bạn',
            avatarText: user.avatar,
            avatarClass: 'notif-avatar-notice',
            timeText: 'Vừa xong',
            text: `<strong>Bài viết mới:</strong> [${safeTitle}] đã được công khai trên Bảng tin HUCE.`
          });
        }

        // Call backend API via unified API service
        if (window.API && window.API.posts) {
          window.API.posts.create({ title, content, attachments: [] })
            .then(res => {
              if (res && res.id) {
                newPostEl.setAttribute('data-post-id', res.id.toString());
              }
            })
            .catch(err => {
              console.warn('[UniConnect Post] Create post API notice:', err.message);
            });
        }

        collapseComposer();
        if (window.showToast) window.showToast(`🎉 Đã đăng bài viết [${config.name}] thành công!`, 'success');
        newPostEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    setPurpose('question');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostComposer);
  } else {
    initPostComposer();
  }

  window.initPostComposer = initPostComposer;
})();
