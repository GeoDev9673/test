import React, { useState, useEffect } from 'react';
import { NAV_ITEMS, PARALIFE_META } from '../data/paralifeData';
import logoImg from '../assets/images/logo.png';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-12 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#121316]/95 backdrop-blur-md border-b border-[#F2EEE8]/10'
          : 'bg-transparent'
      }`}
      aria-label="Primary navigation"
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* PARALIFE Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center hover:opacity-80 transition-opacity duration-200"
        >
          <img
            src={logoImg}
            alt={PARALIFE_META.brandName}
            className="h-7 sm:h-8 md:h-10 w-auto object-contain max-w-[130px] sm:max-w-[160px] md:max-w-[200px]"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10" aria-label="Main menu">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-[13px] tracking-[0.08em] uppercase text-[#F2EEE8]/76 hover:text-[#FF2D85] transition-colors duration-200 font-medium"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button (Accessible touch target) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[12px] tracking-[0.14em] uppercase text-[#F2EEE8] hover:text-[#FF2D85] min-h-[44px] min-w-[44px] px-3 py-2 flex items-center justify-center font-semibold transition-colors"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          {mobileMenuOpen ? '✕ CLOSE' : '+P/01'}
        </button>
      </div>

      {/* Mobile Menu Fullscreen / Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[60px] sm:top-[68px] z-40 bg-[#121316]/98 backdrop-blur-xl md:hidden flex flex-col justify-between px-6 py-10 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <nav
            id="mobile-nav-menu"
            aria-label="Mobile navigation"
            className="flex flex-col space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[20px] tracking-[0.14em] uppercase text-[#F2EEE8] hover:text-[#FF2D85] active:text-[#FF2D85] transition-colors duration-150 py-3 border-b border-[#F2EEE8]/10 flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-[#FF2D85] text-sm">→</span>
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-[#F2EEE8]/10 text-center">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#F2EEE8]/40">
              PARALIFE • Less Noise. More Life.
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
