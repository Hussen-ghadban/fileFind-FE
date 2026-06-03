"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useAuthExpired } from "@/components/auth-expired-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { reset } = useAuthExpired();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password);
        setAuth(res.data.user, res.data.access_token);
        reset();
        router.push("/dashboard");
      } else {
        await signup(email, password);
        toast.success("Account created! Please check your email to confirm.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            {isLogin ? "Sign in to FileFind" : "Get started with FileFind"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              className="text-primary underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}