import api from "../utils/api";
import { RegisterUserData, LoginUserData, AuthResponse } from "../types/auth";

export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (credentials: LoginUserData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login/", credentials);
  
  // Store tokens securely
  // localStorage.setItem("accessToken", response.data.access);
  // localStorage.setItem("refreshToken", response.data.refresh);
  
  return response.data;
};

export const logout = async () => {
  try {
    // Optionally, send a request to the backend to blacklist the refresh token
    await api.post("/auth/logout/", {
      refresh_token: localStorage.getItem("refreshToken"),
    });

    // Clear tokens from localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login page
    window.location.href = "/login"; // Redirect to login after logout
  } catch (error) {
    console.error("Logout failed", error);
  }
};

