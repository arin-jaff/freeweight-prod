import apiClient from "./api-client";

export interface User {
  id: number;
  email: string;
  name: string;
  user_type: "athlete" | "coach";
  sport?: string;
  team?: string;
  training_goals?: string;
  coaching_credentials?: string;
  bio?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  user_type: "athlete" | "coach";
  invite_code?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const tokenRes = await apiClient.post<{ access_token: string }>("/api/auth/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    localStorage.setItem("auth_token", tokenRes.data.access_token);
    const user = await authApi.getMe();
    return { access_token: tokenRes.data.access_token, token_type: "bearer", user };
  },

  signup: async (data: SignupData): Promise<LoginResponse> => {
    const tokenRes = await apiClient.post<{ access_token: string }>("/api/auth/signup", data);
    localStorage.setItem("auth_token", tokenRes.data.access_token);
    const user = await authApi.getMe();
    return { access_token: tokenRes.data.access_token, token_type: "bearer", user };
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },
};

export const saveAuthData = (token: string, user: User) => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getAuthData = (): { token: string | null; user: User | null } => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return { token, user };
};
