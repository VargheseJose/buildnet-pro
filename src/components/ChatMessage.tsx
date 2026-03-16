
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Business, GroundingChunk } from '../types';
import { Icon, IconName } from './Icon';

interface Message {
  sender: 'user' | 'bot';
  text?: string;
  businesses?: Business[];
  isLoading?: boolean;
  query?: string;
  sources?: GroundingChunk[];
}

interface ChatMessageProps {
  message: Message;
}

const THINKING_MESSAGES = [
    "Thinking...",
    "Consulting IS Codes...",
    "Analyzing materials...",
    "Estimating costs...",
    "Searching local data...",
    "Reviewing specs...",
    "Checking standards..."
];

const ActionLink: React.FC<{ href?: string; icon: IconName; label: string; className: string }> = ({ href, icon, label, className }) => {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${className}`}
        >
            <Icon name={icon} className="h-3.5 w-3.5" />
            {label}
        </a>
    );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-yellow-400 text-xs font-bold">{rating}</span>
      <Icon name="star" className="h-3 w-3 text-yellow-400" />
    </div>
  );
};

const ChatBusinessCard: React.FC<{ business: Business }> = ({ business }) => {
    const whatsappUrl = business.whatsapp ? `https://wa.me/${business.whatsapp.replace(/[^+\d]/g, '')}` : undefined;
    const phoneUrl = business.phone ? `tel:${business.phone.replace(/[^+\d]/g, '')}` : undefined;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md text-sm hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-white text-base">{business.name}</h4>
                {business.rating && <StarRating rating={business.rating} />}
            </div>
            <p className="text-emerald-400 font-medium text-xs mb-0.5">{business.category}</p>
            <p className="text-slate-400 text-xs mb-3 flex items-center gap-1">
                <Icon name="location" className="h-3 w-3" />
                {business.location}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
                <ActionLink 
                    href={phoneUrl} 
                    icon="phone" 
                    label="Call" 
                    className="bg-slate-700 text-white hover:bg-slate-600 border border-slate-600" 
                />
                <ActionLink 
                    href={whatsappUrl} 
                    icon="whatsapp" 
                    label="Chat" 
                    className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30"
                />
                <ActionLink 
                    href={business.mapUrl} 
                    icon="map" 
                    label="Map" 
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30" 
                />
            </div>
        </div>
    );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const [thinkingText, setThinkingText] = useState(THINKING_MESSAGES[0]);

  useEffect(() => {
      if (!message.isLoading) return;
      const interval = setInterval(() => {
          setThinkingText(prev => {
              const idx = THINKING_MESSAGES.indexOf(prev);
              return THINKING_MESSAGES[(idx + 1) % THINKING_MESSAGES.length];
          });
      }, 2000);
      return () => clearInterval(interval);
  }, [message.isLoading]);
  
  const containerClasses = isUser 
    ? 'bg-emerald-600 text-white shadow-lg' 
    : message.businesses 
        ? 'bg-transparent pl-0' // Transparent for result lists to let cards pop
        : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-md';

  if (message.isLoading) {
    return (
        <div className="flex justify-start animate-fade-in mb-4">
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700 text-slate-400 text-sm flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <span className="animate-pulse">{thinkingText}</span>
            </div>
        </div>
    );
  }
  
  const validSources = message.sources?.filter(source => source.web?.uri || source.maps?.uri);

  return (
    <div className={`flex ${alignment} mb-4`}>
      <div className={`max-w-[85%] md:max-w-md lg:max-w-lg rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} ${!message.businesses ? `px-5 py-3 ${containerClasses}` : 'w-full'}`}>
        {message.text && (
            <div className={`whitespace-pre-wrap leading-relaxed ${message.businesses ? 'bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 mb-3 text-slate-200 shadow-md' : ''}`}>
                {message.text}
            </div>
        )}
        
        {message.businesses && (
          <div className="space-y-3 w-full">
            {message.businesses.length > 0 ? (
                <>
                    <p className="text-xs text-slate-500 font-medium ml-1 mb-2">
                        Found {message.businesses.length} result{message.businesses.length > 1 ? 's' : ''} using live Google Maps data:
                    </p>
                    <div className="grid gap-3">
                        {message.businesses.map((biz, index) => (
                            <ChatBusinessCard key={index} business={biz} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center shadow-md">
                    <div className="bg-slate-700/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon name="search" className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-300 font-medium mb-1">No results found</p>
                    <p className="text-slate-500 text-sm mb-4">Try adjusting your search terms or location.</p>
                     {message.query && (
                        <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(message.query)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all w-full border border-slate-600"
                        >
                             <Icon name="search" className="w-4 h-4 text-emerald-400"/>
                             Search Google for "{message.query}"
                        </a>
                    )}
                </div>
            )}
          </div>
        )}

        {!message.businesses && message.query && (
             <div className="mt-3 pt-3 border-t border-white/10">
                 <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(message.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 hover:underline"
                >
                        <Icon name="search" className="w-3 h-3"/>
                        Search Google for "{message.query}"
                </a>
             </div>
        )}

        {validSources && validSources.length > 0 && (
            <div className={`mt-4 pt-4 border-t ${message.businesses ? 'border-slate-700' : 'border-white/10'}`}>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-3 flex items-center gap-2">
                    <Icon name="database" className="h-3 w-3" />
                    Verified Sources
                </p>
                <div className="space-y-2">
                    {validSources.slice(0, 5).map((source, idx) => {
                        const link = source.web || source.maps;
                        if (!link?.uri) return null;
                        return (
                            <a 
                                key={idx}
                                href={link.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                            >
                                <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-800 group-hover:bg-emerald-500/10 transition-colors">
                                    <Icon name={source.maps ? "location" : "website"} className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-300 truncate group-hover:text-white">{link.title || 'Source Reference'}</p>
                                </div>
                                <Icon name="share" className="h-2.5 w-2.5 text-slate-600 group-hover:text-emerald-500" />
                            </a>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
