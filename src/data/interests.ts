import type { InterestItem } from '../types';

/**
 * ✏️ TẬP TIN CẤU HÌNH SỞ THÍCH (VIETNAMESE)
 * Các niềm đam mê và thú vui thường ngày
 */
export const interestsData: InterestItem[] = [
  {
    id: 'am-nhac',
    title: 'Âm nhạc & Giai điệu',
    category: 'Giai điệu',
    iconName: 'Headphones',
    color: 'periwinkle',
    description:
      'Âm nhạc là thứ không thể thiếu trong ngày của mình. Mình nghe nhạc từ lúc thức dậy, trong lúc làm việc cho tới lúc đi ngủ. Những giai điệu êm dịu giúp mình xoa dịu căng thẳng và tập trung hơn.',
    tags: ['Indie Việt', 'Acoustic', 'City Pop Nhật Bản', 'Lofi Hip-hop', 'R&B êm dịu'],
    gearOrFavorites: ['Tai nghe chụp tai Sony', 'Playlist Spotify chọn lọc', 'Mày mò hợp âm guitar'],
  },
  {
    id: 'ca-phe',
    title: 'Cà phê & Quán xá',
    category: 'Thói quen',
    iconName: 'Coffee',
    color: 'clay',
    description:
      'Mỗi sáng tự tay xay và pha một ly cà phê là nghi thức mở đầu ngày mới yêu thích của mình. Cuối tuần mình thích tìm những quán cà phê có ban công nhiều cây xanh hoặc nằm khuất trong hẻm yên tĩnh.',
    tags: ['Cà phê phin truyền thống', 'Pha thủ công V60', 'Bạc xỉu ít ngọt', 'Quán cà phê vintage'],
    gearOrFavorites: ['Phễu lọc gốm Hario', 'Máy xay tay mini', 'Bình giữ nhiệt gốm'],
  },
  {
    id: 'choi-game',
    title: 'Chơi Game Thư Giãn',
    category: 'Giải trí',
    iconName: 'Gamepad2',
    color: 'solar',
    description:
      'Mình thích những tựa game có cốt truyện sâu sắc, đồ họa nghệ thuật và âm nhạc hay. Thỉnh thoảng chơi vài ván game nông trại hoặc game nhập vai để xả stress cùng bạn bè.',
    tags: ['Stardew Valley', 'Hollow Knight', 'Genshin Impact', 'Game giải đố nhẹ nhàng'],
    gearOrFavorites: ['Nintendo Switch', 'Tay cầm cơ không dây', 'Bàn phím cơ gõ êm'],
  },
  {
    id: 'nhiep-anh',
    title: 'Nhiếp ảnh & Phim ảnh',
    category: 'Thị giác',
    iconName: 'Camera',
    color: 'sage',
    description:
      'Đi dạo phố với chiếc máy ảnh nhỏ giúp mình chú ý hơn đến những điều đẹp đẽ vô tình lướt qua: vạt nắng vàng buổi xế chiều, nụ cười của một cụ già bán hàng rong hay chú mèo nằm sưởi nắng.',
    tags: ['Màu film ấm áp', 'Ảnh đường phố', 'Phim hoạt hình Ghibli', 'Phim tài liệu đời thường'],
    gearOrFavorites: ['Máy ảnh film 35mm', 'Lens tiêu cự 35mm', 'Sổ lưu giữ ảnh in'],
  },
  {
    id: 'cong-nghe',
    title: 'Công nghệ & Bàn phím cơ',
    category: 'Táy máy',
    iconName: 'Code2',
    color: 'clay',
    description:
      'Thích mày mò các phần mềm tiện ích, tinh chỉnh góc làm việc tối giản và tự tay bôi trơn từng switch bàn phím cơ để có âm thanh gõ êm tai như tiếng mưa rơi.',
    tags: ['Bàn phím cơ custom', 'Tối giản không gian', 'Ứng dụng ghi chú', 'Giao diện web mượt mà'],
    gearOrFavorites: ['Bàn phím 75%', 'Keycap PBT màu retro', 'Chuột công thái học'],
  },
  {
    id: 'doc-sach',
    title: 'Đọc sách & Sổ tay',
    category: 'Chiêm nghiệm',
    iconName: 'BookOpen',
    color: 'sage',
    description:
      'Thích cảm giác cầm một cuốn sách giấy thật trên tay. Thường ghi chép những câu nói hay hoặc vài dòng nhật ký ngẫu hứng vào sổ tay kẻ ô vuông.',
    tags: ['Tản văn & Đời sống', 'Tiểu thuyết chữa lành', 'Tâm lý học ứng dụng', 'Sổ tay bìa da'],
    gearOrFavorites: ['Bút gel mực êm', 'Sổ tay giấy kem chống lóa', 'Đèn bàn vàng ấm'],
  },
];
