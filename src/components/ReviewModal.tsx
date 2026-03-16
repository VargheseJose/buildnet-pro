import * as React from 'react';
import { useState } from 'react';
import { Icon } from './Icon';

const AlertModal: React.FC<{ isOpen: boolean; message: string; onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
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

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    businessName: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, businessName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setAlertModal({ isOpen: true, message: "Please select a rating" });
            return;
        }
        onSubmit(rating, comment);
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-scale-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                    <Icon name="x-mark" className="h-6 w-6" />
                </button>
                
                <h3 className="text-2xl font-black text-white mb-2">Rate & Review</h3>
                <p className="text-slate-400 text-sm mb-6">Share your experience with <span className="text-emerald-400 font-bold">{businessName}</span></p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Icon 
                                    name="star" 
                                    className={`h-8 w-8 ${star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-slate-700'}`} 
                                />
                            </button>
                        ))}
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px] placeholder:text-slate-700"
                            placeholder="Tell us about your experience..."
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        Submit Review
                    </button>
                </form>
            </div>
            <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={() => setAlertModal({ isOpen: false, message: '' })} />
        </div>
    );
};
