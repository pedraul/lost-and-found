import { Camera, Mail, MessageCircle, Music2 } from 'lucide-react';
import { getWhatsAppChatUrl } from '../utils/whatsapp';

const socialPlatforms = [
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: Camera, glyph: null },
  { name: 'X', href: 'https://x.com/', icon: null, glyph: 'X' },
  { name: 'TikTok', href: 'https://www.tiktok.com/', icon: Music2, glyph: null },
  { name: 'WhatsApp', href: getWhatsAppChatUrl('Hello, I need help with Lost & Found.'), icon: MessageCircle, glyph: null },
  { name: 'Gmail', href: 'https://mail.google.com/mail/?view=cm&to=barflow01%40gmail.com', icon: Mail, glyph: null },
];

export default function SocialIcons() {
  return (
    <div className="flex w-fit flex-row items-center gap-3" role="group" aria-label="Social media">
      {socialPlatforms.map(({ name, href, icon: Icon, glyph }) => (
        <a
          key={name}
          aria-label={name}
          title={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {Icon ? <Icon size={17} strokeWidth={1.8} aria-hidden="true" /> : <span className="text-lg font-light" aria-hidden="true">{glyph}</span>}
        </a>
      ))}
    </div>
  );
}
