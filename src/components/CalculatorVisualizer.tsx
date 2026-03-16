
import * as React from 'react';
import { Icon } from './Icon';

const WALL_THICKNESSES_MAP: Record<string, number> = {
    "4.5\" Wall": 0.115,
    "9\" Wall": 0.23,
    "13.5\" Wall": 0.345
};

const BRICK_SIZES_MAP: Record<string, {l: number, w: number, h: number}> = {
    "Modular (190x90x90mm)": { l: 0.19, w: 0.09, h: 0.09 },
    "Traditional (230x110x70mm)": { l: 0.23, w: 0.11, h: 0.07 },
    "Wire-cut (200x100x100mm)": { l: 0.20, w: 0.10, h: 0.10 },
    "Solid Block 12\" (300x200x150mm)": { l: 0.30, w: 0.20, h: 0.15 }
};

interface CalculatorVisualizerProps {
    toolId: string;
    values: Record<string, string>;
}

export const CalculatorVisualizer: React.FC<CalculatorVisualizerProps> = ({ toolId, values }) => {
    // --- CONCRETE ---
    if (toolId === 'concrete') {
        const l = parseFloat(values.length) || 0;
        const w = parseFloat(values.width) || 0;
        const d = parseFloat(values.depth) || 0;
        const count = parseFloat(values.count) || 1;
        const vol = l * w * d * count;
        
        // Dry volume factor 1.54
        const dryVol = vol * 1.54;
        const grade = values.grade || "M20";
        // Mix ratios: M15 (1:2:4), M20 (1:1.5:3), M25 (1:1:2) approx
        let cementRatio = 1, sandRatio = 1.5, aggRatio = 3;
        if (grade === 'M15') { cementRatio = 1; sandRatio = 2; aggRatio = 4; }
        else if (grade === 'M20') { cementRatio = 1; sandRatio = 1.5; aggRatio = 3; }
        else if (grade === 'M25') { cementRatio = 1; sandRatio = 1; aggRatio = 2; }
        else if (grade === 'M30') { cementRatio = 1; sandRatio = 0.75; aggRatio = 1.5; }

        const totalRatio = cementRatio + sandRatio + aggRatio;
        const cementVol = (cementRatio / totalRatio) * dryVol;
        const sandVol = (sandRatio / totalRatio) * dryVol;
        const aggVol = (aggRatio / totalRatio) * dryVol;

        const cementBags = Math.ceil(cementVol / 0.035); // 0.035 m3 per bag
        const sandCft = (sandVol * 35.315).toFixed(1);
        const aggCft = (aggVol * 35.315).toFixed(1);

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px] relative">
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                        <Icon name="cube" className="h-4 w-4" /> {values.memberType || 'Member'} Geometry
                    </div>
                    {/* Isometric Simple Representation */}
                    <div className="relative">
                        <svg width="240" height="180" viewBox="0 0 240 180" className="stroke-slate-500 fill-slate-800/80 stroke-2 drop-shadow-2xl">
                            {/* Top Face */}
                            <path d="M60,40 L160,40 L200,70 L100,70 Z" className="fill-slate-700/50" />
                            {/* Front Face */}
                            <path d="M60,40 L60,120 L160,120 L160,40 Z" className="fill-slate-800/80" />
                            {/* Side Face */}
                            <path d="M160,40 L200,70 L200,150 L160,120 Z" className="fill-slate-900/80" />
                            
                            {/* Dimension Lines */}
                            <line x1="60" y1="135" x2="160" y2="135" className="stroke-emerald-500/50 stroke-1 marker-end" />
                            <text x="110" y="150" className="fill-emerald-500 text-[10px] text-center" textAnchor="middle">{l}m Length</text>
                            
                            <line x1="215" y1="70" x2="215" y2="150" className="stroke-emerald-500/50 stroke-1" />
                            <text x="225" y="110" className="fill-emerald-500 text-[10px]" style={{writingMode: 'vertical-rl'}}>{d}m D</text>
                        </svg>
                    </div>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Concrete Volume</h4>
                    <p className="text-4xl font-black text-white">{vol.toFixed(3)} <span className="text-lg text-slate-500 font-bold">m³</span></p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Cement</p>
                        <p className="text-xl font-black text-white">{cementBags} <span className="text-[10px] text-slate-500">Bags</span></p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Sand</p>
                        <p className="text-xl font-black text-white">{sandCft} <span className="text-[10px] text-slate-500">cft</span></p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mb-1">Aggregate</p>
                        <p className="text-xl font-black text-white">{aggCft} <span className="text-[10px] text-slate-500">cft</span></p>
                    </div>
                </div>
            </div>
        );
    }

    // --- PLASTERING ---
    if (toolId === 'plastering') {
        const area = parseFloat(values.area) || 0;
        const thickness = parseFloat(values.thickness?.replace(/[^\d.]/g, '') || '12') / 1000; // m
        const ratioStr = values.mixRatio || "1:4";
        const [cemPart, sandPart] = ratioStr.split(':').map(Number);
        
        // ft2 to m2 = / 10.764
        const areaM2 = area / 10.764;
        const wetVol = areaM2 * thickness;
        const dryVol = wetVol * 1.33; // Bulking factor
        const totalPart = (cemPart || 1) + (sandPart || 4);
        
        const cementVol = (cemPart / totalPart) * dryVol;
        const sandVol = (sandPart / totalPart) * dryVol;
        
        const cementBags = Math.ceil(cementVol / 0.035);
        const sandCft = (sandVol * 35.315).toFixed(1);

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-64 h-40 bg-slate-800 border-2 border-slate-700 relative shadow-2xl">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWUyOTNiIi8+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30"></div>
                        <div className="absolute bottom-0 left-0 w-full h-3 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                        <div className="absolute -right-12 bottom-0 text-[10px] text-emerald-500 font-bold bg-slate-900 px-2 py-1 rounded border border-emerald-500/30">
                            {Math.round(thickness*1000)}mm Layer
                        </div>
                    </div>
                    <p className="mt-6 text-slate-500 text-[10px] uppercase tracking-widest font-bold">Surface Area: {area} sq.ft</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Cement</h4>
                        <p className="text-3xl font-black text-white">{cementBags} <span className="text-sm text-slate-500">Bags</span></p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">M-Sand</h4>
                        <p className="text-3xl font-black text-white">{sandCft} <span className="text-sm text-slate-500">cft</span></p>
                    </div>
                </div>
            </div>
        );
    }

    // --- MATERIAL ESTIMATION ---
    if (toolId === 'material-estimation') {
        const l = parseFloat(values.length) || 0;
        const w = parseFloat(values.width) || 0;
        const h = parseFloat(values.height) || 0;
        const count = parseFloat(values.count) || 1;
        const unit = values.unit || "Meters";
        
        let vol = l * w * h * count;
        let unitLabel = "units³";
        if (unit === 'Meters') unitLabel = "m³";
        if (unit === 'Feet') unitLabel = "cft";
        if (unit === 'Inches') { 
            vol = vol / 1728; // cubic inch to cft
            unitLabel = "cft"; 
        } 

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="grid grid-cols-2 gap-3 p-4">
                        {[...Array(Math.min(4, Math.ceil(count)))].map((_, i) => (
                            <div key={i} className="w-20 h-20 bg-slate-800 border border-slate-600 shadow-lg relative flex items-center justify-center">
                                <Icon name="cube" className="h-8 w-8 text-slate-700" />
                                <span className="absolute top-1 right-1 text-slate-500 text-[9px] font-bold">#{i+1}</span>
                            </div>
                        ))}
                    </div>
                    {count > 4 && <p className="mt-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+ {count - 4} more items</p>}
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Estimated Volume</h4>
                    <p className="text-4xl font-black text-white">{vol.toFixed(2)} <span className="text-lg text-slate-500 font-bold">{unitLabel}</span></p>
                </div>
            </div>
        );
    }

    // --- BRICKS ---
    if (toolId === 'bricks') {
        const l = parseFloat(values.wallLength) || 0;
        const h = parseFloat(values.wallHeight) || 0;
        const thickVal = values.wallThickness || "9\" Wall";
        const thick = WALL_THICKNESSES_MAP[thickVal] || 0.23;
        
        const wallVol = l * h * thick;
        let brickData;

        if (values.brickType === 'Custom Size...') {
            const unit = values.customBrickUnit || 'mm';
            let conversionFactor = 0.001; // default to mm -> m

            if (unit === 'cm') conversionFactor = 0.01;
            else if (unit === 'inch') conversionFactor = 0.0254;
            else if (unit === 'ft') conversionFactor = 0.3048;

            brickData = {
                l: (parseFloat(values.customBrickL) || 0) * conversionFactor,
                w: (parseFloat(values.customBrickW) || 0) * conversionFactor,
                h: (parseFloat(values.customBrickH) || 0) * conversionFactor
            };
        } else {
            brickData = BRICK_SIZES_MAP[values.brickType] || BRICK_SIZES_MAP["Modular (190x90x90mm)"];
        }
        
        const mortarThickness = 0.01; 
        const brickVolWithMortar = (brickData.l + mortarThickness) * (brickData.w + mortarThickness) * (brickData.h + mortarThickness);
        
        const totalBricks = wallVol > 0 ? Math.ceil(wallVol / brickVolWithMortar) : 0;
        const totalWithWastage = Math.ceil(totalBricks * 1.05);

        // Mortar Calc
        const brickActualVol = brickData.l * brickData.w * brickData.h;
        const totalBrickActualVol = totalBricks * brickActualVol;
        const wetMortarVol = Math.max(0, wallVol - totalBrickActualVol);
        const dryMortarVol = wetMortarVol * 1.33;
        const cementBags = Math.ceil(((1/7) * dryMortarVol) / 0.035) || 0;
        const sandCft = (((6/7) * dryMortarVol) * 35.315).toFixed(1);

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                        <Icon name="cube" className="h-4 w-4" /> Schematic View
                    </div>
                    {/* Simplified Wall Visualizer */}
                    <div className="w-48 h-32 bg-[#8f3418] border-2 border-[#5c210f] relative shadow-2xl flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+CjxyZWN0IHdpZHRoPSIxOSIgaGVpZ2h0PSI5IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')]">
                        <span className="text-white/50 text-xs font-bold bg-black/50 px-2 py-1 rounded">{l}m x {h}m</span>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Brick Count</h4>
                    <p className="text-4xl font-black text-white relative z-10">{totalWithWastage} <span className="text-lg text-slate-500 font-bold">Nos</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Mortar Cement</p>
                        <p className="text-2xl font-black text-white">{cementBags} <span className="text-xs text-slate-500">Bags</span></p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Mortar Sand</p>
                        <p className="text-2xl font-black text-white">{sandCft} <span className="text-xs text-slate-500">cft</span></p>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- STEEL WEIGHT ---
    if (toolId === 'steel-weight') {
        const type = values.sectionType || 'I-Beam';
        const len = parseFloat(values.length) || 0;
        const count = parseFloat(values.count) || 1;
        const density = 7850; 

        let areaMm2 = 0;
        const D = parseFloat(values.depth) || 0; 
        const B = parseFloat(values.width) || 0; 
        const tf = parseFloat(values.flangeThick) || 0;
        const tw = parseFloat(values.webThick) || 0;
        const t = parseFloat(values.thickness) || 0; 

        if (type === 'I-Beam') { if (D>0 && B>0 && tf>0 && tw>0) areaMm2 = (2 * B * tf) + ((D - 2 * tf) * tw); } 
        else if (type === 'Channel') { if (D>0 && B>0 && tf>0 && tw>0) areaMm2 = (2 * B * tf) + ((D - 2 * tf) * tw); } 
        else if (type === 'Angle') { if (D>0 && B>0 && t>0) areaMm2 = (D * t) + ((B - t) * t); } 
        else if (type === 'Tube') { if (D>0 && B>0 && t>0) areaMm2 = (D * B) - ((D - 2*t) * (B - 2*t)); }

        const weight = (areaMm2 / 1000000) * len * density * count;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-600 tracking-widest flex items-center gap-2">
                        <Icon name="cube" className="h-4 w-4" /> Section Profile
                    </div>
                    <div className="text-slate-500 text-sm mb-4">{type} Profile Preview</div>
                    <div className="w-32 h-32 border-2 border-dashed border-slate-700 flex items-center justify-center rounded-lg">
                        {type === 'I-Beam' && <div className="w-20 h-24 border-x-8 border-y-[12px] border-slate-600"></div>}
                        {type === 'Channel' && <div className="w-20 h-24 border-l-8 border-y-[12px] border-slate-600"></div>}
                        {type === 'Tube' && <div className="w-20 h-24 border-8 border-slate-600"></div>}
                        {type === 'Angle' && <div className="w-20 h-24 border-l-8 border-b-8 border-slate-600"></div>}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Steel Weight</h4>
                    <p className="text-4xl font-black text-white relative z-10">{weight.toFixed(2)} <span className="text-lg text-slate-500 font-bold">kg</span></p>
                </div>
            </div>
        );
    }

    // --- REBAR ---
    if (toolId === 'rebar') {
        const d = parseFloat(values.diameter) || 8;
        const count = parseFloat(values.count) || 1;
        const shape = values.shape || 'straight';
        
        let cuttingLength = 0; // meters
        let displayFormula = '';

        if (shape === 'straight') {
            cuttingLength = parseFloat(values.length) || 0;
            displayFormula = `L`;
        } else if (shape === 'lbend') {
            const a = parseFloat(values.legA) || 0;
            const b = parseFloat(values.legB) || 0;
            cuttingLength = a + b;
            displayFormula = `A + B`;
        } else if (shape === 'stirrup') {
            const a = (parseFloat(values.width) || 0) / 1000;
            const b = (parseFloat(values.depth) || 0) / 1000;
            // Standard hook approx 10d per hook, 2 hooks
            const hook = (2 * 10 * d) / 1000;
            cuttingLength = 2 * (a + b) + hook;
            displayFormula = `2(A + B) + Hooks`;
        } else if (shape === 'crank') {
            const span = parseFloat(values.span) || 0;
            const h = (parseFloat(values.crankHeight) || 0) / 1000;
            // 0.42 * H extra per crank. Assuming double crank for visualization context
            cuttingLength = span + (2 * 0.42 * h);
            displayFormula = `Span + 0.84H`;
        }

        // D^2 / 162 formula for unit weight (kg/m)
        const unitWeight = (d * d) / 162; 
        const totalWeight = unitWeight * cuttingLength * count;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center text-center">
                    {/* Dynamic SVG Visualizer based on shape */}
                    <div className="w-48 h-32 flex items-center justify-center mb-4 text-emerald-500">
                        {shape === 'straight' && (
                            <svg viewBox="0 0 200 100" className="w-full h-full stroke-current stroke-[4] fill-none">
                                <line x1="20" y1="50" x2="180" y2="50" />
                                <text x="100" y="40" className="fill-slate-500 stroke-none text-xs text-center" textAnchor="middle">L</text>
                            </svg>
                        )}
                        {shape === 'lbend' && (
                            <svg viewBox="0 0 200 100" className="w-full h-full stroke-current stroke-[4] fill-none">
                                <path d="M50,20 L50,80 L150,80" />
                                <text x="40" y="50" className="fill-slate-500 stroke-none text-xs" textAnchor="end">A</text>
                                <text x="100" y="95" className="fill-slate-500 stroke-none text-xs" textAnchor="middle">B</text>
                            </svg>
                        )}
                        {shape === 'stirrup' && (
                            <svg viewBox="0 0 200 100" className="w-full h-full stroke-current stroke-[4] fill-none">
                                <rect x="60" y="20" width="80" height="60" rx="5" />
                                <path d="M70,30 L60,20 M130,30 L140,20" className="opacity-50" />
                                <text x="150" y="50" className="fill-slate-500 stroke-none text-xs">B</text>
                                <text x="100" y="95" className="fill-slate-500 stroke-none text-xs" textAnchor="middle">A</text>
                            </svg>
                        )}
                        {shape === 'crank' && (
                            <svg viewBox="0 0 200 100" className="w-full h-full stroke-current stroke-[4] fill-none">
                                <path d="M20,70 L50,70 L70,30 L130,30 L150,70 L180,70" />
                                <text x="100" y="20" className="fill-slate-500 stroke-none text-xs" textAnchor="middle">Span</text>
                                <line x1="160" y1="30" x2="160" y2="70" className="stroke-slate-700 stroke-[1]" />
                                <text x="165" y="55" className="fill-slate-500 stroke-none text-xs">H</text>
                            </svg>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-white">{count} Bars <span className="text-emerald-500">x</span> {cuttingLength.toFixed(2)}m</p>
                        <p className="text-xs text-slate-500 font-mono">Cut Length = {displayFormula}</p>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Steel Weight</h4>
                    <p className="text-4xl font-black text-white">{totalWeight.toFixed(2)} <span className="text-lg text-slate-500 font-bold">kg</span></p>
                    <p className="text-xs text-slate-500 mt-1">{(totalWeight/1000).toFixed(3)} Metric Tonnes @ {d}mm</p>
                </div>
            </div>
        );
    }

    // --- RAKE WALL ---
    if (toolId === 'rakewall') {
        const l = parseFloat(values.length) || 0;
        const h1 = parseFloat(values.heightStart) || 0;
        const h2 = parseFloat(values.heightEnd) || 0;
        const t = parseFloat(values.thickness) || 230;
        
        const area = l * ((h1 + h2) / 2);
        const volume = area * (t / 1000); // t in mm

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <svg width="200" height="150" viewBox="0 0 200 150" className="opacity-80">
                        <path d={`M20,130 L20,${130 - (h1*10)} L180,${130 - (h2*10)} L180,130 Z`} fill="#334155" stroke="#10b981" strokeWidth="2" />
                    </svg>
                    <p className="text-xs text-slate-500 mt-4">Trapezoidal Section View</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Surface Area</h4>
                        <p className="text-2xl font-black text-white">{area.toFixed(2)} <span className="text-xs text-slate-500">m²</span></p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Masonry Volume</h4>
                        <p className="text-2xl font-black text-white">{volume.toFixed(2)} <span className="text-xs text-slate-500">m³</span></p>
                    </div>
                </div>
            </div>
        );
    }

    // --- STAIRCASE ---
    if (toolId === 'staircase') {
        const h = parseFloat(values.totalHeight) || 0;
        const riser = parseFloat(values.riser) || 150; // mm
        const steps = h > 0 ? Math.round((h * 1000) / riser) : 0;
        const width = parseFloat(values.width) || 1;
        const waist = parseFloat(values.waist) || 150;
        const tread = parseFloat(values.tread) || 250;

        // Approx concrete calc (Waist slab + Steps)
        // Length of waist slab
        const run = (steps - 1) * tread;
        const height = steps * riser;
        const waistLen = Math.sqrt(Math.pow(run, 2) + Math.pow(height, 2));
        const waistVol = (waistLen/1000) * width * (waist/1000);
        const stepsVol = (0.5 * (riser/1000) * (tread/1000)) * width * steps;
        const totalVol = waistVol + stepsVol;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <div className="flex items-end space-x-0">
                        {[...Array(Math.min(5, steps))].map((_, i) => (
                            <div key={i} className="w-8 bg-slate-700 border-r border-t border-slate-600" style={{ height: `${(i+1)*20}px` }}></div>
                        ))}
                        {steps > 5 && <span className="text-slate-500 text-xs ml-2">...</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-4">{steps} Risers @ {riser}mm</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Concrete Volume</h4>
                    <p className="text-4xl font-black text-white">{totalVol.toFixed(3)} <span className="text-lg text-slate-500 font-bold">m³</span></p>
                    <p className="text-xs text-slate-500 mt-1">Incl. Waist Slab & Steps</p>
                </div>
            </div>
        );
    }

    // --- FOUNDATION RAFT / PILING ---
    if (toolId === 'foundation-raft') {
        const vol = (parseFloat(values.length)||0) * (parseFloat(values.width)||0) * ((parseFloat(values.depth)||0)/1000);
        const steel = vol * (parseFloat(values.steelDensity)||80);
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="w-48 h-32 bg-slate-800 border-2 border-slate-600 relative grid grid-cols-6 grid-rows-4 gap-1 p-1">
                        {[...Array(24)].map((_,i) => <div key={i} className="border border-slate-700/50"></div>)}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Concrete</h4>
                        <p className="text-2xl font-black text-white">{vol.toFixed(2)} <span className="text-xs text-slate-500">m³</span></p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Steel (Approx)</h4>
                        <p className="text-2xl font-black text-white">{steel.toFixed(0)} <span className="text-xs text-slate-500">kg</span></p>
                    </div>
                </div>
            </div>
        );
    }

    if (toolId === 'foundation-piling') {
        const r = (parseFloat(values.diameter) || 600) / 2000; // m
        const h = parseFloat(values.depth) || 0;
        const count = parseFloat(values.count) || 1;
        const vol = Math.PI * r * r * h * count;
        
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="flex gap-4 items-end">
                        <div className="w-12 h-40 bg-slate-800 border-x border-slate-600 rounded-b-xl relative">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
                        </div>
                        {count > 1 && <div className="w-12 h-40 bg-slate-800 border-x border-slate-600 rounded-b-xl opacity-50"></div>}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Pile Concrete</h4>
                    <p className="text-4xl font-black text-white">{vol.toFixed(2)} <span className="text-lg text-slate-500 font-bold">m³</span></p>
                </div>
            </div>
        );
    }

    // --- SHUTTERING ---
    if (toolId === 'shuttering') {
        const l = parseFloat(values.length) || 0;
        const w = parseFloat(values.width) || 0;
        const d = parseFloat(values.depth) || 0;
        const count = parseFloat(values.count) || 1;
        let area = 0;
        // Simplified Logic
        if (values.elementType === 'Column') area = (2 * (l + w)) * d; // Perimeter * Height
        else if (values.elementType === 'Beam') area = (l * w) + (2 * l * d); // Bottom + 2 Sides
        else if (values.elementType === 'Slab') area = l * w; // Bottom only
        else if (values.elementType === 'Wall') area = 2 * l * w; // 2 Sides (l x h)

        area = area * count;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="w-32 h-32 border-2 border-dashed border-emerald-500/50 flex items-center justify-center bg-emerald-900/10">
                        <span className="text-emerald-500 text-xs font-bold uppercase">Form Area</span>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Shuttering Area</h4>
                    <p className="text-4xl font-black text-white">{area.toFixed(2)} <span className="text-lg text-slate-500 font-bold">m²</span></p>
                    <p className="text-xs text-slate-500 mt-1">{(area * 10.764).toFixed(2)} sq.ft</p>
                </div>
            </div>
        );
    }

    // --- CEILING ---
    if (toolId === 'ceiling') {
        const area = (parseFloat(values.length) || 0) * (parseFloat(values.width) || 0);
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="w-48 h-32 bg-slate-900 border border-slate-700 grid grid-cols-4 grid-rows-3">
                        {[...Array(12)].map((_,i) => <div key={i} className="border border-slate-800"></div>)}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Ceiling Area</h4>
                    <p className="text-4xl font-black text-white">{area.toFixed(2)} <span className="text-lg text-slate-500 font-bold">m²</span></p>
                    <p className="text-xs text-slate-500 mt-1">Material approximation depends on grid selection.</p>
                </div>
            </div>
        );
    }

    // --- EXCAVATION VOLUME ---
    if (toolId === 'excavation-vol') {
        const l = parseFloat(values.length) || 0;
        const w = parseFloat(values.width) || 0;
        const d = parseFloat(values.depth) || 0;
        const count = parseFloat(values.count) || 1;
        const unit = values.unit || 'Meters';

        let vol = l * w * d * count;
        
        let primaryValue = vol.toFixed(2);
        let primaryUnit = unit === 'Meters' ? 'm³' : 'cft';
        
        let secondaryValue = '';
        let secondaryUnit = '';
        
        if (unit === 'Meters') {
            secondaryValue = (vol * 35.3147).toFixed(2);
            secondaryUnit = 'cft';
        } else {
            secondaryValue = (vol / 35.3147).toFixed(2);
            secondaryUnit = 'm³';
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                    {/* 3D Pit Visualization using CSS Perspective */}
                    <div className="relative w-48 h-32 transform-gpu" style={{ perspective: '800px' }}>
                        <div className="w-full h-full relative transform-style-3d rotate-x-[60deg]">
                             {/* Pit Floor */}
                             <div className="absolute inset-0 bg-amber-950/40 border border-amber-800/50 shadow-inner"></div>
                             {/* Walls (pseudo-3d borders) */}
                             <div className="absolute -left-2 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-900 to-transparent skew-y-[45deg] origin-right opacity-50"></div>
                             <div className="absolute -top-2 left-0 right-0 h-2 bg-gradient-to-b from-amber-900 to-transparent skew-x-[45deg] origin-bottom opacity-50"></div>
                        </div>
                        {/* Labels */}
                        <div className="absolute -bottom-6 w-full text-center text-[10px] text-slate-500 font-mono">{l} x {w}</div>
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono rotate-90">Depth: {d}</div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-amber-700/30">
                        <Icon name="tractor" className="h-12 w-12" />
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Excavation Volume</h4>
                    <p className="text-4xl font-black text-white">{primaryValue} <span className="text-lg text-slate-500 font-bold">{primaryUnit}</span></p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{secondaryValue} {secondaryUnit}</p>
                </div>
                
                {/* Contextual Info */}
                <div className="p-4 bg-amber-900/10 border border-amber-900/20 rounded-xl">
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">Soil Bulking Factor</p>
                    <p className="text-xs text-amber-200/70">Estimated loose volume (haulage) will be approx <strong>{((parseFloat(primaryValue) || 0) * 1.3).toFixed(2)} {primaryUnit}</strong> due to 30% expansion.</p>
                </div>
            </div>
        );
    }

    // --- FOUNDATION INDEP ---
    if (toolId === 'foundation-indep') {
        const l = parseFloat(values.length) || 0;
        const w = parseFloat(values.width) || 0;
        const d = parseFloat(values.depth) || 0;
        const count = parseFloat(values.count) || 1;
        
        const vol = l * w * d * count;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <div className="w-32 h-32 border-b-4 border-l-4 border-r-4 border-slate-700 bg-slate-900/50 relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-900/20 h-full border-t border-dashed border-amber-700/50 flex items-center justify-center">
                            <span className="text-amber-500/50 font-bold text-xs">Soil Volume</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Excavation Volume</h4>
                    <p className="text-4xl font-black text-white">{vol.toFixed(2)} <span className="text-lg text-slate-500 font-bold">m³</span></p>
                    <p className="text-xs text-slate-500 mt-1">{(vol * 35.315).toFixed(2)} Cubic Feet</p>
                </div>
            </div>
        );
    }

    // --- TILES ---
    if (toolId === 'tiles') {
        const area = parseFloat(values.area) || 0;
        const tileSizeStr = values.tileSize || "2x2 ft (600x600mm)";
        
        let tileAreaSqFt = 0;
        let tilesPerBox = 4; // Default estimate

        if (tileSizeStr === 'Custom Size...') {
            const unit = values.customTileUnit || 'mm';
            const l = parseFloat(values.customTileL) || 0;
            const w = parseFloat(values.customTileW) || 0;
            
            let l_ft = 0;
            let w_ft = 0;

            // Conversion to feet
            if (unit === 'mm') { l_ft = l * 0.00328084; w_ft = w * 0.00328084; }
            else if (unit === 'cm') { l_ft = l * 0.0328084; w_ft = w * 0.0328084; }
            else if (unit === 'meter') { l_ft = l * 3.28084; w_ft = w * 3.28084; }
            else if (unit === 'inch') { l_ft = l / 12; w_ft = w / 12; }
            else if (unit === 'ft') { l_ft = l; w_ft = w; }

            tileAreaSqFt = l_ft * w_ft;
            
            // Estimate tiles per box for custom
            if (tileAreaSqFt > 0) {
                if (tileAreaSqFt < 1) tilesPerBox = 25;
                else if (tileAreaSqFt < 2.5) tilesPerBox = 6; // e.g. 1x2
                else if (tileAreaSqFt < 5) tilesPerBox = 4;   // e.g. 2x2
                else tilesPerBox = 2;                         // e.g. 4x2, 4x4
            }
        } else {
            // Presets
            if (tileSizeStr.includes('2x2')) { tileAreaSqFt = 4; tilesPerBox = 4; }
            else if (tileSizeStr.includes('4x2')) { tileAreaSqFt = 8; tilesPerBox = 2; }
            else if (tileSizeStr.includes('4x4')) { tileAreaSqFt = 16; tilesPerBox = 2; }
            else if (tileSizeStr.includes('Wood')) { tileAreaSqFt = 2.66; tilesPerBox = 8; }
        }

        const tileCount = (area > 0 && tileAreaSqFt > 0) ? Math.ceil((area / tileAreaSqFt) * 1.10) : 0; 
        const boxCount = Math.ceil(tileCount / tilesPerBox);

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <div className="grid grid-cols-4 gap-1 p-4 bg-slate-900 rounded-lg">
                        {[...Array(16)].map((_, i) => <div key={i} className="w-6 h-6 border border-slate-700 bg-slate-800"></div>)}
                    </div>
                    {tileSizeStr === 'Custom Size...' && (
                        <p className="mt-4 text-xs text-slate-500">Custom Size: {parseFloat(values.customTileL) || 0} x {parseFloat(values.customTileW) || 0} {values.customTileUnit}</p>
                    )}
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Total Tiles Required</h4>
                    <p className="text-4xl font-black text-white">{tileCount} <span className="text-lg text-slate-500 font-bold">Nos</span></p>
                    <p className="text-xs text-slate-500 mt-1">Approx {boxCount} Boxes (Est. {tilesPerBox}/box) with 10% wastage</p>
                </div>
            </div>
        );
    }

    // --- PAINT ---
    if (toolId === 'paint') {
        const area = parseFloat(values.area) || 0;
        const coats = parseInt(values.coats) || 1;
        const coverage = 100; // sqft per liter per coat approx
        
        const liters = (area * coats) / coverage;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center relative min-h-[300px] justify-center">
                    <div className="w-32 h-32 rounded-full bg-blue-500/20 border-4 border-blue-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                        <Icon name="leaf" className="h-12 w-12 text-blue-400" />
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-2">Paint Quantity</h4>
                    <p className="text-4xl font-black text-white">{liters.toFixed(1)} <span className="text-lg text-slate-500 font-bold">Liters</span></p>
                    <p className="text-xs text-slate-500 mt-1">For {coats} Coat(s)</p>
                </div>
            </div>
        );
    }

    // Default fallback for generic inputs
    const genericArea = (parseFloat(values.length) || 0) * (parseFloat(values.width) || 0);
    const genericVol = genericArea * (parseFloat(values.height) || parseFloat(values.depth) || 0);
    
    if (genericVol > 0 || genericArea > 0) {
         return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <Icon name="calculator" className="h-16 w-16 text-slate-700" />
                    <p className="mt-4 text-slate-500 text-xs font-medium">Generic Calculation</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Volume</h4>
                        <p className="text-2xl font-black text-white">{genericVol.toFixed(2)} <span className="text-xs text-slate-500">unit³</span></p>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Area</h4>
                        <p className="text-2xl font-black text-white">{genericArea.toFixed(2)} <span className="text-xs text-slate-500">unit²</span></p>
                    </div>
                </div>
            </div>
         );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-600 opacity-50 space-y-4">
            <Icon name="chart-bar" className="h-16 w-16" />
            <p className="text-xs font-black uppercase tracking-widest">Enter parameters to visualize</p>
        </div>
    );
};
