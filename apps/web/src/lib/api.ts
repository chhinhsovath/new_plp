import { clerkClient } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Convenience functions for common API calls
export const api = {
  // User management
  getCurrentUser: () => apiClient.get('/users/me'),
  updateUser: (data: any) => apiClient.put('/users/me', data),
  
  // Subjects and lessons
  getSubjects: () => apiClient.get('/subjects'),
  getSubject: (id: string) => apiClient.get(`/subjects/${id}`),
  
  // Exercises
  getExercises: (subjectId: string, type?: string) => 
    apiClient.get(`/exercises/${subjectId}${type ? `?type=${type}` : ''}`),
  submitExercise: (exerciseId: string, data: any) => 
    apiClient.post(`/exercises/${exerciseId}/submit`, data),
  
  // Progress
  getProgress: (subjectId?: string) => 
    apiClient.get(`/progress${subjectId ? `/${subjectId}` : ''}`),
  
  // Videos
  getVideos: (subjectId?: string) => 
    apiClient.get(`/videos${subjectId ? `?subject=${subjectId}` : ''}`),
  
  // Library
  getLibraryResources: (type?: string) => 
    apiClient.get(`/library${type ? `?type=${type}` : ''}`),
  
  // Forum
  getForumPosts: (subjectId?: string) => 
    apiClient.get(`/forum/posts${subjectId ? `?subject=${subjectId}` : ''}`),
  createForumPost: (data: any) => apiClient.post('/forum/posts', data),
  
  // Assessments
  getAssessments: () => apiClient.get('/assessments'),
  getAssessment: (id: string) => apiClient.get(`/assessments/${id}`),
  
  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
};