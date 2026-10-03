(function () {
  'use strict';

  const BACKEND_URL = 'https://uniconnect-2-5jup.onrender.com';

  window.APP_CONFIG = {
    // Đường dẫn gốc gọi API
    BACKEND_URL: BACKEND_URL.replace(/\/+$/, ''),

    // Đường dẫn gốc để tải hình ảnh / tệp tin tải lên (/uploads/...)
    STATIC_URL: BACKEND_URL.replace(/\/+$/, ''),

    // Thời gian chờ phản hồi tối đa (ms) - Đặt 90s để hỗ trợ Render Free Tier Cold Start (50-70s)
    TIMEOUT_MS: 90000,
  };
})();
