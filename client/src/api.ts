import { tokenStorage } from './utils/tokenStorage';

export const BASE_URL = 'http://localhost:8000'; 
 //export const BASE_URL = 'https://medquery-1.onrender.com'; // Production

// Type definitions for API responses
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupResponse {
  message: string;
  user_id: number;
  user_email: string;
  user_role: string;
}

export interface QuerySource {
  doc_id: string;
  filename: string;
  chunk_id: string;
  snippet: string;
}

export interface QueryAnswer {
  question: string;
  answer: string;
  sources: QuerySource[];
  created_at: string;
}

export interface QueryHistoryPayload {
  queries: QueryAnswer[];
}

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    ME: `${BASE_URL}/auth/me`,
    HEALTH: `${BASE_URL}/auth/health`,
  },
  AI: {
    QUERY: `${BASE_URL}/ai/query`,
    HISTORY: `${BASE_URL}/ai/history`,
  },
  DOCUMENTS: {
    UPLOAD: `${BASE_URL}/documents/upload`,
    LIST: `${BASE_URL}/documents`,
    SEARCH: `${BASE_URL}/documents/search`,
    DOWNLOAD: (docId: string) => `${BASE_URL}/documents/download/${docId}`,
  },
  PUBMED: {
    SEARCH: `${BASE_URL}/pubmed/search`,
    PAPER: (pmid: string) => `${BASE_URL}/pubmed/paper/${pmid}`,
  },
};

// Common API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface DocumentUploadResponse {
  id: string;
  filename: string;
  processed: boolean;
}

export interface DocumentListItem {
  id: string;
  filename: string;
  processed: boolean;
  preview: string;
  created_at: string;
}

// API Request Helper Class
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setToken(token: string, options?: { persist?: boolean }) {
    tokenStorage.setToken(token, options?.persist);
  }

  // Remove authentication token
  removeToken() {
    tokenStorage.clear();
  }

  // Get default headers
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = tokenStorage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

      const extraHeaders = options.headers ? (options.headers as Record<string, string>) : {};
      const mergedHeaders: Record<string, string> = {
        ...this.getHeaders(),
        ...extraHeaders,
      };

      if (options.body instanceof FormData && mergedHeaders['Content-Type']) {
        delete mergedHeaders['Content-Type'];
      }

      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders,
        credentials: options.credentials ?? 'include',
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, try to get text
        const textData = await response.text();
        data = { detail: textData || 'Invalid response format' };
      }

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? data.detail || data.message || 'An error occurred' : undefined,
        message: data.message,
        status: response.status,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0,
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async uploadFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Authentication API Functions
export const authAPI = {
  // Sign up
  signup: async (userData: any) => {
    return apiClient.post<SignupResponse>(API_ENDPOINTS.AUTH.SIGNUP, userData);
  },

  // Login
  login: async (credentials: any, options?: { persistSession?: boolean }) => {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // If login successful, save token
    if (response.data?.access_token) {
      apiClient.setToken(response.data.access_token, { persist: options?.persistSession });
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Remove token from storage
    apiClient.removeToken();
    
    return response;
  },

  // Get current user profile
  getCurrentUser: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },

  // Auth health check
  healthCheck: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.HEALTH);
  },
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return tokenStorage.hasToken();
};

// Utility function to get stored token
export const getStoredToken = (): string | null => {
  return tokenStorage.getToken();
};

// Ask AI Medical Assistant
export const askAI = async (question: string) => {
  return apiClient.post<QueryAnswer>(API_ENDPOINTS.AI.QUERY, { question });
};

export const getQueryHistory = async (limit: number = 5) => {
  const url = `${API_ENDPOINTS.AI.HISTORY}?limit=${limit}`;
  return apiClient.get<QueryHistoryPayload>(url);
};

export const aiAPI = {
  ask: askAI,
  history: getQueryHistory,
};

export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.uploadFormData<DocumentUploadResponse>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData);
  },
  list: async () => {
    return apiClient.get<DocumentListItem[]>(API_ENDPOINTS.DOCUMENTS.LIST);
  },
};

// PubMed API Types
export interface PubMedPaper {
  pmid: string;
  title: string;
  abstract: string;
  journal: string;
  year: string;
  doi: string;
  authors: string[];
}

export interface PubMedSearchResponse {
  query: string;
  papers: PubMedPaper[];
  count: number;
}

export const pubmedAPI = {
  search: async (query: string, limit: number = 20) => {
    const params = new URLSearchParams({
      query: query,
      limit: limit.toString(),
    });
    const url = `${API_ENDPOINTS.PUBMED.SEARCH}?${params.toString()}`;
    return apiClient.get<PubMedSearchResponse>(url);
  },
  getPaper: async (pmid: string) => {
    return apiClient.get<PubMedPaper>(API_ENDPOINTS.PUBMED.PAPER(pmid));
  },
};

// Environment helper
export const getEnvironment = (): 'development' | 'production' | 'staging' => {
  if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
    return 'development';
  } else if (BASE_URL.includes('staging')) {
    return 'staging';
  } else {
    return 'production';
  }
};

// Export default API client for easy access
export default apiClient;