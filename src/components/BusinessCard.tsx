import * as React from 'react';
import { useState, useEffect } from 'react';
import { Business, Review } from '../types';
import { Icon, IconName } from './Icon';
import { ReviewModal } from './ReviewModal';
import { reviewService } from '../services/reviewService';
import { authService } from '../services/authService';

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

const StarRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Icon key={i} name="star" className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-slate-700'}`} />
      ))}
      <span className="ml-1 text-[10px] text-slate-500 font-black uppercase tracking-widest">{rating.toFixed(1)} {count !== undefined && `(${count})`}</span>
    </div>
);

interface BusinessCardProps {
  business: Business; isSelected: boolean; onSelect: (b: Business) => void;
  isFavorite?: boolean; onToggleFavorite?: (b: Business) => void;
}

import { chatService } from '../services/chatService';

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, isSelected, onSelect, isFavorite, onToggleFavorite }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [displayRating, setDisplayRating] = useState(business.rating || 0);
  const [showReviews, setShowReviews] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
      const fetchReviews = async () => {
          const storedReviews = await reviewService.getReviews(business.name);
          setReviews(storedReviews);
          
          const avgRating = await reviewService.getAverageRating(business.name);
          if (avgRating !== null) {
              setDisplayRating(avgRating);
          }
      };
      fetchReviews();
  }, [business.name]);

  const handleAddReview = async (rating: number, comment: string) => {
      const user = authService.getCurrentUser();
      const newReview: Review = {
          id: Date.now().toString(),
          userId: user?.email || 'anonymous',
          userName: user?.businessName || 'Anonymous User',
          rating,
          comment,
          date: new Date().toISOString()
      };
      
      await reviewService.addReview(business.name, newReview);
      
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);
      
      // Calculate new average
      const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      setDisplayRating(sum / updatedReviews.length);
  };
  
  // Check if business is in RMC category to allow RFQ selection
  const isRmcCategory = business.category?.toLowerCase().includes('ready-mix') || 
                       business.category?.toLowerCase().includes('rmc') ||
                       business.category?.toLowerCase().includes('concrete batching') ||
                       business.category?.toLowerCase().includes('concrete pumps');

  const isValidPhone = (phone?: string) => {
      return phone && phone.replace(/\D/g, '').length >= 10;
  };

  const isValidEmail = (email?: string) => {
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const hasValidPhone = isValidPhone(business.phone);
  const hasValidEmail = isValidEmail(business.email);

  const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const shareData = {
          title: business.name,
          text: `Check out ${business.name} on BuildNet!\nCategory: ${business.category}\nLocation: ${business.location}${business.phone ? `\nPhone: ${business.phone}` : ''}`,
          url: window.location.href,
      };

      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
              alert('Business details copied to clipboard!');
          }
      } catch (err) {
          console.error('Error sharing:', err);
      }
  };

  return (
    <>
    <div className={`group bg-slate-900/60 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 md:p-8 flex flex-col h-full transition-all duration-500 border border-slate-800/80 hover:border-slate-600 hover:shadow-2xl relative overflow-hidden animate-slide-up ${isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}`}>
        {isSelected && <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 sm:px-5 py-1.5 rounded-bl-2xl sm:rounded-bl-3xl text-[9px] font-black uppercase tracking-widest z-10 shadow-xl">Linked</div>}
        
        <div className="flex-grow">
            <div className="flex justify-between items-start mb-5 sm:mb-6 gap-4">
                <div className="min-w-0 flex-1">
                    <h3 onClick={() => setShowReviews(!showReviews)} className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-emerald-400 transition-colors line-clamp-2">{business.name}</h3>
                    <div className="mt-2 sm:mt-3 cursor-pointer" onClick={() => setShowReviews(!showReviews)}>
                        <StarRating rating={displayRating} count={reviews.length > 0 ? reviews.length : undefined} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleShare} className="shrink-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-all active:scale-75 text-slate-600 hover:text-emerald-400" title="Share">
                        <Icon name="share" className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    {onToggleFavorite && (
                        <button onClick={() => onToggleFavorite(business)} className={`shrink-0 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition-all active:scale-75 ${isFavorite ? 'text-red-500' : 'text-slate-600'}`} title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                            <Icon name="heart" className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Icon name="building" className="h-4 w-4" /></div>
                    {business.category}
                </div>
                <div className="flex items-start gap-3 text-slate-400 text-xs font-medium leading-relaxed">
                    <div className="p-2 bg-slate-800/50 rounded-xl mt-0.5 border border-slate-700/50"><Icon name="location" className="h-4 w-4 text-slate-500" /></div>
                    <span className="line-clamp-2">{business.location}</span>
                </div>
            </div>
            
            {business.description && <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3 mb-6">{business.description}</p>}
            
            {showReviews && (
                <div className="mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-bold text-sm">Reviews</h4>
                        <button onClick={() => setIsReviewModalOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300">Write Review</button>
                    </div>
                    {reviews.length > 0 ? (
                        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-slate-300 text-xs font-bold">{review.userName}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Icon key={i} name="star" className={`h-2 w-2 ${i < review.rating ? 'fill-current' : 'text-slate-800'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-[10px] mb-2">{new Date(review.date).toLocaleDateString()}</p>
                                    <p className="text-slate-400 text-xs">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-600 text-xs italic">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            )}
        </div>

        <div className={`grid ${isRmcCategory ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} gap-3 no-print mt-auto pt-6`}>
            {hasValidPhone ? (
                <a href={`https://wa.me/${business.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 py-3.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#25D366]/20 transition-all active:scale-95 shadow-lg">
                    <Icon name="whatsapp" className="h-4 w-4" /> WhatsApp
                </a>
            ) : (
                <button disabled className="flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 cursor-not-allowed">
                    <Icon name="whatsapp" className="h-4 w-4" /> WhatsApp
                </button>
            )}
            
            {hasValidEmail || business.name ? (
                 <button onClick={() => chatService.startChat(business.email || business.name)} className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95 shadow-lg">
                    <Icon name="chat-bubble-left-right" className="h-4 w-4" /> Message
                </button>
            ) : (
                <button disabled className="flex items-center justify-center gap-2 py-3.5 bg-slate-800/50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 cursor-not-allowed">
                    <Icon name="chat-bubble-left-right" className="h-4 w-4" /> Message
                </button>
            )}

            {isRmcCategory ? (
                <button onClick={() => onSelect(business)} className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${isSelected ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'}`}>
                    <Icon name={isSelected ? "check" : "plus"} className="h-4 w-4" /> {isSelected ? 'Remove' : 'Select'}
                </button>
            ) : (
                <button onClick={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: business.name,
                            text: `Check out ${business.name} on BuildNet!`,
                            url: window.location.href,
                        }).catch(console.error);
                    } else {
                        // Fallback for browsers that don't support Web Share API
                        navigator.clipboard.writeText(`${business.name} - ${business.location}\n${window.location.href}`);
                        alert('Business details copied to clipboard!');
                    }
                }} className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95 shadow-lg">
                    <Icon name="share" className="h-4 w-4" /> Share
                </button>
            )}
        </div>
    </div>
    <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={handleAddReview}
        businessName={business.name}
    />
    </>
  );
};
