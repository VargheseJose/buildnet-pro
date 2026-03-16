
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, HashRouter } from 'react-router-dom';
import { UserLocation, Business, RFQ, UserProfile, Site, Project, SavedSearch, RfqItem } from './types';
import { ChatSystem } from './components/Chat/ChatSystem';
import { Chatbot } from './components/Chatbot';
import { Icon } from './components/Icon';
import { ResultsDisplay } from './components/ResultsDisplay';
import { findConstructionInfo } from './services/geminiService';
import { CALCULATOR_TOOLS } from './data/categories';
import { SearchForm } from './components/SearchForm';
import { LoginModal } from './components/LoginModal';
import { DashboardPage } from './components/DashboardPage';
import { ProfilePage } from './components/ProfilePage';
import { fetchDirectoryData } from './services/directoryService';
import { CalculatorPage } from './components/CalculatorPage';
import { authService } from './services/authService';
import { LOGO_URL } from './assets/logo';
import { OnboardingModal } from './components/OnboardingModal';

import { NotificationBell } from './components/NotificationBell';

const AlertModal: React.FC<{ isOpen: boolean; message: string; onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Alert</h3>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-400 transition-colors">OK</button>
                </div>
            </div>
        </div>
    );
};

const HomeHeader: React.FC<{ 
    isLoggedIn: boolean; 
    onLoginToggle: () => void;
    onNavigate: (path: string) => void;
    onLogout: () => void;
    userProfile?: UserProfile;
    onMarkNotificationAsRead?: (id: string) => void;
    onMarkAllNotificationsAsRead?: () => void;
}> = ({ isLoggedIn, onLoginToggle, onNavigate, onLogout, userProfile, onMarkNotificationAsRead, onMarkAllNotificationsAsRead }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuBtnClasses = "w-full text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all font-semibold flex items-center gap-3 group";

  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-slate-950/40">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('/')}>
            <img 
                src={LOGO_URL} 
                alt="BuildNet AI" 
                className="h-8 w-8 md:h-10 md:w-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]" 
            />
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
                BuildNet <span className="text-emerald-400">AI</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-4">
                <button onClick={() => onNavigate('/marketplace')} className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap">Marketplace</button>
                <button onClick={() => {
                    const toolsSection = document.getElementById('tools-list');
                    if (toolsSection) toolsSection.scrollIntoView({ behavior: 'smooth' });
                    else onNavigate('/');
                }} className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap">AI Tools</button>
                {isLoggedIn ? (
                     <>
                         <NotificationBell 
                             notifications={userProfile?.notifications || []}
                             onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                             onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                             onNavigate={onNavigate}
                         />
                         <button onClick={onLogout} className="text-slate-500 hover:text-red-400 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors">Sign Out</button>
                     </>
                ) : (
                    <button onClick={onLoginToggle} className="text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-colors whitespace-nowrap">Sign In</button>
                )}
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all shadow-xl">
                <Icon name={isMenuOpen ? 'x-mark' : 'menu'} className="h-6 w-6" />
            </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="absolute top-full right-4 md:right-6 w-[calc(100vw-2rem)] md:w-72 bg-[#0a0f1c] shadow-2xl border border-slate-800 p-3 flex flex-col space-y-1 z-[60] animate-slide-up rounded-2xl ring-1 ring-white/5 mt-2">
           <button onClick={() => { onNavigate('/'); setIsMenuOpen(false); }} className={menuBtnClasses}>
                <Icon name="bolt" className="h-4 w-4 text-emerald-400 group-hover:animate-pulse"/> Home
           </button>
           <button onClick={() => { onNavigate('/marketplace'); setIsMenuOpen(false); }} className={menuBtnClasses}>
                <Icon name="search" className="h-4 w-4 text-cyan-400"/> Marketplace
           </button>
           
           <div className="py-2 px-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Icon name="calculator" className="h-3 w-3 text-purple-400" /> Tool Suite
                </p>
                <div className="space-y-1">
                    {CALCULATOR_TOOLS.flatMap(c => c.tools).slice(0, 8).map(tool => (
                        <button key={tool.id} onClick={() => { onNavigate(`/calculator/${tool.id}`); setIsMenuOpen(false); }} className="w-full text-left py-2 px-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors block truncate">
                            {tool.name}
                        </button>
                    ))}
                    <button onClick={() => {
                         const toolsSection = document.getElementById('tools-list');
                         if (toolsSection) toolsSection.scrollIntoView({ behavior: 'smooth' });
                         else onNavigate('/');
                         setIsMenuOpen(false);
                    }} className="w-full text-left py-2 px-2 text-emerald-500 font-black uppercase tracking-widest transition-colors block truncate">
                        View All Tools
                    </button>
                </div>
           </div>

           {isLoggedIn && (
               <div className="pt-2 border-t border-slate-800 mt-2">
                   <button onClick={() => { onNavigate('/dashboard'); setIsMenuOpen(false); }} className={menuBtnClasses}><Icon name="apps" className="h-4 w-4 text-orange-400"/> My Dashboard</button>
               </div>
           )}
        </div>
      )}
    </header>
  );
};

