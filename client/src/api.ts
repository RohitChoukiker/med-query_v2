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

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    ME: `${BASE_URL}/auth/me`,
    HEALTH: `${BASE_URL}/auth/health`,
  },
 
};

// Common API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

// API Request Helper Class
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    this.token = localStorage.getItem('access_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  // Get default headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
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
  login: async (credentials: any) => {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // If login successful, save token
    if (response.data?.access_token) {
      apiClient.setToken(response.data.access_token);
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
  return !!localStorage.getItem('access_token');
};

// Utility function to get stored token
export const getStoredToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Ask AI Medical Assistant
export const askAI = async (question: string) => {
  return apiClient.post<{ answer: string }>("/ai/ask", { question });
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