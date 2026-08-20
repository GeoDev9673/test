import React from 'react';
import { SOCIAL_LINKS } from '../data/paralifeData';

export const SocialSidebar: React.FC = () => {
  return (
    <aside
      className="fixed left-3 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col space-y-3 sm:space-y-4"
      aria-label="Social media links"
    >
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit PARALIFE on ${item.name}`}
          className="text-[#FF2D85] hover:text-[#FF65B2] active:text-white transition-all duration-200 p-1.5 sm:p-2 flex items-center justify-center hover:scale-115 drop-shadow-[0_0_6px_rgba(255,45,133,0.4)] hover:drop-shadow-[0_0_12px_rgba(255,45,133,0.85)] group"
        >
          {item.name === 'Instagram' && (
            <svg
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 fill-none stroke-current stroke-[1.8]"
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
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.59a6.33 6.33 0 0 0 10.79 4.51c1.8-1.57 2.08-4.22 2.08-4.51V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.05-.12z" />
            </svg>
          )}

          {item.name === 'YouTube' && (
            <svg
              className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 fill-none stroke-current stroke-[1.8]"
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
