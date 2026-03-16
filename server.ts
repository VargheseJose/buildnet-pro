import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Starting BuildNet AI Server...');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory store for messages (replace with DB in production)
interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

const messages: ChatMessage[] = [];
const activeConnections = new Map<string, WebSocket>();

async function startServer() {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    const PORT = Number(process.env.PORT) || 3000;

    // WebSocket Handling
    wss.on('connection', (ws) => {
        let userId: string | null = null;

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());

                if (message.type === 'connect') {
                    userId = message.payload.userId;
                    if (userId) {
                        activeConnections.set(userId, ws);
                        console.log(`User connected: ${userId}`);
                        
                        // Send history involving this user
                        const history = messages.filter(m => m.senderId === userId || m.receiverId === userId);
                        ws.send(JSON.stringify({ type: 'history', payload: history }));
                    }
                } else if (message.type === 'message') {
                    const { senderId, receiverId, content, id, timestamp } = message.payload;
                    const newMessage: ChatMessage = {
                        id: id || Date.now().toString(),
                        senderId,
                        receiverId,
                        content,
                        timestamp: timestamp || new Date().toISOString(),
                        status: 'sent'
                    };
                    
                    messages.push(newMessage);

                    // Send to receiver if connected
                    const receiverSocket = activeConnections.get(receiverId);
                    if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                        receiverSocket.send(JSON.stringify({ type: 'message', payload: newMessage }));
                        newMessage.status = 'delivered';
                    }

                    // Send confirmation to sender
                    ws.send(JSON.stringify({ type: 'message_sent', payload: newMessage }));
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        });

        ws.on('close', () => {
            if (userId) {
                activeConnections.delete(userId);
                console.log(`User disconnected: ${userId}`);
            }
        });
    });

    // API routes (add your specific routes here)
    app.use(express.json());

    // In-memory users store
    const users: any[] = [];
    const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

    app.post('/api/auth/signup', async (req, res) => {
        try {
            const { email, password, businessName, role, phone } = req.body;
            const bcrypt = await import('bcryptjs');
            const jwt = await import('jsonwebtoken');

            if ((!email && !phone) || !businessName) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const existingUser = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
            
            const newUser = {
                id: Date.now().toString(),
                email: email || '',
                phone: phone || '',
                password: hashedPassword,
                businessName,
                role: role || 'Contractor',
                category: 'Contractors',
                district: 'Ernakulam',
                gst: '',
                sites: [],
                projects: [],
                favorites: [],
                savedSearches: []
            };

            users.push(newUser);

            const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
            
            const { password: _, ...userWithoutPassword } = newUser;
            res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password, phone, otp } = req.body;
            const bcrypt = await import('bcryptjs');
            const jwt = await import('jsonwebtoken');

            let user;
            if (email && password) {
                user = users.find(u => u.email === email);
                if (!user || !user.password) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
            } else if (phone && otp) {
                if (otp !== '123456') { // Mock OTP for now
                    return res.status(401).json({ error: 'Invalid OTP' });
                }
                user = users.find(u => u.phone === phone);
                if (!user) {
                    // Auto-register on phone login if not found
                    user = {
                        id: Date.now().toString(),
                        email: '',
                        phone,
                        businessName: 'New User',
                        role: 'Contractor',
                        category: 'Contractors',
                        district: 'Ernakulam',
                        gst: '',
                        sites: [],
                        projects: [],
                        favorites: [],
                        savedSearches: []
                    };
                    users.push(user);
                }
            } else {
                return res.status(400).json({ error: 'Invalid login credentials' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            const { password: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword, token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    app.post('/api/razorpay/order', async (req, res) => {
        try {
            const Razorpay = (await import('razorpay')).default;
            const key_id = process.env.RAZORPAY_KEY_ID;
            const key_secret = process.env.RAZORPAY_KEY_SECRET;
            
            if (!key_id || !key_secret) {
                return res.status(500).json({ error: 'Razorpay keys not configured' });
            }

            const razorpay = new Razorpay({
                key_id,
                key_secret
            });

            const options = {
                amount: 99900, // amount in smallest currency unit (e.g., 999.00 INR)
                currency: "INR",
                receipt: "receipt_order_" + Date.now(),
            };

            const order = await razorpay.orders.create(options);
            res.json({ order, key_id });
        } catch (error) {
            console.error('Razorpay order error:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    });

    // Handle 404 for API routes specifically
    app.use('/api', (req, res) => {
        res.status(404).json({ error: 'API route not found' });
    });

    // Vite Middleware
    if (process.env.NODE_ENV !== 'production') {
        try {
            const { createServer: createViteServer } = await import('vite');
            const vite = await createViteServer({
                server: { middlewareMode: true },
                appType: 'spa',
            });
            app.use(vite.middlewares);
        } catch (e) {
            console.warn('Vite not found, falling back to static serving');
            app.use(express.static(path.join(__dirname, 'dist')));
            app.use((req, res) => {
                res.sendFile(path.join(__dirname, 'dist', 'index.html'));
            });
        }
    } else {
        // Serve static files in production
        app.use(express.static(path.join(__dirname, 'dist')));
        app.use((req, res) => {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });
    }

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
