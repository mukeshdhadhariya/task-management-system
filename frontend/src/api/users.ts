import { http } from "./http";
import type { ApiResponse, PaginationMeta, User, UserFormValues } from "../types";

export interface UserListResponse {
  success: boolean;
  data: User[];
  meta: PaginationMeta;
}

export const usersApi = {
  async create(payload: UserFormValues) {
    const { data } = await http.post<ApiResponse<User>>("/users", payload);
    return data.data;
  },

  async list(params?: { page?: number; limit?: number }) {
    const { data } = await http.get<UserListResponse>("/users", { params });
    return data;
  },

  async update(userId: string, payload: Partial<UserFormValues>) {
    const { data } = await http.patch<ApiResponse<User>>(`/users/${userId}`, payload);
    return data.data;
  },

  async remove(userId: string) {
    await http.delete(`/users/${userId}`);
  },
};