const MarketplacePage: React.FC<{ 
    directoryData: Business[]; 
    googleToken?: string; 
    userProfile?: UserProfile;
    onLoginToggle: () => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    onNavigate: (p: string) => void;
    onMarkNotificationAsRead?: (id: string) => void;
    onMarkAllNotificationsAsRead?: () => void;
    onToggleFavorite?: (business: Business) => void;
}> = ({ directoryData, googleToken, userProfile, onLoginToggle, isLoggedIn, onLogout, onNavigate, onMarkNotificationAsRead, onMarkAllNotificationsAsRead, onToggleFavorite }) => {
    const [mainCategory, setMainCategory] = useState('');
    const [category, setCategory] = useState('');
    const [district, setDistrict] = useState('Ernakulam');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Business[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [sources, setSources] = useState<any[]>([]);
    const [searchMode, setSearchMode] = useState<'standard' | 'ai'>('standard');
    const [aiParams, setAiParams] = useState({ style: '', materials: '', imageQuality: 'Standard' });
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent, overrideCategory?: string) => {
        if (e) e.preventDefault();
        const activeCategory = overrideCategory !== undefined ? overrideCategory : category;
        
        setIsLoading(true);
        setIsAiSearching(searchMode === 'ai');
        setSearchError(null);
        
        try {
            if (searchMode === 'ai') {
                const aiParamsString = [
                    aiParams.style ? `Style: ${aiParams.style}` : '',
                    aiParams.materials ? `Materials: ${aiParams.materials}` : '',
                    aiParams.imageQuality ? `Image Quality: ${aiParams.imageQuality}` : ''
                ].filter(Boolean).join(', ');
                
                const fullQuery = `${query} ${activeCategory} in ${district} ${aiParamsString ? `(${aiParamsString})` : ''}`;
                
                const searchResult = await findConstructionInfo(fullQuery, null, undefined, undefined);
                setResults(searchResult.businesses);
                setSources(searchResult.sources);
            } else {
                const filtered = directoryData.filter(b => {
                    const matchCat = !activeCategory || b.category.includes(activeCategory);
                    const matchDist = !district || b.location.includes(district);
                    const matchQuery = !query || b.name.toLowerCase().includes(query.toLowerCase());
                    return matchCat && matchDist && matchQuery;
                });
                setResults(filtered);
            }
        } catch (err) {
            console.error(err);
            setSearchError(err instanceof Error ? err.message : "An error occurred while searching.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617]">
            <HomeHeader 
                isLoggedIn={isLoggedIn} 
                onLoginToggle={onLoginToggle} 
                onNavigate={onNavigate} 
                onLogout={onLogout} 
                userProfile={userProfile}
                onMarkNotificationAsRead={onMarkNotificationAsRead}
                onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
            />
            <main className="pt-24 md:pt-32 pb-20 container mx-auto px-4 md:px-6 max-w-6xl">
                <div className="mb-8 md:mb-12 text-center md:text-left">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter mb-2 md:mb-4 uppercase flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4">
                        Provider Marketplace 
                        <span className="text-emerald-400 opacity-50 text-sm sm:text-xl md:text-4xl">Coming Soon</span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto md:mx-0 font-medium text-xs sm:text-sm md:text-base">Find and verify verified construction professionals across India.</p>
                </div>
                
                <SearchForm 
                    mainCategory={mainCategory} setMainCategory={setMainCategory}
                    category={category} onCategoryChange={(v) => { setCategory(v); if(v) handleSearch(undefined, v); }}
                    district={district} setDistrict={setDistrict}
                    query={query} setQuery={setQuery}
                    handleSearch={handleSearch}
                    isLoading={isLoading}
                    searchMode={searchMode} setSearchMode={setSearchMode}
                    fuse={null} onSuggestionSelect={()=>{}}
                    isNearMe={false} onToggleNearMe={()=>{}}
                    selectedState="Kerala" setSelectedState={()=>{}}
                    aiParams={aiParams} setAiParams={setAiParams}
                />

                {searchError ? (
                    <div className="mt-8 bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto animate-fade-in">
                        <Icon name="x-mark" className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-red-400 font-bold text-lg mb-2">Search Failed</h3>
                        <p className="text-slate-300 text-sm">{searchError}</p>
                    </div>
                ) : (
                    <ResultsDisplay 
                        results={results} 
                        isLoading={isLoading} 
                        isAiSearching={isAiSearching} 
                        sources={sources} 
                        selectedSuppliers={[]} 
                        onSelectSupplier={()=>{}}
                        favorites={userProfile?.favorites}
                        onToggleFavorite={onToggleFavorite}
                        userLocation={null}
                        googleToken={googleToken}
                        userProfile={userProfile}
                    />
                )}
            </main>
        </div>
    );
};

const HomePage: React.FC<{
    onTalkToAIClick: () => void;
    onNavigate: (path: string) => void;
    isLoggedIn: boolean;
    onLoginToggle: () => void;
    onLogout: () => void;
    userProfile?: UserProfile;
    onMarkNotificationAsRead?: (id: string) => void;
    onMarkAllNotificationsAsRead?: () => void;
}> = ({ onTalkToAIClick, onNavigate, isLoggedIn, onLoginToggle, onLogout, userProfile, onMarkNotificationAsRead, onMarkAllNotificationsAsRead }) => {
    
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    return (
        <div className="relative min-h-screen bg-[#020617] selection:bg-emerald-500/30">
            <HomeHeader 
                isLoggedIn={isLoggedIn} 
                onLoginToggle={onLoginToggle} 
                onNavigate={onNavigate} 
                onLogout={onLogout} 
                userProfile={userProfile}
                onMarkNotificationAsRead={onMarkNotificationAsRead}
                onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
            />
            
            <section className="pt-32 sm:pt-40 md:pt-48 pb-20 sm:pb-32 px-4 md:px-6 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto text-center relative z-10 max-w-5xl">
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.1] sm:leading-[1] drop-shadow-2xl uppercase">
                        Redefining Construction<br/>
                        <span className="text-white">With</span><br/>
                        <span className="text-emerald-400">AI Intelligence</span>
                    </h1>
                    
                    <p className="text-slate-400 text-sm sm:text-lg font-medium max-w-2xl mx-auto mb-10 opacity-80">
                        Specialized tools for every phase of your construction project
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-12">
                        <Icon name="bolt" className="h-3 w-3" /> Smart Tools Suite
                    </div>

                </div>

                <div className="container mx-auto max-w-7xl px-4" id="tools-list">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {CALCULATOR_TOOLS.map((category, idx) => {
                            const isExpanded = expandedCategory === category.title;
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                                    className={`flex flex-col bg-[#0f1623] border ${isExpanded ? 'border-emerald-500/50 bg-[#131b2c] ring-1 ring-emerald-500/20' : 'border-slate-800'} rounded-2xl p-6 hover:border-slate-600 transition-all cursor-pointer group shadow-xl relative overflow-hidden h-fit`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-[#0a1019] border border-slate-800 rounded-xl text-emerald-500 group-hover:text-emerald-400 transition-colors shadow-inner">
                                            <Icon name={category.tools[0].icon} className="h-6 w-6" />
                                        </div>
                                        <Icon name="chevron-down" className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-500' : ''}`} />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{category.title}</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed">{category.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{category.tools.length} TOOLS</span>
                                    </div>

                                    {/* Expanded Tools List - Inside the card */}
                                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-slate-700/50' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="space-y-3">
                                            {category.tools.map(tool => (
                                                <button 
                                                    key={tool.id} 
                                                    onClick={() => onNavigate(`/calculator/${tool.id}`)}
                                                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0a1019] border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 transition-all group/tool text-left shadow-sm"
                                                >
                                                    <span className="text-slate-200 text-xs font-bold group-hover/tool:text-emerald-400">{tool.name}</span>
                                                    <div className="p-1.5 rounded-lg bg-slate-800 group-hover/tool:bg-emerald-500/20 text-slate-600 group-hover/tool:text-emerald-400 transition-colors">
                                                        <Icon name="chevron-down" className="h-3 w-3 -rotate-90" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <footer className="bg-[#01040f] border-t border-white/5 pt-16 sm:pt-24 pb-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-20 mb-16 sm:mb-24">
                        <div className="space-y-6 sm:space-y-8">
                            <div className="flex items-center gap-3">
                                <img src={LOGO_URL} alt="BuildNet AI" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
                                <span className="text-white text-2xl sm:text-3xl font-black tracking-tighter">BuildNet <span className="text-emerald-400">AI</span></span>
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium text-sm">
                                Empowering India's construction industry with neural-engine estimators and architectural intelligence.
                            </p>
                        </div>
                        
                        <div className="space-y-6 sm:space-y-8">
                            <h4 className="text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em]">Direct Connectivity</h4>
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <a href="https://wa.me/918547735518" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group bg-slate-900/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/50 hover:border-[#25D366]/30 transition-all">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6"><Icon name="whatsapp" className="w-full h-full text-[#25D366]" /></div>
                                    <span className="text-slate-400 font-bold text-[10px] sm:text-xs tracking-widest group-hover:text-white transition-colors">+91 85477 35518</span>
                                </a>
                                <a href="mailto:info@buildnet.store" className="flex items-center gap-4 group bg-slate-900/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-all">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6"><Icon name="email" className="w-full h-full text-slate-500" /></div>
                                    <span className="text-slate-400 font-bold text-[10px] sm:text-xs tracking-widest group-hover:text-white transition-colors">INFO@BUILDNET.STORE</span>
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6 sm:space-y-8">
                            <h4 className="text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em]">Ecosystem Links</h4>
                            <ul className="flex flex-col gap-3 sm:gap-4">
                                <li><a href="https://www.buildnet.pro" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 font-bold text-[10px] sm:text-xs tracking-widest transition-all">SUBSCRIPTION SERVICES</a></li>
                                <li><a href="https://www.buildnetai.ae" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 font-bold text-[10px] sm:text-xs tracking-widest transition-all">GCC OPERATIONS</a></li>
                                <li><a href="https://www.buildnet.app" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 font-bold text-[10px] sm:text-xs tracking-widest transition-all underline underline-offset-8">AI WORKSPACE</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 sm:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                        <p className="text-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-center md:text-left">© 2026 BuildNet AI Engineering Lab.</p>
                        <div className="flex gap-8 sm:gap-10">
                             <a href="https://www.instagram.com/buildnet.ai" target="_blank" className="text-slate-600 hover:text-white transition-colors w-5 h-5 sm:w-6 sm:h-6"><Icon name="instagram" className="w-full h-full" /></a>
                             <a href="#" className="text-slate-600 hover:text-white transition-colors w-5 h-5 sm:w-6 sm:h-6"><Icon name="linkedin" className="w-full h-full" /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const AppContent: React.FC = () => {
  const routerNavigate = useNavigate();
  const navigate = (path: string) => routerNavigate(path);
  
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(authService.getCurrentUser());
  const [googleToken, setGoogleToken] = useState<string | undefined>(() => {
      try {
          const sessionStr = localStorage.getItem('buildnet_session_user');
          if (sessionStr) {
              const session = JSON.parse(sessionStr);
              return session.token;
          }
      } catch (e) {}
      return undefined;
  });
  const [directoryData, setDirectoryData] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchDirectoryData();
            setDirectoryData(data);
        } catch (err) { setError("Data offline."); } finally { setIsLoading(false); }
    };
    loadData();

    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
        setShowOnboardingModal(true);
    }

    // Check for payment success/cancel
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment') === 'success') {
        if (isLoggedIn && userProfile) {
            const updatedProfile = { ...userProfile, isPremium: true };
            setUserProfile(updatedProfile);
            authService.updateProfile(updatedProfile);
            setAlertModal({ isOpen: true, message: 'Payment successful! You are now a premium user.' });
        }
        // Remove query param
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('payment') === 'cancelled') {
        setAlertModal({ isOpen: true, message: 'Payment was cancelled.' });
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
      import('./firebase').then(({ auth }) => {
          import('firebase/auth').then(({ onAuthStateChanged }) => {
              const unsubscribe = onAuthStateChanged(auth, async (user) => {
                  if (user) {
                      setIsLoggedIn(true);
                      const profile = await authService.fetchUserProfile(user.uid);
                      if (profile) {
                          setUserProfile(profile);
                      }
                  } else {
                      setIsLoggedIn(false);
                      setUserProfile(authService.getCurrentUser()); // Fallback to default
                  }
              });
              return () => unsubscribe();
          });
      });
  }, []);

  const handleCloseOnboarding = () => {
      localStorage.setItem('hasSeenOnboarding', 'true');
      setShowOnboardingModal(false);
  };

  const handleLoginSuccess = (user: UserProfile, token?: string) => {
      setUserProfile(user);
      setIsLoggedIn(true);
      if (token) {
          setGoogleToken(token);
          // Persist Google user in authService
          localStorage.setItem('buildnet_session_user', JSON.stringify({ email: user.email, token }));
          authService.updateProfile(user);
      }
      setShowLoginModal(false);
  };

  const handleMarkNotificationAsRead = (id: string) => {
      const updatedNotifications = (userProfile.notifications || []).map(n => 
          n.id === id ? { ...n, read: true } : n
      );
      const updatedProfile = { ...userProfile, notifications: updatedNotifications };
      setUserProfile(updatedProfile);
      authService.updateProfile(updatedProfile);
  };

  const handleMarkAllNotificationsAsRead = () => {
      const updatedNotifications = (userProfile.notifications || []).map(n => ({ ...n, read: true }));
      const updatedProfile = { ...userProfile, notifications: updatedNotifications };
      setUserProfile(updatedProfile);
      authService.updateProfile(updatedProfile);
  };

  const handleToggleFavorite = (business: Business) => {
      if (!isLoggedIn) {
          setShowLoginModal(true);
          return;
      }
      const favorites = userProfile.favorites || [];
      const isFavorite = favorites.some(f => f.name === business.name);
      const updatedFavorites = isFavorite 
          ? favorites.filter(f => f.name !== business.name)
          : [...favorites, business];
          
      const updatedProfile = { ...userProfile, favorites: updatedFavorites };
      setUserProfile(updatedProfile);
      authService.updateProfile(updatedProfile);
  };

  return (
    <div className="font-sans bg-slate-950 min-h-screen text-slate-200 selection:bg-emerald-500/30 relative">
      <Routes>
          <Route path="/" element={<HomePage onTalkToAIClick={() => setChatOpen(true)} onNavigate={navigate} isLoggedIn={isLoggedIn} onLoginToggle={() => setShowLoginModal(true)} onLogout={() => { authService.logout(); setIsLoggedIn(false); setGoogleToken(undefined); }} userProfile={userProfile} onMarkNotificationAsRead={handleMarkNotificationAsRead} onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead} />} />
          <Route path="/marketplace" element={<MarketplacePage directoryData={directoryData} googleToken={googleToken} userProfile={userProfile} onLoginToggle={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} onLogout={() => { authService.logout(); setIsLoggedIn(false); setGoogleToken(undefined); }} onNavigate={navigate} onMarkNotificationAsRead={handleMarkNotificationAsRead} onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead} onToggleFavorite={handleToggleFavorite} />} />
          <Route path="/directory" element={<Navigate to="/marketplace" replace />} />
          <Route path="/business" element={isLoggedIn ? <ProfilePage onNavigate={navigate} onLogout={() => { authService.logout(); setIsLoggedIn(false); }} profile={userProfile} onProfileChange={(p) => { setUserProfile(p); authService.updateProfile(p); }} selectedSuppliers={[]} onSelectSupplier={()=>{}} onToggleFavorite={handleToggleFavorite} /> : <Navigate to="/" replace />} />
          <Route path="/calculator" element={<CalculatorPage onNavigate={navigate} onLogout={() => { authService.logout(); setIsLoggedIn(false); }} isLoggedIn={isLoggedIn} userProfile={userProfile} onProfileChange={(p) => { setUserProfile(p); authService.updateProfile(p); }} googleToken={googleToken} />} />
          <Route path="/calculator/:toolId" element={<CalculatorPage onNavigate={navigate} onLogout={() => { authService.logout(); setIsLoggedIn(false); }} isLoggedIn={isLoggedIn} userProfile={userProfile} onProfileChange={(p) => { setUserProfile(p); authService.updateProfile(p); }} googleToken={googleToken} />} />
          <Route path="/dashboard" element={isLoggedIn ? <DashboardPage rfqs={userProfile.rfqs || []} onNavigate={navigate} onLogout={() => { authService.logout(); setIsLoggedIn(false); }} favorites={userProfile.favorites || []} onToggleFavorite={handleToggleFavorite} userProfile={userProfile} onUpdateRfqStatus={()=>{}} /> : <Navigate to="/" replace />} />
      </Routes>
      
      <Chatbot 
        isOpen={chatOpen} 
        setIsOpen={setChatOpen} 
        userLocation={null} 
        directoryData={directoryData} 
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />
      {showOnboardingModal && <OnboardingModal onClose={handleCloseOnboarding} />}
      {isLoggedIn && userProfile && <ChatSystem currentUser={userProfile} />}
      <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={() => setAlertModal({ isOpen: false, message: '' })} />
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#020617', height: '100vh' }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#f87171' }}>{this.state.error?.message}</pre>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => (
  <ErrorBoundary>
    <HashRouter><AppContent /></HashRouter>
  </ErrorBoundary>
);

export default App;
