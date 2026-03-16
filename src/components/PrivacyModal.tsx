
import * as React from 'react';
import { Icon } from './Icon';

interface PrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-slate-800 relative">
        <div className="text-center mb-6">
            <div className="bg-emerald-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Icon name="check" className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Privacy & Data Notice</h2>
            <p className="text-slate-300 text-sm leading-relaxed text-left">
                <strong>BuildNet AI</strong> prioritizes your privacy. 
                <br/><br/>
                <span className="text-slate-200 font-semibold">Data Usage:</span> All data, including location access and camera inputs used for measurements or searches, is processed securely for your active session. We do not permanently store your personal biometric or location data without your explicit consent.
                <br/><br/>
                <span className="text-slate-200 font-semibold">Permissions:</span> Location and Camera access are requested <strong>only</strong> when you explicitly use features like "Near Me" search or AI measurements.
            </p>
        </div>
        <button 
            onClick={onAccept}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
        >
            I Understand & Continue
        </button>
      </div>
    </div>
  );
};
