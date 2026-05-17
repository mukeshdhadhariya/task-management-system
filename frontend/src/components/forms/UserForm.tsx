import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { userSchema, type UserFormValues, type UserSchemaValues } from "../../validators/user";
import type { User } from "../../types";

interface UserFormProps {
  initialUser?: User | null;
  isSaving?: boolean;
  onSubmit: (values: UserSchemaValues) => Promise<void>;
}

export const UserForm = ({ initialUser, isSaving, onSubmit }: UserFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues, any, UserSchemaValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialUser?.email ?? "",
      role: initialUser?.role ?? "USER",
        password: "",
    },
  });

  useEffect(() => {
    reset({
      email: initialUser?.email ?? "",
      role: initialUser?.role ?? "USER",
      password: "",
    });
  }, [initialUser, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <Select label="Role" error={errors.role?.message} {...register("role")}>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </Select>

      {!initialUser ? (
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
      ) : null}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : initialUser ? "Update user" : "Create user"}
      </Button>
    </form>
  );
};