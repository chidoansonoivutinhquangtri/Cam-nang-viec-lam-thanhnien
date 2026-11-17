[README.md](https://github.com/user-attachments/files/33951996/README.md)
# Cẩm nang việc làm dành cho Thanh niên

Trang web tĩnh "Cẩm nang số Việc làm dành cho Thanh niên" của Chi đoàn Sở Nội vụ tỉnh Quảng Trị: việc làm trong nước và ngoài nước, học nghề, chính sách hỗ trợ, văn bản – biểu mẫu.

Nội dung được đọc trực tiếp trên trình duyệt từ bảng tính Google Sheets đã "Xuất bản lên web":
https://docs.google.com/spreadsheets/d/e/2PACX-1vSn0AtyF_KX4KDsx7C-fnh8vn53lk15is_kkpQUIhInZJNSQtE45JNauoE6iZXwOg/pubhtml

Muốn cập nhật nội dung, chỉ cần sửa bảng tính; trang web lấy dữ liệu mới mỗi lần được mở, không cần triển khai lại.

## Công nghệ
- HTML/CSS/JavaScript thuần (`public/index.html`), không có bước build
- Google Sheets (CSV xuất bản, đọc theo mã `gid` của từng tab)
- Netlify (hosting tĩnh, cấu hình trong `netlify.toml`)

## Chạy trên máy
```
netlify dev
```
hoặc mở thẳng `public/index.html` bằng trình duyệt.

## Ảnh chia sẻ link
`public/og-image.jpg` (1200×630) được khai báo trong các thẻ `og:image` / `twitter:image`. Khi thay ảnh, tăng tham số `?v=` trong các thẻ đó và dùng công cụ Facebook Sharing Debugger để làm mới bộ nhớ đệm.
