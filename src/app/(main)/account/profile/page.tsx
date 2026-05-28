"use client";

import { SoftInput } from "@/components/ui/SoftInput";
import { SoftSelect } from "@/components/ui/SoftSelect";
import { useAuth } from "@/hooks/use-auth";
import { profileService } from "@/services/profile-service";
import { UpdateProfileRequest, UserProfile } from "@/types/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormHandleSubmit,
} from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters" }),
  phoneNumber: z.string().nullable(),
  avatarUrl: z
    .string()
    .nullable()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      {
        message: "Invalid URL",
      },
    ),
  bio: z.string().nullable(),
  gender: z.string().nullable(),
  dateOfBirth: z
    .string()
    .nullable()
    .refine((val) => !val || val === "" || !Number.isNaN(Date.parse(val)), {
      message: "Invalid date",
    }),
  addresses: z
    .array(
      z.object({
        publicId: z.string().optional(),
        addressLabel: z.string().min(1, "Required"),
        receiverName: z.string().min(1, "Required"),
        receiverPhone: z.string().min(1, "Required"),
        streetAddress: z.string().min(1, "Required"),
        city: z.string().min(1, "Required"),
        stateProvince: z.string().min(1, "Required"),
        postalCode: z.string().min(1, "Required"),
        country: z.string().min(1, "Required"),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isDefault: z.boolean(),
      }),
    )
    .optional(),
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

// Sub-component: Profile Header Info
interface ProfileHeaderProps {
  avatarUrl?: string | null;
  fullName?: string;
  name: string;
  email: string;
}

function ProfileHeader({
  avatarUrl,
  fullName,
  name,
  email,
}: Readonly<ProfileHeaderProps>) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserIcon size={48} strokeWidth={1.5} />
        )}
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-bold font-heading">{fullName || name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail size={16} />
          <span>{email}</span>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Read-Only Profile View
interface ReadOnlyViewProps {
  profile: UserProfile | null;
}

