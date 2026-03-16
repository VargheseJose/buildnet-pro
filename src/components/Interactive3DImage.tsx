import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { Icon } from './Icon';

interface Interactive3DImageProps {
    src: string;
    alt: string;
}

export const Interactive3DImage: React.FC<Interactive3DImageProps> = ({ src, alt }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        const width = rect.width;
        const height = rect.height;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const background = useMotionTemplate`radial-gradient(circle at ${useTransform(x, [-0.5, 0.5], ["0%", "100%"])} ${useTransform(y, [-0.5, 0.5], ["0%", "100%"])}, rgba(255,255,255,0.1) 0%, transparent 50%)`;

    return (
        <div 
            className="relative flex-1 rounded-xl overflow-hidden border border-slate-700 bg-black print:border-none print:bg-transparent perspective-[1000px] flex items-center justify-center"
            style={{ perspective: 1000 }}
        >
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="relative w-full h-full flex items-center justify-center cursor-crosshair"
            >
                {/* Main Image */}
                <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-full object-contain print:max-w-full print:h-auto shadow-2xl" 
                    style={{ transform: "translateZ(50px)" }}
                />

                {/* BuildNet Watermark / Logo */}
                <div 
                    className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 pointer-events-none"
                    style={{ transform: "translateZ(80px)" }}
                >
                    <Icon name="bolt" className="h-4 w-4 text-emerald-500" />
                    <span className="text-white font-black text-xs uppercase tracking-widest">BuildNet <span className="text-emerald-500">AI</span></span>
                </div>

                {/* AR / 3D Badge */}
                <div 
                    className="absolute top-4 left-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 pointer-events-none"
                    style={{ transform: "translateZ(100px)" }}
                >
                    <Icon name="cube" className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">Interactive 3D AR</span>
                </div>

                {/* Glare effect */}
                {isHovered && (
                    <motion.div 
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                            background,
                            transform: "translateZ(120px)"
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
};
