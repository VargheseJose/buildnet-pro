import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { UserLocation, Business, GroundingChunk } from '../types';
import { getChatbotResponse, findConstructionInfo } from '../services/geminiService';
import { Icon, IconName } from './Icon';
import { ChatMessage } from './ChatMessage';

interface ChatbotProps {
  userLocation: UserLocation | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  directoryData: Business[];
}

interface Message {
    sender: 'user' | 'bot';
    text?: string;
    businesses?: Business[];
    isLoading?: boolean;
    query?: string;
    sources?: GroundingChunk[];
}

const CHAT_HISTORY_KEY = 'buildnet_chat_history';

interface Suggestion {
    label: string;
    icon: IconName;
    category: string;
}

const SUGGESTIONS: Suggestion[] = [
    { label: "Find Plumbers in Kochi", icon: 'search', category: 'Local Search' },
    { label: "Cement prices in Kerala", icon: 'database', category: 'Market Rates' },
    { label: "Calculate 10x10 wall bricks", icon: 'calculator', category: 'Estimation' },
    { label: "Steel weight for 12mm rod", icon: 'bolt', category: 'Structural' },
    { label: "Best waterproofing brands", icon: 'star', category: 'Expert Advice' },
    { label: "Compare M-Sand vs River Sand", icon: 'refresh', category: 'Material Info' }
];

