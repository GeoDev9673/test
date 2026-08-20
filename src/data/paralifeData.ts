import heroPosterImg from '../assets/images/hero_poster_1785348901613.jpg';
import memoryCinemaImg from '../assets/images/memory_cinema_1785348915755.jpg';

import { NavItem } from '../types';

/**
 * FEATURE FLAGS:
 * Easily enable or disable sections for release dates.
 * Change `showMusicSection: true` when the track is officially released!
 */
export const FEATURE_FLAGS = {
  showMusicSection: false, // Hidden for initial launch. Switch to true on release date!
  showMemoryCinema: true,
};

export const PARALIFE_META = {
  brandName: 'PARALIFE',
  tagline: 'Less Noise. More Life.',
  metaDescription: 'A cinematic alternative music project where music, memory and visual storytelling become one digital experience.',
};

export const NAV_ITEMS: NavItem[] = [
  { label: '+video', href: '#hero' },
  ...(FEATURE_FLAGS.showMusicSection ? [{ label: '+music', href: '#music' }] : []),
  { label: '+memory', href: '#memory-cinema' },
  { label: '+signal', href: '#subscribe' },
];

export const HERO_DATA = {
  posterImage: heroPosterImg,
  altText: 'PARALIFE cinematic video.',
  tagline: 'Less Noise. More Life.',
};

export const ABOUT_DATA = {
  sectionLabel: 'ABOUT',
  headline: 'A cinematic music project where music, memory and visual storytelling become one experience.',
  body: 'PARALIFE combines music, film language and editorial design into one digital experience.',
};

export const MUSIC_DATA = {
  sectionLabel: 'MUSIC',
  headline: 'PARALIFE SOUND SYSTEM',
  trackTitle: 'PARALIFE — STEALING TIME',
  duration: '04:15',
  streamLinkText: 'LISTEN ON ALL PLATFORMS →',
  platforms: [
    { name: 'Spotify', href: 'https://spotify.com' },
    { name: 'Apple Music', href: 'https://music.apple.com' },
    { name: 'YouTube Music', href: 'https://music.youtube.com' },
    { name: 'Bandcamp', href: 'https://bandcamp.com' },
  ],
};

export const MEMORY_CINEMA_DATA = {
  sectionLabel: 'MEMORY CINEMA',
  image: memoryCinemaImg,
  altText: 'Memory Cinema location.',
  headline: 'Some places remember us long before we remember them.',
  body: 'Memory Cinema is the symbolic place where music, stories and memory quietly intersect.',
  quote: '"Some memories wait until you are ready."',
};

export const SUBSCRIBE_DATA = {
  sectionLabel: 'FOLLOW THE SIGNAL',
  inputPlaceholder: 'Enter your email',
  buttonText: '+subscribe',
  privacyNote: 'No spam. Only meaningful updates.',
  loadingText: 'Sending...',
  successText: 'Thank you. You are now following the signal.',
  alreadySubscribedText: 'You are already following the signal.',
  invalidEmailText: 'Please enter a valid email address.',
  errorText: 'Something went wrong. Please try again.',
};

export const FOOTER_DATA = {
  copyright: '© PARALIFE',
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/paralifeofficial/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@paralifemusic' },
    { label: 'YouTube', href: 'https://www.youtube.com/@Paralifemusic' },
    { label: 'Contact', href: 'mailto:hello@paralifemusic.com' },
  ],
};
