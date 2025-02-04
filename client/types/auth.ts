export interface RegisterUserData {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginUserData {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    access: string;
    refresh: string;
  }  