import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { clearError, login } from "../features/auth/authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const isLoading = status === "loading";

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AlgoTrade account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Alert message={error ?? ""} />
        <Alert message={googleError} />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" fullWidth loading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-text-muted">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton onError={setGoogleError} />
    </AuthLayout>
  );
}
