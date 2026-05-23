"use client";

import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, TrashIcon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, total, isDrawerOpen, closeDrawer, fetchCart, updateItemQuantity, removeItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // Only fetch if open and empty maybe, or just always fetch when opened
    if (isDrawerOpen) {
      fetchCart();
    }
  }, [isDrawerOpen, fetchCart]);

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="p-6 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="w-5 h-5" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
              <ShoppingCartIcon className="w-16 h-16 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={closeDrawer}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.publicId} className="flex gap-4 p-4 border rounded-lg bg-card shadow-sm">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.imageUrl || "https://placehold.co/100x100"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <h4 className="font-medium text-sm line-clamp-2">{item.productName}</h4>
                    {item.variantName && (
                      <span className="text-xs text-muted-foreground">{item.variantName}</span>
                    )}
                    <div className="text-sm font-semibold text-primary mt-1">
                      {formatCurrency(item.unitPrice, item.currencyCode)}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-secondary rounded-md px-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          disabled={item.quantity <= 1}
                          onClick={() => updateItemQuantity(item.publicId, item.quantity - 1)}
                        >
                          <MinusIcon className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updateItemQuantity(item.publicId, item.quantity + 1)}
                        >
                          <PlusIcon className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.publicId)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 pt-4 border-t bg-background flex-col gap-4">
            <div className="flex justify-between w-full font-semibold text-lg">
              <span>Subtotal</span>
              <span>{formatCurrency(total, items[0]?.currencyCode || "IDR")}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Shipping and taxes calculated at checkout.
            </p>
            <Button className="w-full h-12 text-lg" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
