// TypeScript API Client
import type { APIResponse, CommissionRequest, GalleryItem } from '../types';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Commission methods
  async submitCommission(data: CommissionRequest): Promise<APIResponse> {
    return this.request('/commissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCommissions(status?: string): Promise<APIResponse> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/commissions${query}`);
  }

  // Gallery methods
  async getGalleryItems(): Promise<APIResponse<GalleryItem[]>> {
    return this.request('/gallery');
  }

  async uploadGalleryItem(
    file: File,
    metadata: Partial<GalleryItem>
  ): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', metadata.alt || '');
    formData.append('title', metadata.title || '');
    formData.append('description', metadata.description || '');
    if (metadata.tags) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    try {
      const response = await fetch(`${this.baseURL}/gallery`, {
        method: 'POST',
        body: formData
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Analytics methods
  async logEvent(eventType: string, eventData?: any): Promise<APIResponse> {
    return this.request('/analytics', {
      method: 'POST',
      body: JSON.stringify({ eventType, eventData })
    });
  }

  async getAnalytics(startDate?: string, endDate?: string): Promise<APIResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/analytics${query}`);
  }

  // Settings methods
  async getSetting(key: string): Promise<APIResponse<{ value: string }>> {
    return this.request(`/settings/${key}`);
  }

  async setSetting(key: string, value: string): Promise<APIResponse> {
    return this.request(`/settings/${key}`, {
      method: 'POST',
      body: JSON.stringify({ value })
    });
  }
}

export default new APIClient();
