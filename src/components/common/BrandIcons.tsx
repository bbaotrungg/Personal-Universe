import type { FC } from 'react';

export const FacebookIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export const InstagramIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const GithubIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

export const TwitterIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733-16z"/>
    <path d="M4 20l6.768-6.768m3.464-3.464L20 4"/>
  </svg>
);

export const SpotifyIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 11.5c3.5-1 7.5-.5 10 1"/>
    <path d="M7 14.5c4-1 8-.5 11 1.5"/>
    <path d="M9 8.5c4-1 9-.5 12 1.5"/>
  </svg>
);

export const DiscordIcon: FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6a15.8 15.8 0 0 0-4-1.25.1.1 0 0 0-.1.05c-.2.35-.4.8-.55 1.2a15 15 0 0 0-4.7 0c-.15-.4-.35-.85-.55-1.2a.1.1 0 0 0-.1-.05A15.8 15.8 0 0 0 6 6a18 18 0 0 0-3 12 .1.1 0 0 0 .05.08 16 16 0 0 0 4.95 2.52.1.1 0 0 0 .1-.04c.4-.55.75-1.15 1.05-1.78a.1.1 0 0 0-.05-.14 10.4 10.4 0 0 1-1.5-.72.1.1 0 0 1 0-.17c.1-.08.2-.16.3-.24a.1.1 0 0 1 .1 0 11.3 11.3 0 0 0 9.8 0 .1.1 0 0 1 .1 0c.1.08.2.16.3.24a.1.1 0 0 1 0 .17 10.4 10.4 0 0 1-1.5.72.1.1 0 0 0-.05.14c.3.63.65 1.23 1.05 1.78a.1.1 0 0 0 .1.04 16 16 0 0 0 4.95-2.52.1.1 0 0 0 .05-.08A18 18 0 0 0 18 6z"/>
    <circle cx="9" cy="12" r="1.5"/>
    <circle cx="15" cy="12" r="1.5"/>
  </svg>
);
