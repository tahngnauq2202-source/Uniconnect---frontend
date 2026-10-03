/**
 * ============================================================================
 * UNICONNECT HUCE - HELPER UTILITIES (js/utils/helpers.js)
 * ============================================================================
 * 
 * Mục đích file:
 * - Tập hợp các hàm tiện ích dùng chung:
 *   1. escapeHtml: Chống tấn công Cross-Site Scripting (XSS).
 *   2. copyToClipboard: Sao chép văn bản/đường link vào bộ nhớ tạm.
 */

/**
 * Mã hóa các ký tự đặc biệt nguy hiểm trong chuỗi sang HTML Entities
 * Ngăn chặn mã độc script do người dùng nhập vào
 * @param {string} str - Chuỗi văn bản gốc
 * @returns {string} Chuỗi an toàn để chèn vào innerHTML
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sao chép văn bản vào bộ nhớ tạm (Clipboard API)
 * @param {string} text - Nội dung cần copy
 * @param {string} [successMessage='Đã sao chép vào bộ nhớ tạm'] - Thông báo khi copy thành công
 */
function copyToClipboard(text, successMessage = 'Đã sao chép vào bộ nhớ tạm') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === 'function') {
        showToast(successMessage);
      }
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
    });
  } else {
    // Fallback cho trình duyệt cũ
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    if (typeof showToast === 'function') {
      showToast(successMessage);
    }
  }
}

// Gắn vào window để gọi từ các module khác
window.escapeHtml = escapeHtml;
window.copyToClipboard = copyToClipboard;
