"use client";

import { useEffect, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { registerAction } from "@/modules/auth/auth.actions";

function SignUpFormContent({ onReset }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [verificationNotice, setVerificationNotice] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await registerAction({
        name,
        email,
        password,
        passwordConfirmation,
      });

      if (!res.success) {
        setError(res.message || "Unable to create account.");
        return;
      }

      if (res.data?.requiresEmailVerification) {
        setPassword("");
        setPasswordConfirmation("");
        setVerificationNotice(true);
        return;
      }

      flushSync(() => {
        onReset();
      });
      router.push("/dashboard");
    });
  }

  if (verificationNotice) {
    return (
      <Card className="py-0 text-center">
        <CardContent className="space-y-4 p-6">
          <p className="text-base font-medium">Check your email</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to {email}. Verify your email before
            logging in.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-foreground underline underline-offset-4"
          >
            Go to log in
          </Link>
        </CardContent>
      </Card>
    );
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
        <Label htmlFor="register-name">Name</Label>
        <Input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email address</Label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password-confirmation">Confirm password</Label>
        <PasswordInput
          id="register-password-confirmation"
          name="passwordConfirmation"
          autoComplete="new-password"
          placeholder="Confirm password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : null}
        Create account
      </Button>

      <p className="pt-1 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const pathname = usePathname();
  const [formKey, setFormKey] = useState(0);

  function resetForm() {
    setFormKey((prev) => prev + 1);
  }

  useEffect(() => {
    if (pathname !== "/sign-up") {
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

  return <SignUpFormContent key={formKey} onReset={resetForm} />;
}
