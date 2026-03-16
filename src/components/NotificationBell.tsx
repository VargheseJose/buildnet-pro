import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { Notification, UserProfile } from '../types';

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNavigate: (path: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
    notifications, 
    onMarkAsRead, 
    onMarkAllAsRead,
    onNavigate
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
        if (notification.link) {
            onNavigate(notification.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white focus:outline-none rounded-xl hover:bg-slate-800 transition-colors"
            >
                <Icon name="bell" className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={onMarkAllAsRead}
                                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Icon name="bell" className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 ${!notification.read ? 'bg-slate-800/20' : ''}`}
                                    >
                                        <div className="mt-1 shrink-0">
                                            {notification.type === 'rfq_new' && <Icon name="document-text" className="h-5 w-5 text-blue-400" />}
                                            {notification.type === 'rfq_response' && <Icon name="chat" className="h-5 w-5 text-emerald-400" />}
                                            {notification.type === 'system' && <Icon name="bell" className="h-5 w-5 text-purple-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-slate-300'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-600 mt-2 font-medium uppercase tracking-wider">
                                                {new Date(notification.date).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="shrink-0 flex items-center">
                                                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
