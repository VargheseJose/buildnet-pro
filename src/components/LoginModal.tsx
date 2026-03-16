import * as React from 'react';
import { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { authService } from '../services/authService';
import { UserProfile, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, googleToken?: string) => void;
}

declare const google: any;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<UserRole>('Contractor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { profile, token } = await authService.loginWithGoogle();
        onLoginSuccess(profile, token);
    } catch (err: any) {
        setError(err.message || "Failed to authenticate with Google");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendOtp = () => {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
          setError("Please enter a valid 10-digit Indian phone number starting with 6-9");
          return;
      }
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
          setOtpSent(true);
          setIsLoading(false);
          setError(null);
          // In a real app, this would trigger SMS
          console.log(`Mock OTP sent to ${phone}: 123456`);
      }, 1000);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !agreedToTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }

    setIsLoading(true);
    try {
        let user: UserProfile;
        if (authMethod === 'email') {
            if (mode === 'login') user = await authService.login(email, password);
            else user = await authService.register(email, password, businessName, role);
        } else {
            if (mode === 'login') user = await authService.loginWithPhone(phone, otp);
            else user = await authService.registerWithPhone(phone, otp, businessName, role);
        }
        onLoginSuccess(user);
    } catch (err: any) {
        setError(err.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md relative border border-slate-800 overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10 p-2 hover:bg-slate-800 rounded-full"><Icon name="x-mark" className="h-5 w-5" /></button>
        
        <div className="flex border-b border-slate-800">
            <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}>Sign In</button>
            <button onClick={() => { setMode('signup'); setError(null); }} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}>Join BuildNet</button>
        </div>

        <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto scrollbar-hide">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-slate-500 text-sm font-medium">Access your construction workspace.</p>
            </div>

            <button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="w-full mb-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:bg-slate-100 transition-all flex justify-center items-center gap-4 text-[10px] uppercase tracking-widest disabled:opacity-50"
            >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="G" />
                Continue with Google
            </button>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase">
                    <span className="bg-slate-900 px-4 text-slate-600 font-black tracking-[0.3em]">Neural Auth Gateway</span>
                </div>
            </div>

            <div className="flex justify-center gap-2 mb-8 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button 
                    onClick={() => { setAuthMethod('email'); setError(null); }} 
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'email' ? 'bg-slate-800 text-emerald-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Email
                </button>
                <button 
                    onClick={() => { setAuthMethod('phone'); setError(null); }} 
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMethod === 'phone' ? 'bg-slate-800 text-emerald-400 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Phone
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-start gap-3 animate-shake">
                    <Icon name="bolt" className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Identity</label>
                            <input 
                                type="text" 
                                value={businessName} 
                                onChange={(e) => setBusinessName(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                                placeholder="Company or Full Name" 
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Role</label>
                            <div className="relative">
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value as UserRole)} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Contractor">Contractor / Builder</option>
                                    <option value="Client">Client / Homeowner</option>
                                    <option value="Supplier">Material Supplier</option>
                                    <option value="Architect">Architect / Designer</option>
                                    <option value="Admin">Site Admin</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Icon name="chevron-down" className="h-4 w-4" /></div>
                            </div>
                        </div>
                    </div>
                )}
                
                {authMethod === 'email' ? (
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                                placeholder="name@company.com" 
                                required 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                                    placeholder="••••••••" 
                                    minLength={6} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    <Icon name={showPassword ? "eye-off" : "eye"} className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button type="button" className="text-[10px] font-black text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">Forgot Password?</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">+91</span>
                                    <input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="9876543210" 
                                        required 
                                        disabled={otpSent} 
                                    />
                                </div>
                                {!otpSent && (
                                    <button 
                                        type="button" 
                                        onClick={handleSendOtp} 
                                        disabled={isLoading || phone.length < 10} 
                                        className="px-6 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 border border-slate-700"
                                    >
                                        {isLoading ? '...' : 'Send OTP'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {otpSent && (
                            <div className="space-y-1.5 animate-fade-in">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                                <input 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-2xl py-4 px-5 text-white text-lg font-black tracking-[1em] text-center focus:ring-2 focus:ring-emerald-500/40 outline-none transition-all" 
                                    placeholder="000000" 
                                    required 
                                />
                                <div className="flex justify-between items-center mt-2 px-1">
                                    <button type="button" onClick={() => setOtpSent(false)} className="text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">Change Number</button>
                                    <button type="button" onClick={handleSendOtp} className="text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">Resend Code</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'signup' && (
                    <div className="flex items-start gap-3 px-1">
                        <button 
                            type="button"
                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                            className={`mt-1 w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 ${agreedToTerms ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-transparent'}`}
                        >
                            <Icon name="check" className="h-3 w-3" />
                        </button>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            I agree to the <button type="button" className="text-emerald-400 hover:underline">Terms of Service</button> and <button type="button" className="text-emerald-400 hover:underline">Privacy Policy</button>, and consent to receive project alerts.
                        </p>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading || (authMethod === 'phone' && !otpSent)} 
                    className="w-full mt-6 py-5 bg-emerald-600 text-white font-black rounded-[1.25rem] shadow-2xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-[0.2em] border-t border-emerald-400/20"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                        mode === 'login' ? 'Authenticate Workspace' : 'Initialize BuildNet Account'
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};