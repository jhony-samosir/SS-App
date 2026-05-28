"use client";

import { SoftInput } from "@/components/ui/SoftInput";
import { SoftSelect } from "@/components/ui/SoftSelect";
import { useAuth } from "@/hooks/use-auth";
import { profileService } from "@/services/profile-service";
import { UpdateProfileRequest, UserProfile } from "@/types/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
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
  Star,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Validation schema for profile update (no addresses here)
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
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

const addressSchema = z.object({
  publicId: z.string().optional(),
  addressLabel: z.string().min(1, "Required"),
  receiverName: z.string().min(1, "Required"),
  receiverPhone: z.string().min(1, "Required"),
  streetAddress: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  stateProvince: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

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
    </div>
  );
}

// Sub-component: Address Editor Form
function AddressForm({
  initialData,
  userPublicId,
  onSuccess,
  onCancel,
  hasExistingAddresses,
}: Readonly<{
  initialData?: AddressFormValues;
  userPublicId: string;
  onSuccess: () => void;
  onCancel: () => void;
  hasExistingAddresses: boolean;
}>) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData?.publicId;

  const { control, handleSubmit } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      addressLabel: "",
      receiverName: "",
      receiverPhone: "",
      streetAddress: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "Indonesia",
      isDefault: !hasExistingAddresses,
    },
  });

  const mutationFn = (data: AddressFormValues) => {
    if (isEditing && data.publicId) {
      return profileService.updateAddress(userPublicId, data.publicId, data);
    }
    return profileService.createAddress(userPublicId, data);
  };

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(`Address ${isEditing ? "updated" : "added"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["profile", userPublicId] });
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(
        err?.message || `Failed to ${isEditing ? "update" : "add"} address`,
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutate(data))}
      className="p-5 rounded-2xl border border-border/50 bg-muted/10 space-y-4"
    >
      <h3 className="font-bold text-lg">
        {isEditing ? "Edit Address" : "New Address"}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Controller
          name="addressLabel"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="addressLabel"
              label="Label (e.g. Home, Office)"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <div className="flex items-center pt-8 px-2">
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20"
                />{" "}
                Set as default address
              </label>
            )}
          />
        </div>
        <Controller
          name="receiverName"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="receiverName"
              label="Receiver Name"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="receiverPhone"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="receiverPhone"
              label="Receiver Phone"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <div className="md:col-span-2">
          <Controller
            name="streetAddress"
            control={control}
            render={({ field, fieldState }) => (
              <SoftInput
                id="streetAddress"
                label="Street Address"
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />
        </div>
        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="city"
              label="City"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="stateProvince"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="stateProvince"
              label="State/Province"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="postalCode"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="postalCode"
              label="Postal Code"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <SoftInput
              id="country"
              label="Country"
              error={fieldState.error?.message}
              {...field}
            />
          )}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-muted text-muted-foreground rounded-xl font-bold hover:bg-muted/80 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 text-sm disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}{" "}
          Save Address
        </button>
      </div>
    </form>
  );
}

// Sub-component: Editing Profile View Form
interface EditFormViewProps {
  control: any;
  handleSubmit: any;
  onSubmit: (data: ProfileUpdateValues) => void;
  isUpdating: boolean;
  onCancel: () => void;
  errors: any;
}

function EditFormView({
  control,
  handleSubmit,
  onSubmit,
  isUpdating,
  onCancel,
}: Readonly<EditFormViewProps>) {
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

// Sub-component: Address List and Manager
function AddressManager({
  profile,
  userPublicId,
}: Readonly<{ profile: UserProfile; userPublicId: string }>) {
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(
    null,
  );
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const queryClient = useQueryClient();

  const addresses = profile.addresses || [];

  const { mutate: deleteAddress } = useMutation({
    mutationFn: (addressPublicId: string) =>
      profileService.deleteAddress(userPublicId, addressPublicId),
    onSuccess: () => {
      toast.success("Address removed");
      queryClient.invalidateQueries({ queryKey: ["profile", userPublicId] });
    },
    onError: () => toast.error("Failed to remove address"),
  });

  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: (addressPublicId: string) =>
      profileService.setDefaultAddress(userPublicId, addressPublicId),
    onSuccess: () => {
      toast.success("Default address updated");
      queryClient.invalidateQueries({ queryKey: ["profile", userPublicId] });
    },
    onError: () => toast.error("Failed to update default address"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin size={20} className="text-primary" />
          Saved Addresses
        </h2>
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {isAddingNew && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AddressForm
                userPublicId={userPublicId}
                hasExistingAddresses={addresses.length > 0}
                onSuccess={() => setIsAddingNew(false)}
                onCancel={() => setIsAddingNew(false)}
              />
            </motion.div>
          )}

          {addresses.map((address, idx) => (
            <motion.div
              key={address.publicId || idx}
              layout
              className="rounded-xl border border-border/50 bg-muted/20 relative overflow-hidden"
            >
              {editingAddressId === address.publicId ? (
                <div className="p-2">
                  <AddressForm
                    initialData={{ ...address, publicId: address.publicId }}
                    userPublicId={userPublicId}
                    hasExistingAddresses={true}
                    onSuccess={() => setEditingAddressId(null)}
                    onCancel={() => setEditingAddressId(null)}
                  />
                </div>
              ) : (
                <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start">
                  <div className="space-y-2">
                    <div className="font-bold flex items-center gap-2 text-lg">
                      {address.addressLabel}
                      {address.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> Default
                        </span>
                      )}
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
                        {address.city}, {address.stateProvince}{" "}
                        {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(address.publicId!)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => setEditingAddressId(address.publicId!)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to remove this address?",
                          )
                        ) {
                          deleteAddress(address.publicId!);
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {addresses.length === 0 && !isAddingNew && (
            <div className="text-sm text-muted-foreground text-center py-8 bg-muted/10 rounded-2xl border border-dashed border-border/50">
              No addresses saved. Add one for faster checkout.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      avatarUrl: "",
      bio: "",
      gender: "",
      dateOfBirth: "",
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
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split("T")[0]
          : "",
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
        errors={formErrors}
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

        {/* Address Manager Section */}
        {profile && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-xl"
          >
            <AddressManager profile={profile} userPublicId={user.id} />
          </motion.div>
        )}

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
