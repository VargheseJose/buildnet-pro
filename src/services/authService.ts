
import { UserProfile, Site, UserRole } from '../types';
import { auth, db } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const USER_SESSION_KEY = 'buildnet_session_user';
const PROFILE_STORAGE_KEY = 'buildnet_user_profile';

const DEFAULT_PROFILE: UserProfile = {
    businessName: "My Construction Co.",
    email: "user@example.com",
    role: "Contractor",
    category: "Contractors",
    district: "Ernakulam",
    gst: "",
    phone: "",
    sites: [],
    projects: [],
    favorites: [],
    savedSearches: [],
    notifications: []
};

// Helper to handle Firestore errors
enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
        userId: string | undefined;
        email: string | null | undefined;
        emailVerified: boolean | undefined;
        isAnonymous: boolean | undefined;
        tenantId: string | null | undefined;
        providerInfo: {
            providerId: string;
            displayName: string | null;
            email: string | null;
            photoUrl: string | null;
        }[];
    }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
            emailVerified: auth.currentUser?.emailVerified,
            isAnonymous: auth.currentUser?.isAnonymous,
            tenantId: auth.currentUser?.tenantId,
            providerInfo: auth.currentUser?.providerData.map(provider => ({
                providerId: provider.providerId,
                displayName: provider.displayName,
                email: provider.email,
                photoUrl: provider.photoURL
            })) || []
        },
        operationType,
        path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

export const authService = {
    isAuthenticated(): boolean {
        return !!auth.currentUser || !!localStorage.getItem(USER_SESSION_KEY);
    },

    getCurrentUser(): UserProfile {
        try {
            const sessionStr = localStorage.getItem(USER_SESSION_KEY);
            if (!sessionStr) return DEFAULT_PROFILE;
            
            const storedProfileStr = localStorage.getItem(PROFILE_STORAGE_KEY);
            if (storedProfileStr) {
                return JSON.parse(storedProfileStr);
            }
            
            return JSON.parse(sessionStr);
        } catch (e) {
            console.error("Error parsing user profile:", e);
            return DEFAULT_PROFILE;
        }
    },

    async fetchUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data() as UserProfile;
                localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
                return data;
            }
            return null;
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${uid}`);
            return null;
        }
    },

    async login(email: string, password: string): Promise<UserProfile> {
        if (!email || !password) {
            throw new Error("Email and password are required.");
        }
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const profile = await this.fetchUserProfile(user.uid);
            if (!profile) {
                throw new Error("User profile not found.");
            }

            localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ email: user.email, uid: user.uid }));
            
            return profile;
        } catch (error: any) {
            console.error("Login error:", error);
            throw new Error(error.message || "Login failed");
        }
    },

    async register(email: string, password: string, businessName: string, role: UserRole = 'Contractor'): Promise<UserProfile> {
        if (!email || !password || !businessName) {
            throw new Error("All fields are required.");
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const newUserProfile: UserProfile = {
                ...DEFAULT_PROFILE,
                email: user.email || email,
                businessName,
                role,
            };

            await setDoc(doc(db, 'users', user.uid), newUserProfile).catch(error => {
                handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
            });

            localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ email: user.email, uid: user.uid }));
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newUserProfile));
            
            return newUserProfile;
        } catch (error: any) {
            console.error("Registration error:", error);
            throw new Error(error.message || "Registration failed");
        }
    },

    async loginWithGoogle(): Promise<{ profile: UserProfile, token: string }> {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/drive.file');
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken || '';
            const user = result.user;

            let profile = await this.fetchUserProfile(user.uid);
            
            if (!profile) {
                // Create new profile for Google user
                profile = {
                    ...DEFAULT_PROFILE,
                    email: user.email || "",
                    businessName: user.displayName || "Google User",
                    businessPhotoUrl: user.photoURL || undefined,
                };
                await setDoc(doc(db, 'users', user.uid), profile).catch(error => {
                    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
                });
            }

            localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ email: user.email, uid: user.uid, token }));
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));

            return { profile, token };
        } catch (error: any) {
            console.error("Google login error:", error);
            throw new Error(error.message || "Google login failed");
        }
    },

    // Mock implementations for phone auth since Firebase phone auth requires recaptcha setup
    async loginWithPhone(phone: string, otp: string): Promise<UserProfile> {
        throw new Error("Phone authentication is not fully implemented in this demo.");
    },

    async registerWithPhone(phone: string, otp: string, businessName: string, role: string = 'Contractor'): Promise<UserProfile> {
        throw new Error("Phone authentication is not fully implemented in this demo.");
    },

    async logout(): Promise<void> {
        try {
            await signOut(auth);
            localStorage.removeItem(USER_SESSION_KEY);
            localStorage.removeItem(PROFILE_STORAGE_KEY);
        } catch (error) {
            console.error("Logout error:", error);
        }
    },
    
    async updateProfile(profile: UserProfile): Promise<void> {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await updateDoc(doc(db, 'users', currentUser.uid), profile as any);
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
            }
        }
    }
};
