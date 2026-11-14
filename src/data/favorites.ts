import type { FavoriteItem } from '../types';

/**
 * ✏️ TẬP TIN CẤU HÌNH NHỮNG ĐIỀU TÔI THÍCH (VIETNAMESE)
 * Các bộ phim, bài hát, món ăn và chốn quen yêu thích nhất
 */
export const favoritesData: FavoriteItem[] = [
  // ÂM NHẠC
  {
    id: 'fav-music-1',
    category: 'nhac',
    title: 'Nàng Thơ',
    subtitle: 'Hoàng Dũng',
    tag: 'Indie Việt',
    badge: 'Bài hát ruột',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Giai điệu da diết và lời ca thơ mộng. Mỗi lần nghe khi ngồi xe buýt chiều mưa đều cảm thấy lòng lắng lại.',
  },
  {
    id: 'fav-music-2',
    category: 'nhac',
    title: 'Plastic Love',
    subtitle: 'Mariya Takeuchi',
    tag: 'City Pop Nhật Bản',
    badge: 'Nghe hoài không chán',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Tiếng bass nhịp nhàng cùng không khí thành phố về đêm của thập niên 80 khiến tâm trạng lập tức phấn chấn.',
  },
  {
    id: 'fav-music-3',
    category: 'nhac',
    title: 'Lối Nhỏ',
    subtitle: 'Đen ft. Phương Anh Đào',
    tag: 'Acoustic Rap',
    badge: 'Mộc mạc',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Tiếng guitar mộc mạc và ca từ bình dị như lời tự sự của một người bạn tri kỷ sau một ngày dài làm việc.',
  },

  // PHIM ẢNH
  {
    id: 'fav-phim-1',
    category: 'phim',
    title: 'Vùng Đất Linh Hồn (Spirited Away)',
    subtitle: 'Studio Ghibli • Hayao Miyazaki',
    tag: 'Hoạt hình kinh điển',
    badge: 'Bộ phim yêu thích nhất',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Khung cảnh đoàn tàu chạy trên mặt nước phẳng lặng trong ánh hoàng hôn là khoảnh khắc điện ảnh đẹp và êm đềm nhất mình từng xem.',
  },
  {
    id: 'fav-phim-2',
    category: 'phim',
    title: 'Before Sunrise (Trước Lúc Bình Minh)',
    subtitle: 'Đạo diễn: Richard Linklater',
    tag: 'Lãng mạn & Đối thoại',
    badge: 'Phim chữa lành',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Hai con người xa lạ gặp nhau trên chuyến tàu, cùng đi dạo và trò chuyện thâu đêm suốt sáng về cuộc đời, ước mơ và nỗi sợ.',
  },

  // GAME
  {
    id: 'fav-game-1',
    category: 'game',
    title: 'Stardew Valley',
    subtitle: 'Phát triển bởi: ConcernedApe',
    tag: 'Nông trại & Cuộc sống',
    badge: 'Chốn bình yên',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Trốn khỏi những ồn ào thành phố để về miền quê trồng rau, câu cá, nghe tiếng mưa rơi trên mái nhà gỗ ấm cúng.',
  },
  {
    id: 'fav-game-2',
    category: 'game',
    title: 'Hollow Knight',
    subtitle: 'Team Cherry',
    tag: 'Hành động & Khám phá',
    badge: 'Kiệt tác nghệ thuật',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Đồ họa vẽ tay đẹp như tranh vẽ, âm nhạc piano u uất nhưng hào hùng và thế giới ngầm kỳ bí đầy hấp dẫn.',
  },

  // MÓN ĂN
  {
    id: 'fav-food-1',
    category: 'mon-an',
    title: 'Phở Bò Tái Lăn & Quẩy Nóng',
    subtitle: 'Món ăn quốc dân',
    tag: 'Ẩm thực Việt Nam',
    badge: 'Món ruột',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Nước dùng ninh xương ngọt thanh thơm mùi quế hồi, thêm nhiều hành lá, ớt tươi và vắt chút chanh chua dịu.',
  },
  {
    id: 'fav-food-2',
    category: 'mon-an',
    title: 'Bánh Mì Kẹp Sài Gòn',
    subtitle: 'Bánh mì giòn rụm',
    tag: 'Bữa sáng nhanh gọn',
    badge: 'Ăn mỗi tuần',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Vỏ bánh mì giòn tan, pate béo ngậy thơm lừng, đồ chua thanh mát và chút tương ớt cay cay.',
  },

  // CHỐN QUEN
  {
    id: 'fav-place-1',
    category: 'chon-quen',
    title: 'Quán Cà Phê Ban Công Cũ',
    subtitle: 'Nằm trong một con hẻm Quận 3',
    tag: 'Góc làm việc quen',
    badge: 'Cứ rảnh là tới',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Có giàn hoa giấy rủ bóng mát, bật nhạc Trịnh hoặc nhạc acoustic nhẹ nhàng, không gian yên ắng đủ để đọc trọn một cuốn sách.',
  },
  {
    id: 'fav-place-2',
    category: 'chon-quen',
    title: 'Đà Lạt Những Ngày Mờ Sương',
    subtitle: 'Rừng thông & Không khí se lạnh',
    tag: 'Nơi đi trốn',
    badge: 'Mỗi năm đều đi',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    whyILoveIt: 'Sáng sớm thức dậy hít một hơi không khí lạnh buốt, ôm ly sữa đậu nành nóng hổi ngắm sương mù bay lững lờ qua đồi thông.',
  },
];
