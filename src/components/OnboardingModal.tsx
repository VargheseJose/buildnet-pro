import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface OnboardingModalProps {
    onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const steps = [
        {
            title: "Welcome to Buildnet.app Beta",
            description: "We are excited to invite you to test the Beta version of Buildnet.app. Let's explore the highlights.",
            icon: "bolt",
            color: "text-emerald-400",
            bg: "bg-emerald-900/20",
            border: "border-emerald-500/30"
        },
        {
            title: "3D Rendering & MEP Tools",
            description: "Generate stunning 3D architectural designs from your sketches and utilize our specialized MEP (Mechanical, Electrical, Plumbing) tools.",
            icon: "camera",
            color: "text-purple-400",
            bg: "bg-purple-900/20",
            border: "border-purple-500/30"
        },
        {
            title: "Quantity Take Off & Estimation",
            description: "Perform accurate quantity take offs and generate detailed cost estimations using our advanced AI calculators.",
            icon: "calculator",
            color: "text-orange-400",
            bg: "bg-orange-900/20",
            border: "border-orange-500/30"
        },
        {
            title: "Material Discovery",
            description: "Discover and source construction materials across all states of India with our intelligent marketplace search.",
            icon: "search",
            color: "text-cyan-400",
            bg: "bg-cyan-900/20",
            border: "border-cyan-500/30"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
    };

    const currentStep = steps[step];

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-[#0a0f1c] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-emerald-500' : i < step ? 'w-2 bg-emerald-500/50' : 'w-2 bg-slate-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center min-h-[280px] justify-center relative overflow-hidden">
                    {/* Background glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-10 transition-colors duration-500 ${currentStep.bg.replace('/20', '')}`} />
                    
                    <div className={`p-6 rounded-3xl border ${currentStep.bg} ${currentStep.border} mb-6 relative z-10 transition-all duration-500 transform scale-110`}>
                        <Icon name={currentStep.icon as any} className={`h-12 w-12 ${currentStep.color}`} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white tracking-tight mb-4 relative z-10">
                        {currentStep.title}
                    </h2>
                    
                    <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                        {currentStep.description}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800/50 flex gap-4 bg-slate-900/30">
                    {step > 0 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                        >
                            Back
                        </button>
                    )}
                    <button 
                        onClick={handleNext}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2 ${step === steps.length - 1 ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'}`}
                    >
                        {step === steps.length - 1 ? (
                            <>Get Started <Icon name="bolt" className="h-4 w-4" /></>
                        ) : (
                            <>Next <Icon name="arrow-right" className="h-4 w-4" /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
