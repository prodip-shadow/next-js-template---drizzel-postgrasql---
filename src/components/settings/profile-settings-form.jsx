"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Camera } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { useDashboard } from "@/components/dashboard/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { confirmPasswordAction } from "@/modules/auth/auth.actions";
import {
  deleteAccountAction,
  removeProfilePictureAction,
  updateProfileAction,
  updateProfilePictureAction,
} from "@/modules/users/users.actions";

export function ProfileSettingsForm() {
  const { user } = useDashboard();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileError, setProfileError] = useState("");

  const [avatarError, setAvatarError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");

    startTransition(async () => {
      const res = await updateProfileAction({ name, email });
      if (!res.success) {
        setProfileError(res.message || "Unable to update profile.");
        return;
      }
      toast.success("Profile updated.");
      router.refresh();
    });
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    const formData = new FormData();
    formData.append("file", file);

    startAvatarTransition(async () => {
      const res = await updateProfilePictureAction(formData);
      if (!res.success) {
        setAvatarError(res.message || "Unable to upload image.");
        return;
      }
      toast.success("Profile photo updated.");
      router.refresh();
    });
  }

  function handleRemoveAvatar() {
    setAvatarError("");
    startAvatarTransition(async () => {
      const res = await removeProfilePictureAction();
      if (!res.success) {
        setAvatarError(res.message || "Unable to remove image.");
        return;
      }
      toast.success("Profile photo removed.");
      router.refresh();
    });
  }

  function handleDeleteAccount(e) {
    e.preventDefault();
    setDeleteError("");

    startDeleteTransition(async () => {
      const confirmRes = await confirmPasswordAction({ password: deletePassword });
      if (!confirmRes.success) {
        setDeleteError(confirmRes.message || "Incorrect password.");
        return;
      }

      const res = await deleteAccountAction({ password: deletePassword });
      if (!res.success) {
        setDeleteError(res.message || "Unable to delete account.");
        return;
      }

      setDeleteDialogOpen(false);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div>
          <h2 className="text-base font-medium text-foreground">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your name and email address
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-16 border border-border bg-card shadow-xs">
              {user?.avatarUrl ? (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name || "Avatar"}
                />
              ) : null}
              <AvatarFallback className="flex-col gap-0.5 bg-card text-muted-foreground">
                <Camera className="size-5 stroke-[1.5]" />
                <span className="text-xs font-medium">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                JPG, PNG or WebP. Max 2MB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "cursor-pointer bg-card shadow-xs",
                isAvatarPending && "pointer-events-none opacity-50"
              )}
            >
              {isAvatarPending ? <Spinner /> : null}
              <span>Upload photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isAvatarPending}
                className="sr-only"
              />
            </label>
            {user?.avatarUrl ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemoveAvatar}
                disabled={isAvatarPending}
                className="text-muted-foreground hover:text-destructive"
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {avatarError ? (
          <p className="text-sm text-destructive">{avatarError}</p>
        ) : null}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email address</Label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {profileError ? (
            <p className="text-sm text-destructive">{profileError}</p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Save
          </Button>
        </form>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-medium text-foreground">Delete account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delete your account and all of its resources
          </p>
        </div>

        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertTriangle />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Please proceed with caution, this cannot be undone.
          </AlertDescription>
        </Alert>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setDeletePassword("");
              setDeleteError("");
            }
          }}
        >
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="destructive"
                className="bg-destructive text-white hover:bg-destructive/90"
              />
            }
          >
            Delete account
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                Once your account is deleted, all of its resources and data will
                be permanently removed. Please enter your password to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-account-password">Password</Label>
                <PasswordInput
                  id="delete-account-password"
                  placeholder="Password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeletePending}
                  required
                />
              </div>

              {deleteError ? (
                <p className="text-sm text-destructive">{deleteError}</p>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletePending}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isDeletePending}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeletePending ? <Spinner /> : null}
                  Confirm delete
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
