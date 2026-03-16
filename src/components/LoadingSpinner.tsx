
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Icon } from './Icon';

const THINKING_MESSAGES = [
    "Analyzing construction data...",
    "Consulting Indian Standard (IS) Codes...",
    "Optimizing material estimates...",
    "Reviewing local market rates in Kerala...",
    "Calculating structural requirements...",
    "Searching for top-rated professionals...",
    "Drafting technical specifications...",
    "Verifying supplier availability...",
    "Processing architectural inputs...",
    "Cross-referencing safety standards...",
    "Computing quantity take-offs..."
];

interface LoadingSpinnerProps {
    message?: string;
    isThinking?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, isThinking = false }) => {
  const [currentMessage, setCurrentMessage] = useState(THINKING_MESSAGES[0]);

  useEffect(() => {
    if (!isThinking) return;
    
    // Shuffle initial message
    setCurrentMessage(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);

    const interval = setInterval(() => {
        setCurrentMessage(prev => {
            const currentIndex = THINKING_MESSAGES.indexOf(prev);
            const nextIndex = (currentIndex + 1) % THINKING_MESSAGES.length;
            return THINKING_MESSAGES[nextIndex];
        });
    }, 2500);
    return () => clearInterval(interval);
  }, [isThinking]);

  return (
    <div className="flex flex-col justify-center items-center p-8 space-y-4 animate-fade-in w-full">
      <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-slate-700 border-t-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
          {isThinking && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="bolt" className="h-6 w-6 text-emerald-500 animate-pulse" />
              </div>
          )}
      </div>
      <div className="text-center max-w-sm mx-auto">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse">
              {isThinking ? "BuildNet AI is thinking..." : "Loading..."}
          </h3>
          <p className="text-slate-400 text-sm mt-2 font-medium transition-opacity duration-500 min-h-[1.25rem]">
              {message || (isThinking ? currentMessage : "Please wait a moment")}
          </p>
      </div>
    </div>
  );
};
