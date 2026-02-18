import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * API Client Configuration with Authentication Support
 * 
 * This client is configured with:
 * - Base URL for API requests
 * - Cookie support via withCredentials
 * - Request interceptor to attach access token
 * - Response interceptor to handle token expiration (401 errors)
 * 
 * The access token is managed by AuthContext and refresh token is
 * automatically handled via HttpOnly cookies.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly cookie support (refresh token)
});

// Reference to access token getter and setter; optional session-expired callback
let getAccessToken: (() => string | null) | null = null;
let setAccessToken: ((token: string | null) => void) | null = null;
let onSessionExpired: (() => void) | null = null;

// Single in-flight refresh: multiple 401s share one refresh call to avoid token rotation 403
let refreshPromise: Promise<string> | null = null;

/**
 * Set token getter, setter, and optional session-expired callback from AuthContext
 */
export const setAuthTokenHandlers = (
  getter: () => string | null,
  setter: (token: string | null) => void,
  sessionExpiredCallback?: () => void
) => {
  getAccessToken = getter;
  setAccessToken = setter;
  onSessionExpired = sessionExpiredCallback ?? null;
};

/**
 * Request Interceptor
 * 
 * Attaches the access token to all requests if available
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (getAccessToken) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Run a single refresh and return the new access token, or reject.
 * Shared by all 401s so we only call /auth/refresh once (avoids rotation 403).
 */
function doRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
        withCredentials: true,
      });
      const newToken = response.data.data.accessToken;
      if (setAccessToken) setAccessToken(newToken);
      return newToken;
    } catch (err) {
      if (setAccessToken) setAccessToken(null);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      // Only show "Session expired" for 401; 403 often means token reuse (our own second refresh)
      if (status === 401) onSessionExpired?.();
      return Promise.reject(err);
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Response Interceptor
 *
 * On 401, uses a single in-flight refresh so multiple parallel 401s share one
 * refresh call. Retries the request with the new token or rejects.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await doRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
