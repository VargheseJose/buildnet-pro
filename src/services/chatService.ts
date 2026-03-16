import { ChatMessage, WebSocketMessage } from '../types';

class ChatService {
    private socket: WebSocket | null = null;
    private userId: string | null = null;
    private messageHandlers: ((message: ChatMessage) => void)[] = [];
    private historyHandlers: ((messages: ChatMessage[]) => void)[] = [];
    private openChatHandlers: ((userId: string) => void)[] = [];

    onOpenChat(handler: (userId: string) => void) {
        this.openChatHandlers.push(handler);
        return () => {
            this.openChatHandlers = this.openChatHandlers.filter(h => h !== handler);
        };
    }

    startChat(userId: string) {
        this.openChatHandlers.forEach(handler => handler(userId));
    }

    connect(userId: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        this.userId = userId;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.socket = new WebSocket(`${protocol}//${host}`);

        this.socket.onopen = () => {
            console.log('Connected to Chat Server');
            this.send({ type: 'connect', payload: { userId } });
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'message') {
                    this.messageHandlers.forEach(handler => handler(data.payload));
                } else if (data.type === 'history') {
                    this.historyHandlers.forEach(handler => handler(data.payload));
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        this.socket.onclose = () => {
            console.log('Disconnected from Chat Server');
            // Reconnect logic could go here
        };
    }

    send(message: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('Socket not connected');
        }
    }

    sendMessage(receiverId: string, content: string) {
        if (!this.userId) return;
        const message: ChatMessage = {
            id: Date.now().toString(),
            senderId: this.userId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        this.send({ type: 'message', payload: message });
        return message; // Optimistic update
    }

    onMessage(handler: (message: ChatMessage) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    onHistory(handler: (messages: ChatMessage[]) => void) {
        this.historyHandlers.push(handler);
        return () => {
            this.historyHandlers = this.historyHandlers.filter(h => h !== handler);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const chatService = new ChatService();
