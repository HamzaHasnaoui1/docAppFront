export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  email: string;
  token: string;
  roles: string[];
  permissions?: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
}

export interface UserCreationRequest {
  username: string;
  password: string;
  email: string;
  phoneNumber?: string;
  active: boolean;
  roles: string[];
}

export interface UserDetailsResponse {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  roles: string[];
  permissions?: string[];
}
export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  medecinId?: number;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface User {
  id?: string;
  userId?: string;
  username: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  active: boolean;
  roles: string[];
  permissions?: string[];
  medecinId?: number;
}
