export type Role = "ADMIN" | "USER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type SortOrder = "asc" | "desc";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthUser extends User {}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  downloadUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToId: string;
  assignedTo?: Pick<User, "id" | "email">;
  attachments?: Attachment[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedToId: string;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  sortBy?: "createdAt" | "dueDate" | "priority";
  sortOrder?: SortOrder;
}

export interface UserFormValues {
  email: string;
  role: Role;
  password?: string;
}

export interface SessionState {
  user: User | null;
  token: string | null;
}