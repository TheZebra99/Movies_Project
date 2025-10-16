
// the user object after login
export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  profile_pic_url?: string;
  role: UserRole;
}

// user roles
export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

// what we send to the login endpoint
export interface LoginRequest {
  email: string;
  password: string;
}

// what we send to the register endpoint
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  display_name: string;
}

// what our .NET API returns after successful login/register
export interface AuthResponse {
  token: string;  // JWT token
  user: User;     // User info
}

// update profile request
export interface UpdateProfileRequest {
  display_name?: string;
  profile_pic_url?: string;
}

// change password request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}