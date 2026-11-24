import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in to your account"
      description="Enter your email and password below to log in"
    >
      <LoginForm />
    </AuthShell>
  );
}
