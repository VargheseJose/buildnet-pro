import * as React from 'react';
import { CATEGORIES_DATA, KERALA_DISTRICTS } from '../data/categories';
import { Icon } from './Icon';
import Fuse from 'fuse.js';
import { Business } from '../types';

interface SearchFormProps {
  mainCategory: string; setMainCategory: (v: string) => void;
  category: string; onCategoryChange: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  query: string; setQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isLoading: boolean;
  searchMode: 'standard' | 'ai'; setSearchMode: (v: 'standard' | 'ai') => void;
  fuse: Fuse<Business> | null;
  onSuggestionSelect: (s: any) => void;
  isNearMe: boolean; onToggleNearMe: () => void;
  selectedState: string; setSelectedState: (v: string) => void;
  // AI specific parameters
  aiParams?: {
    style: string;
    materials: string;
    imageQuality: string;
  };
  setAiParams?: (params: { style: string; materials: string; imageQuality: string }) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ 
    mainCategory, setMainCategory, category, onCategoryChange, district, setDistrict,
    query, setQuery, handleSearch, isLoading, searchMode, setSearchMode,
    isNearMe, onToggleNearMe, aiParams, setAiParams
}) => {
  const isAi = searchMode === 'ai';
  const [showAiParams, setShowAiParams] = React.useState(false);
  
  // Refined classes for better mobile touch experience
  const fieldClasses = "w-full px-4 py-4 bg-slate-900/60 border border-slate-700/80 rounded-2xl shadow-inner focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-white placeholder-slate-600 text-base md:text-sm appearance-none outline-none";
  const labelClasses = "block text-[11px] font-black text-slate-500 mb-2.5 uppercase tracking-[0.2em] ml-1.5";

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full bg-slate-900/30 backdrop-blur-2xl p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border border-slate-800/60 shadow-2xl animate-slide-up ring-1 ring-white/5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8 items-end">
        
        {/* Industry Segment */}
        <div className="space-y-1.5">
            <label className={labelClasses}>Industry Segment</label>
            <div className="relative group">
                <select 
                    value={mainCategory} 
                    onChange={e => {setMainCategory(e.target.value); onCategoryChange('');}} 
                    className={`${fieldClasses} cursor-pointer pr-10`}
                >
                    <option value="">All Segments</option>
                    {Object.keys(CATEGORIES_DATA).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-hover:text-emerald-500 transition-colors">
                    <Icon name="chevron-down" className="h-4 w-4" />
                </div>
            </div>
        </div>

        {/* Specific Service */}
        <div className="space-y-1.5">
            <label className={labelClasses}>Service Type</label>
            <div className="relative group">
                <select 
                    value={category} 
                    onChange={e => onCategoryChange(e.target.value)} 
                    className={`${fieldClasses} cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed`} 
                    disabled={!mainCategory}
                >
                    <option value="">{mainCategory ? `All Services` : 'Select Segment First'}</option>
                    {(CATEGORIES_DATA[mainCategory] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-hover:text-emerald-500 transition-colors">
                    <Icon name="chevron-down" className="h-4 w-4" />
                </div>
            </div>
        </div>

        {/* Region / Near Me */}
        <div className="space-y-1.5">
            <label className={labelClasses}>Region & Search Radius</label>
            <div className="flex items-center gap-3">
                <div className="relative flex-1 group">
                    <select 
                        value={district} 
                        onChange={e => setDistrict(e.target.value)} 
                        className={`${fieldClasses} pr-10 disabled:opacity-50 disabled:cursor-not-allowed`} 
                        disabled={isNearMe}
                    >
                        <option value="">Kerala (All Districts)</option>
                        {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-hover:text-emerald-500 transition-colors">
                        <Icon name="chevron-down" className="h-4 w-4" />
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={onToggleNearMe} 
                    aria-label="Toggle location search"
                    className={`shrink-0 w-[58px] h-[58px] md:w-[52px] md:h-[52px] rounded-2xl border transition-all active:scale-90 flex items-center justify-center ${isNearMe ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500/50'}`}
                >
                    <Icon name="location" className={`h-6 w-6 md:h-5 md:w-5 ${isNearMe ? 'animate-pulse' : ''}`} />
                </button>
            </div>
        </div>

        {/* Keyword Search & AI Toggle */}
        <div className="space-y-1.5">
             <div className="flex justify-between items-center mb-1.5 px-1.5">
                <label className={labelClasses}>{isAi ? 'Neural Query' : 'Refine Results'}</label>
                <button 
                    type="button" 
                    onClick={() => setSearchMode(isAi ? 'standard' : 'ai')} 
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${isAi ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'}`}
                >
                    {isAi ? 'AI Engine: ON' : 'Standard Mode'}
                </button>
             </div>
             <div className="relative group">
                <input 
                    type="text" 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    className={`${fieldClasses} pl-12 pr-14 ${isAi ? 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/20' : ''}`} 
                    placeholder={isAi ? "Ask about architects, materials..." : "Company or service name..."} 
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                    <Icon name={isAi ? "chat" : "search"} className="h-5 w-5" />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-[42px] w-[42px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all active:scale-90 shadow-lg shadow-emerald-900/20 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Icon name="send" className="h-5 w-5" />
                    )}
                </button>
             </div>
        </div>
      </div>

      {isAi && aiParams && setAiParams && (
        <div className="mt-6 pt-6 border-t border-slate-800/60">
            <button 
                type="button" 
                onClick={() => setShowAiParams(!showAiParams)}
                className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
            >
                <Icon name="chevron-down" className={`h-4 w-4 transition-transform ${showAiParams ? 'rotate-180' : ''}`} />
                AI Design Generator Parameters
            </button>
            
            {showAiParams && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 animate-slide-down">
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Preferred Style</label>
                        <select 
                            value={aiParams.style} 
                            onChange={e => setAiParams({...aiParams, style: e.target.value})} 
                            className={fieldClasses}
                        >
                            <option value="">Any Style</option>
                            <option value="Modern">Modern</option>
                            <option value="Traditional Indian">Traditional Indian</option>
                            <option value="Minimalist">Minimalist</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Contemporary">Contemporary</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Materials</label>
                        <input 
                            type="text" 
                            value={aiParams.materials} 
                            onChange={e => setAiParams({...aiParams, materials: e.target.value})} 
                            placeholder="e.g., Wood, Glass, Concrete" 
                            className={fieldClasses}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Image Quality</label>
                        <select 
                            value={aiParams.imageQuality} 
                            onChange={e => setAiParams({...aiParams, imageQuality: e.target.value})} 
                            className={fieldClasses}
                        >
                            <option value="Standard">Standard</option>
                            <option value="High">High (4K)</option>
                            <option value="Ultra">Ultra (Photorealistic)</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
      )}
    </form>
  );
};