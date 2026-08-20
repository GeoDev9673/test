import React, { useState } from 'react';
import { SUBSCRIBE_DATA } from '../data/paralifeData';
import { SubscribeState } from '../types';
import { subscribeEmail, validateEmail } from '../utils/supabase';

export const SubscribeSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscribeState>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage(SUBSCRIBE_DATA.invalidEmailText);
      return;
    }

    setStatus('loading');
    setMessage(SUBSCRIBE_DATA.loadingText);

    const result = await subscribeEmail(email);

    if (result.success) {
      if (result.isDuplicate) {
        setStatus('error');
        setMessage(SUBSCRIBE_DATA.alreadySubscribedText);
      } else {
        setStatus('success');
        setMessage(SUBSCRIBE_DATA.successText);
        setEmail('');
      }
    } else {
      setStatus('error');
      setMessage(result.message || SUBSCRIBE_DATA.errorText);
    }
  };

  return (
    <section
      id="subscribe"
      className="w-full py-20 sm:py-28 md:py-40 px-4 sm:px-8 md:px-12 bg-[#121316]"
      aria-label="Subscribe"
    >
      <div className="max-w-[560px] mx-auto text-center flex flex-col items-center space-y-8 sm:space-y-10">
        {/* Section Headline */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-[28px] sm:text-[36px] md:text-[44px] text-[#F2EEE8] font-normal leading-[1.12] sm:leading-[1.08] tracking-[-0.01em]">
            Follow the Signal
          </h3>
        </div>

        {/* Minimal Editorial Direct Form */}
        <div className="w-full flex flex-col items-center space-y-6">
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-5">
            <div className="w-full relative flex items-center border-b border-[#F2EEE8]/30 focus-within:border-[#FF2D85] transition-colors duration-200">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                }}
                placeholder={SUBSCRIBE_DATA.inputPlaceholder}
                disabled={status === 'loading'}
                className="w-full bg-transparent py-4 text-[16px] text-[#F2EEE8] placeholder-[#F2EEE8]/40 focus:outline-none tracking-[0.02em]"
                required
                aria-label="Email address"
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="ml-2 sm:ml-4 py-3 sm:py-4 px-2 sm:px-3 text-[12px] sm:text-[13px] tracking-[0.1em] uppercase text-[#F2EEE8] hover:text-[#FF2D85] active:text-[#FF2D85] disabled:opacity-50 transition-colors duration-150 min-h-[44px] cursor-pointer whitespace-nowrap font-medium"
              >
                {status === 'loading' ? SUBSCRIBE_DATA.loadingText : SUBSCRIBE_DATA.buttonText}
              </button>
            </div>

            {/* Feedback Messages */}
            <div aria-live="polite">
              {status === 'success' && (
                <p className="text-[13px] tracking-[0.06em] text-[#00FF88] animate-fade-in">
                  {message}
                </p>
              )}

              {status === 'error' && (
                <p className="text-[13px] tracking-[0.06em] text-[#FF4D88] animate-fade-in">
                  {message}
                </p>
              )}
            </div>

            {/* Quiet Privacy Note */}
            <p className="text-[12px] tracking-[0.04em] text-[#F2EEE8]/52">
              {SUBSCRIBE_DATA.privacyNote}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
