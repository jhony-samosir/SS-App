import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-16">
      <AuthGuard>
        {children}
      </AuthGuard>
    </div>
  );
}
