export interface RegisterUserData {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    access_level: string;
  }
  
  export interface LoginUserData {
    username: string;
    password: string;
    roles?: string[];
  }
  
  export interface AuthResponse {
    access: string;
    refresh: string;
  }

  export interface UserProfile {
    username: string;
    email: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
  }