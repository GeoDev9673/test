import React from 'react';
import { MEMORY_CINEMA_DATA } from '../data/paralifeData';

export const MemoryCinemaSection: React.FC = () => {
  return (
    <section
      id="memory-cinema"
      className="w-full py-20 sm:py-28 md:py-40 px-4 sm:px-8 md:px-12 bg-[#121316]"
      aria-label="Memory Cinema"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Section Label */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <span className="section-label text-[#F2EEE8]/52 hover:text-[#FF2D85] transition-colors duration-200 cursor-default">
            MEMORY CINEMA
          </span>
        </div>

        {/* Editorial Layout: Image and Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Cinematic Image */}
          <div className="lg:col-span-7 xl:col-span-8 w-full overflow-hidden rounded-sm">
            <img
              src={MEMORY_CINEMA_DATA.image}
              alt={MEMORY_CINEMA_DATA.altText}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover grayscale brightness-90 contrast-105 hover:brightness-95 transition-all duration-700"
            />
          </div>

          {/* Supporting Text Block */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6 sm:space-y-8 lg:pt-8">
            {/* Headline */}
            <h3 className="text-[28px] sm:text-[36px] md:text-[44px] text-[#F2EEE8] font-normal leading-[1.12] sm:leading-[1.08] tracking-[-0.01em]">
              {MEMORY_CINEMA_DATA.headline}
            </h3>

            {/* Quote */}
            <blockquote className="text-[16px] sm:text-[18px] italic text-[#F2EEE8]/85 border-l-2 border-[#FF2D85]/80 pl-4 sm:pl-6 py-1 font-serif leading-relaxed">
              {MEMORY_CINEMA_DATA.quote}
            </blockquote>

            {/* Body */}
            <p className="text-[14px] sm:text-[16px] text-[#F2EEE8]/76 font-normal leading-[1.6]">
              {MEMORY_CINEMA_DATA.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
