import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthForm } from "../components/forms/AuthForm";
import { AuthLayout } from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(values);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} />
        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link to="/register" className="font-medium text-slate-900 underline">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
};