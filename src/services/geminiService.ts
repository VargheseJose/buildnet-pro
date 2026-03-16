
import { GoogleGenAI, Type } from "@google/genai";
import { UserLocation, Business, SearchResult, UserProfile } from '../types';

const cleanJsonString = (text: string): string => {
    if (!text) return "";
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    return cleanedText;
};

const handleAIError = (error: unknown, context: string): never => {
    console.error(`Detailed Service Error in ${context}:`, error);
    let msg = `An unknown error occurred in ${context}.`;

    if (error instanceof Error) {
        const errorText = error.message;

        if (errorText.includes("Requested entity was not found")) {
            throw new Error("API_KEY_RESET_REQUIRED");
        }

        if (errorText.includes("unregistered callers") || errorText.includes("API key not valid") || errorText.includes("403")) {
            msg = "The API key provided is either missing, invalid, or does not have permission to access this specific AI model (e.g. 3D Image Generation). Please check your Gemini API key in the settings or select a valid key from the platform.";
        }

        if (errorText.includes("429") || errorText.includes("quota") || errorText.includes("Resource has been exhausted")) {
            msg = "Our high-performance neural engine is temporarily at capacity. This usually happens during peak design hours. Please wait 10-15 seconds while we re-allocate processing power for your request.";
        }
        else if (errorText.includes("SAFETY") || errorText.includes("blocked") || errorText.includes("candidate was blocked")) {
            msg = "The visual or text prompt contains elements that trigger our architectural safety filters. Please refine your description to focus purely on structural, material, and construction details. Avoid sensitive or non-construction related imagery.";
        }
        else if (errorText.includes("400") || errorText.includes("invalid")) {
            msg = "We couldn't process this structural request. Please ensure your inputs (dimensions, material types, or uploaded plans) are clear and follow standard engineering formats.";
        }
        else if (errorText.includes("500") || errorText.includes("503") || errorText.includes("deadline")) {
            msg = "Our design servers are experiencing high latency due to complex 3D rendering. Please try again in a moment; your request has been logged for priority processing.";
        }
        else {
            msg = errorText;
        }
    }

    msg = msg.replace(/Gemini/gi, "BuildNet AI");
    throw new Error(msg);
};

export const findConstructionInfo = async (
    searchQuery: string,
    location: UserLocation | null,
    base64Image?: string,
    filters?: { category?: string; district?: string; state?: string },
    apiKey?: string
): Promise<SearchResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
        const systemInstruction = `You are BuildNet AI, India's premier Construction Intelligence Engine. 
        Your mission is to find the absolute best construction professionals, material suppliers, and contractors.
        
        STRICT GUIDELINES:
        1. Prioritize businesses with high ratings (>4.0) and verified status.
        2. Use Google Maps to verify physical addresses and contact details.
        3. Ensure the business category strictly matches the user's intent (e.g., if they ask for 'Plumber', don't show general hardware stores).
        4. Provide a brief, professional description for each business highlighting their specialty.
        
        Return a JSON structure: 
        { "businesses": [ { "name": string, "category": string, "location": string, "phone": string, "rating": number, "description": string, "mapUrl": string, "latitude": number, "longitude": number } ] }. 
        Only include real, verified businesses found through Google Maps or search grounding.`;

        const parts: any[] = [{ text: `User Query: "${searchQuery}" Filters: ${JSON.stringify(filters)}. If the location is provided via GPS, focus search around those coordinates.` }];

        if (base64Image) {
            const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            }
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts }],
            config: {
                systemInstruction,
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                ...(location && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: location.latitude,
                                longitude: location.longitude
                            }
                        }
                    }
                }),
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const text = response.text || "";

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const responseText = cleanJsonString(jsonMatch ? jsonMatch[0] : "{\"businesses\":[]}");

        try {
            const parsedJson = JSON.parse(responseText);
            return { businesses: parsedJson.businesses || [], sources };
        } catch (e) {
            console.warn("Could not parse AI response as JSON for businesses. Returning empty list but preserving grounding sources.", text);
            return { businesses: [], sources };
        }
    } catch (error) {
        handleAIError(error, "findConstructionInfo");
    }
};

