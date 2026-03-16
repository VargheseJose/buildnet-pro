
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CALCULATOR_TOOLS, CalculatorTool, INDIAN_STATES, STATE_DISTRICTS_MAP, KERALA_DISTRICTS } from '../data/categories';
import { Icon } from './Icon';
import { UserProfile, ROLE_PERMISSIONS, Business } from '../types';
import { CalculatorVisualizer } from './CalculatorVisualizer';
import { LoadingSpinner } from './LoadingSpinner';
import { getAiCalculatorResponse, generateOrEditImage, generateConstructionImage, findConstructionInfo } from '../services/geminiService';
import { googleDriveService } from '../services/googleDriveService';
import { PaymentModal } from './PaymentModal';
import { Interactive3DImage } from './Interactive3DImage';
import { GoogleMapComponent } from './GoogleMap';
import html2pdf from 'html2pdf.js';

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

const SaveToDriveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (folderName: string, subFolderName: string) => void;
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, isSaving }) => {
    const [folderName, setFolderName] = useState("BuildNet Calculations");
    const [subFolderName, setSubFolderName] = useState("Reports");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Icon name="document" className="h-6 w-6 text-emerald-400" />
                        Save to Google Drive
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <Icon name="x-mark" className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Main Folder Name</label>
                        <input 
                            type="text" 
                            value={folderName} 
                            onChange={e => setFolderName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="e.g., BuildNet Calculations"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Subfolder Name</label>
                        <input 
                            type="text" 
                            value={subFolderName} 
                            onChange={e => setSubFolderName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            placeholder="e.g., Reports"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(folderName, subFolderName)}
                        disabled={isSaving || !folderName.trim()}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Icon name="check" className="h-4 w-4" />
                        )}
                        Confirm Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// Predefined prompts for AI Design Generator
const DESIGN_PROMPTS: Record<string, string> = {
    "Modern Tropical Villa": "A luxury modern villa integrated with tropical nature. Large overhangs, wooden louvers, floor-to-ceiling glass connecting to a koi pond and infinity pool. Warm ambient lighting, sustainable materials.",
    "Kerala Traditional Home": "Traditional Kerala architecture with sloping clay tile roofs (Nalukettu style), wooden pillars, and a central courtyard. Laterite stone walls, extensive verandahs, and lush green surroundings.",
    "Contemporary Apartment Interior": "Spacious open-plan apartment living room. Italian marble flooring, false ceiling with cove lighting, neutral beige and grey tones, modern Italian furniture, and a balcony view of the city skyline.",
    "Commercial Showroom": "High-end retail showroom facade. Frameless glass frontage, double-height entrance, modern ACP cladding, spot lighting highlighting products, minimalist branding signage.",
    "Rustic Farmhouse": "Cozy rustic farmhouse with exposed brick walls, stone fireplace, wooden beams on the ceiling, vintage decor, and a large front porch overlooking a field.",
    "Futuristic Office Complex": "Futuristic parametric architecture. Curvilinear forms, steel and glass facade, vertical gardens on the exterior, smart lighting systems, and a high-tech entrance lobby."
};

