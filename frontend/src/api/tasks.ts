import { http } from "./http";
import type { ApiResponse, Attachment, PaginationMeta, Task, TaskFormValues, TaskQueryParams } from "../types";

export interface TaskListResponse {
  success: boolean;
  data: Task[];
  meta: PaginationMeta;
}

export const tasksApi = {
  async list(params: TaskQueryParams) {
    const query = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
    );

    const { data } = await http.get<TaskListResponse>("/tasks", { params: query });
    return data;
  },

  async getById(taskId: string) {
    const { data } = await http.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return data.data;
  },

  async create(payload: TaskFormValues) {
    const { data } = await http.post<ApiResponse<Task>>("/tasks", payload);
    return data.data;
  },

  async update(taskId: string, payload: Partial<TaskFormValues>) {
    const { data } = await http.patch<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
    return data.data;
  },

  async remove(taskId: string) {
    await http.delete(`/tasks/${taskId}`);
  },

  async uploadDocuments(taskId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("documents", file));

    const { data } = await http.post<ApiResponse<Attachment[]>>(`/tasks/${taskId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data.data;
  },
};