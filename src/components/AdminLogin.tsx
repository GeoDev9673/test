import React, { useState } from 'react';
import logoImg from '../assets/images/logo.png';
import { PARALIFE_META } from '../data/paralifeData';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MASTER_ACCESS_KEY = '88BQWTUT9GCG16UVWQ09';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.trim() === MASTER_ACCESS_KEY) {
      onSuccess();
    } else {
      setError(true);
      setAccessKey('');
    }
  };

  return (
    <div className="min-h-[100svh] w-full bg-[#121316] text-[#F2EEE8] flex flex-col justify-between py-6 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 selection:bg-[#FF2D85]/30">
      
      {/* Top Header */}
      <header className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
        <a href="/" className="hover:opacity-80 transition-opacity">
          <img
            src={logoImg}
            alt={PARALIFE_META.brandName}
            className="h-7 sm:h-8 md:h-10 w-auto object-contain max-w-[140px] sm:max-w-[180px]"
          />
        </a>
        <span className="text-[11px] sm:text-[12px] tracking-[0.14em] uppercase text-[#FF2D85] font-semibold">
          +access
        </span>
      </header>

      {/* Main Login Card */}
      <main className="max-w-[480px] w-full mx-auto my-auto flex flex-col items-center text-center space-y-8 sm:space-y-10 py-8">
        
        {/* Editorial Subtitle */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#F2EEE8]/52 font-medium">
            FREQUENCY CONTROL
          </span>
          <h2 className="text-[26px] sm:text-[34px] md:text-[40px] text-[#F2EEE8] font-normal leading-[1.12] tracking-tight">
            Enter Signal Key
          </h2>
        </div>

        {/* Minimal Underline Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-6 sm:space-y-8">
          <div className="w-full relative flex items-center border-b border-[#F2EEE8]/30 focus-within:border-[#FF2D85] transition-colors duration-200">
            <input
              type="password"
              autoFocus
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                if (error) setError(false);
              }}
              placeholder="ENTER ACCESS KEY"
              className="w-full bg-transparent py-3.5 sm:py-4 text-center text-[16px] text-[#F2EEE8] placeholder-[#F2EEE8]/30 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none shadow-none tracking-[0.14em] sm:tracking-[0.18em] uppercase"
            />
          </div>

          {error && (
            <p className="text-[12px] sm:text-[13px] tracking-[0.06em] text-[#FF4D88] animate-fade-in">
              Access key incorrect. Signal rejected.
            </p>
          )}

          {/* Action Buttons in Brand Style */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 pt-2 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="text-[12px] sm:text-[13px] tracking-[0.1em] uppercase text-[#F2EEE8]/52 hover:text-[#F2EEE8] active:text-[#F2EEE8] transition-colors duration-150 cursor-pointer font-medium min-h-[44px] px-3 flex items-center"
            >
              ← return
            </button>
            
            <button
              type="submit"
              className="py-3 px-7 sm:px-8 text-[12px] sm:text-[13px] tracking-[0.12em] uppercase bg-[#FF2D85] hover:bg-[#ff1275] active:bg-[#ff1275] text-white font-medium transition-all duration-150 cursor-pointer shadow-lg shadow-[#FF2D85]/20 min-h-[44px] flex items-center"
            >
              +unlock
            </button>
          </div>
        </form>

        {/* Editorial Quote */}
        <p className="text-[11px] sm:text-[12px] tracking-[0.04em] text-[#F2EEE8]/40 italic">
          “Some memories wait until you are ready.”
        </p>

      </main>

      {/* Footer */}
      <footer className="max-w-[1440px] w-full mx-auto flex items-center justify-between text-[11px] sm:text-[12px] tracking-[0.1em] text-[#F2EEE8]/40 uppercase pt-4 border-t border-[#F2EEE8]/8">
        <span>© PARALIFE</span>
        <span>Less Noise. More Life.</span>
      </footer>

    </div>
  );
};
