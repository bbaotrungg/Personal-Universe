import type { PersonalInfo } from '../types';

/**
 * ✏️ TẬP TIN CẤU HÌNH THÔNG TIN CÁ NHÂN (VIETNAMESE)
 * Thay đổi các thông tin dưới đây để cập nhật toàn bộ nội dung website!
 */
export const personalData: PersonalInfo = {
  name: 'Nguyễn Minh Quân',
  nickname: 'Quân "Lex"',
  pronouns: 'bạn / mình',
  role: 'Người thích sáng tạo & Lập trình giao diện',
  tagline: 'Thích thiết kế những thứ dễ thương, nghiện cà phê phin và thích lang thang chụp ảnh dạo.',
  bio: 'Chào bạn! Đây là góc nhỏ của mình trên internet — nơi mình chia sẻ một chút về con người, những sở thích vụn vặt, vài chốn quen thuộc và những khoảnh khắc đời thường. Rất vui vì bạn đã ghé qua!',
  location: 'Sài Gòn, Việt Nam',
  bornYear: '2001 (23 tuổi)',
  mbti: 'INFP (Người lý tưởng hóa)',
  zodiac: 'Song Ngư ♓',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  status: {
    listeningTo: {
      song: 'Nàng Thơ',
      artist: 'Hoàng Dũng',
      link: 'https://open.spotify.com',
      audioUrl: '',
      enabled: true,
    },
    currentObsession: 'Đang tập pha cà phê phễu V60 và tìm tòi sổ tay bìa da',
    todayVibe: 'Bình yên, thảnh thơi, đầu óc bay bổng',
    coffeeFuelLevel: 85, // %
  },
  quickFacts: [
    {
      icon: 'MapPin',
      label: 'Nơi sống',
      value: 'Sài Gòn • Quận 3',
    },
    {
      icon: 'Sparkles',
      label: 'Tính cách',
      value: 'INFP • Hơi hướng nội',
    },
    {
      icon: 'Coffee',
      label: 'Nạp năng lượng',
      value: 'Bạc xỉu ít ngọt / Cà phê đen đá',
    },
    {
      icon: 'Moon',
      label: 'Giờ hoạt động',
      value: 'Cú đêm (11h đêm - 2h sáng)',
    },
  ],
  storyHighlights: [
    {
      title: '🌿 Về bản thân mình',
      content:
        'Mình là kiểu người dễ rung động trước những điều bình dị: một buổi chiều mưa ngồi bên cửa sổ, một bài nhạc Indie Việt có giai điệu mộc mạc, hay mùi giấy thơm của một cuốn sách cũ. Mình thích nói chuyện chân thành hơn là xã giao.',
    },
    {
      title: '⚡ Dạo này mình đang làm gì?',
      content:
        'Học cách sống chậm lại một chút. Ban ngày làm việc với máy tính, tối về dành thời gian đọc vài trang sách, nghe nhạc không lời, hoặc lượn xe máy qua những con hẻm nhỏ hít thở không khí mát mẻ.',
    },
    {
      title: '✨ Châm ngôn sống',
      content:
        'Cứ chân thành và tử tế với cuộc đời. Không cần phải vội vã chạy theo người khác, mỗi người đều có một múi giờ và nhịp điệu của riêng mình.',
    },
  ],
};
