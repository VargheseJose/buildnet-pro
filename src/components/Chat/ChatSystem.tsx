import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { ChatMessage, Conversation, UserProfile } from '../../types';
import { chatService } from '../../services/chatService';
import { authService } from '../../services/authService';

interface ChatSystemProps {
    currentUser: UserProfile;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser) {
            chatService.connect(currentUser.email); // Using email as ID for simplicity
            
            const handleMessage = (msg: ChatMessage) => {
                setMessages(prev => [...prev, msg]);
                updateConversations(msg);
            };

            const handleHistory = (msgs: ChatMessage[]) => {
                setMessages(msgs);
                // Process history into conversations
                const convs: Record<string, Conversation> = {};
                msgs.forEach(msg => {
                    const otherId = msg.senderId === currentUser.email ? msg.receiverId : msg.senderId;
                    if (!convs[otherId]) {
                        convs[otherId] = {
                            id: otherId,
                            participantId: otherId,
                            participantName: otherId.split('@')[0], // Simple name extraction
                            lastMessage: msg,
                            unreadCount: 0
                        };
                    }
                    convs[otherId].lastMessage = msg;
                    if (msg.receiverId === currentUser.email && msg.status !== 'read') {
                        convs[otherId].unreadCount++;
                    }
                });
                setConversations(Object.values(convs));
            };

            const unsubscribeMessage = chatService.onMessage(handleMessage);
            const unsubscribeHistory = chatService.onHistory(handleHistory);
            const unsubscribeOpenChat = chatService.onOpenChat((userId) => {
                setIsOpen(true);
                // Find existing or create new conversation
                const existing = conversations.find(c => c.participantId === userId);
                if (existing) {
                    setActiveConversation(existing);
                } else {
                    const newConv: Conversation = {
                        id: userId,
                        participantId: userId,
                        participantName: userId.split('@')[0],
                        unreadCount: 0
                    };
                    setConversations(prev => [...prev, newConv]);
                    setActiveConversation(newConv);
                }
            });

            return () => {
                unsubscribeMessage();
                unsubscribeHistory();
                unsubscribeOpenChat();
                chatService.disconnect();
            };
        }
    }, [currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeConversation]);

    const updateConversations = (msg: ChatMessage) => {
        const otherId = msg.senderId === currentUser.email ? msg.receiverId : msg.senderId;
        setConversations(prev => {
            const existing = prev.find(c => c.participantId === otherId);
            if (existing) {
                return prev.map(c => c.participantId === otherId ? { ...c, lastMessage: msg, unreadCount: msg.receiverId === currentUser.email ? c.unreadCount + 1 : c.unreadCount } : c);
            } else {
                return [...prev, {
                    id: otherId,
                    participantId: otherId,
                    participantName: otherId.split('@')[0],
                    lastMessage: msg,
                    unreadCount: msg.receiverId === currentUser.email ? 1 : 0
                }];
            }
        });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const msg = chatService.sendMessage(activeConversation.participantId, newMessage);
        if (msg) {
            setMessages(prev => [...prev, msg]);
            updateConversations(msg);
            setNewMessage('');
        }
    };

    const openConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        // Mark as read logic would go here
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 transition-all z-50 animate-bounce-in"
            >
                <Icon name="chat-bubble-left-right" className="h-6 w-6" />
                {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {conversations.reduce((acc, curr) => acc + curr.unreadCount, 0)}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 flex flex-col z-50 animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    {activeConversation ? (
                        <>
                            <button onClick={() => setActiveConversation(null)} className="text-slate-400 hover:text-white"><Icon name="arrow-left" className="h-4 w-4" /></button>
                            {activeConversation.participantName}
                        </>
                    ) : (
                        <>
                            <Icon name="chat-bubble-left-right" className="h-5 w-5 text-emerald-500" /> Messages
                        </>
                    )}
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><Icon name="x-mark" className="h-5 w-5" /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {activeConversation ? (
                    <>
                        {messages.filter(m => m.senderId === activeConversation.participantId || m.receiverId === activeConversation.participantId).map(msg => (
                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.email ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === currentUser.email ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                    {msg.content}
                                    <p className="text-[9px] opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    conversations.length > 0 ? (
                        conversations.map(conv => (
                            <div key={conv.id} onClick={() => openConversation(conv)} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex items-center gap-3 border border-transparent hover:border-slate-700">
                                <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                                    {conv.participantName[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-bold text-white truncate">{conv.participantName}</h4>
                                        {conv.lastMessage && <span className="text-[10px] text-slate-500">{new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">{conv.lastMessage?.content}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{conv.unreadCount}</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <Icon name="chat-bubble-left-right" className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-xs">No conversations yet.</p>
                        </div>
                    )
                )}
            </div>

            {/* Input */}
            {activeConversation && (
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type a message..." 
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-500 transition-colors">
                        <Icon name="paper-airplane" className="h-5 w-5" />
                    </button>
                </form>
            )}
        </div>
    );
};
