import apiClient from "./api-client";

export interface User {
  id: number;
  email: string;
  name: string;
  user_type: "athlete" | "coach";
  profile_photo_url?: string;
  sport?: string;
  team?: string;
  training_goals?: string;
  injuries?: string;
  experience_level?: string;
  onboarding_completed?: boolean;
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
    console.log("🌐 [AUTH API] Preparing login request...");
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    console.log("📤 [AUTH API] Request details:");
    console.log("  URL: /api/auth/login");
    console.log("  Method: POST");
    console.log("  Content-Type: application/x-www-form-urlencoded");
    console.log("  Body params:", params.toString());

    try {
      console.log("📡 [AUTH API] Sending request to backend...");
      const response = await apiClient.post<LoginResponse>("/api/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("✅ [AUTH API] Response received!");
      console.log("📥 [AUTH API] Status:", response.status);
      console.log("📥 [AUTH API] Response data:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ [AUTH API] Request failed!");
      console.error("Error:", error);
      console.error("Response:", error.response);
      throw error;
    }
  },

  signup: async (data: SignupData): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/signup", data);
    return response.data;
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
