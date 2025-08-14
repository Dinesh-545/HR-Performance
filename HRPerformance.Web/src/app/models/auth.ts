export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: string;
  employeeId: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    employeeId: number;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  role: string;
  employeeId: number;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
} 