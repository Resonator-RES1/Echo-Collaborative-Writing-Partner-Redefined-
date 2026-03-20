export class DriveService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.accessToken}`);
    
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Token expired');
      }
      if (response.status === 412) {
        throw new Error('Precondition Failed - Revision mismatch');
      }
      
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error?.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = response.statusText;
      }
      
      throw new Error(`Drive API Error: ${response.status} - ${errorDetail}`);
    }
    return response;
  }

  async getUserInfo(): Promise<{ name: string, email: string }> {
    const res = await this.fetchWithAuth('https://www.googleapis.com/oauth2/v3/userinfo');
    const data = await res.json();
    return { name: data.name, email: data.email };
  }

  async getOrCreateFolder(folderName: string, parentId?: string): Promise<string> {
    let q = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    } else {
      q += ` and 'root' in parents`;
    }

    const res = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`);
    const data = await res.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create folder
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const createRes = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });

    const createData = await createRes.json();
    return createData.id;
  }

  async uploadFile(fileName: string, content: string, parentId: string, existingFileId?: string, revisionId?: string): Promise<{ id: string, revisionId: string }> {
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      ...(existingFileId ? {} : { parents: [parentId] })
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      close_delim;

    const url = existingFileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,headRevisionId`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,headRevisionId`;

    const headers: Record<string, string> = {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    };
    if (revisionId) {
      headers['If-Match'] = revisionId;
    }

    const res = await this.fetchWithAuth(url, {
      method: existingFileId ? 'PATCH' : 'POST',
      headers,
      body: multipartRequestBody,
    });

    const data = await res.json();
    return { id: data.id, revisionId: data.headRevisionId };
  }

  async downloadFile(fileId: string): Promise<any> {
    const res = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return await res.json();
  }

  async listFilesInFolder(folderId: string): Promise<{ id: string, name: string, headRevisionId: string, modifiedTime: string, mimeType: string }[]> {
    const q = `'${folderId}' in parents and trashed=false`;
    const res = await this.fetchWithAuth(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,headRevisionId,modifiedTime,mimeType)`);
    const data = await res.json();
    return data.files || [];
  }
}
