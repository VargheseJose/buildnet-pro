
export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export interface Business {
    name: string;
    category: string;
    location: string;
    rating?: number;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    mapUrl?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    reviews?: Review[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
}

export interface SearchResult {
  businesses: Business[];
  sources: GroundingChunk[];
}

// --- RFQ and Dashboard Types ---

export interface RfqItem {
    id: number;
    description: string;
    quantity: string;
}

export interface QuoteItem {
    description: string;
    price: number;
}

export interface Quote {
    supplierName: string;
    items: QuoteItem[];
    total: number;
    submittedAt: Date;
}

export interface RFQ {
    id: string;
    suppliers: Business[];
    items: RfqItem[];
    gstNo: string;
    siteLocation: string;
    siteId?: number; 
    deliveryDate: string;
    submittedAt: Date;
    status: 'Pending' | 'Quotes Received' | 'Completed' | 'Awaiting Approval' | 'Rejected';
    quotes: Quote[];
    // Specific Material Fields for Incharge requests
    rmcType?: string;
    pumpRequired?: boolean;
    pumpType?: 'Boom Pump' | 'Line Pump' | 'Static Pump';
    pipeLength?: string;
    projectHeight?: string;
    requestedBy?: string; // Incharge Name
    inchargeContact?: string;
}

// --- Profile Page Types ---

export interface SavedCalculation {
    id: string;
    title: string;
    date: string;
    query: string;
    result: string;
    siteId?: number; 
    isLocked?: boolean;
    attachments?: { name: string; data: string }[];
}

export interface SavedSearch {
    id: string;
    title: string;
    query: string;
    mainCategory: string;
    category: string; // Sub-category
    district: string;
    date: string;
}

export interface Site {
    id: number;
    userId: string;
    name: string;
    location: string;
    contactNumber: string;
    mapUrl: string;
    inchargeName: string;
    inchargeContact: string;
    attachments: { name: string; data: string; type: string }[];
    savedCalculations?: SavedCalculation[];
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed';

export interface ProjectStage {
    name: string;
    status: string; // 'Not Started' | 'In Progress' | 'Completed'
}

export interface Project {
    id: string;
    userId: string;
    name: string;
    startDate: string;
    estimatedCompletionDate: string;
    status: ProjectStatus;
    description?: string;
    estimatedCost?: number;
    siteId?: number; 
    stages?: ProjectStage[];
    milestones?: string[];
}

export type UserRole = 'Admin' | 'Contractor' | 'Client' | 'Supplier' | 'Project Manager' | 'Site Engineer' | 'Finance';

export interface RolePermissions {
    canViewProjects: boolean;
    canEditProjects: boolean;
    canDeleteProjects: boolean;
    canCreateProjects: boolean;
    canViewFinancials: boolean;
    canEditFinancials: boolean;
    canViewSites: boolean;
    canEditSites: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    'Admin': {
        canViewProjects: true, canEditProjects: true, canDeleteProjects: true, canCreateProjects: true,
        canViewFinancials: true, canEditFinancials: true, canViewSites: true, canEditSites: true,
    },
    'Contractor': {
        canViewProjects: true, canEditProjects: true, canDeleteProjects: true, canCreateProjects: true,
        canViewFinancials: true, canEditFinancials: true, canViewSites: true, canEditSites: true,
    },
    'Client': {
        canViewProjects: true, canEditProjects: false, canDeleteProjects: false, canCreateProjects: false,
        canViewFinancials: true, canEditFinancials: false, canViewSites: true, canEditSites: false,
    },
    'Supplier': {
        canViewProjects: false, canEditProjects: false, canDeleteProjects: false, canCreateProjects: false,
        canViewFinancials: false, canEditFinancials: false, canViewSites: false, canEditSites: false,
    },
    'Project Manager': {
        canViewProjects: true, canEditProjects: true, canDeleteProjects: false, canCreateProjects: true,
        canViewFinancials: true, canEditFinancials: false, canViewSites: true, canEditSites: true,
    },
    'Site Engineer': {
        canViewProjects: true, canEditProjects: false, canDeleteProjects: false, canCreateProjects: false,
        canViewFinancials: false, canEditFinancials: false, canViewSites: true, canEditSites: true,
    },
    'Finance': {
        canViewProjects: true, canEditProjects: false, canDeleteProjects: false, canCreateProjects: false,
        canViewFinancials: true, canEditFinancials: true, canViewSites: false, canEditSites: false,
    }
};

export interface Notification {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'rfq_new' | 'rfq_response' | 'system';
    link?: string;
}

export interface UserProfile {
    businessName: string;
    email: string;
    role: UserRole;
    category: string;
    district: string;
    gst: string;
    phone: string;
    logoUrl?: string;
    businessPhotoUrl?: string;
    emailSignature?: string;
    sites?: Site[];
    projects?: Project[];
    favorites?: Business[];
    savedSearches?: SavedSearch[];
    rfqs?: RFQ[];
    notifications?: Notification[];
    imageGenUsage?: {
        date: string;
        count: number;
    };
    reviews?: Review[];
    downloadsCount?: number;
    isPremium?: boolean;
}

// --- Invoice Types ---

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    notes?: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantRole?: string;
    lastMessage?: ChatMessage;
    unreadCount: number;
}

export interface WebSocketMessage {
    type: 'message' | 'history' | 'typing' | 'read' | 'connect';
    payload: any;
}
