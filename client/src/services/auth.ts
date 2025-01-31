import api from "../utils/api";
import { RegisterUserData, LoginUserData, AuthResponse } from "../types/auth";

export const registerUser = async (userData: RegisterUserData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (credentials: LoginUserData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login/", credentials);
  return response.data;
};


export const logout = async (refreshToken: string) => {
  try {

    const accessToken = localStorage.getItem('accessToken');
    await api.post(
      "/auth/logout/",
      { refresh_token: refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      }
    );

    // Remove token from localStorage or cookies
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    return true;
  } catch (error) {
    console.error("Logout failed", error);
    return false;
  }
};


