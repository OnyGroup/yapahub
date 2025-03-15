"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function LoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { access, refresh } = await loginUser({ username, password });

      // Store JWT tokens in localStorage
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Show success toast
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
        variant: "default",
      });

      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please check your credentials.";
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={login} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              name="username"
              type="text"
              required
              disabled={submitting}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={submitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </Button>
          <Link href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Add the Toaster component here to render the toasts */}
      <Toaster />
    </>
  );
}
