
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Business, GroundingChunk, UserLocation, UserProfile } from '../types';
import { BusinessCard } from './BusinessCard';
import { BusinessCardSkeleton } from './BusinessCardSkeleton';
import { Icon } from './Icon';
import { MapView } from './MapView';
import { LoadingSpinner } from './LoadingSpinner';
import { googleDriveService } from '../services/googleDriveService';

interface ResultsDisplayProps {
  results: Business[] | null; isLoading: boolean; isAiSearching: boolean;
  sources: GroundingChunk[]; selectedSuppliers: Business[];
  onSelectSupplier: (b: Business) => void;
  favorites?: Business[]; onToggleFavorite?: (b: Business) => void;
  error?: string | null; userLocation: UserLocation | null;
  googleToken?: string; userProfile?: UserProfile;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
    results, isLoading, isAiSearching, sources, selectedSuppliers, onSelectSupplier, 
    favorites = [], onToggleFavorite, error, userLocation, googleToken, userProfile
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(() => {
      return localStorage.getItem('buildnet_auto_sync') === 'true';
  });

  useEffect(() => {
      localStorage.setItem('buildnet_auto_sync', String(autoSync));
  }, [autoSync]);

  const handleSaveToDrive = useCallback(async () => {
    if (!googleToken || !results || results.length === 0) return;
    
    setIsDriveSaving(true);
    setSyncError(null);
    try {
        const headers = "Name,Category,Location,Phone,Rating,Description\n";
        const rows = results.map(b => 
            `"${(b.name || '').replace(/"/g, '""')}","${(b.category || '').replace(/"/g, '""')}","${(b.location || '').replace(/"/g, '""')}","${b.phone || ''}","${b.rating || ''}","${(b.description || '').replace(/"/g, '""')}"`
        ).join("\n");
        const csvData = headers + rows;

        const projectName = userProfile?.businessName || "BuildNet Sourcing";
        const categoryName = results[0]?.category || "General Search";
        const fileName = `BuildNet_${categoryName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        
        await googleDriveService.saveToDrive(googleToken, projectName, "Verified Providers", fileName, csvData);
        setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) { 
        console.error("Auto-sync error:", err);
        setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally { setIsDriveSaving(false); }
  }, [googleToken, results, userProfile]);

  const handleEmailResults = () => {
    if (!results) return;
    const body = `Verified Providers for ${results[0]?.category}:\n\n` + 
        results.map(b => `${b.name} - ${b.phone} - ${b.location}`).join('\n') + 
        `\n\nGenerated via BuildNet AI Marketplace`;
    window.location.href = `mailto:?subject=BuildNet Provider List&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    if (autoSync && results && results.length > 0 && !isLoading && googleToken) {
        handleSaveToDrive();
    }
  }, [autoSync, results, isLoading, handleSaveToDrive, googleToken]);

  if (isLoading) return (
    <div className="mt-12 w-full flex flex-col items-center justify-center min-h-[400px]">
        {isAiSearching ? <LoadingSpinner isThinking /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-fade-in">{[...Array(4)].map((_, i) => <BusinessCardSkeleton key={i} />)}</div>}
    </div>
  );

  if (!results) return (
    <div className="mt-16 text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[3rem] animate-slide-up">
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 w-fit mx-auto mb-8 shadow-2xl"><Icon name="search" className="h-12 w-12 text-slate-700" /></div>
        <h3 className="text-white font-black text-2xl tracking-tight mb-4 uppercase">Construction Intelligence Marketplace</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">Select a category or use the AI Neural Query to populate the directory with live Google Maps data.</p>
    </div>
  );

  return (
    <div className="mt-16 w-full space-y-12 animate-slide-up">
        {/* Workspace Sync Control */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-emerald-500/20 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Icon name="database" className="h-64 w-64 text-emerald-400" /></div>
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
                <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl transform group-hover:rotate-6 transition-transform">
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="h-10 w-10 sm:h-12 sm:w-12" alt="Sheets" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-white font-black text-2xl sm:text-3xl tracking-tighter mb-3 sm:mb-4 uppercase">Google Workspace Sync</h3>
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base max-w-md font-medium leading-relaxed">
                        Export {results.length} verified providers for <span className="text-emerald-400 font-black">"{results[0]?.category || 'Your Search'}"</span> to a Google Sheet automatically.
                    </p>
                    {googleToken ? (
                        <div className="mt-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setAutoSync(!autoSync)} 
                                    className={`w-12 h-6 rounded-full relative transition-colors ${autoSync ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${autoSync ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enable Category-to-Sheet Automation</span>
                            </div>
                            {syncError && (
                                <div className="flex items-center gap-2 text-red-400 text-[9px] font-black uppercase tracking-widest animate-fade-in">
                                    <Icon name="x-mark" className="h-3 w-3" />
                                    {syncError}
                                </div>
                            )}
                            {lastSyncTime && !syncError && (
                                <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-widest animate-fade-in">
                                    <Icon name="check" className="h-3 w-3" />
                                    Data extracted to sheets at {lastSyncTime}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/20 rounded-2xl">
                             <p className="text-orange-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Icon name="bolt" className="h-4 w-4" />
                                Sign in with Google Workspace to enable Sheet Export
                             </p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full lg:w-auto z-10">
                <button 
                    onClick={handleSaveToDrive} 
                    disabled={isDriveSaving || !googleToken} 
                    className={`px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 sm:gap-4 ${googleToken ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
                >
                    {isDriveSaving ? <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icon name="download" className="h-4 w-4 sm:h-5 sm:w-5" />}
                    {isDriveSaving ? 'Extracting...' : 'Sync to Sheets Now'}
                </button>
                <button 
                    onClick={handleEmailResults}
                    className="px-8 sm:px-12 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3"
                >
                    <Icon name="email" className="h-3 w-3 sm:h-4 sm:w-4" />
                    Email Result List
                </button>
            </div>
        </div>

        {sources && sources.length > 0 && (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                    <Icon name="map" className="h-4 w-4 text-blue-400" />
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Sources (Google Maps)</h5>
                </div>
                <div className="flex flex-wrap gap-4">
                    {sources.map((source, idx) => {
                        const link = source.maps || source.web;
                        if (!link?.uri) return null;
                        return (
                            <a 
                                key={idx} 
                                href={link.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/30 transition-all text-xs font-medium text-slate-300"
                            >
                                <Icon name={source.maps ? "map" : "share"} className="h-3 w-3 text-emerald-400" />
                                {link.title || 'View Location'}
                            </a>
                        );
                    })}
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-8">
            <h4 className="text-white font-black text-xl sm:text-2xl tracking-tighter uppercase text-center md:text-left">{results.length} Verified Providers</h4>
            <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex shadow-inner w-full md:w-auto">
                <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>List</button>
                <button onClick={() => setViewMode('map')} className={`flex-1 md:flex-none px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-600 hover:text-slate-400'}`}>Map</button>
            </div>
        </div>

        {viewMode === 'map' ? <MapView businesses={results} userLocation={userLocation} onSelect={onSelectSupplier} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {results.slice(0, 20).map((b, i) => <BusinessCard key={i} business={b} isSelected={selectedSuppliers.some(s => s.name === b.name)} onSelect={onSelectSupplier} isFavorite={favorites.some(f => f.name === b.name)} onToggleFavorite={onToggleFavorite} />)}
            </div>
        )}
    </div>
  );
};
