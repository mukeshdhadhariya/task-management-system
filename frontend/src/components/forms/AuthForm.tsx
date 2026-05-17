import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "../../validators/auth";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (values: LoginFormValues | RegisterFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const AuthForm = ({ mode, onSubmit, isLoading }: AuthFormProps) => {
  const schema = mode === "login" ? loginSchema : registerSchema;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const useTestAdmin = () => {
    setValue('email' as any, 'admin@gmail.com');
    setValue('password' as any, 'admin1234');
  };

  return (
    <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:rounded-3xl sm:p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login" ? "Sign in to continue to your dashboard." : "Register and start managing tasks."}
        </p>
        {mode === 'login' ? (
          <div className="mt-3">
            <button type="button" onClick={useTestAdmin} className="text-sm text-slate-700 underline underline-offset-4">
              Use test admin credentials
            </button>
          </div>
        ) : null}
      </div>

      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Input label="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} error={errors.password?.message} {...register("password")} />

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
      </Button>
    </form>
  );
};