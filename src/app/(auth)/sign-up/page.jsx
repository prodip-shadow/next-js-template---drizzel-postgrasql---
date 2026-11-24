import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <SignUpForm />
    </AuthShell>
  );
}
