import React, { useState, useEffect, useRef } from 'react';
import heroVideoWebm from '../assets/videos/hero-section.webm';
import heroVideoMp4 from '../assets/videos/hero-section.mp4';
import heroMobileVideoWebm from '../assets/videos/hero-section-mobile.webm';
import heroMobileVideoMp4 from '../assets/videos/hero-section-mobile.mp4';
import { HERO_DATA } from '../data/paralifeData';

export const HeroSection: React.FC = () => {
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isSoundOn;
    }
  }, [isSoundOn]);

  useEffect(() => {
    if (videoRef.current) {
      setIsVideoLoaded(false);
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [isMobile]);

  const toggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const nextMutedState = !videoRef.current.muted;
      videoRef.current.muted = nextMutedState;
      setIsSoundOn(!nextMutedState);

      if (!nextMutedState) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative h-[100svh] min-h-[500px] w-full flex items-end justify-center overflow-hidden bg-[#121316] pb-20 sm:pb-24 md:pb-12 lg:pb-14"
      aria-label="Hero"
    >
      {/* Background Video with WebM primary and MP4 fallback (responsive mobile/desktop with smooth 60fps) */}
      <video
        ref={videoRef}
        key={isMobile ? 'mobile' : 'desktop'}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controlsList="nodownload no-remote-playback"
        disablePictureInPicture
        onPlaying={() => setIsVideoLoaded(true)}
        onLoadedData={() => setIsVideoLoaded(true)}
        onEnded={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className={`absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 contrast-[1.05] transition-opacity duration-700 ease-out ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source
          src={isMobile ? heroMobileVideoWebm : heroVideoWebm}
          type="video/webm"
        />
        <source
          src={isMobile ? heroMobileVideoMp4 : heroVideoMp4}
          type="video/mp4"
        />
      </video>

      {/* Dark Cinematic Vignette & Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#121316] via-black/25 to-[#121316]/50 pointer-events-none" />

      {/* Bottom Hero Overlay:
          - Mobile: Centered stack with tagline and sound button below
          - Desktop: Tagline centered lower at the bottom, sound button positioned directly on the right side on the exact same horizontal line */}
      <div className="relative z-20 w-full px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-center space-y-5 sm:space-y-6 md:space-y-0">
        <h1 className="text-[15px] sm:text-[19px] md:text-[24px] lg:text-[28px] tracking-[0.22em] sm:tracking-[0.26em] uppercase text-[#F2EEE8] font-light leading-snug drop-shadow-2xl text-center">
          {HERO_DATA.tagline}
        </h1>

        {/* Sound Toggle Button (Mobile: centered below; Desktop: directly at the right edge on the exact same line as text) */}
        <div className="md:absolute md:right-6 lg:right-12 md:top-1/2 md:-translate-y-1/2 flex items-center">
          <button
            type="button"
            onClick={toggleSound}
            className="text-[11px] sm:text-[12px] md:text-[13px] tracking-[0.16em] uppercase text-[#F2EEE8]/85 hover:text-[#FF2D85] active:text-[#FF2D85] hover:border-[#FF2D85] active:border-[#FF2D85] font-medium transition-all duration-200 min-h-[42px] px-5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-center cursor-pointer bg-[#121316]/80 backdrop-blur-md border border-[#F2EEE8]/20 rounded-none shadow-2xl"
            aria-label={isSoundOn ? 'Turn sound off' : 'Turn sound on'}
          >
            {isSoundOn ? '— sound off' : '+ sound on'}
          </button>
        </div>
      </div>
    </section>
  );
};
