import React, { useState, useRef, useEffect } from 'react';
import { FOOTER_DATA } from '../data/paralifeData';

export const FooterSection: React.FC = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const contactEmail = 'hello@paralifemusic.com';

  // Close modal on click outside or Escape
  useEffect(() => {
    if (!contactOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContactOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contactOpen]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <footer
      className="w-full py-4 sm:py-5 px-4 sm:px-6 md:px-10 lg:px-14 bg-[#121316] border-t border-[#F2EEE8]/8 relative"
      aria-label="Footer"
    >
      <div className="w-full flex items-center justify-between text-left">
        {/* Copyright */}
        <p className="text-[11px] sm:text-[12px] tracking-[0.1em] text-[#F2EEE8]/52 uppercase">
          {FOOTER_DATA.copyright}
        </p>

        {/* Footer Destination Links */}
        <div className="flex items-center gap-6">
          {FOOTER_DATA.links.map((link) => {
            if (link.label.toLowerCase() === 'contact') {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="text-[11px] sm:text-[12px] tracking-[0.08em] uppercase text-[#F2EEE8]/76 hover:text-[#FF2D85] active:text-[#FF2D85] font-medium transition-colors duration-150 py-1 flex items-center cursor-pointer"
                >
                  {link.label}
                </button>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-[12px] tracking-[0.08em] uppercase text-[#F2EEE8]/76 hover:text-[#FF2D85] active:text-[#FF2D85] font-medium transition-colors duration-150 py-1 flex items-center"
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Sleek Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div
            ref={modalRef}
            className="w-full max-w-md bg-[#16171d] border border-[#F2EEE8]/15 p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F2EEE8]/10 pb-4">
              <div className="flex items-center space-x-3">
                <span className="section-label text-[#FF2D85]">+direct transmission</span>
              </div>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="text-[#F2EEE8]/52 hover:text-[#FF2D85] text-sm uppercase tracking-widest cursor-pointer p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Email Display & Copy Box */}
            <div className="flex flex-col space-y-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#F2EEE8]/40">
                Official Contact Address
              </span>
              <div className="flex items-center justify-between bg-[#111216] border border-[#F2EEE8]/10 px-4 py-3">
                <span className="text-[15px] text-[#F2EEE8] font-mono select-all">
                  {contactEmail}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={`text-[11px] uppercase tracking-[0.14em] font-semibold cursor-pointer transition-colors ${
                    copied ? 'text-[#00FF88]' : 'text-[#FF2D85] hover:text-[#F2EEE8]'
                  }`}
                >
                  {copied ? '✓ COPIED' : '+COPY'}
                </button>
              </div>
            </div>

            {/* Direct Webmail & App Shortcuts */}
            <div className="flex flex-col space-y-3 pt-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#F2EEE8]/40">
                Open in Webmail or App
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[12px] uppercase tracking-[0.1em]">
                {/* Outlook Web */}
                <a
                  href={`https://outlook.live.com/mail/0/deeplink/compose?to=${contactEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#20222a] hover:bg-[#FF2D85] text-[#F2EEE8] hover:text-white transition-colors border border-[#F2EEE8]/10 rounded-sm font-medium"
                >
                  Outlook Web
                </a>

                {/* Gmail Web */}
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#20222a] hover:bg-[#FF2D85] text-[#F2EEE8] hover:text-white transition-colors border border-[#F2EEE8]/10 rounded-sm font-medium"
                >
                  Gmail Web
                </a>

                {/* Default Mail App */}
                <a
                  href={`mailto:${contactEmail}`}
                  className="py-2.5 px-3 bg-[#20222a] hover:bg-[#FF2D85] text-[#F2EEE8] hover:text-white transition-colors border border-[#F2EEE8]/10 rounded-sm font-medium"
                >
                  Mail App
                </a>
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] tracking-[0.04em] text-[#F2EEE8]/40 text-center pt-2">
              All messages are delivered directly to the PARALIFE inbox.
            </p>
          </div>
        </div>
      )}
    </footer>
  );
};