export const Chatbot: React.FC<ChatbotProps> = ({ userLocation, isOpen, setIsOpen, directoryData }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
      try {
          const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
          if (savedMessages) {
              return JSON.parse(savedMessages);
          }
      } catch (error) {
          console.error("Failed to load chat history:", error);
      }
      return [{ sender: 'bot', text: 'Hello! I am BuildNet AI. I can help you find verified suppliers, calculate material requirements, or answer technical construction queries.' }];
  });
  
  const [userInput, setUserInput] = useState('');
  const [documentContext, setDocumentContext] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [messages, isOpen]);
  
  useEffect(() => {
      const messagesToSave = messages.filter(msg => !msg.isLoading);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
  }, [messages]);

  const handleClearHistory = () => {
      const defaultMessage: Message[] = [{ sender: 'bot', text: 'Hello! I am BuildNet AI. I can help you find verified suppliers, calculate material requirements, or answer technical construction queries.' }];
      setMessages(defaultMessage);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(defaultMessage));
      setDocumentContext('');
      setAttachedFiles([]);
  };
  
  const handleSendMessage = async (e?: React.FormEvent, manualQuery?: string) => {
    if (e) e.preventDefault();
    const messageToSend = manualQuery || userInput.trim();
    if (!messageToSend) return;

    const newUserMessage: Message = { sender: 'user', text: messageToSend };
    setMessages(prev => [...prev, newUserMessage, { sender: 'bot', isLoading: true }]);
    setUserInput('');

    try {
        const response = await getChatbotResponse(messageToSend, documentContext, attachedFiles, userLocation);

        if (response.action === 'search') {
            const queryLower = messageToSend.toLowerCase();
            const localResults = directoryData.filter(b => 
                b.name.toLowerCase().includes(queryLower) ||
                b.category.toLowerCase().includes(queryLower) ||
                b.location.toLowerCase().includes(queryLower) ||
                (b.description && b.description.toLowerCase().includes(queryLower))
            );

            if (localResults.length > 0) {
                 setMessages(prev => [
                    ...prev.slice(0, -1),
                    { sender: 'bot', businesses: localResults, query: messageToSend }
                ]);
                return;
            }
            
            const searchResult = await findConstructionInfo(messageToSend, userLocation, undefined, undefined);
            
            if (searchResult.businesses.length > 0) {
                setMessages(prev => [
                    ...prev.slice(0, -1),
                    { 
                        sender: 'bot', 
                        businesses: searchResult.businesses, 
                        sources: searchResult.sources,
                        query: messageToSend 
                    }
                ]);
            } else {
                 setMessages(prev => [
                    ...prev.slice(0, -1),
                    { 
                        sender: 'bot', 
                        text: "I couldn't find any specific businesses matching that request in the live database. Try specifying a location or category, or I can provide general advice.", 
                        query: messageToSend,
                        sources: searchResult.sources 
                    }
                ]);
            }
        } else {
             setMessages(prev => [
                ...prev.slice(0, -1),
                { 
                    sender: 'bot', 
                    text: response.data.text,
                    sources: response.sources 
                }
            ]);
        }
    } catch (error: any) {
        console.error("Chatbot error:", error);
        let errorMsg = "Sorry, I'm having trouble connecting to my brain right now.";
        if (error instanceof Error) {
            errorMsg = error.message;
        }
        setMessages(prev => [
            ...prev.slice(0, -1),
            { sender: 'bot', text: errorMsg, query: messageToSend }
        ]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentContext(text);
        setMessages(prev => [
            ...prev,
            { sender: 'bot', text: `Successfully loaded '${file.name}'. You can now ask me questions about it.` }
        ]);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
         const reader = new FileReader();
         reader.onload = (e) => {
             const base64 = e.target?.result as string;
             setAttachedFiles([base64]);
             setMessages(prev => [
                ...prev,
                { sender: 'bot', text: `Successfully attached '${file.name}'. You can now ask questions about this image/plan.` }
            ]);
         };
         reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  }

  return (
    <>
      <div className={`fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out
            ${isOpen ? 'w-full h-full md:w-96 md:h-[75vh] md:m-6 md:rounded-[2.5rem] rounded-none' : 'w-0 h-0 opacity-0 pointer-events-none translate-y-10'}
      `}>
        <div className="bg-[#0f172a] shadow-2xl border border-slate-800 flex flex-col h-full w-full md:rounded-[2.5rem] overflow-hidden">
          <header className="bg-slate-900 p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <h3 className="text-white font-black text-xs uppercase tracking-widest">BuildNet Neural Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    title="AI Settings"
                >
                    <Icon name="bolt" className="h-5 w-5" />
                </button>
                <button 
                    onClick={handleClearHistory} 
                    className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                    title="Clear History"
                >
                    <Icon name="refresh" className="h-5 w-5"/>
                </button>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                    <Icon name="x-mark" className="h-6 w-6"/>
                </button>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#0f172a] scrollbar-hide">
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
            ))}
            
            {messages.length === 1 && (
                <div className="mt-8 animate-fade-in space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-slate-800"></div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] whitespace-nowrap">Suggested Workflows</p>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                        {SUGGESTIONS.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(undefined, s.label)}
                                className="group flex items-center gap-4 p-4 text-left bg-slate-900/50 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/30 rounded-2xl transition-all duration-300"
                            >
                                <div className="p-2.5 bg-slate-800 group-hover:bg-emerald-500/20 rounded-xl text-slate-500 group-hover:text-emerald-400 transition-colors">
                                    <Icon name={s.icon} className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-300 group-hover:text-white truncate">{s.label}</p>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5 group-hover:text-emerald-600 transition-colors">{s.category}</p>
                                </div>
                                <Icon name="chevron-down" className="h-3 w-3 text-slate-700 group-hover:text-emerald-500 -rotate-90" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900">
            {attachedFiles.length > 0 && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2 bg-emerald-950/20 rounded-xl border border-emerald-500/20 w-fit animate-fade-in">
                    <Icon name="check" className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Document Ready</span>
                    <button onClick={() => setAttachedFiles([])} className="text-slate-500 hover:text-red-400"><Icon name="x-mark" className="h-3 w-3"/></button>
                </div>
            )}
            
            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.jpg,.jpeg,.png,.webp" />
              <button 
                type="button" 
                onClick={triggerFileUpload} 
                className="p-3.5 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-800 transition-all active:scale-95 mb-0.5" 
                title="Upload image or document"
              >
                  <Icon name="upload" className="w-5 h-5"/>
              </button>
              <div className="flex-1 relative">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Describe requirement..."
                    className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 text-sm resize-none max-h-32 min-h-[52px] transition-all"
                    rows={1}
                    style={{ height: 'auto', minHeight: '52px' }} 
                  />
              </div>
              <button 
                type="submit" 
                disabled={!userInput.trim() && attachedFiles.length === 0}
                className="p-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-emerald-900/20 active:scale-95 mb-0.5" 
              >
                  <Icon name="send" className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
