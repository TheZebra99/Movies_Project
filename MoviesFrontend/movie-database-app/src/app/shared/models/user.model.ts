
export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  profile_pic_url?: string;
  creation_date: string;  // added missing field
  role: UserRole;
}

export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export interface LoginRequest {
  login: string;      // changed from 'email' to 'login' (can be username OR email)
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  display_name?: string;  // updated to be optional
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateProfileRequest {
  email?: string;
  username?: string;
  display_name?: string;
  profile_pic_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}