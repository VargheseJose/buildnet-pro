
export interface GoogleDriveFolder {
    id: string;
    name: string;
}

export const googleDriveService = {
    async findOrCreateFolder(accessToken: string, folderName: string, parentId?: string): Promise<string> {
        // Search for folder
        let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            throw new Error(`Drive API Error: ${errorData.error?.message || searchResponse.statusText}`);
        }
        
        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id;
        }

        // Create folder if not found
        const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentId ? [parentId] : []
            })
        });
        
        if (!createResponse.ok) {
            const errorData = await createResponse.json().catch(() => ({}));
            throw new Error(`Drive API Error: ${errorData.error?.message || createResponse.statusText}`);
        }
        
        const createData = await createResponse.json();
        return createData.id;
    },

    async saveToDrive(
        accessToken: string, 
        projectName: string, 
        siteName: string, 
        fileName: string, 
        csvContent: string
    ): Promise<string> {
        try {
            const rootId = await this.findOrCreateFolder(accessToken, 'BuildNet AI');
            const projectId = await this.findOrCreateFolder(accessToken, projectName, rootId);
            const siteId = await this.findOrCreateFolder(accessToken, siteName, projectId);
            
            const metadata = {
                name: fileName,
                mimeType: 'application/vnd.google-apps.spreadsheet',
                parents: [siteId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([csvContent], { type: 'text/csv' }));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Drive Upload Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.webViewLink;
        } catch (error) {
            console.error("Drive upload failed:", error);
            throw error;
        }
    },

    async saveDocToDrive(
        accessToken: string, 
        projectName: string, 
        siteName: string, 
        fileName: string, 
        textContent: string
    ): Promise<string> {
        try {
            const rootId = await this.findOrCreateFolder(accessToken, 'BuildNet AI');
            const projectId = await this.findOrCreateFolder(accessToken, projectName, rootId);
            const siteId = await this.findOrCreateFolder(accessToken, siteName, projectId);
            
            const metadata = {
                name: fileName,
                mimeType: 'application/vnd.google-apps.document',
                parents: [siteId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([textContent], { type: 'text/plain' }));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: form
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Drive Doc Upload Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.webViewLink;
        } catch (error) {
            console.error("Drive Doc upload failed:", error);
            throw error;
        }
    }
};
