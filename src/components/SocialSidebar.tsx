import React from 'react';
import { SOCIAL_LINKS } from '../data/paralifeData';

export const SocialSidebar: React.FC = () => {
  return (
    <aside
      className="fixed left-3 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-2.5 sm:space-y-3.5"
      aria-label="Social media links"
    >
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit PARALIFE on ${item.name}`}
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-[#121316]/80 hover:bg-[#121316] text-[#F2EEE8]/70 hover:text-[#FF2D85] border border-[#F2EEE8]/15 hover:border-[#FF2D85]/80 backdrop-blur-md transition-all duration-200 rounded-none shadow-xl hover:shadow-[0_0_12px_rgba(255,45,133,0.35)] group"
        >
          {item.name === 'Instagram' && (
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current stroke-2 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          )}

          {item.name === 'TikTok' && (
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.59a6.33 6.33 0 0 0 10.79 4.51c1.8-1.57 2.08-4.22 2.08-4.51V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.05-.12z" />
            </svg>
          )}

          {item.name === 'YouTube' && (
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-none stroke-current stroke-2 transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
            </svg>
          )}
        </a>
      ))}
    </aside>
  );
};
