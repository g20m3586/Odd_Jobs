// components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import {
  Button,
  Input,
  Label,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui";
import { toast } from "sonner";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return toast.error(error.message);
      router.push("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      if (error) return toast.error(error.message);
      toast.success("Registration successful! Check your email.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full mx-auto mt-10 p-6 rounded-lg shadow bg-white dark:bg-gray-800 space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? "Login" : "Register"}
      </h2>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {!isLogin && (
        <div>
          <Label htmlFor="role">Select Role</Label>
          <Select onValueChange={(value) => setRole(value)} defaultValue="customer">
            <SelectTrigger>
              <SelectValue placeholder="Choose role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full">
        {isLogin ? "Login" : "Register"}
      </Button>

      <p
        onClick={() => setIsLogin(!isLogin)}
        className="text-center text-sm text-blue-600 cursor-pointer"
      >
        {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
      </p>
    </form>
  );
}
