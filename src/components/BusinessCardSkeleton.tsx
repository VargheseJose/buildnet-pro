
import * as React from 'react';

export const BusinessCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 flex flex-col h-full border border-slate-800/80 animate-pulse">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-5 sm:mb-6 gap-4">
            <div className="min-w-0 flex-1">
                {/* Title */}
                <div className="h-6 sm:h-8 bg-slate-800 rounded-xl w-3/4 mb-3"></div>
                {/* Rating */}
                <div className="h-4 bg-slate-800 rounded-lg w-1/3"></div>
            </div>
            <div className="flex gap-2">
                {/* Action icons */}
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-800 rounded-xl sm:rounded-2xl shrink-0"></div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-800 rounded-xl sm:rounded-2xl shrink-0"></div>
            </div>
        </div>

        <div className="space-y-4 mb-8">
            {/* Category */}
            <div className="h-8 bg-slate-800 rounded-xl w-1/2"></div>
            {/* Location */}
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-slate-800 rounded-xl shrink-0"></div>
                <div className="h-10 bg-slate-800 rounded-xl w-full"></div>
            </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-6">
            <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-800 rounded-lg w-5/6"></div>
            <div className="h-4 bg-slate-800 rounded-lg w-4/6"></div>
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-6">
          <div className="h-12 bg-slate-800 rounded-2xl w-full"></div>
          <div className="h-12 bg-slate-800 rounded-2xl w-full"></div>
      </div>
    </div>
  );
};
