"use client";

import { useEffect, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { loginAction } from "@/modules/auth/auth.actions";

function LoginFormContent({ onReset }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await loginAction({
        email,
        password,
        ...(requiresTwoFactor && totpCode ? { totpCode } : {}),
      });

      if (!res.success) {
        setError(res.message || "Unable to log in.");
        return;
      }

      if (res.data?.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        return;
      }

      flushSync(() => {
        onReset();
      });
      router.push("/dashboard");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email address</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending || requiresTwoFactor}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending || requiresTwoFactor}
          required
        />
      </div>

      {requiresTwoFactor ? (
        <div className="space-y-2">
          <Label htmlFor="login-totp">Authentication code</Label>
          <InputOTP
            id="login-totp"
            maxLength={6}
            value={totpCode}
            onChange={(value) => setTotpCode(value)}
            disabled={isPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : null}
        {requiresTwoFactor ? "Verify & log in" : "Log in"}
      </Button>

      <p className="pt-1 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const pathname = usePathname();
  const [formKey, setFormKey] = useState(0);

  function resetForm() {
    setFormKey((prev) => prev + 1);
  }

  useEffect(() => {
    if (pathname !== "/login") {
      const id = setTimeout(resetForm, 0);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  useEffect(() => {
    function handlePageShow(event) {
      if (event.persisted) {
        resetForm();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return <LoginFormContent key={formKey} onReset={resetForm} />;
}
