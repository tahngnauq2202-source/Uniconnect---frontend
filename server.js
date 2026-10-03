require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Trỏ chính xác vào thư mục chứa server.js (Uniconnect---frontend)
app.use(express.static(__dirname));

// Phục vụ file index.html từ đúng thư mục hiện tại
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server đang chạy tại: http://localhost:${PORT}`);
});
