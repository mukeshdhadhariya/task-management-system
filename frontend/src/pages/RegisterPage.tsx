import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthForm } from "../components/forms/AuthForm";
import { AuthLayout } from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      await createAccount(values);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} />
        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-slate-900 underline">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
};