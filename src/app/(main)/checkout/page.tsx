"use client";

import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { paymentService } from "@/services/payment-service";
import Script from "next/script";

export default function CheckoutPage() {
  const { items, total, checkout, fetchCart } = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const fetchPaymentWithRetry = async (orderId: string, retries = 5, delay = 1000): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const payment = await paymentService.getPaymentByOrder(orderId);
        if (payment && payment.snapToken) {
          return payment;
        }
      } catch (err) {
        console.warn(`Attempt ${i + 1} to fetch payment failed:`, err);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    throw new Error("Payment initialization timed out. You can complete payment from your Orders page.");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);
    const result = await checkout();
    if (result.success && result.orderId) {
      try {
        // Wait for RabbitMQ event processing & payment generation
        const payment = await fetchPaymentWithRetry(result.orderId);
        if (payment && payment.snapToken) {
          // @ts-ignore
          window.snap.pay(payment.snapToken, {
            onSuccess: function (res: any) {
              console.log("checkout payment success", res);
              setOrderSuccess(result.orderId || "success");
            },
            onPending: function (res: any) {
              console.log("checkout payment pending", res);
              setOrderSuccess(result.orderId || "success");
            },
            onError: function (res: any) {
              console.error("checkout payment error", res);
              setError("Payment transaction failed. You can retry from My Orders.");
              setOrderSuccess(result.orderId || "success"); // Show success screen anyway so they know the order is placed
            },
            onClose: function () {
              console.log("customer closed snap popup at checkout");
              setOrderSuccess(result.orderId || "success"); // Show success screen so they can pay from orders page
            }
          });
        } else {
          setOrderSuccess(result.orderId || "success");
        }
      } catch (err: any) {
        console.error("Failed to fetch payment at checkout", err);
        setError(err.message || "Failed to initiate payment. You can pay from My Orders.");
        setOrderSuccess(result.orderId || "success"); // Still show order success
      }
    } else {
      setError(result.error || "Failed to process checkout");
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-muted/20 flex items-center justify-center">
        <div className="max-w-md w-full bg-card p-10 rounded-[2rem] border shadow-2xl shadow-primary/5 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold">Order Placed!</h2>
          <p className="text-muted-foreground">
            Your order has been successfully initiated. Order ID: <br/>
            <span className="font-mono text-xs mt-2 block">{orderSuccess}</span>
          </p>
          <div className="pt-6 border-t border-border/50">
            <Button className="w-full" onClick={() => router.push("/account/orders")}>
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background flex flex-col items-center justify-center text-center space-y-6">
        <h2 className="text-3xl font-bold">Your Cart is Empty</h2>
        <p className="text-muted-foreground">Add some delicious snacks to proceed to checkout.</p>
        <Button onClick={() => router.push("/shop")}>Return to Shop</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-muted/10">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-r24mD6a4g9sE_FhL"
        strategy="lazyOnload"
      />
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Checkout</h1>
              <p className="text-muted-foreground">Review your items and place your order.</p>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div className="bg-card rounded-[2rem] p-8 border shadow-sm space-y-6">
              <h3 className="text-xl font-bold border-b pb-4">Order Items</h3>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.publicId} className="flex gap-6 items-center">
                    <div className="w-24 h-24 bg-muted rounded-2xl relative overflow-hidden shrink-0">
                      <Image
                        src={item.imageUrl || "https://placehold.co/150x150"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{item.productName}</h4>
                      {item.variantName && (
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                      )}
                      <p className="text-primary font-bold mt-1">
                        {formatCurrency(item.unitPrice, item.currencyCode)} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-black text-lg">
                      {formatCurrency(item.unitPrice * item.quantity, item.currencyCode)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Method / Address Placeholder */}
            <div className="bg-card rounded-[2rem] p-8 border shadow-sm space-y-6">
              <h3 className="text-xl font-bold border-b pb-4">Shipping Information</h3>
              <p className="text-muted-foreground text-sm">
                Shipping details will be integrated with the Address Service in future iterations.
                For now, placing this order will trigger the downstream order flow.
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-[2rem] p-8 border shadow-lg shadow-primary/5 sticky top-32 space-y-8">
              <h3 className="text-xl font-bold">Order Summary</h3>
              
              <div className="space-y-4 text-sm font-medium border-b pb-6 border-border/50">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatCurrency(total, items[0]?.currencyCode || "IDR")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>Calculated later</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="text-3xl font-black text-primary">
                  {formatCurrency(total, items[0]?.currencyCode || "IDR")}
                </span>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                <ShieldCheck size={16} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
