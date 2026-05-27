import { SellerSidebar } from "@/components/seller/SellerSidebar";
import { SellerGuard } from "@/components/auth/SellerGuard";

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
      <SellerSidebar />
      <div className="grow flex flex-col min-w-0">
        <main className="grow p-8 lg:p-12 overflow-y-auto bg-muted/5">
          <SellerGuard>
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </SellerGuard>
        </main>
      </div>
    </div>
  );
}
