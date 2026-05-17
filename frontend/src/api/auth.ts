import { http, storeToken } from "./http";
import type { LoginPayload, LoginResponse, RegisterPayload, User } from "../types";

export const authApi = {
  async register(payload: RegisterPayload) {
    const { data } = await http.post<{ success: boolean; data: User }>("/auth/register", payload);
    return data;
  },

  async login(payload: LoginPayload) {
    const { data } = await http.post<LoginResponse>("/auth/login", payload);
    storeToken(data.token);
    return data;
  },
};