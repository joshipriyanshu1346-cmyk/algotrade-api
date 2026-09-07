import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AuthLayout } from "../components/auth/AuthLayout";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { clearError, register } from "../features/auth/authSlice";
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];

  return { score, ...levels[Math.max(0, score - 1)] };
}

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const result = await dispatch(register({ name, email, password }));
    if (register.rejected.match(result) && result.meta.rejectedWithValue) {
      // Field errors handled via global error message from API
    }
  };

  const isLoading = status === "loading";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building algorithmic trading strategies"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Alert message={error ?? ""} />
        <Alert message={googleError} />

        <Input
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, upper, lower, number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= passwordStrength.score ? passwordStrength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">{passwordStrength.label}</p>
            </div>
          )}
        </div>

        <Button type="submit" fullWidth loading={isLoading}>
          Create account
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
