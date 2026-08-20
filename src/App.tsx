import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { MusicSection } from './components/MusicSection';
import { MemoryCinemaSection } from './components/MemoryCinemaSection';
import { SubscribeSection } from './components/SubscribeSection';
import { FooterSection } from './components/FooterSection';
import { SiteProtection } from './components/SiteProtection';
import { AdminPage } from './pages/AdminPage';
import { trackPageView } from './utils/analytics';
import { FEATURE_FLAGS } from './data/paralifeData';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin-control-panel') || hash === '#admin-control-panel';
  });

  useEffect(() => {
    // 1. Track Visitor Page View on Mount (only for regular site visitors)
    if (!isAdminRoute) {
      trackPageView();
    }

    // 2. Listen to route changes
    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      setIsAdminRoute(path.startsWith('/admin-control-panel') || hash === '#admin-control-panel');
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [isAdminRoute]);

  // If on the /admin-control-panel route, render the standalone Admin Page
  if (isAdminRoute) {
    return <AdminPage />;
  }

  // Regular Public Website (100% clean, zero admin elements)
  return (
    <SiteProtection>
      <div className="w-full min-h-screen bg-[#121316] text-[#F2EEE8] selection:bg-[#FF2D85]/30 selection:text-[#F2EEE8]">
        {/* 01 HEADER */}
        <Header />

        {/* MAIN EXPERIENCE CONTAINER */}
        <main className="w-full flex flex-col">
          {/* 02 HERO WITH CINEMATIC SCREEN */}
          <HeroSection />

          {/* 03 ABOUT */}
          <AboutSection />

          {/* 04 MUSIC (Toggled via FEATURE_FLAGS.showMusicSection) */}
          {FEATURE_FLAGS.showMusicSection && <MusicSection />}

          {/* 05 MEMORY CINEMA */}
          <MemoryCinemaSection />

          {/* 06 SUBSCRIBE */}
          <SubscribeSection />
        </main>

        {/* 07 FOOTER */}
        <FooterSection />
      </div>
    </SiteProtection>
  );
}
