import React from 'react';
import { ABOUT_DATA } from '../data/paralifeData';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="w-full py-24 sm:py-32 md:py-44 px-5 sm:px-8 md:px-12 bg-[#121316] flex flex-col items-center justify-center text-center"
      aria-label="About PARALIFE"
    >
      <div className="w-full max-w-[940px] mx-auto flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 md:space-y-12">
        {/* Section Label */}
        <span className="section-label text-center">
          {ABOUT_DATA.sectionLabel}
        </span>

        {/* Headline (Fluid responsive typography with optical text-balance) */}
        <h2 className="w-full text-center text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] text-[#F2EEE8] font-normal leading-[1.18] sm:leading-[1.12] tracking-[-0.01em] [text-wrap:balance]">
          {ABOUT_DATA.headline}
        </h2>
      </div>
    </section>
  );
};
