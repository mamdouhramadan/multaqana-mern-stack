import axios from 'axios';

// Base URL for API requests (set in .env as VITE_API_URL)
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Registration data interface
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  age?: number;
  address?: string;
  emiratesId?: string;
  employeeCode?: string;
  department?: string;
  position?: string;
  joiningDate?: string;
  jobTitle?: string;
  manager?: string;
  contractType?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  personalEmail?: string;
  language?: string;
  image?: File;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

/**
 * Refresh token response from backend
 */
export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

/**
 * Generic API response
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  code?: number;
  message_code?: string;
  data?: any;
}

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls including login, register,
 * logout, and token refresh. All requests use `withCredentials: true` to
 * support HttpOnly cookie-based refresh tokens.
 */
class AuthService {
  private baseURL = API_BASE_URL;

  /**
   * Login user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with access token
   * 
   * Backend sets refresh token as HttpOnly cookie automatically
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${this.baseURL}/auth/login`,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true, // Required to receive refresh token cookie
      }
    );
    return response.data;
  }

  /**
   * Register a new user
   * 
   * @param userData - Registration form data
   * @returns Promise with success message
   * 
   * Note: Uses multipart/form-data if image is included
   */
  async register(userData: RegisterData): Promise<ApiResponse> {
    // Check if image file is included
    const hasImage = userData.image instanceof File;

    let requestData: FormData | RegisterData;
    let contentType: string;

    if (hasImage) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'emergencyContact' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      requestData = formData;
      contentType = 'multipart/form-data';
    } else {
      // Use JSON for simple registration
      requestData = userData;
      contentType = 'application/json';
    }

    const response = await axios.post<ApiResponse>(
      `${this.baseURL}/auth/register`,
      requestData,
      {
        headers: { 'Content-Type': contentType },
        withCredentials: true,
      }
    );
    return response.data;
  }

  /**
   * Refresh access token using refresh token cookie
   * 
   * @returns Promise with new access token
   * 
   * This endpoint reads the 'jwt' cookie automatically and returns a new
   * access token. Backend also sets a new refresh token cookie (token rotation).
   */
  async refreshToken(): Promise<RefreshResponse> {
    const response = await axios.get<RefreshResponse>(
      `${this.baseURL}/auth/refresh`,
      {
        withCredentials: true, // Required to send refresh token cookie
      }
    );
    return response.data;
  }

  /**
   * Logout user and clear refresh token cookie
   * 
   * @returns Promise with logout confirmation
   * 
   * Backend clears the 'jwt' cookie and removes refresh token from database
   */
  async logout(): Promise<ApiResponse> {
    const response = await axios.post<ApiResponse>(
      `${this.baseURL}/auth/logout`,
      {},
      {
        withCredentials: true, // Required to send refresh token cookie
      }
    );
    return response.data;
  }
}

// Export singleton instance
export const authService = new AuthService();