export const getRecommendations = async (
    userProfile: UserProfile,
    userLocation: UserLocation | null,
    apiKey?: string
): Promise<Business[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });

        // Construct context from user profile
        const recentSearches = userProfile.savedSearches?.slice(0, 5).map(s => `${s.query} in ${s.district}`).join(", ") || "None";
        const favorites = userProfile.favorites?.map(f => `${f.name} (${f.category})`).join(", ") || "None";
        const projectDescriptions = userProfile.projects?.map(p => `${p.name}: ${p.description || ''}`).join("; ") || "None";
        const rfqItems = userProfile.rfqs?.flatMap(r => r.items.map(i => i.description)).join(", ") || "None";

        const systemInstruction = `You are BuildNet AI's Recommendation Engine. 
        Analyze the user's history to suggest relevant construction professionals, suppliers, or services.
        
        User Context:
        - Recent Searches: ${recentSearches}
        - Favorites: ${favorites}
        - Projects: ${projectDescriptions}
        - RFQ Items: ${rfqItems}
        - User Role: ${userProfile.role}
        - Location: ${userProfile.district}, ${userProfile.category}

        Task:
        Based on this activity, recommend 3-5 specific types of businesses or services they might need next. 
        Use Google Maps to find REAL, highly-rated businesses in their area matching these needs.
        
        Return a JSON structure:
        { "businesses": [ { "name": string, "category": string, "location": string, "phone": string, "rating": number, "description": string, "mapUrl": string, "latitude": number, "longitude": number } ] }
        
        Focus on:
        1. Next logical steps (e.g., if they searched for architects, suggest structural engineers).
        2. Related services (e.g., if they bought cement, suggest steel or labor contractors).
        3. Highly rated local options.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: "Generate recommendations based on my history." }],
            config: {
                systemInstruction,
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                ...(userLocation && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude
                            }
                        }
                    }
                }),
            },
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const responseText = cleanJsonString(jsonMatch ? jsonMatch[0] : "{\"businesses\":[]}");

        try {
            const parsedJson = JSON.parse(responseText);
            return parsedJson.businesses || [];
        } catch (e) {
            console.warn("Could not parse AI recommendations.", text);
            return [];
        }
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return []; // Return empty on error to avoid breaking UI
    }
};

export const getMarketQuoteEstimate = async (
    takeoffResult: string,
    location: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = `You are a Senior Quantity Surveyor at BuildNet AI.
        TASK: Based on the provided Quantity Takeoff result and project location, generate a high-level Initial Quote Estimate using CURRENT INDIAN MARKET RATES (2026).
        
        STRICT RULES:
        1. CURRENCY: Use INR (₹) exclusively. NEVER use dollar signs ($) or USD.
        2. UNITS: Use plain alphanumeric units (cu.m, sq.m, sq.ft, Bags, Nos, MT). NO LaTeX formatting like m^3.
        3. FORMAT: Return a structured Markdown table including:
           | Item | Unit | Quantity | Unit Rate (Est. ₹) | Amount (Est. ₹) |
        4. TOTALS: Provide a Grand Total in ₹ at the end.
        5. DISCLAIMER: Always mention that this is an AI-generated estimate and actual vendor quotes may vary.
        6. REGIONAL DATA: Use current market rates specifically for ${location}.
        
        Tone: Professional, conservative, and technical.`;

        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: `Location: ${location}\nTakeoff Quantities:\n${takeoffResult}`,
            config: { systemInstruction },
        });
        return response.text || "";
    } catch (error) {
        handleAIError(error, "getMarketQuoteEstimate");
    }
};

export const searchGroundingForMaterial = async (
    description: string,
    location: string,
    userCoords?: UserLocation | null,
    base64Image?: string
): Promise<{ text: string, sources: any[] }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const parts: any[] = [
            {
                text: `Find suitable construction materials and verified suppliers for: "${description}" in ${location}. 
            Provide technical specifications, brand recommendations, and specific local businesses if found. 
            Use Google Maps to find exact business locations and current availability.` }
        ];

        if (base64Image) {
            const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            }
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ parts }],
            config: {
                tools: [{ googleMaps: {} }, { googleSearch: {} }],
                ...(userCoords && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: userCoords.latitude,
                                longitude: userCoords.longitude
                            }
                        }
                    }
                }),
            }
        });
        const text = response.text || "";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch (error) {
        handleAIError(error, "searchGroundingForMaterial");
    }
};

export const searchLocalServices = async (
    query: string,
    location: string,
    userCoords?: UserLocation | null
): Promise<{ text: string, sources: any[] }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ text: `Find construction professionals, suppliers, and services for: "${query}" in ${location}. Provide a detailed list with names, contact info, and their specific expertise.` }],
            config: {
                tools: [{ googleMaps: {} }],
                ...(userCoords && {
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: userCoords.latitude,
                                longitude: userCoords.longitude
                            }
                        }
                    }
                }),
            }
        });
        const text = response.text || "";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch (error) {
        handleAIError(error, "searchLocalServices");
    }
};

const getApiKey = (apiKey?: string) => {
    const key = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!key) {
        console.warn('No API Key found in any source!');
    }
    return key;
};

export const generateOrEditImage = async (
    prompt: string,
    base64Image?: string,
    apiKey?: string
): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
        const model = 'gemini-3.1-flash-image-preview';

        const parts: any[] = [];
        if (base64Image) {
            const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            }
        }
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                tools: [
                    {
                        googleSearch: {
                            searchTypes: {
                                webSearch: {},
                                imageSearch: {},
                            }
                        },
                    } as any,
                ],
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        return "";
    } catch (error) {
        handleAIError(error, "generateOrEditImage");
        return "";
    }
};

export const generateConstructionImage = async (
    prompt: string,
    quality: "1K" | "2K" | "4K" = "1K",
    aspectRatio: string = "16:9",
    base64Image?: string,
    apiKey?: string
): Promise<{ imageUrl: string | null; question: string | null }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
        const modelName = 'gemini-3.1-flash-image-preview';

        const instruction = `You are the BuildNet AI Architectural Visualization Engine. 
        You specialize in transforming construction prompts, hand sketches, and SketchUp exports into hyper-realistic, structurally sound architectural renders.
        
        VISUAL STANDARDS:
        - Use cinematic lighting (Golden Hour, Soft Daylight, or Professional Interior Lighting).
        - Ensure material textures (concrete, wood, glass, steel) are photorealistic and high-resolution.
        - Maintain structural logic: beams, columns, and overhangs must look engineered and stable.
        - For SketchUp/Blueprint inputs: You MUST use the attachment as the structural template. Preserve the original proportions but add realistic materials, depth, and environment.
        - Environment: Add relevant context (lush Kerala greenery, modern urban streetscapes, or clean professional interiors).
        - Output: Return ONLY the generated image part. No reports or descriptions.`;

        const parts: any[] = [
            { text: instruction },
            { text: `Target Render Specification: ${prompt}` }
        ];

        if (base64Image) {
            const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            }
        }

        const config: any = {
            imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: quality
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
                ...config,
                tools: [
                    {
                        googleSearch: {
                            searchTypes: {
                                webSearch: {},
                                imageSearch: {},
                            }
                        },
                    } as any,
                ],
            },
        });

        let imageUrl: string | null = null;
        let question: string | null = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    question = part.text;
                }
            }
        }
        return { imageUrl: imageUrl, question: imageUrl ? null : question };
    } catch (error) {
        handleAIError(error, "generateConstructionImage");
    }
};

export const getAiCalculatorResponse = async (
    query: string,
    role: string,
    fileBase64s?: string[],
    isQuickCalc: boolean = false,
    reportTitle: string = "ENGINEERING REPORT",
    apiKey?: string
): Promise<{ text: string; sources: any[] }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
        const systemInstruction = `You are a Senior Structural Engineer and Quantity Surveyor at BuildNet AI Engineering Lab.
        Your task is to provide highly precise, professional construction estimates and technical advice.
        
        STRICT FORMATTING & QUALITY PROTOCOL:
        1. **ACCURACY**: Use standard Indian construction constants (e.g., 0.45 bags of cement per sqft for 1:4 plastering).
        2. **CURRENCY**: Use INR (₹) exclusively. ABSOLUTE BAN on the '$' symbol.
        3. **UNITS**: Use plain text alphanumeric units only (cu.m, sq.m, sq.ft, Nos, MT, Bags).
        4. **REPORT HEADERS**: Start exactly with: # ${reportTitle.toUpperCase()}
        5. **IS CODES**: Reference relevant Indian Standards (IS Codes) for safety and compliance.
        6. **BREAKDOWN**: Provide a clear table of materials with quantities and estimated costs.
        7. **CONTINGENCY**: Always suggest a 5-10% contingency buffer for material wastage.
        
        If an image is provided, analyze it as a blueprint or site photo to extract dimensions and structural details.`;

        const parts: any[] = [{ text: `CONFIG_IS_QUICK_CALC: ${isQuickCalc}\n\n${query}` }];
        if (fileBase64s) {
            fileBase64s.forEach(fb64 => {
                const matches = fb64.match(/^data:(.+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
                }
            });
        }
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [{ parts }],
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }]
            },
        });

        const text = response.text || "";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch (error) {
        handleAIError(error, "getAiCalculatorResponse");
    }
};

export const getChatbotResponse = async (
    userMessage: string,
    documentContext: string,
    fileBase64s?: string[],
    location?: UserLocation | null,
    apiKey?: string
): Promise<{ action: 'search' | 'answer', data: any; sources: any[] }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
        const systemInstruction = `You are BuildNet AI, the ultimate Construction Intelligence Assistant. 
        You are a Senior Construction Consultant with 20+ years of experience in the Indian construction industry.
        
        YOUR CAPABILITIES:
        - Technical Advice: Answer complex queries about structural design, material selection, and IS Codes.
        - Material Estimates: Provide quick, rough-order-of-magnitude estimates for common tasks.
        - Supplier Discovery: Help users find the best local professionals and materials.
        - Plan Analysis: Read blueprints and site photos to provide contextual advice.
        
        TONE & STYLE:
        - Professional, authoritative, yet approachable.
        - Use technical terminology correctly (e.g., 'M20 grade concrete', 'TMT bars', 'Laterite stone').
        - Always prioritize safety and structural integrity.
        
        DECISION LOGIC:
        - If the user is looking for specific businesses, contractors, or local services, return: { "action": "search" }.
        - For all other technical queries, advice, or general conversation, return: { "action": "answer", "responseText": "Your detailed response in Markdown" }.`;

        const prompt = `Context: ${documentContext || "None"}. User Message: ${userMessage}`;
        const parts: any[] = [{ text: prompt }];
        if (fileBase64s) {
            fileBase64s.forEach(file => {
                const matches = file.match(/^data:(.+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
                }
            });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: [{ parts }],
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['search', 'answer'] },
                        responseText: { type: Type.STRING }
                    },
                    required: ['action', 'responseText'],
                }
            }
        });
        const cleanedText = cleanJsonString(response.text || "{\"action\":\"answer\",\"responseText\":\"Error.\"}");
        const parsedJson = JSON.parse(cleanedText);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { action: parsedJson.action, data: { text: parsedJson.responseText || "" }, sources };
    } catch (error) {
        handleAIError(error, "getChatbotResponse");
    }
};
