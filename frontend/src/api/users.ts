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

  async list() {
    const { data } = await http.get<UserListResponse>("/users");
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