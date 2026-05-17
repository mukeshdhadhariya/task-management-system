import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import { DataCacheProvider } from "./context/DataCacheContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { TasksPage } from "./pages/TasksPage";
import { TaskDetailsPage } from "./pages/TaskDetailsPage";
import { UsersPage } from "./pages/UsersPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <DataCacheProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
              <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DataCacheProvider>
    </AuthProvider>
  </BrowserRouter>
);