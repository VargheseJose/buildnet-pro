import { db, auth } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Site, Project } from '../types';

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
    authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
        },
        operationType,
        path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
}

export const dataService = {
    async getSites(userId: string): Promise<Site[]> {
        try {
            const q = query(collection(db, 'sites'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as Site);
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, 'sites');
            return [];
        }
    },

    async saveSite(site: Site): Promise<void> {
        try {
            const siteRef = doc(db, 'sites', site.id.toString());
            await setDoc(siteRef, site);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `sites/${site.id}`);
        }
    },

    async updateSite(site: Site): Promise<void> {
        try {
            const siteRef = doc(db, 'sites', site.id.toString());
            await updateDoc(siteRef, site as any);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `sites/${site.id}`);
        }
    },

    async deleteSite(siteId: number): Promise<void> {
        try {
            const siteRef = doc(db, 'sites', siteId.toString());
            await deleteDoc(siteRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}`);
        }
    },

    async getProjects(userId: string): Promise<Project[]> {
        try {
            const q = query(collection(db, 'projects'), where('userId', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as Project);
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, 'projects');
            return [];
        }
    },

    async saveProject(project: Project): Promise<void> {
        try {
            const projectRef = doc(db, 'projects', project.id);
            await setDoc(projectRef, project);
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `projects/${project.id}`);
        }
    },

    async updateProject(project: Project): Promise<void> {
        try {
            const projectRef = doc(db, 'projects', project.id);
            await updateDoc(projectRef, project as any);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `projects/${project.id}`);
        }
    },

    async deleteProject(projectId: string): Promise<void> {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await deleteDoc(projectRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `projects/${projectId}`);
        }
    }
};
