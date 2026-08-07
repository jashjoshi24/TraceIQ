export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  phone?: string;
  department?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  roles: Role[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
