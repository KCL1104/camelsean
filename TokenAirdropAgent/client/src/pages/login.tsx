import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [message, setMessage] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Login failed");
      const result = await res.json();
      if (result.success) {
        // Store dummy login state
        localStorage.setItem("isLoggedIn", "true");
        // Optionally store a dummy token
        localStorage.setItem("token", "dummy-token");
        navigate("/dashboard");
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err: any) {
      setMessage(err.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Email</label>
          <input type="email" {...register("email", { required: true })} className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-500">Email is required</p>}
        </div>
        <div>
          <label>Password</label>
          <input type="password" {...register("password", { required: true })} className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-500">Password is required</p>}
        </div>
        <Button type="submit" className="w-full">Login</Button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
      <div className="mt-4 text-center">
        <p>Don't have an account?</p>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
}