function ReadOnlyView({ profile }: Readonly<ReadOnlyViewProps>) {
  const formattedDob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Full Name
          </span>
          <p className="text-sm font-medium mt-1">{profile?.fullName || "-"}</p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Phone Number
          </span>
          <p className="text-sm font-medium mt-1">
            {profile?.phoneNumber || "-"}
          </p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Gender
          </span>
          <p className="text-sm font-medium mt-1">{profile?.gender || "-"}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Date of Birth
          </span>
          <p className="text-sm font-medium mt-1">{formattedDob}</p>
        </div>
        <div className="md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
            Bio
          </span>
          <p className="text-sm font-medium mt-1 whitespace-pre-wrap">
            {profile?.bio || "-"}
          </p>
        </div>
      </div>

      {profile?.addresses && profile.addresses.length > 0 && (
        <div className="md:col-span-2 pt-4 border-t border-border/50">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-4">
            Saved Addresses
          </span>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.addresses.map((address, idx) => (
              <div
                key={address.publicId || idx}
                className="p-4 rounded-xl border border-border/50 bg-muted/20 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md">
                    Default
                  </span>
                )}
                <div className="font-bold flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-primary" />
                  {address.addressLabel}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">
                      {address.receiverName}
                    </span>{" "}
                    ({address.receiverPhone})
                  </p>
                  <p>{address.streetAddress}</p>
                  <p>
                    {address.city}, {address.stateProvince} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Editing Profile View Form
interface EditFormViewProps {
  control: Control<ProfileUpdateValues>;
  handleSubmit: UseFormHandleSubmit<ProfileUpdateValues>;
  onSubmit: (data: ProfileUpdateValues) => void;
  isUpdating: boolean;
  onCancel: () => void;
}

function EditFormView({
  control,
  handleSubmit,
  onSubmit,
  isUpdating,
  onCancel,
}: Readonly<EditFormViewProps>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Controller
          name="fullName"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              label="Full Name"
              id="fullName"
              placeholder="Enter your full name"
              icon={UserIcon}
              error={fieldState.error?.message}
              {...field}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              label="Phone Number"
              id="phoneNumber"
              placeholder="e.g. +62812345678"
              icon={Phone}
              error={fieldState.error?.message}
              {...field}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="avatarUrl"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              label="Avatar URL"
              id="avatarUrl"
              placeholder="https://example.com/avatar.jpg"
              icon={UserIcon}
              error={fieldState.error?.message}
              {...field}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              label="Date of Birth"
              id="dateOfBirth"
              type="date"
              icon={Calendar}
              error={fieldState.error?.message}
              {...field}
              value={field.value || ""}
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <SoftSelect
              label="Gender"
              id="gender"
              placeholder="Select Gender"
              value={field.value || ""}
              onChange={field.onChange}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
                { value: "Prefer not to say", label: "Prefer not to say" },
              ]}
              icon={<Users size={16} />}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="md:col-span-2 space-y-2">
          <label
            htmlFor="bio"
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1"
          >
            Bio
          </label>
          <div className="relative group">
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-muted/30 border border-border/50 focus:border-primary/30 rounded-2xl py-3.5 px-4 text-sm transition-all outline-none ring-primary/5 focus:ring-8 min-h-24"
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-t-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Addresses
          </h3>
          <button
            type="button"
            onClick={() =>
              append({
                addressLabel: "Home",
                receiverName: "",
                receiverPhone: "",
                streetAddress: "",
                city: "",
                stateProvince: "",
                postalCode: "",
                country: "Indonesia",
                isDefault: fields.length === 0,
              })
            }
            className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Address
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-5 rounded-2xl border border-border/50 bg-muted/10 relative"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Remove address"
              >
                <Trash2 size={16} />
              </button>

              <div className="grid md:grid-cols-2 gap-4 mt-2">
                <Controller
                  name={`addresses.${index}.addressLabel`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="Label (e.g. Home, Office)"
                      id={`addresses.${index}.addressLabel`}
                      placeholder="Home"
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <div className="flex items-center pt-8 px-2">
                  <Controller
                    name={`addresses.${index}.isDefault`}
                    control={control}
                    render={({ field: inputField }) => (
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={inputField.value}
                          onChange={inputField.onChange}
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20"
                        />{" "}
                        Set as default address
                      </label>
                    )}
                  />
                </div>

                <Controller
                  name={`addresses.${index}.receiverName`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="Receiver Name"
                      id={`addresses.${index}.receiverName`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <Controller
                  name={`addresses.${index}.receiverPhone`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="Receiver Phone"
                      id={`addresses.${index}.receiverPhone`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <div className="md:col-span-2">
                  <Controller
                    name={`addresses.${index}.streetAddress`}
                    control={control}
                    render={({ field: inputField, fieldState }) => (
                      <SoftInput
                        label="Street Address"
                        id={`addresses.${index}.streetAddress`}
                        error={fieldState.error?.message}
                        {...inputField}
                      />
                    )}
                  />
                </div>

                <Controller
                  name={`addresses.${index}.city`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="City"
                      id={`addresses.${index}.city`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <Controller
                  name={`addresses.${index}.stateProvince`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="State/Province"
                      id={`addresses.${index}.stateProvince`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <Controller
                  name={`addresses.${index}.postalCode`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="Postal Code"
                      id={`addresses.${index}.postalCode`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />

                <Controller
                  name={`addresses.${index}.country`}
                  control={control}
                  render={({ field: inputField, fieldState }) => (
                    <SoftInput
                      label="Country"
                      id={`addresses.${index}.country`}
                      error={fieldState.error?.message}
                      {...inputField}
                    />
                  )}
                />
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6 bg-muted/10 rounded-2xl border border-dashed border-border/50">
              No addresses saved. Add one for faster checkout.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-t-border/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-muted text-muted-foreground rounded-2xl font-bold hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isUpdating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user, isHydrated } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);

  // Fetch profile data
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileService.getProfile(user!.id),
    enabled: !!user?.id,
  });

  // Mutation for updating profile
  const { mutate: updateProfileMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      profileService.updateProfile(user!.id, data),
    onSuccess: (updatedProfile) => {
      toast.success("Profile updated successfully!");
      // Update the query cache
      queryClient.setQueryData(["profile", user?.id], updatedProfile);
      setIsEditing(false);
    },
    onError: (err: unknown) => {
      let message = "Failed to update profile.";
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String((err as Record<string, unknown>).message);
      }
      toast.error(message);
    },
  });

  // Form methods
  const { control, handleSubmit, reset } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      avatarUrl: "",
      bio: "",
      gender: "",
      dateOfBirth: "",
      addresses: [],
    },
  });

  // Helper to sync form with backend data
  const resetForm = React.useCallback(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        avatarUrl: profile.avatarUrl || "",
        bio: profile.bio || "",
        gender: profile.gender || "",
        dateOfBirth: profile.dateOfBirth || "",
        addresses: profile.addresses || [],
      });
    }
  }, [profile, reset]);

  // Sync form on load or when profile changes
  React.useEffect(() => {
    resetForm();
  }, [profile, resetForm]);

  if (!isHydrated) return null;
  if (!user) return <div>Please sign in to view your profile.</div>;

  // Handle form submit
  const onSubmit = (data: ProfileUpdateValues) => {
    // Ensure only one default address
    if (data.addresses) {
      const defaultCount = data.addresses.filter((a) => a.isDefault).length;
      if (defaultCount > 1) {
        toast.error("Only one default address is allowed.");
        return;
      }
      if (defaultCount === 0 && data.addresses.length > 0) {
        data.addresses[0].isDefault = true;
      }
    }

    const updateData: UpdateProfileRequest = {
      fullName: data.fullName,
      phoneNumber:
        !data.phoneNumber || data.phoneNumber.trim() === ""
          ? null
          : data.phoneNumber,
      avatarUrl:
        !data.avatarUrl || data.avatarUrl.trim() === "" ? null : data.avatarUrl,
      bio: !data.bio || data.bio.trim() === "" ? null : data.bio,
      gender: !data.gender || data.gender.trim() === "" ? null : data.gender,
      dateOfBirth:
        !data.dateOfBirth || data.dateOfBirth.trim() === ""
          ? null
          : data.dateOfBirth,
      addresses: data.addresses || [],
    };
    updateProfileMutate(updateData);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetForm();
  };

  // Determine main panel content (loading, error, read-only, or edit view)
  let contentElement;
  if (isLoading) {
    contentElement = (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  } else if (error) {
    contentElement = (
      <div className="text-destructive text-sm py-4 text-center font-medium">
        Error fetching profile data. Please try again later.
      </div>
    );
  } else if (isEditing) {
    contentElement = (
      <EditFormView
        control={control}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        isUpdating={isUpdating}
        onCancel={handleCancelEdit}
      />
    );
  } else {
    contentElement = <ReadOnlyView profile={profile || null} />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-6 py-24 space-y-8">
      {/* Header Info */}
      <ProfileHeader
        avatarUrl={profile?.avatarUrl}
        fullName={profile?.fullName}
        name={user.name}
        email={user.email}
      />

      <div className="grid gap-8">
        {/* Main Profile Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h2 className="text-xl font-bold">Profile Details</h2>
            {isEditing === false && isLoading === false && error === null && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-2xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/10"
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            )}
          </div>

          {contentElement}
        </motion.div>

        {/* Security and MFA Setup Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Two-Step Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
              </div>
            </div>

            <Link
              href="/profile/mfa"
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Setup MFA
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Account Security / Active Sessions Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldCheck className="text-primary" size={18} />
              Account Security
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Password</span>
                <button className="text-primary font-bold hover:underline">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent Activity</span>
                <span className="font-medium">View All</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-3xl p-6 space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldAlert className="text-amber-500" size={18} />
              Active Sessions
            </h4>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                You are currently logged in on this Windows device.
              </p>
              <button className="text-destructive font-bold hover:underline">
                Sign out of all devices
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
