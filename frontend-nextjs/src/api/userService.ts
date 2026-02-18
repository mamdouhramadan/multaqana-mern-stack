import apiClient from './client';

/**
 * Current user profile from GET /users/me (Node.js + MongoDB).
 * Matches the User model fields returned by the backend.
 */
export interface CurrentUserProfile {
  _id: string;
  username: string;
  email: string;
  image?: string;
  employeeCode?: string;
  jobTitle?: string;
  joiningDate?: string;
  phoneNumber?: string;
  personalEmail?: string;
  language?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: { country?: string; city?: string; street?: string };
  emergencyContact?: { name?: string; phone?: string; relation?: string };
  workSchedule?: { startTime?: string; endTime?: string };
  leaveBalance?: { annual?: number; sick?: number };
  department?: string;
  position?: string;
  contractType?: string;
  manager?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Backend GET /users/me response shape (apiResponse).
 * Response is { success, code, message_code, message, data: userDoc }.
 */
interface GetMeResponse {
  success?: boolean;
  code?: number;
  message_code?: string;
  message?: string;
  data?: CurrentUserProfile;
}

/**
 * Fetches the currently logged-in user profile from the Node.js API.
 * Requires a valid access token (sent via apiClient interceptor).
 *
 * @returns The current user document from MongoDB
 * @throws On non-2xx or when response shape is unexpected
 */
export async function getCurrentUser(): Promise<CurrentUserProfile> {
  const response = await apiClient.get<GetMeResponse>('/users/me');
  const user = response.data?.data;
  if (!user) {
    throw new Error('Invalid response: missing user data');
  }
  return user;
}
