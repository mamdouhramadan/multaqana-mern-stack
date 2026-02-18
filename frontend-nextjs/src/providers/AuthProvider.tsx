import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authService, type RegisterData } from '../services/authService';
import { setAuthTokenHandlers } from '../api/client';
import toast from 'react-hot-toast';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

/**
 * User information decoded from JWT token
 */
export interface User {
  id: string;
  username: string;
  roles: string[];
}

/**
 * JWT Token Payload Structure
 */
interface TokenPayload {
  UserInfo: {
    id: string;
    username: string;
    roles: string[];
  };
  iat: number;
  exp: number;
}

/**
 * Authentication Context Type
 */
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Run initial refresh only once per page load (avoids duplicate calls from React Strict Mode)
let initialRefreshStarted = false;

/**
 * Authentication Provider Component
 * 
 * Manages global authentication state including:
 * - Access token (stored in memory)
 * - User information (decoded from token)
 * - Authentication status
 * 
 * The refresh token is managed automatically via HttpOnly cookies
 * and is never accessible to JavaScript.
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Decode user information from access token
   */
  const decodeToken = useCallback((token: string): User | null => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return {
        id: decoded.UserInfo.id,
        username: decoded.UserInfo.username,
        roles: decoded.UserInfo.roles,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  /**
   * Set access token and decode user info
   */
  const setAccessToken = useCallback(
    (token: string | null) => {
      setAccessTokenState(token);
      if (token) {
        const decodedUser = decodeToken(token);
        setUser(decodedUser);
      } else {
        setUser(null);
      }
    },
    [decodeToken]
  );

  /**
   * Login user with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await authService.login(email, password);
        setAccessToken(response.data.accessToken);
        toast.success('Login successful!');
      } catch (error: unknown) {
        // Error will be handled by caller (LoginPage)
        throw error;
      }
    },
    [setAccessToken]
  );

  /**
   * Register new user and auto-login
   * 
   * After successful registration, the backend returns an access token
   * and sets a refresh token cookie, so the user is automatically logged in.
   */
  const register = useCallback(async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      // Auto-login: Set the access token from registration response
      if (response.data?.accessToken) {
        setAccessToken(response.data.accessToken);
        toast.success('Registration successful! You are now logged in.');
      } else {
        toast.success('Registration successful! Please login.');
      }
    } catch (error: unknown) {
      // Error will be handled by caller (RegisterPage)
      throw error;
    }
  }, [setAccessToken]);

  /**
   * Logout user and clear tokens
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setAccessToken(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      setAccessToken(null);
      toast.error('Logout failed. Please try again.');
    }
  }, [setAccessToken]);

  /**
   * Attempt to refresh access token on mount (with one retry on failure).
   * Skips if we already have a token (e.g. just logged in). Runs only once per page load
   * to avoid duplicate refresh calls from React Strict Mode.
   */
  useEffect(() => {
    // Already have a token (e.g. after login) - no need to call refresh
    if (accessToken) {
      setIsLoading(false);
      return;
    }
    // Avoid double refresh when Strict Mode runs the effect twice.
    // Do NOT set isLoading false here: the in-flight refresh will do it in finally.
    if (initialRefreshStarted) {
      return;
    }
    initialRefreshStarted = true;

    const RETRY_DELAY_MS = 800;

    const initializeAuth = async (isRetry = false) => {
      try {
        const response = await authService.refreshToken();
        const token = response.data?.accessToken ?? null;
        setAccessToken(token);
      } catch (error) {
        if (!isRetry) {
          try {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            await initializeAuth(true);
            return;
          } catch {
            // Retry failed; fall through to finally
          }
        }
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [accessToken, setAccessToken]);

  /**
   * Register token handlers with API client (synchronous so chat/other requests get the token)
   */
  useEffect(() => {
    setAuthTokenHandlers(
      () => accessToken,
      (token: string | null) => setAccessToken(token),
      () => toast.error('Session expired. Please sign in again.')
    );
  }, [accessToken, setAccessToken]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!accessToken && !!user,
      isLoading,
      login,
      register,
      logout,
      setAccessToken,
    }),
    [user, accessToken, isLoading, login, register, logout, setAccessToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <FullPageLoader /> : children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
