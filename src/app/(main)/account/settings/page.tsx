"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Lock, Loader2, CheckCircle2, ShieldCheck, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Schema for Profile Update
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

// Schema for Password Change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setAuth } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || "",
    },
  });

  // Password Form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onUpdateProfile = async (values: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    try {
      const response = await authService.updateProfile(values);
      toast.success(response.message);
      
      // Update local auth state
      if (user) {
        setAuth({ ...user, name: values.fullName });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      const response = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success(response.message);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-sm overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
            <UserCircle className="text-primary" size={20} />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Profile Details</h2>
          </div>
          <div className="p-6">
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Full Name</label>
                <Input 
                  {...profileForm.register("fullName")}
                  placeholder="Enter your full name"
                  className="rounded-sm"
                />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email Address</label>
                <Input 
                  value={user?.email || ""}
                  disabled
                  className="bg-muted/50 rounded-sm cursor-not-allowed opacity-70"
                />
                <p className="text-[10px] text-muted-foreground">Email cannot be changed directly for security reasons.</p>
              </div>

              <Button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="rounded-sm px-8"
              >
                {isUpdatingProfile ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Save Changes
              </Button>
            </form>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/50 rounded-sm overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
            <ShieldCheck className="text-primary" size={20} />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Security & Password</h2>
          </div>
          <div className="p-6">
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Current Password</label>
                <Input 
                  {...passwordForm.register("currentPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="rounded-sm"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">New Password</label>
                  <Input 
                    {...passwordForm.register("newPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="rounded-sm"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Confirm New Password</label>
                  <Input 
                    {...passwordForm.register("confirmPassword")}
                    type="password"
                    placeholder="••••••••"
                    className="rounded-sm"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-sm border border-primary/10">
                <div className="flex gap-3">
                  <Lock className="text-primary shrink-0" size={18} />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Changing your password will automatically log you out of all other active sessions for your security.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="outline"
                disabled={isChangingPassword}
                className="rounded-sm px-8 hover:bg-primary hover:text-white transition-all"
              >
                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Update Password
              </Button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
