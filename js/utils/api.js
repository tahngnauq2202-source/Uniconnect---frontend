/**
 * UniConnect HUCE - Centralized API Service Module
 * Handles all HTTP requests to the Backend Express API with automatic JWT Bearer token authentication,
 * error handling, and file upload support.
 */

(function () {
  'use strict';

  // Base API configuration
  const API_CONFIG = {
    get BASE_URL() {
      if (window.APP_CONFIG && typeof window.APP_CONFIG.BACKEND_URL === 'string') {
        return window.APP_CONFIG.BACKEND_URL.replace(/\/+$/, '');
      }
      return '';
    },
    get TIMEOUT_MS() {
      return (window.APP_CONFIG && window.APP_CONFIG.TIMEOUT_MS) || 20000;
    },
  };

  /**
   * Core request wrapper
   */
  async function request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = window.getAuthToken ? window.getAuthToken() : localStorage.getItem('uniconnect_token');

    const headers = { ...options.headers };

    // Attach JWT Bearer token if available and not explicitly skipped
    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Unless sending FormData, default to application/json
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || API_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized (token expired or invalid)
      if (response.status === 401 && !options.skipAuthHandling) {
        console.warn('[UniConnect API] ⚠️ Phiên đăng nhập hết hạn hoặc không hợp lệ.');
        // Do not force logout if simply checking anonymous access
      }

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error((data && data.message) || `HTTP error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error('Yêu cầu hết thời gian chờ (Timeout). Vui lòng thử lại.');
        timeoutErr.status = 408;
        throw timeoutErr;
      }
      throw err;
    }
  }

  // ==========================================
  // 1. AUTH API (/api/auth)
  // ==========================================
  const auth = {
    /**
     * Đăng ký tài khoản sinh viên / giảng viên HUCE
     */
    async register({ username, email, password, fullName }) {
      return request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, fullName }),
      });
    },

    /**
     * Xác thực mã OTP 6 chữ số
     */
    async verifyOtp({ email, otpCode }) {
      return request('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode }),
      });
    },

    /**
     * Đăng nhập
     */
    async login({ email, password }) {
      return request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    /**
     * Lấy thông tin tài khoản hiện tại
     */
    async getMe() {
      return request('/api/auth/me', { method: 'GET' });
    },

    /**
     * Quên mật khẩu - gửi OTP về email trường
     */
    async forgotPassword(email) {
      return request('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    /**
     * Đặt lại mật khẩu mới với mã OTP
     */
    async resetPassword({ email, otpCode, newPassword }) {
      return request('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otpCode, newPassword }),
      });
    },

    /**
     * Đăng xuất khỏi hệ thống
     */
    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } catch (_) {}
      if (window.clearAuth) window.clearAuth();
    },
  };

  // ==========================================
  // 2. USERS API (/api/users)
  // ==========================================
  const users = {
    /**
     * Lấy profile đầy đủ của chính mình
     */
    async getMyProfile() {
      return request('/api/users/me', { method: 'GET' });
    },

    /**
     * Lấy profile công khai của user bất kỳ theo ID
     */
    async getUserProfile(userId) {
      return request(`/api/users/${userId}`, { method: 'GET' });
    },

    /**
     * Cập nhật thông tin profile cá nhân
     */
    async updateProfile({ fullName, avatar, bio, username }) {
      return request('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, avatar, bio, username }),
      });
    },

    /**
     * Đổi mật khẩu tài khoản
     */
    async changePassword({ currentPassword, newPassword }) {
      return request('/api/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
  };

  // ==========================================
  // 3. POSTS API (/api/posts)
  // ==========================================
  const posts = {
    /**
     * Lấy danh sách bài viết (phân trang, lọc theo categoryId)
     */
    async getAll({ page = 1, limit = 10, categoryId = null } = {}) {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (categoryId) params.append('categoryId', categoryId);

      const qs = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/posts${qs}`, { method: 'GET', skipAuth: true });
    },

    /**
     * Lấy chi tiết bài viết theo ID
     */
    async getById(postId) {
      return request(`/api/posts/${postId}`, { method: 'GET', skipAuth: true });
    },

    /**
     * Đăng bài viết / câu hỏi học thuật mới
     */
    async create({ title, content, categoryId = null, attachments = [] }) {
      return request('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, categoryId, attachments }),
      });
    },

    /**
     * Chỉnh sửa bài viết
     */
    async update(postId, { title, content, categoryId }) {
      return request(`/api/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, content, categoryId }),
      });
    },

    /**
     * Xóa bài viết
     */
    async delete(postId) {
      return request(`/api/posts/${postId}`, { method: 'DELETE' });
    },

    /**
     * Ghim / Bỏ ghim bài viết (Giảng viên / Admin)
     */
    async togglePin(postId) {
      return request(`/api/posts/${postId}/pin`, { method: 'PATCH' });
    },
  };

  // ==========================================
  // 4. COMMENTS API (/api/comments)
  // ==========================================
  const comments = {
    /**
     * Lấy danh sách bình luận của bài viết
     */
    async getByPostId(postId) {
      return request(`/api/comments/posts/${postId}/comments`, { method: 'GET', skipAuth: true });
    },

    /**
     * Viết bình luận gốc cho bài viết
     */
    async create(postId, content) {
      return request(`/api/comments/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    /**
     * Trả lời bình luận (Reply)
     */
    async reply(commentId, content) {
      return request(`/api/comments/comments/${commentId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },

    /**
     * Chỉnh sửa bình luận
     */
    async update(commentId, content) {
      return request(`/api/comments/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
    },

    /**
     * Xóa bình luận
     */
    async delete(commentId) {
      return request(`/api/comments/comments/${commentId}`, { method: 'DELETE' });
    },
  };

  // ==========================================
  // 5. VOTES API (/api/votes)
  // ==========================================
  const votes = {
    /**
     * Toggle upvote bài viết
     */
    async togglePost(postId) {
      return request(`/api/votes/posts/${postId}`, { method: 'POST' });
    },

    /**
     * Toggle upvote bình luận
     */
    async toggleComment(commentId) {
      return request(`/api/votes/comments/${commentId}`, { method: 'POST' });
    },
  };

  // ==========================================
  // 6. NOTIFICATIONS API (/api/notifications)
  // ==========================================
  const notifications = {
    /**
     * Lấy danh sách thông báo
     */
    async getAll({ page = 1, limit = 20 } = {}) {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/notifications${qs}`, { method: 'GET' });
    },

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    async getUnreadCount() {
      return request('/api/notifications/unread-count', { method: 'GET' });
    },

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    async markAsRead(notificationId) {
      return request(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
    },

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    async markAllAsRead() {
      return request('/api/notifications/read-all', { method: 'PATCH' });
    },

    /**
     * Thử nghiệm phát thông báo realtime (Test & Simulation)
     */
    async testEmit(payload) {
      return request('/api/notifications/test-emit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // ==========================================
  // 7. UPLOAD API (/api/upload)
  // ==========================================
  const upload = {
    /**
     * Tải lên 1 tệp tin (ảnh hoặc tài liệu PDF/Docx/CAD)
     * @param {File} file
     */
    async single(file) {
      const formData = new FormData();
      formData.append('file', file);
      return request('/api/upload', {
        method: 'POST',
        body: formData,
      });
    },
  };

  // ==========================================
  // 8. CATEGORIES API (/api/categories)
  // ==========================================
  const categories = {
    async getAll() {
      return request('/api/categories', { method: 'GET', skipAuth: true });
    },
  };

  /**
   * Chuyển đổi đường dẫn ảnh/tệp tin sang URL hoàn chỉnh tương ứng với Backend URL
   */
  function getMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
      return path;
    }
    const base = (window.APP_CONFIG && window.APP_CONFIG.STATIC_URL) 
      ? window.APP_CONFIG.STATIC_URL.replace(/\/+$/, '') 
      : API_CONFIG.BASE_URL;
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // Export to global window object
  window.API = {
    auth,
    users,
    posts,
    comments,
    votes,
    notifications,
    upload,
    categories,
    request,
    getMediaUrl,
  };
})();
