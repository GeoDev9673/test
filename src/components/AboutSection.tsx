import React from 'react';
import { ABOUT_DATA } from '../data/paralifeData';

export const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="w-full py-24 sm:py-32 md:py-44 px-5 sm:px-8 md:px-12 bg-[#121316] flex flex-col items-center text-center"
      aria-label="About PARALIFE"
    >
      <div className="max-w-[820px] mx-auto flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-12">
        {/* Section Label */}
        <span className="section-label">
          {ABOUT_DATA.sectionLabel}
        </span>

        {/* Headline (Fluid responsive typography) */}
        <h2 className="text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] text-[#F2EEE8] font-normal leading-[1.12] sm:leading-[1.08] max-w-[780px] tracking-[-0.01em]">
          {ABOUT_DATA.headline}
        </h2>

        {/* Body Text */}
        <p className="text-[15px] sm:text-[17px] md:text-[19px] text-[#F2EEE8]/76 max-w-[640px] font-normal leading-[1.6] sm:leading-[1.55]">
          {ABOUT_DATA.body}
        </p>
      </div>
    </section>
  );
};
