/**
 * UniConnect HUCE - Frontend Global Configuration
 * File cấu hình kết nối giữa Frontend và Backend (Hỗ trợ cách 3: Deploy Online)
 */

(function () {
  'use strict';

  /**
   * =========================================================================
   * HƯỚNG DẪN CẤU HÌNH CHO CÁCH 3 (DEPLOY ONLINE):
   * 
   * 1. Nếu Backend của bạn đã được deploy online (ví dụ trên Render, Railway, VPS, Heroku...):
   *    -> Điền URL của Backend vào biến BACKEND_URL bên dưới (không cần dấu gạch chéo cuối).
   *    Ví dụ: const BACKEND_URL = 'https://uniconnect-backend.onrender.com';
   * 
   * 2. Nếu Frontend và Backend được host chung cùng một domain / port:
   *    -> Giữ nguyên chuỗi rỗng: const BACKEND_URL = '';
   * =========================================================================
   */
  const BACKEND_URL = 'https://uniconnect-2-5jup.onrender.com/';

  window.APP_CONFIG = {
    // Đường dẫn gốc gọi API
    BACKEND_URL: BACKEND_URL.replace(/\/+$/, ''),

    // Đường dẫn gốc để tải hình ảnh / tệp tin tải lên (/uploads/...)
    STATIC_URL: BACKEND_URL.replace(/\/+$/, ''),

    // Thời gian chờ phản hồi tối đa (ms)
    TIMEOUT_MS: 20000,
  };
})();
