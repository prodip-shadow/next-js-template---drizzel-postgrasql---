"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  confirmPasswordAction,
  disableTwoFactorAction,
  enableTwoFactorAction,
  setupTwoFactorAction,
} from "@/modules/auth/auth.actions";
import { changePasswordAction } from "@/modules/users/users.actions";

export function SecuritySettingsForm() {
  const { user, isPasswordConfirmed } = useDashboard();
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled);
  const router = useRouter();
  const pathname = usePathname();
  const [confirmed, setConfirmed] = useState(Boolean(isPasswordConfirmed));
  const [gatePassword, setGatePassword] = useState("");
  const [gateError, setGateError] = useState("");
  const [isGatePending, startGateTransition] = useTransition();

  const [isPassPending, startPassTransition] = useTransition();
  const [isTwoFaPending, startTwoFaTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passError, setPassError] = useState("");

  const [twoFaStep, setTwoFaStep] = useState("idle"); // idle | verify | recovery | disable
  const [twoFaSecret, setTwoFaSecret] = useState("");
  const [twoFaOtpUrl, setTwoFaOtpUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [disablePass, setDisablePass] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (pathname !== "/dashboard/settings/security") {
      const id = setTimeout(() => {
        setGatePassword("");
        setGateError("");
        setCurrentPassword("");
        setPassword("");
        setPasswordConfirmation("");
        setPassError("");
        setTotpCode("");
        setDisablePass("");
        setTwoFaSecret("");
        setTwoFaOtpUrl("");
        setTwoFaError("");
        setTwoFaStep("idle");
      }, 0);
      return () => clearTimeout(id);
    }
  }, [pathname]);

  useEffect(() => {
    function resetAllSecurityForms() {
      setGatePassword("");
      setGateError("");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setPassError("");
      setTotpCode("");
      setDisablePass("");
      setTwoFaSecret("");
      setTwoFaOtpUrl("");
      setTwoFaError("");
      setTwoFaStep("idle");
    }
    window.addEventListener("pagehide", resetAllSecurityForms);
    return () => {
      window.removeEventListener("pagehide", resetAllSecurityForms);
    };
  }, []);

  function handleConfirmAccess(e) {
    e.preventDefault();
    setGateError("");

    startGateTransition(async () => {
      const res = await confirmPasswordAction({ password: gatePassword });
      if (!res.success) {
        setGateError(res.message || "Incorrect password.");
        return;
      }

      setGatePassword("");
      setConfirmed(true);
      router.refresh();
    });
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    setPassError("");

    startPassTransition(async () => {
      const res = await changePasswordAction({
        currentPassword,
        password,
        passwordConfirmation,
      });

      if (!res.success) {
        setPassError(res.message || "Unable to update password.");
        return;
      }

      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      toast.success("Password updated.");
    });
  }

  function handleStartTwoFactorSetup() {
    setTwoFaError("");
    startTwoFaTransition(async () => {
      const setupRes = await setupTwoFactorAction();
      if (!setupRes.success) {
        setTwoFaError(setupRes.message || "Unable to initialize 2FA.");
        return;
      }

      setTwoFaSecret(setupRes.data.secret);
      setTwoFaOtpUrl(setupRes.data.otpAuthUrl);
      setTwoFaStep("verify");
    });
  }

  function handleVerifyAndEnable(e) {
    e.preventDefault();
    setTwoFaError("");

    startTwoFaTransition(async () => {
      const res = await enableTwoFactorAction({ code: totpCode });
      if (!res.success) {
        setTwoFaError(res.message || "Invalid authentication code.");
        return;
      }

      setRecoveryCodes(res.data?.recoveryCodes || []);
      setTwoFaSecret("");
      setTwoFaOtpUrl("");
      setTotpCode("");
      setTwoFaStep("recovery");
      toast.success("Two-factor authentication enabled.");
      router.refresh();
    });
  }

  function handleDisableTwoFactor(e) {
    e.preventDefault();
    setTwoFaError("");

    startTwoFaTransition(async () => {
      const res = await disableTwoFactorAction({ password: disablePass });
      if (!res.success) {
        setTwoFaError(res.message || "Unable to disable 2FA.");
        return;
      }

      setDisablePass("");
      setTwoFaStep("idle");
      toast.success("Two-factor authentication disabled.");
      router.refresh();
    });
  }

  async function handleCopySecret() {
    if (!twoFaSecret) return;
    await navigator.clipboard.writeText(twoFaSecret);
    setCopiedSecret(true);
    toast.success("Setup key copied.");
    setTimeout(() => setCopiedSecret(false), 2000);
  }

  if (!confirmed) {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) router.push("/dashboard/settings/profile");
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              Confirm your password
            </DialogTitle>
            <DialogDescription className="text-sm">
              For your security, please confirm your password before accessing
              security settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="security-gate-password">Password</Label>
              <PasswordInput
                id="security-gate-password"
                placeholder="Password"
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                disabled={isGatePending}
                autoFocus
                required
              />
            </div>

            {gateError ? (
              <p className="text-sm text-destructive">{gateError}</p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isGatePending}
                onClick={() => router.push("/dashboard/settings/profile")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGatePending}>
                {isGatePending ? <Spinner /> : null}
                Confirm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Update password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ensure your account is using a long, random password to stay secure
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isPassPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPassPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm password</Label>
            <PasswordInput
              id="confirm-new-password"
              placeholder="Confirm password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={isPassPending}
              required
            />
          </div>

          {passError ? (
            <p className="text-sm text-destructive">{passError}</p>
          ) : null}

          <Button type="submit" disabled={isPassPending}>
            {isPassPending ? <Spinner /> : null}
            Save
          </Button>
        </form>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Two-factor authentication
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your two-factor authentication settings
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          When you enable two-factor authentication, you will be prompted for a
          secure pin during login. This pin can be retrieved from a
          TOTP-supported application on your phone.
        </p>

        {twoFaError ? (
          <p className="text-sm text-destructive">{twoFaError}</p>
        ) : null}

        {twoFaStep === "recovery" ? (
          <Card className="py-0">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-medium text-foreground">
                Save your recovery codes
              </p>
              <p className="text-sm text-muted-foreground">
                Store these recovery codes in a secure place. Each code can be used
                once if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/40 p-3 font-mono text-sm text-foreground">
                {recoveryCodes.map((code) => (
                  <span key={code}>{code}</span>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTwoFaStep("idle")}
              >
                Done
              </Button>
            </CardContent>
          </Card>
        ) : twoFactorEnabled ? (
          twoFaStep === "disable" ? (
            <form onSubmit={handleDisableTwoFactor} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="disable-2fa-password">
                  Confirm password to disable 2FA
                </Label>
                <PasswordInput
                  id="disable-2fa-password"
                  placeholder="Password"
                  value={disablePass}
                  onChange={(e) => setDisablePass(e.target.value)}
                  disabled={isTwoFaPending}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isTwoFaPending}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isTwoFaPending ? <Spinner /> : null}
                  Disable 2FA
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTwoFaStep("idle")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Enabled</Badge>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTwoFaStep("disable")}
              >
                Disable 2FA
              </Button>
            </div>
          )
        ) : twoFaStep === "verify" ? (
          <Card className="py-0">
            <CardContent className="p-4">
              <form onSubmit={handleVerifyAndEnable} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Authenticator setup key
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground">
                      {twoFaSecret}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                      aria-label="Copy setup key"
                    >
                      {copiedSecret ? <Check /> : <Copy />}
                    </Button>
                  </div>
                  <p className="break-all text-xs text-muted-foreground">
                    URI: {twoFaOtpUrl}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-2fa-code">Enter 6-digit code</Label>
                  <InputOTP
                    id="verify-2fa-code"
                    maxLength={6}
                    value={totpCode}
                    onChange={(value) => setTotpCode(value)}
                    disabled={isTwoFaPending}
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

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={isTwoFaPending}>
                    {isTwoFaPending ? <Spinner /> : null}
                    Verify & Enable
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTwoFaStep("idle")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            disabled={isTwoFaPending}
            onClick={handleStartTwoFactorSetup}
          >
            {isTwoFaPending ? <Spinner /> : null}
            Enable 2FA
          </Button>
        )}
      </section>
    </div>
  );
}
