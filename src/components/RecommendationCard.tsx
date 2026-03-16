import * as React from 'react';
import { Business } from '../types';
import { Icon } from './Icon';

interface RecommendationCardProps {
    business: Business;
    onSelect?: (business: Business) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ business, onSelect }) => {
    return (
        <div 
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all cursor-pointer group"
            onClick={() => onSelect && onSelect(business)}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors line-clamp-1">{business.name}</h4>
                    <p className="text-slate-500 text-xs">{business.category}</p>
                </div>
                {business.rating && (
                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500">
                        {business.rating} <Icon name="star" className="h-2.5 w-2.5" />
                    </div>
                )}
            </div>
            
            <p className="text-slate-400 text-xs line-clamp-2 mb-3 h-8">{business.description || `Verified ${business.category} in ${business.location}`}</p>
            
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
                <span className="flex items-center gap-1"><Icon name="location" className="h-3 w-3" /> {business.location.split(',')[0]}</span>
                <span className="text-emerald-500 group-hover:underline flex items-center gap-1">View Details <Icon name="arrow-right" className="h-3 w-3" /></span>
            </div>
        </div>
    );
};
