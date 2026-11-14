import type { SocialLink } from '../types';

/**
 * ✏️ TẬP TIN CẤU HÌNH LIÊN HỆ & MẠNG XÃ HỘI (VIETNAMESE)
 * Các kênh kết nối và giao lưu
 */
export const socialLinksData: SocialLink[] = [
  {
    id: 'facebook',
    platform: 'Facebook',
    username: 'facebook.com/minhquan.lex',
    url: 'https://facebook.com',
    iconName: 'Facebook',
    badge: 'Kênh chính',
    color: 'periwinkle',
    description: 'Nơi mình chia sẻ những mẩu chuyện thường ngày và hình ảnh cùng bạn bè.',
  },
  {
    id: 'instagram',
    platform: 'Instagram',
    username: '@quan.lex.film',
    url: 'https://instagram.com',
    iconName: 'Instagram',
    badge: 'Ảnh đời thường',
    color: 'clay',
    description: 'Chuyên đăng ảnh chụp góc phố, ảnh film 35mm và các quán cà phê đẹp.',
  },
  {
    id: 'spotify',
    platform: 'Spotify',
    username: 'minhquan.playlist',
    url: 'https://spotify.com',
    iconName: 'Spotify',
    badge: 'Gu âm nhạc',
    color: 'sage',
    description: 'Các playlist Indie Việt êm dịu, City Pop và nhạc không lời lúc làm việc.',
  },
  {
    id: 'github',
    platform: 'GitHub',
    username: 'minhquan-dev',
    url: 'https://github.com',
    iconName: 'Github',
    badge: 'Code & Dự án',
    color: 'slate',
    description: 'Kho chứa các thử nghiệm giao diện web và các dự án cá nhân thú vị.',
  },
  {
    id: 'discord',
    platform: 'Discord',
    username: 'quanlex#2026',
    url: 'https://discord.com',
    iconName: 'Discord',
    badge: 'Trò chuyện & Game',
    color: 'periwinkle',
    description: 'Hay treo máy nghe nhạc, chơi game thư giãn hoặc tám chuyện cùng bạn bè.',
  },
  {
    id: 'email',
    platform: 'Hộp thư Email',
    username: 'minhquan.contact@gmail.com',
    url: 'mailto:minhquan.contact@gmail.com',
    iconName: 'Mail',
    badge: 'Gửi thư riêng',
    color: 'solar',
    description: 'Gửi lời chào, hỏi thăm quán cà phê ngon hoặc trao đổi về công việc sáng tạo.',
  },
];
