export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
  userId: number;
  username: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface Role {
  id: number;
  nom: string;
}