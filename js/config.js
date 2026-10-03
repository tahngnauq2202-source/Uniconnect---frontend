

(function () {
  'use strict';


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
