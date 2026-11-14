# 🪐 Hướng Dẫn Tùy Chỉnh Danh Thiếp Cá Nhân

Chào bạn! Trang web này được thiết kế theo phong cách **Danh thiếp số cá nhân (Digital Business Card) & Scrapbook**, ưu tiên trải nghiệm trên điện thoại thông minh (**iPhone 14 Pro Max: 430 × 932 px**) với toàn bộ nội dung bằng **Tiếng Việt**.

---

## 🚀 Lệnh Khởi Chạy Nhanh

```bash
# 1. Chạy môi trường phát triển (Development)
npm run dev

# 2. Đóng gói bản chính thức (Production Build)
npm run build

# 3. Xem trước bản đóng gói cục bộ (Preview)
npm run preview
```

---

## ✏️ Cách Thay Đổi Thông Tin Cá Nhân

Tất cả thông tin cá nhân được tập trung 100% tại thư mục `src/data/`. Bạn **không cần chỉnh sửa code giao diện**!

### 1. Thông tin cá nhân & Giới thiệu (`src/data/personal.ts`)
Mở file `src/data/personal.ts` để chỉnh sửa:
- **`name`**: Họ và tên thật (ví dụ: *Nguyễn Minh Quân*)
- **`nickname`**: Biệt danh thường gọi (ví dụ: *Quân "Lex"*)
- **`role`**: Công việc hoặc định danh cá nhân
- **`tagline`**: Câu mô tả ngắn gọn, dễ thương ở đầu trang
- **`bio`**: Lời chào và đoạn giới thiệu bản thân
- **`location`**: Nơi bạn đang sống (ví dụ: *Sài Gòn • Quận 3*)
- **`bornYear`**: Năm sinh / Tuổi
- **`mbti` & `zodiac`**: Nhóm tính cách MBTI và Cung hoàng đạo
- **`avatarUrl`**: Đường dẫn ảnh chân dung (có thể đặt ảnh vào thư mục `public/` và điền `/ten-anh.jpg`)
- **`status`**: Bài hát đang nghe, thói quen dạo này, mức năng lượng cà phê
- **`quickFacts`**: 4 gạch đầu dòng thông tin nhanh
- **`storyHighlights`**: 3 mẩu chuyện ngắn (Về bản thân, Dạo này làm gì, Châm ngôn)

### 2. Sở thích thường ngày (`src/data/interests.ts`)
Mở file `src/data/interests.ts` để cập nhật các thú vui:
- Âm nhạc, Cà phê, Chơi game, Nhiếp ảnh, Công nghệ, Đọc sách...
- Thẻ từ khóa thể loại yêu thích (`tags`)
- Đồ dùng & dụng cụ thường dùng (`gearOrFavorites`)

### 3. Những điều tôi thích (`src/data/favorites.ts`)
Mở file `src/data/favorites.ts` để thêm các tác phẩm, bài hát, món ăn yêu thích:
- Các mục: **Âm nhạc**, **Phim ảnh**, **Game**, **Món ăn**, **Chốn quen**
- Kèm lý do tại sao thích (`whyILoveIt`) chân thật và mộc mạc

### 4. Tính cách & Thói quen (`src/data/personality.ts`)
Mở file `src/data/personality.ts` để ghi lại:
- **`traits`**: Vài nét tính cách đặc trưng (kèm emoji)
- **`habits`**: Những thói quen thường ngày ngộ nghĩnh
- **`likes`**: Danh sách những điều cực thích
- **`dislikes`**: Danh sách những điều không thích lắm
- **`randomFacts`**: Vài sự thật vui, ngẫu nhiên về bản thân

### 5. Khoảnh khắc & Kỷ niệm (`src/data/memories.ts`)
Mở file `src/data/memories.ts` để thay ảnh polaroid:
- Tiêu đề ảnh, địa điểm chụp, thời gian
- `caption`: Dòng chú thích viết tay ngắn ở dưới khung polaroid
- `story`: Câu chuyện đầy đủ phía sau bức ảnh (hiển thị khi bạn bè bấm vào xem phóng to trong Lightbox)
- `tapeColor`: Màu băng keo washi dán góc (`yellow`, `coral`, `sage`, `periwinkle`)

### 6. Mạng xã hội & Kênh liên hệ (`src/data/social.ts`)
Mở file `src/data/social.ts` để điền liên kết thật của bạn:
- **Facebook**, **Instagram**, **Spotify**, **GitHub**, **Discord**, **Email**...
- Mỗi thẻ đều có nút **"Sao chép ID"** 1 chạm nhanh gọn
- Người xem có thể bấm vào nút **"Mã QR"** ở đầu trang hoặc cuối trang để quét bằng camera điện thoại
- Bạn bè có thể để lại lời nhắn ngắn kèm sticker ở mục **"Bảng tin lời nhắn"** (được lưu trực tiếp trong trình duyệt)

---

## 📱 Thiết Kế Thân Thiện Điện Thoại

- Được tối ưu đặc biệt cho màn hình **iPhone 14 Pro Max (430 × 932 px)**.
- Thanh điều hướng nhanh dưới đáy màn hình (Dock) vừa tầm với ngón tay cái, tự động sáng theo vị trí cuộn trang.
- Hỗ trợ đổi giao diện **Sáng (Giấy ấm vintage)** hoặc **Tối (Bầu trời đêm dịu mắt)**.
