import React, { useState } from 'react';
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

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    if (!isOpen) return null;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsLoading(true);
        
        const res = await loadRazorpayScript();
        if (!res) {
            setAlertModal({ isOpen: true, message: 'Razorpay SDK failed to load. Are you offline?' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/razorpay/order', { method: 'POST' });
            const data = await response.json();

            if (!data.order) {
                setAlertModal({ isOpen: true, message: 'Server error. Are you sure you configured the Razorpay keys?' });
                setIsLoading(false);
                return;
            }

            const options = {
                key: data.key_id,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "BuildNet Premium",
                description: "Upgrade to Premium",
                order_id: data.order.id,
                handler: function (response: any) {
                    setAlertModal({ isOpen: true, message: 'Payment Successful! Payment ID: ' + response.razorpay_payment_id });
                    onClose();
                },
                prefill: {
                    name: "BuildNet User",
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#10b981"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error(error);
            setAlertModal({ isOpen: true, message: 'Something went wrong.' });
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <Icon name="x-mark" className="h-6 w-6" />
                </button>
                
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="star" className="h-8 w-8 text-emerald-400" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-2">Upgrade to Premium</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        You've reached your limit of 100 free downloads for 3D rendering and estimation. Upgrade to premium for unlimited access.
                    </p>
                    
                    <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700 text-left">
                        <h3 className="text-white font-bold mb-4">Premium Features:</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <Icon name="check" className="h-4 w-4 text-emerald-400 shrink-0" />
                                Unlimited 3D Rendering Downloads
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <Icon name="check" className="h-4 w-4 text-emerald-400 shrink-0" />
                                Unlimited AI Estimations
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <Icon name="check" className="h-4 w-4 text-emerald-400 shrink-0" />
                                High-Resolution Exports
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <Icon name="check" className="h-4 w-4 text-emerald-400 shrink-0" />
                                Priority Support
                            </li>
                        </ul>
                    </div>
                    
                    <button 
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Icon name="bolt" className="h-5 w-5" />
                                Upgrade Now with Razorpay
                            </>
                        )}
                    </button>
                    <p className="text-xs text-slate-500 mt-4">Secure payment powered by Razorpay</p>
                </div>
            </div>
            <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={() => setAlertModal({ isOpen: false, message: '' })} />
        </div>
    );
};