interface CalculatorPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  userProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  googleToken?: string;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ 
    onNavigate, onLogout, isLoggedIn, userProfile, onProfileChange, googleToken 
}) => {
    const { toolId } = useParams<{ toolId?: string }>();
    const [activeTool, setActiveTool] = useState<CalculatorTool | null>(null);
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [aiResult, setAiResult] = useState<string>('');
    const [groundingSources, setGroundingSources] = useState<any[]>([]);
    const [foundBusinesses, setFoundBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [isSaving, setIsSaving] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [needsApiKey, setNeedsApiKey] = useState(false);
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
    
    // Image Upload State
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleDownload = (dataUrl: string) => {
        if (!isLoggedIn) {
            setAlertModal({ isOpen: true, message: "Please log in to download." });
            return;
        }
        const currentCount = userProfile.downloadsCount || 0;
        if (userProfile.isPremium || currentCount < 100) {
            if (!userProfile.isPremium) {
                onProfileChange({ ...userProfile, downloadsCount: currentCount + 1 });
            }
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `BuildNet_Design_${Date.now()}.png`;
            a.click();
        } else {
            setShowPaymentModal(true);
        }
    };
    
    useEffect(() => {
        if (toolId) {
            const tool = CALCULATOR_TOOLS.flatMap(c => c.tools).find(t => t.id === toolId);
            setActiveTool(tool || null);
            setInputValues({});
            setErrors({});
            setAiResult('');
            setAttachedImage(null);
            // Default to 'ai' if the tool ID starts with 'ai-' OR is 'design-gen', 'image-editor', or 'ai-material-discovery', otherwise 'manual'
            const isAiTool = tool?.id.startsWith('ai-') || tool?.id === 'design-gen' || tool?.id === 'image-editor' || tool?.id === 'ai-material-discovery';
            setActiveTab(isAiTool ? 'ai' : 'manual');
        } else {
            setActiveTool(null);
        }
    }, [toolId]);

    const handleTabChange = (tab: 'manual' | 'ai') => {
        setActiveTab(tab);
        // Clear AI result when switching to manual to ensure visualizer is shown if applicable
        if (tab === 'manual') {
            setAiResult('');
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setInputValues(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    const handleBlur = (id: string, value: string, type: string) => {
        let error = '';
        if (!value || value.trim() === '') {
            error = 'This field is required';
        } else if (type === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
                error = 'Must be a valid number';
            } else if (num <= 0) {
                error = 'Must be greater than 0';
            }
        }
        if (error) {
            setErrors(prev => ({ ...prev, [id]: error }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const generateReportText = () => {
        let content = `BUILDNET AI CALCULATION REPORT\nTool: ${activeTool?.name}\nDate: ${new Date().toLocaleString()}\n\n`;
        
        if (activeTab === 'manual') {
            content += `--- INPUT PARAMETERS ---\n`;
            Object.entries(inputValues).forEach(([k, v]) => {
                if (v) content += `${k}: ${v}\n`;
            });
            content += `\n(See visualizer for calculated results)`;
        } else {
            content += `--- AI INTELLIGENCE REPORT ---\n`;
            if (aiResult.startsWith('data:image')) {
                content += `[Image Generated - View on BuildNet AI]`;
            } else {
                content += aiResult;
            }
        }
        return content;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        const element = document.getElementById('report-content');
        if (element) {
            const opt = {
                margin:       1,
                filename:     `BuildNet_Report_${activeTool?.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
                image:        { type: 'jpeg' as const, quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    const handleWhatsApp = () => {
        const text = generateReportText();
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmail = () => {
        const text = generateReportText();
        const subject = `BuildNet AI Report: ${activeTool?.name}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    };

    const handleShare = async () => {
        const text = generateReportText();
        const title = `BuildNet AI Report: ${activeTool?.name}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                setAlertModal({ isOpen: true, message: 'Report copied to clipboard!' });
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const handleSaveResult = () => {
        if (!googleToken) {
            setAlertModal({ isOpen: true, message: "Please sign in with Google to save results." });
            return;
        }
        setShowSaveModal(true);
    };

    const performSave = async (folderName: string, subFolderName: string) => {
        if (!googleToken) return;
        setIsSaving(true);
        try {
            const fileName = `Calc_${activeTool?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
            const content = generateReportText();

            await googleDriveService.saveDocToDrive(googleToken, folderName, subFolderName, fileName, content);
            setAlertModal({ isOpen: true, message: "Report saved to your Google Drive!" });
            setShowSaveModal(false);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "Failed to save report.";
            setAlertModal({ isOpen: true, message: `Error: ${errorMessage}` });
        } finally {
            setIsSaving(false);
        }
    };

    // Helper for rendering inputs
    const renderField = (label: string, id: string, type: string = 'text', placeholder?: string, options?: string[]) => {
        const error = errors[id];
        return (
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
                {options ? (
                    <div className="relative">
                        <select 
                            value={inputValues[id] || ''} 
                            onChange={e => handleInputChange(id, e.target.value)}
                            onBlur={e => handleBlur(id, e.target.value, type)}
                            className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3.5 text-white appearance-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all`}
                        >
                            <option value="">Select...</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <Icon name="chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                    </div>
                ) : (
                    <input 
                        type={type} 
                        value={inputValues[id] || ''} 
                        onChange={e => handleInputChange(id, e.target.value)}
                        onBlur={e => handleBlur(id, e.target.value, type)}
                        placeholder={placeholder || "0"}
                        className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3.5 text-white focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all placeholder:text-slate-600`}
                    />
                )}
                {error && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{error}</p>}
            </div>
        );
    };

    // AI Handler
    const handleAiGenerate = async () => {
         const hasErrors = Object.values(errors).some(err => err !== '');
         if (hasErrors) {
             setAlertModal({ isOpen: true, message: "Please fix the errors in the form before generating." });
             return;
         }

         setActiveTab('ai'); // Switch to AI tab to show results
         setIsLoading(true);
         setNeedsApiKey(false);
         try {
             // Logic split for Design Generator vs other Text-based tools
             if (activeTool?.id === 'design-gen' || activeTool?.id === 'image-editor') {
                 if ((window as any).aistudio && typeof (window as any).aistudio.hasSelectedApiKey === 'function') {
                     const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                     if (!hasKey) {
                         setIsLoading(false);
                         setNeedsApiKey(true);
                         return;
                     }
                 }
             }

             if (activeTool?.id === 'design-gen') {
                 // Use image editing/generation service
                 const userQ = inputValues['userQuery'] || "Modern architectural design";
                 
                 // Collect manual inputs
                 const type = inputValues['buildingType'] || '';
                 const style = inputValues['designStyle'] || '';
                 const area = inputValues['area'] ? `${inputValues['area']} sq.ft` : '';
                 const floors = inputValues['floors'] ? `${inputValues['floors']} floors` : '';
                 
                 // New inputs
                 const camera = inputValues['cameraView'] || '';
                 const lighting = inputValues['lighting'] || '';
                 const renderStyle = inputValues['renderStyle'] || 'Photorealistic';
                 const resolution = (inputValues['resolution'] as "1K" | "2K" | "4K") || '1K';
                 const aspectRatio = inputValues['aspectRatio'] || '16:9';
                 
                 let manualContext = [type, style, area, floors, camera, lighting, renderStyle].filter(Boolean).join(', ');
                 if (!manualContext) manualContext = "Architectural Structure";

                 let enhancedPrompt = `Design a ${manualContext}. ${userQ}`;

                 if (attachedImage) {
                     enhancedPrompt = `
You are an expert Architectural AI Visualizer.
Input Analysis & Generation Task:
1. ELEVATION SKETCH / SKETCHUP EXPORT PROVIDED: If the input image is a hand-drawn sketch, 2D elevation, or a SketchUp model export, generate an "Ultra Realistic 3D Visualization". Strictly follow the structural lines, proportions, and details of the drawing. Apply high-end architectural materials (e.g., polished concrete, cedar wood, tempered glass, natural stone) and cinematic lighting.
2. FLOOR PLAN PROVIDED: If the input image is a 2D floor plan, generate a "3D Isometric Floor Plan" or a "3D Cutaway View". Extrude the walls, add flooring textures, and place essential furniture to visualize the space.
3. STYLE & CONTEXT: Building Type: ${type}, Architectural Style: ${style}, Render Style: ${renderStyle}, Camera: ${camera}, Lighting: ${lighting}, Details: "${userQ}".
4. OUTPUT QUALITY: ${resolution} resolution, Aspect Ratio: ${aspectRatio}, Unreal Engine 5.4 render style, ray-traced shadows, global illumination.
`;
                 } else {
                     enhancedPrompt = `Generate a ${renderStyle} 3D architectural render. Type: ${type}, Style: ${style}, Camera: ${camera}, Lighting: ${lighting}, Area: ${area}, Floors: ${floors}. Description: ${userQ}. Resolution: ${resolution}, Aspect Ratio: ${aspectRatio}.`;
                 }

                 const result = await generateConstructionImage(enhancedPrompt, resolution, aspectRatio, attachedImage || undefined);
                 setAiResult(result.imageUrl || result.question || "No image generated. Please try a different prompt.");
             } else if (activeTool?.id === 'image-editor') {
                 const userQ = inputValues['userQuery'] || "A beautiful landscape";
                 const result = await generateOrEditImage(userQ, attachedImage || undefined);
                 setAiResult(result || "No image generated. Please try a different prompt.");
             } else if (activeTool?.id === 'ai-site-analyzer') {
                 if (!attachedImage) {
                     setAiResult("Please upload a site photo or blueprint for analysis.");
                     setIsLoading(false);
                     return;
                 }
                 const userQ = inputValues['userQuery'] || "Analyze this site photo/blueprint.";
                 const enhancedPrompt = `You are an expert AI Site Inspector and Structural Analyst.
Task: Analyze the provided site photo or blueprint.
1. Extract and list any visible dimensions or scale indicators.
2. Identify potential structural issues, safety hazards, or construction defects visible in the image.
3. Suggest material optimizations or alternative construction methods based on the visual data.
4. Provide a rough estimation of materials and costs based on the visible scope of work.
User Query: ${userQ}`;
                 
                 const response = await getAiCalculatorResponse(enhancedPrompt, "Engineer", [attachedImage], true, activeTool?.name ? `${activeTool.name} REPORT` : "ENGINEERING REPORT");
                 setAiResult(response.text);
                 setGroundingSources(response.sources || []);
              } else if (activeTool?.id === 'ai-material-discovery') {
                  const material = inputValues['materialQuery'] || '';
                  const category = inputValues['materialCategory'] || '';
                  const quantity = inputValues['quantity'] || '';
                  const unit = inputValues['unit'] || '';
                  const state = inputValues['state'] || '';
                  const district = inputValues['district'] || '';
                  const specs = inputValues['userQuery'] || '';
                  
                  const locationStr = [district, state].filter(Boolean).join(', ');
                  const fullDescription = `${category} - ${material}. Quantity Required: ${quantity} ${unit}. ${specs}`;
                  
                  // Use grounding service with structured output
                  const result = await findConstructionInfo(fullDescription, null, undefined, { category, district, state });
                  setFoundBusinesses(result.businesses || []);
                  
                  let formattedResult = `### Material Sourcing Report: ${material}\n\n`;
                  if (result.businesses && result.businesses.length > 0) {
                      formattedResult += `Found ${result.businesses.length} verified suppliers in ${locationStr}.\n\n`;
                      result.businesses.forEach(b => {
                          formattedResult += `#### ${b.name}\n- **Rating**: ${b.rating} ★\n- **Location**: ${b.location}\n- ${b.description}\n\n`;
                      });
                  }

                  if (result.sources && result.sources.length > 0) {
                      formattedResult += "\n\n### Verified Sources & Map Links:\n";
                      result.sources.forEach((s: any) => {
                          const link = s.web || s.maps;
                          if (link?.uri) {
                              formattedResult += `- [${link.title || 'View Source'}](${link.uri})\n`;
                          }
                      });
                  }
                  setAiResult(formattedResult);
              } else if (activeTool?.id === 'ai-service-finder') {
                  const serviceType = inputValues['serviceType'] || '';
                  const district = inputValues['district'] || '';
                  const state = "Kerala"; // Locked to Kerala as per request
                  const specs = inputValues['userQuery'] || '';
                  
                  const locationStr = `${district}, ${state}`;
                  const query = `${serviceType}. ${specs}`;
                  
                  const result = await findConstructionInfo(query, null, undefined, { category: serviceType, district, state });
                  setFoundBusinesses(result.businesses || []);
                  
                  let formattedResult = `Found ${result.businesses?.length || 0} professionals in ${locationStr}.\n\n`;
                  if (result.businesses && result.businesses.length > 0) {
                      result.businesses.forEach(b => {
                          formattedResult += `### ${b.name}\n- **Category**: ${b.category}\n- **Rating**: ${b.rating} ★\n- **Location**: ${b.location}\n- ${b.description}\n\n`;
                      });
                  }

                  if (result.sources && result.sources.length > 0) {
                      formattedResult += "\n\n### Local Professionals & Map Links:\n";
                      result.sources.forEach((s: any) => {
                          const link = s.web || s.maps;
                          if (link?.uri) {
                              formattedResult += `- [${link.title || 'View on Google Maps'}](${link.uri})\n`;
                          }
                      });
                  }
                  setAiResult(formattedResult);
              } else {
                  // Standard text/analysis flow
                 let query = activeTool?.aiPrompt || `I need help calculating/estimating for: ${activeTool?.name}.`;
                 
                 // If there's a specific user query in the AI tab
                 if (inputValues['userQuery']) {
                     query = `${query}\n\nSpecific Request: ${inputValues['userQuery']}`;
                 }
                 
                 // Append any manual input values as context
                 const manualContext = Object.entries(inputValues)
                    .filter(([k]) => k !== 'userQuery' && k !== 'materialQuery' && k !== 'state' && k !== 'district' && k !== 'materialCategory' && k !== 'quantity' && k !== 'unit' && k !== 'buildingType' && k !== 'designStyle' && k !== 'area' && k !== 'floors')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('\n');

                 if (manualContext) {
                     query += `\n\nContext parameters provided:\n${manualContext}`;
                 }

                 // Add location context for market rates
                 const state = inputValues['state'];
                 const district = inputValues['district'];
                 if (state || district) {
                     const locationStr = [district, state].filter(Boolean).join(', ');
                     query += `\n\nProject Location: ${locationStr}. Please use current local Indian market rates for this specific region when providing cost estimates.`;
                 }

                 // Pass attached image if available for multimodal analysis (e.g. reading blueprints)
                 const files = attachedImage ? [attachedImage] : undefined;
                 const response = await getAiCalculatorResponse(query, "Engineer", files, true, activeTool?.name ? `${activeTool.name} REPORT` : "ENGINEERING REPORT");
                 setAiResult(response.text);
                 setGroundingSources(response.sources || []);
             }
         } catch (e) {
             console.error(e);
             const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while generating the response.";
             setAiResult(`**Error:** ${errorMessage}`);
         } finally {
             setIsLoading(false);
         }
    };

    const renderAiInputs = () => {
        if (activeTool?.id === 'ai-material-discovery') {
            const selectedState = inputValues['state'];
            const districts = selectedState ? STATE_DISTRICTS_MAP[selectedState] : [];

            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-6 bg-[#0f172a] border border-emerald-500/20 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <Icon name="search" className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Icon name="search" className="h-4 w-4" /> AI Material Sourcing
                            </h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xl">
                                Expert discovery of technical grades and verified local suppliers using Google Search Grounding.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {/* Manual Category Selection */}
                        <div className="grid grid-cols-2 gap-5">
                            {renderField("Material Category", "materialCategory", "select", undefined, ["Cement", "Steel / TMT", "Bricks & Blocks", "Ready-Mix Concrete", "Flooring / Tiles", "Paints & Finishes", "Electrical", "Plumbing", "Wood / Timber", "Glass", "Roofing"])}
                            {renderField("What specific product?", "materialQuery", "text", "e.g. Fire-rated gypsum boards")}
                        </div>

                        {/* Quantity Inputs */}
                        <div className="grid grid-cols-2 gap-5">
                            {renderField("Quantity", "quantity", "number", "0")}
                            {renderField("Unit", "unit", "select", undefined, ["Bags", "Metric Tonnes (MT)", "Numbers (Nos)", "Sq. Feet", "Sq. Meters", "Liters", "Truck Load"])}
                        </div>

                        {/* Location Grid */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project State</label>
                                <div className="relative">
                                    <select 
                                        value={inputValues['state'] || ''}
                                        onChange={e => {
                                            handleInputChange('state', e.target.value);
                                            handleInputChange('district', ''); // Reset district
                                            handleBlur('state', e.target.value, 'text');
                                        }}
                                        onBlur={e => handleBlur('state', e.target.value, 'text')}
                                        className={`w-full bg-[#0f172a] border ${errors['state'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 text-white appearance-none focus:ring-2 ${errors['state'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all cursor-pointer`}
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <Icon name="chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                                </div>
                                {errors['state'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['state']}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project District</label>
                                <div className="relative">
                                    <select 
                                        value={inputValues['district'] || ''}
                                        onChange={e => handleInputChange('district', e.target.value)}
                                        onBlur={e => handleBlur('district', e.target.value, 'text')}
                                        disabled={!selectedState}
                                        className={`w-full bg-[#0f172a] border ${errors['district'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 text-white appearance-none focus:ring-2 ${errors['district'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">Select District</option>
                                        {districts?.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <Icon name="chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                                </div>
                                {errors['district'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['district']}</p>}
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Additional Project Context / Brand Specs</label>
                            <textarea 
                                value={inputValues['userQuery'] || ''}
                                onChange={e => handleInputChange('userQuery', e.target.value)}
                                onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                                placeholder="Specify brand preferences, grade requirements (e.g. OPC 53), or delivery constraints..."
                                className={`w-full h-32 bg-[#0f172a] border ${errors['userQuery'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl p-5 text-white text-sm resize-none focus:ring-2 ${errors['userQuery'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none placeholder:text-slate-600 leading-relaxed`}
                            />
                            {errors['userQuery'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['userQuery']}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImageUpload} 
                                className="hidden" 
                                accept="application/pdf,image/*"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${attachedImage ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-[#0f172a] text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'}`}
                            >
                                <Icon name="upload" className="h-4 w-4" />
                                {attachedImage ? 'Specs Attached' : 'Upload Specs'}
                            </button>
                            
                            <button 
                                onClick={handleAiGenerate}
                                disabled={isLoading}
                                className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Searching Market...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="search" className="h-4 w-4" />
                                        <span>Search Marketplace</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTool?.id === 'ai-service-finder') {
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-6 bg-[#0f172a] border border-emerald-500/20 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <Icon name="location" className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Icon name="location" className="h-4 w-4" /> Professional Finder
                            </h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-xl">
                                Find verified civil contractors, architects, and suppliers in Kerala using real-time Google Maps data.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            {renderField("Service Type", "serviceType", "select", undefined, ["Civil Contractors", "Architects", "Interior Designers", "Structural Engineers", "Electrical Contractors", "Plumbing Services", "Ready-Mix Concrete Suppliers", "Steel & TMT Suppliers", "Cement Dealers"])}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">District in Kerala</label>
                                <div className="relative">
                                    <select 
                                        value={inputValues['district'] || ''}
                                        onChange={e => handleInputChange('district', e.target.value)}
                                        onBlur={e => handleBlur('district', e.target.value, 'text')}
                                        className={`w-full bg-[#0f172a] border ${errors['district'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 text-white appearance-none focus:ring-2 ${errors['district'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all cursor-pointer`}
                                    >
                                        <option value="">Select District</option>
                                        {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <Icon name="chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                                </div>
                                {errors['district'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['district']}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Requirements (Optional)</label>
                            <textarea 
                                value={inputValues['userQuery'] || ''}
                                onChange={e => handleInputChange('userQuery', e.target.value)}
                                onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                                placeholder="e.g. Looking for contractors experienced in traditional Kerala architecture or eco-friendly materials..."
                                className={`w-full h-32 bg-[#0f172a] border ${errors['userQuery'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl p-5 text-white text-sm resize-none focus:ring-2 ${errors['userQuery'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none placeholder:text-slate-600 leading-relaxed`}
                            />
                        </div>

                        <button 
                            onClick={handleAiGenerate}
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Searching Maps...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="location" className="h-4 w-4" />
                                    <span>Find Professionals</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        }

        if (activeTool?.id === 'design-gen' || activeTool?.id === 'image-editor' || activeTool?.id === 'ai-site-analyzer') {
            return (
                <div className="space-y-6 animate-fade-in">
                    {/* Visual Header */}
                    <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50 rounded-3xl relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <Icon name="camera" className="h-32 w-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <Icon name="bolt" className="h-4 w-4" /> {activeTool.name}
                            </h3>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm">
                                {activeTool.description}
                            </p>
                        </div>
                    </div>

                    {/* Manual Data Entry Section */}
                    {activeTool.id === 'design-gen' && (
                        <div className="bg-slate-900/30 p-1 rounded-3xl border border-slate-800/50">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-4 pt-4 mb-2">Project Configuration</p>
                            <div className="grid grid-cols-2 gap-4 p-4">
                                {renderField("Project Plan Type", "buildingType", "select", undefined, ["Elevation Drawing", "Residential Villa", "Apartment Complex", "Commercial Office", "Interior Room", "Retail Shop", "Landscape / Garden"])}
                                {renderField("Architectural Style", "designStyle", "select", undefined, ["Modern Minimalist", "Modern Contemporary", "Traditional Indian", "Kerala Traditional", "Colonial / Classic", "Industrial", "Futuristic", "Mediterranean"])}
                                
                                {renderField("Camera View", "cameraView", "select", undefined, ["Exterior (Front Elevation)", "Top Down 3D View", "Isometric View", "Eye Level", "Bird's Eye View", "Interior View"])}
                                {renderField("Lighting Condition", "lighting", "select", undefined, ["Golden Hour (Sunset)", "Daylight", "Overcast", "Night / Artificial", "Studio Lighting"])}
                                
                                {renderField("Output Resolution", "resolution", "select", undefined, ["1K", "2K", "4K"])}
                                {renderField("Aspect Ratio", "aspectRatio", "select", undefined, ["16:9", "4:3", "1:1", "9:16", "21:9"])}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                         {/* Standard Input: Prompt & Upload */}
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Vision / Requirements</label>
                             <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-inner">
                                 <textarea 
                                    value={inputValues['userQuery'] || ''}
                                    onChange={e => handleInputChange('userQuery', e.target.value)}
                                    onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                                    placeholder={activeTool.id === 'design-gen' ? "Describe your vision, materials, lighting, or specific requirements..." : (activeTool.id === 'ai-site-analyzer' ? "Add specific questions about the site photo or blueprint..." : "Describe the image you want to generate or how to edit the attached image...")}
                                    className="w-full h-32 bg-transparent p-5 text-white text-sm resize-none outline-none placeholder:text-slate-600 leading-relaxed"
                                 />
                                 {errors['userQuery'] && <p className="text-red-500 text-[10px] font-bold ml-5 mb-2">{errors['userQuery']}</p>}
                                 
                                 <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            accept="image/*,application/pdf"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${attachedImage ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                        >
                                            <Icon name="upload" className="h-4 w-4" />
                                            {attachedImage ? "Replace Reference" : (activeTool.id === 'design-gen' ? "Upload Blueprint / Sketch" : (activeTool.id === 'ai-site-analyzer' ? "Upload Site Photo/Blueprint" : "Upload Image"))}
                                        </button>
                                        {attachedImage && (
                                            <button onClick={removeImage} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors">
                                                <Icon name="x-mark" className="h-4 w-4" />
                                            </button>
                                        )}
                                     </div>
                                 </div>
                                 {attachedImage && (
                                     <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                                         <div className="w-32 h-24 relative rounded-lg overflow-hidden border border-slate-700 bg-black/50">
                                             <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                                         </div>
                                     </div>
                                 )}
                             </div>
                         </div>
                         <button 
                            onClick={handleAiGenerate}
                            disabled={isLoading}
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 border-t border-emerald-400/20"
                         >
                             {isLoading ? (
                                 <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{activeTool.id === 'design-gen' ? 'Rendering Design...' : (activeTool.id === 'ai-site-analyzer' ? 'Analyzing Site...' : 'Generating Image...')}</span>
                                 </>
                             ) : (
                                 <>
                                    <Icon name="camera" className="h-4 w-4" />
                                    <span>{activeTool.id === 'design-gen' ? 'Generate Visualization' : (activeTool.id === 'ai-site-analyzer' ? 'Analyze Site' : 'Generate / Edit Image')}</span>
                                 </>
                             )}
                         </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4 animate-fade-in">
                 <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
                    <div className="flex items-center gap-2.5 mb-2">
                        <Icon name="bolt" className="h-4 w-4 text-emerald-400" />
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Neural Engine Context</p>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-medium opacity-80">
                        {activeTool?.description || "Describe your requirements in detail. The AI will generate estimates, methods, or reports based on your inputs."}
                    </p>
                 </div>

                 {/* File Upload UI */}
                 <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            accept="image/*,application/pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-emerald-500/50 transition-all"
                        >
                            <Icon name="upload" className="h-4 w-4" />
                            {attachedImage ? "Change Image" : "Attach Plan/Image"}
                        </button>
                        {attachedImage && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                                <span className="text-[10px] text-emerald-400 font-medium">Image Attached</span>
                                <button onClick={removeImage} className="text-slate-500 hover:text-red-400 transition-colors"><Icon name="x-mark" className="h-3 w-3" /></button>
                            </div>
                        )}
                     </div>
                     
                     {attachedImage && (
                         <div className="w-full h-32 relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950/50">
                             <img src={attachedImage} alt="Preview" className="w-full h-full object-contain" />
                         </div>
                     )}
                 </div>

                 {/* Location Selection for Market Rates */}
                 <div className="grid grid-cols-2 gap-5">
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project State (For Market Rates)</label>
                         <div className="relative">
                             <select 
                                 value={inputValues['state'] || ''}
                                 onChange={e => {
                                     handleInputChange('state', e.target.value);
                                     handleInputChange('district', ''); // Reset district
                                     handleBlur('state', e.target.value, 'text');
                                 }}
                                 onBlur={e => handleBlur('state', e.target.value, 'text')}
                                 className={`w-full bg-[#0f172a] border ${errors['state'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 text-white appearance-none focus:ring-2 ${errors['state'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all cursor-pointer`}
                             >
                                 <option value="">Select State</option>
                                 {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <Icon name="chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                         </div>
                         {errors['state'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['state']}</p>}
                     </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project District</label>
                         <div className="relative">
                             <select 
                                 value={inputValues['district'] || ''}
                                 onChange={e => handleInputChange('district', e.target.value)}
                                 onBlur={e => handleBlur('district', e.target.value, 'text')}
                                 disabled={!inputValues['state']}
                                 className={`w-full bg-[#0f172a] border ${errors['district'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl px-5 py-4 text-white appearance-none focus:ring-2 ${errors['district'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500'} outline-none text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                             >
                                 <option value="">Select District</option>
                                 {inputValues['state'] && STATE_DISTRICTS_MAP[inputValues['state']]?.map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                             <Icon name="chevron-down" className="absolute right-5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                         </div>
                         {errors['district'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['district']}</p>}
                     </div>
                 </div>

                 <textarea 
                    value={inputValues['userQuery'] || ''}
                    onChange={e => handleInputChange('userQuery', e.target.value)}
                    onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                    placeholder={activeTool?.id === 'design-gen' ? "Describe the image you want to generate or how to edit the attached image (e.g. 'Add a retro filter')..." : `Describe your ${activeTool?.name} requirements (e.g. dimensions, mix ratios, location constraints)...`}
                    className={`w-full h-48 bg-slate-900 border ${errors['userQuery'] ? 'border-red-500' : 'border-slate-700'} rounded-2xl p-5 text-white text-sm resize-none focus:ring-2 ${errors['userQuery'] ? 'focus:ring-red-500' : 'focus:ring-emerald-500/50'} outline-none placeholder:text-slate-600 leading-relaxed`}
                 />
                 {errors['userQuery'] && <p className="text-red-500 text-[10px] font-bold ml-1 mt-1">{errors['userQuery']}</p>}
                 <button 
                    onClick={handleAiGenerate}
                    disabled={isLoading}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                 >
                     {isLoading ? (
                         <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Analyzing Structural Data...</span>
                         </>
                     ) : (
                         <>
                            <Icon name="bolt" className="h-4 w-4" />
                            <span>Generate Intelligence Report</span>
                         </>
                     )}
                 </button>
            </div>
        );
    };

    const renderManualInputs = () => {
        if (!activeTool) return null;
        
        switch(activeTool.id) {
            case 'design-gen':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("Building Type", "buildingType", "select", undefined, ["Residential Villa", "Apartment Building", "Commercial Complex", "Industrial Warehouse", "Retail Store", "Office Space"])}
                            {renderField("Architectural Style", "designStyle", "select", undefined, ["Modern", "Kerala Traditional", "Contemporary", "Minimalist", "Industrial", "Victorian", "Art Deco"])}
                            {renderField("Render Style", "renderStyle", "select", undefined, ["Photorealistic", "Blueprint Style", "Sketch Style", "Ultra Realistic (SketchUp to Real)", "Watercolor", "Pencil Sketch"])}
                            {renderField("Camera View", "cameraView", "select", undefined, ["Eye Level", "Aerial / Bird's Eye", "Worm's Eye", "Interior Wide Angle", "Close-up Detail", "Isometric"])}
                            {renderField("Lighting Conditions", "lighting", "select", undefined, ["Daylight / Sunny", "Golden Hour", "Night / Artificial", "Overcast / Soft", "Studio Lighting"])}
                            {renderField("Output Resolution", "resolution", "select", undefined, ["1K", "2K", "4K"])}
                            {renderField("Aspect Ratio", "aspectRatio", "select", undefined, ["1:1", "4:3", "16:9", "9:16", "3:4"])}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {renderField("Built-up Area (sq.ft)", "area", "number")}
                            {renderField("Number of Floors", "floors", "number")}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Vision / Requirements</label>
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all shadow-inner">
                                <textarea 
                                    value={inputValues['userQuery'] || ''}
                                    onChange={e => handleInputChange('userQuery', e.target.value)}
                                    onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                                    placeholder="Describe your vision, materials, lighting, or specific requirements..."
                                    className="w-full h-32 bg-transparent p-5 text-white text-sm resize-none outline-none placeholder:text-slate-600 leading-relaxed"
                                />
                                {errors['userQuery'] && <p className="text-red-500 text-[10px] font-bold ml-5 mb-2">{errors['userQuery']}</p>}
                                
                                <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageUpload} 
                                            className="hidden" 
                                            accept="image/*,application/pdf"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${attachedImage ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                        >
                                            <Icon name="upload" className="h-4 w-4" />
                                            {attachedImage ? "Replace Reference" : "Upload Blueprint / Sketch"}
                                        </button>
                                        {attachedImage && (
                                            <button onClick={removeImage} className="p-2 rounded-xl text-slate-500 hover:text-red-400 transition-colors">
                                                <Icon name="x-mark" className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {attachedImage && (
                                    <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                                        <div className="w-32 h-24 relative rounded-lg overflow-hidden border border-slate-700 bg-black/50">
                                            <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isLoading}
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 border-t border-emerald-400/20"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Rendering Design...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="camera" className="h-4 w-4" />
                                    <span>Generate Visualization</span>
                                </>
                            )}
                        </button>
                    </div>
                );
            case 'ai-service-finder':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("Professional Type", "serviceType", "select", undefined, ["Architect", "Interior Designer", "Civil Contractor", "Structural Engineer", "Plumber", "Electrician", "Painter", "Carpenter", "Mason", "HVAC Technician"])}
                            {renderField("District (Kerala)", "district", "select", undefined, KERALA_DISTRICTS)}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Additional Requirements</label>
                            <textarea 
                                value={inputValues['userQuery'] || ''}
                                onChange={e => handleInputChange('userQuery', e.target.value)}
                                onBlur={e => handleBlur('userQuery', e.target.value, 'text')}
                                placeholder="e.g. 'Need someone with experience in traditional Kerala homes' or 'Looking for a licensed electrician for a commercial project'..."
                                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-2xl p-5 text-white text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600 leading-relaxed"
                            />
                        </div>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 border-t border-emerald-400/20"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Searching Professionals...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="search" className="h-4 w-4" />
                                    <span>Find Professionals</span>
                                </>
                            )}
                        </button>
                    </div>
                );
            case 'concrete':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Member Type", "memberType", "select", undefined, ["Column", "Beam", "Slab", "Footing"])}
                        {renderField("Concrete Grade", "grade", "select", undefined, ["M15", "M20", "M25", "M30"])}
                        {renderField("Length (m)", "length", "number")}
                        {renderField("Width (m)", "width", "number")}
                        {renderField("Depth (m)", "depth", "number")}
                        {renderField("Count", "count", "number", "1")}
                    </div>
                );
            case 'bricks':
                 return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("Wall Length (m)", "wallLength", "number")}
                            {renderField("Wall Height (m)", "wallHeight", "number")}
                            {renderField("Wall Thickness", "wallThickness", "select", undefined, ["4.5\" Wall", "9\" Wall", "13.5\" Wall"])}
                            {renderField("Brick Type", "brickType", "select", undefined, ["Modular (190x90x90mm)", "Traditional (230x110x70mm)", "Wire-cut (200x100x100mm)", "Solid Block 12\" (300x200x150mm)", "Custom Size..."])}
                        </div>
                        {inputValues['brickType'] === 'Custom Size...' && (
                             <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                 <p className="text-[10px] uppercase font-bold text-emerald-500 mb-2">Custom Dimensions</p>
                                 <div className="grid grid-cols-4 gap-2">
                                     {renderField("L", "customBrickL", "number")}
                                     {renderField("W", "customBrickW", "number")}
                                     {renderField("H", "customBrickH", "number")}
                                     {renderField("Unit", "customBrickUnit", "select", undefined, ["mm", "cm", "inch", "ft"])}
                                 </div>
                             </div>
                        )}
                    </div>
                );
            case 'rebar':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("Bar Shape", "shape", "select", undefined, ["straight", "lbend", "stirrup", "crank"])}
                            {renderField("Diameter (mm)", "diameter", "select", undefined, ["6", "8", "10", "12", "16", "20", "25", "32"])}
                            {renderField("Count (Nos)", "count", "number", "1")}
                        </div>
                        {inputValues['shape'] === 'straight' && renderField("Length (m)", "length", "number")}
                        {inputValues['shape'] === 'lbend' && (
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Leg A (m)", "legA", "number")}
                                {renderField("Leg B (m)", "legB", "number")}
                            </div>
                        )}
                        {inputValues['shape'] === 'stirrup' && (
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Column Width (mm)", "width", "number")}
                                {renderField("Column Depth (mm)", "depth", "number")}
                            </div>
                        )}
                        {inputValues['shape'] === 'crank' && (
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Total Span (m)", "span", "number")}
                                {renderField("Crank Height (mm)", "crankHeight", "number")}
                            </div>
                        )}
                    </div>
                );
            case 'steel-weight':
                return (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderField("Section Type", "sectionType", "select", undefined, ["I-Beam", "Channel", "Angle", "Tube"])}
                            {renderField("Length (m)", "length", "number")}
                            {renderField("Count", "count", "number", "1")}
                         </div>
                         <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                             {renderField("Depth (D) mm", "depth", "number")}
                             {renderField("Width (B) mm", "width", "number")}
                             {(inputValues['sectionType'] === 'I-Beam' || inputValues['sectionType'] === 'Channel') && (
                                 <>
                                     {renderField("Flange Thickness (tf) mm", "flangeThick", "number")}
                                     {renderField("Web Thickness (tw) mm", "webThick", "number")}
                                 </>
                             )}
                             {(inputValues['sectionType'] === 'Angle' || inputValues['sectionType'] === 'Tube') && (
                                 renderField("Thickness (t) mm", "thickness", "number")
                             )}
                         </div>
                    </div>
                );
            case 'plastering':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Surface Area (sq.ft)", "area", "number")}
                        {renderField("Thickness", "thickness", "select", undefined, ["12mm (Internal)", "15mm (Rough)", "20mm (External)"])}
                        {renderField("Mix Ratio", "mixRatio", "select", undefined, ["1:3", "1:4", "1:5", "1:6"])}
                    </div>
                );
            case 'rakewall':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Base Length (m)", "length", "number")}
                        {renderField("Start Height (m)", "heightStart", "number")}
                        {renderField("End Height (m)", "heightEnd", "number")}
                        {renderField("Thickness (mm)", "thickness", "number", "230")}
                    </div>
                );
            case 'staircase':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Total Height (m)", "totalHeight", "number")}
                        {renderField("Riser Height (mm)", "riser", "number", "150")}
                        {renderField("Tread Length (mm)", "tread", "number", "250")}
                        {renderField("Stair Width (m)", "width", "number", "1.2")}
                        {renderField("Waist Slab (mm)", "waist", "number", "150")}
                    </div>
                );
            case 'excavation-vol':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Length", "length", "number")}
                         {renderField("Width", "width", "number")}
                         {renderField("Depth", "depth", "number")}
                         {renderField("Count", "count", "number", "1")}
                         {renderField("Unit", "unit", "select", undefined, ["Meters", "Feet"])}
                    </div>
                );
            case 'foundation-indep':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Footing Length (m)", "length", "number")}
                         {renderField("Footing Width (m)", "width", "number")}
                         {renderField("Excavation Depth (m)", "depth", "number")}
                         {renderField("Count", "count", "number", "1")}
                    </div>
                );
            case 'foundation-raft':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Raft Length (m)", "length", "number")}
                         {renderField("Raft Width (m)", "width", "number")}
                         {renderField("Thickness (mm)", "depth", "number")}
                         {renderField("Steel Density (kg/m3)", "steelDensity", "number", "80")}
                    </div>
                );
            case 'foundation-piling':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Pile Diameter (mm)", "diameter", "number", "600")}
                         {renderField("Depth (m)", "depth", "number")}
                         {renderField("Number of Piles", "count", "number", "1")}
                    </div>
                );
            case 'shuttering':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Element", "elementType", "select", undefined, ["Column", "Beam", "Slab", "Wall"])}
                        {renderField("Length (m)", "length", "number")}
                        {renderField("Width (m)", "width", "number")}
                        {renderField("Height/Depth (m)", "depth", "number")}
                        {renderField("Count", "count", "number", "1")}
                    </div>
                );
            case 'tiles':
                 return (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {renderField("Area (sq.ft)", "area", "number")}
                             {renderField("Tile Size", "tileSize", "select", undefined, ["2x2 ft (600x600mm)", "4x2 ft (1200x600mm)", "4x4 ft (1200x1200mm)", "Wood Plank (200x1200mm)", "Custom Size..."])}
                         </div>
                         {inputValues['tileSize'] === 'Custom Size...' && (
                             <div className="grid grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                 {renderField("L", "customTileL", "number")}
                                 {renderField("W", "customTileW", "number")}
                                 {renderField("Unit", "customTileUnit", "select", undefined, ["mm", "cm", "inch", "ft"])}
                             </div>
                         )}
                    </div>
                );
            case 'paint':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Surface Area (sq.ft)", "area", "number")}
                        {renderField("No. of Coats", "coats", "number", "2")}
                    </div>
                );
            case 'material-estimation':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Length", "length", "number")}
                         {renderField("Width", "width", "number")}
                         {renderField("Height/Thick", "height", "number")}
                         {renderField("Count", "count", "number", "1")}
                         {renderField("Unit", "unit", "select", undefined, ["Meters", "Feet", "Inches"])}
                     </div>
                 );
            case 'ceiling':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {renderField("Room Length (m)", "length", "number")}
                         {renderField("Room Width (m)", "width", "number")}
                     </div>
                 );
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Length", "length", "number")}
                        {renderField("Width", "width", "number")}
                        {renderField("Height/Depth", "height", "number")}
                    </div>
                );
        }
    };

    if (!activeTool) {
        return (
            <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex items-center justify-center">
                <div className="text-center">
                    <Icon name="calculator" className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a tool from the menu to begin</p>
                    <button onClick={() => onNavigate('/')} className="mt-4 px-6 py-2 bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col md:flex-row print:bg-white print:text-black">
            {/* Sidebar / Tools List (Desktop) */}
            <aside className="w-full md:w-80 border-r border-slate-800 bg-[#0a0f1c] hidden md:flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar print:hidden">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-900 transition-colors" onClick={() => onNavigate('/')}>
                    <Icon name="bolt" className="h-6 w-6 text-emerald-500" />
                    <h1 className="font-black text-white text-lg tracking-tight uppercase">BuildNet <span className="text-emerald-500">Tools</span></h1>
                </div>
                
                <div className="p-4 space-y-6">
                    {CALCULATOR_TOOLS.map((category, idx) => (
                        <div key={idx}>
                            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{category.title}</h3>
                            <div className="space-y-1">
                                {category.tools.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => onNavigate(`/calculator/${tool.id}`)}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${activeTool?.id === tool.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                    >
                                        <Icon name={tool.icon} className={`h-4 w-4 ${activeTool?.id === tool.id ? 'text-white' : 'text-slate-500'}`} />
                                        {tool.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative print:overflow-visible print:h-auto">
                {/* Header */}
                <header className="h-auto min-h-[5rem] py-4 border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 md:px-10 shrink-0 z-20 gap-4 sm:gap-0 print:hidden">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <button onClick={() => onNavigate('/')} className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-400 shrink-0"><Icon name="menu" className="h-5 w-5" /></button>
                        
                        {/* Explicit Home/Back Button for Main View */}
                        <button onClick={() => onNavigate('/')} className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors mr-4 group shrink-0">
                            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 group-hover:border-emerald-500/50"><Icon name="chevron-down" className="h-4 w-4 rotate-90" /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                        </button>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate">{activeTool.name}</h2>
                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hidden sm:block truncate">BuildNet Engineering Suite</p>
                        </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        <button 
                            onClick={handleDownloadPdf} 
                            className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl transition-all shrink-0"
                            title="Download PDF"
                        >
                            <Icon name="download" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handlePrint} 
                            className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl transition-all shrink-0"
                            title="Print Report"
                        >
                            <Icon name="document" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleShare} 
                            className="flex items-center justify-center p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl transition-all shrink-0"
                            title="Share Report"
                        >
                            <Icon name="share" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleWhatsApp} 
                            className="flex items-center justify-center p-2.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/20 rounded-xl transition-all shrink-0"
                            title="Share via WhatsApp"
                        >
                            <Icon name="whatsapp" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleEmail} 
                            className="flex items-center justify-center p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl transition-all shrink-0"
                            title="Share via Email"
                        >
                            <Icon name="email" className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={handleSaveResult} 
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
                        >
                            {isSaving ? <div className="h-4 w-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div> : <Icon name="download" className="h-4 w-4" />}
                            <span className="hidden sm:inline">Save Report</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar print:overflow-visible print:p-0">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full print:block">
                        
                        {/* Input Panel */}
                        <div className="lg:col-span-5 flex flex-col gap-6 h-full print:hidden">
                            {/* Mode Switcher */}
                            <div className="p-1.5 bg-slate-900 rounded-2xl border border-slate-800 flex shrink-0">
                                <button 
                                    onClick={() => handleTabChange('manual')} 
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Standard Input
                                </button>
                                <button 
                                    onClick={() => handleTabChange('ai')} 
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-emerald-400'}`}
                                >
                                    <Icon name="bolt" className="h-3 w-3" /> AI Assistant
                                </button>
                            </div>

                            <div className="bg-[#0a0f1c] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex-1 overflow-y-auto custom-scrollbar relative">
                                {activeTab === 'manual' ? (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                                {activeTool.description}
                                            </p>
                                        </div>
                                        {renderManualInputs()}
                                    </div>
                                ) : (
                                    renderAiInputs()
                                )}
                            </div>
                        </div>

                        {/* Visualization Panel */}
                        <div className="lg:col-span-7 h-full flex flex-col print:block print:h-auto">
                             <div id="report-content" className="bg-[#0a0f1c] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl h-full relative overflow-hidden flex flex-col print:bg-white print:border-none print:shadow-none print:p-0 print:text-black">
                                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none print:hidden">
                                     <Icon name={activeTool.icon} className="h-64 w-64" />
                                 </div>
                                 
                                 <div className="relative z-10 flex-1 flex flex-col print:block">
                                     <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-3 print:text-black print:text-xl">
                                         <span className="w-8 h-[1px] bg-emerald-500 print:hidden"></span> 
                                         {activeTab === 'ai' ? 'Intelligence Report' : 'Real-time Visualization'}
                                         <span className="hidden print:inline ml-2">- {activeTool.name}</span>
                                     </h3>
                                     
                                     <div className="flex-1 print:block">
                                         {activeTab === 'ai' ? (
                                             isLoading ? (
                                                 <div className="h-full flex items-center justify-center print:hidden">
                                                     <LoadingSpinner isThinking />
                                                 </div>
                                             ) : needsApiKey ? (
                                                 <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-6 print:hidden">
                                                     <Icon name="bolt" className="h-16 w-16 text-emerald-500" />
                                                     <div className="text-center max-w-sm">
                                                         <h4 className="text-white font-bold mb-2">Google Cloud API Key Required</h4>
                                                         <p className="text-xs text-slate-500 mb-6">To use high-quality 3D rendering and image generation models, you must provide your own Google Cloud API key with billing enabled.</p>
                                                         <button 
                                                             onClick={async () => {
                                                                 if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
                                                                     await (window as any).aistudio.openSelectKey();
                                                                     setNeedsApiKey(false);
                                                                     handleAiGenerate();
                                                                 }
                                                             }}
                                                             className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                                         >
                                                             Select API Key
                                                         </button>
                                                     </div>
                                                 </div>
                                             ) : aiResult ? (
                                                 <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-6 h-full overflow-y-auto custom-scrollbar animate-slide-up print:bg-white print:border-none print:p-0 print:overflow-visible">
                                                     {aiResult.startsWith('data:image') ? (
                                                         <div className="flex flex-col h-full print:block">
                                                             <Interactive3DImage src={aiResult} alt="AI Generated Design" />
                                                             <div className="mt-4 flex justify-between items-center print:hidden">
                                                                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Generated by BuildNet AI</p>
                                                                 <div className="flex gap-4">
                                                                     <button onClick={() => setAiResult('')} className="text-slate-500 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors"><Icon name="trash" className="h-4 w-4"/> Clear</button>
                                                                     <button onClick={() => handleDownload(aiResult)} className="text-white hover:text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors"><Icon name="download" className="h-4 w-4"/> Download HD</button>
                                                                 </div>
                                                             </div>
                                                         </div>
                                                     ) : (
                                                         <div className="prose prose-invert prose-sm max-w-none print:prose-p:text-black print:prose-headings:text-black print:prose-strong:text-black">
                                                             <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 print:hidden">
                                                                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Neural Intelligence Report</p>
                                                                 <div className="flex gap-4">
                                                                     <button onClick={() => setAiResult('')} className="text-slate-500 hover:text-white text-xs font-bold flex items-center gap-2 transition-colors"><Icon name="trash" className="h-4 w-4"/> Clear</button>
                                                                     <button onClick={() => window.print()} className="text-white hover:text-emerald-400 text-xs font-bold flex items-center gap-2 transition-colors"><Icon name="download" className="h-4 w-4"/> Print Report</button>
                                                                 </div>
                                                             </div>
                                                             <div className="hidden print:block mb-8 border-b-2 border-emerald-500 pb-4">
                                                                 <div className="flex justify-between items-center mb-2">
                                                                     <p className="text-xs text-slate-500 font-bold">{new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                                                                     <p className="text-xs text-slate-500 font-bold">BuildNetAI | Construction Intelligence</p>
                                                                 </div>
                                                                 <p className="text-emerald-600 font-black tracking-[0.4em] uppercase text-xs">
                                                                     {activeTool?.name ? `${activeTool.name} REPORT` : 'NEURAL ENGINEERING REPORT'}
                                                                 </p>
                                                             </div>
                                                              {foundBusinesses.length > 0 && (
                                                                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden print:hidden mb-6">
                                                                      <div className="flex items-center gap-3 mb-4 px-2 pt-1">
                                                                          <div className="h-8 w-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                                              <Icon name="location" className="h-4 w-4 text-emerald-500" />
                                                                          </div>
                                                                          <h3 className="text-white font-black text-[10px] uppercase tracking-widest">Interactive Service Map</h3>
                                                                      </div>
                                                                      <GoogleMapComponent businesses={foundBusinesses} />
                                                                  </div>
                                                              )}
                                                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                                                 {aiResult}
                                                              </ReactMarkdown>

                                                              {groundingSources.length > 0 && (
                                                                  <div className="mt-8 pt-6 border-t border-slate-800 print:hidden">
                                                                      <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                                                          <Icon name="database" className="h-3 w-3" />
                                                                          Verified Google Sources
                                                                      </h4>
                                                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                          {groundingSources.map((source, idx) => {
                                                                              const link = source.web || source.maps;
                                                                              if (!link?.uri) return null;
                                                                              return (
                                                                                  <a 
                                                                                      key={idx}
                                                                                      href={link.uri}
                                                                                      target="_blank"
                                                                                      rel="noopener noreferrer"
                                                                                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                                                                                  >
                                                                                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                                                                          <Icon name={source.maps ? 'location' : 'website'} className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                                                                                      </div>
                                                                                      <div className="flex-1 min-w-0">
                                                                                          <p className="text-xs font-bold text-slate-300 truncate group-hover:text-white">{link.title || 'Source Reference'}</p>
                                                                                          <p className="text-[10px] text-slate-500 truncate">Verified via Google</p>
                                                                                      </div>
                                                                                      <Icon name="share" className="h-3 w-3 text-slate-600 group-hover:text-emerald-500" />
                                                                                  </a>
                                                                              );
                                                                          })}
                                                                      </div>
                                                                  </div>
                                                              )}
                                                              </div>
                                                          )}
                                                 </div>
                                             ) : (
                                                 <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50 print:hidden">
                                                     <Icon name="bolt" className="h-16 w-16" />
                                                     <p className="text-xs font-black uppercase tracking-widest">AI Engine Ready</p>
                                                 </div>
                                             )
                                         ) : (
                                             <div className="h-full print:block">
                                                 <CalculatorVisualizer toolId={activeTool.id} values={inputValues} />
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                        </div>

                    </div>
                </div>
            </main>
            <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
            <AlertModal isOpen={alertModal.isOpen} message={alertModal.message} onClose={() => setAlertModal({ isOpen: false, message: '' })} />
            <SaveToDriveModal 
                isOpen={showSaveModal} 
                onClose={() => setShowSaveModal(false)} 
                onSave={performSave} 
                isSaving={isSaving} 
            />
        </div>
    );
};
