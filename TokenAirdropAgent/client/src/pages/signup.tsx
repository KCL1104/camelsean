import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpForm>();
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) throw new Error("Sign up failed");
      setMessage("Sign up successful! You can now log in.");
    } catch (err: any) {
      setMessage(err.message || "Sign up failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl mb-4">Sign Up</h1>
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
        <div>
          <label>Confirm Password</label>
          <input type="password" {...register("confirmPassword", { required: true })} className="w-full border p-2 rounded" />
          {errors.confirmPassword && <p className="text-red-500">Please confirm your password</p>}
        </div>
        <Button type="submit" className="w-full">Sign Up</Button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}