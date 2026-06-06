"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Order, orderService } from "@/services/order-service";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { paymentService } from "@/services/payment-service";
import Script from "next/script";

const STATUS_CONFIGS: Record<
  string,
  { color: string; icon: any; label: string }
> = {
  pending: {
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
    label: "Pending",
  },
  awaiting_payment: {
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    icon: CreditCard,
    label: "Awaiting Payment",
  },
  processing: {
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    icon: Truck,
    label: "Shipped",
  },
  completed: {
    color: "text-green-500 bg-green-500/10 border-green-500/20",
    icon: CheckCircle,
    label: "Completed",
  },
  cancelled: {
    color: "text-destructive bg-destructive/10 border-destructive/20",
    icon: XCircle,
    label: "Cancelled",
  },
  refunded: {
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: ArrowLeft,
    label: "Refunded",
  },
};

const getStatusConfig = (status: string) => {
  const normalized = status.toLowerCase();
  return (
    STATUS_CONFIGS[normalized] || {
      color: "text-muted-foreground bg-muted border-border",
      icon: Package,
      label: status,
    }
  );
};

const PAYMENT_STATUS_CONFIGS: Record<string, string> = {
  paid: "text-green-500 bg-green-500/10 border-green-500/20",
  failed: "text-destructive bg-destructive/10 border-destructive/20",
};

const getPaymentStatusConfig = (status: string) => {
  return (
    PAYMENT_STATUS_CONFIGS[status.toLowerCase()] ||
    "text-amber-500 bg-amber-500/10 border-amber-500/20"
  );
};

const formatStatusLabel = (status: string) => {
  if (status === "all") return "All";
  if (status === "awaiting_payment") return "Awaiting Payment";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100 },
  },
};

interface OrderListSectionProps {
  orders: Order[];
  filteredOrders: Order[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onSelectOrder: (order: Order) => void;
  onBrowseSnacks: () => void;
}

function OrderListSection({
  orders,
  filteredOrders,
  statusFilter,
  setStatusFilter,
  onSelectOrder,
  onBrowseSnacks,
}: Readonly<OrderListSectionProps>) {
  return (
    <motion.div
      key="list"
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={containerVariants}
      className="space-y-8"
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight font-heading">
            My Orders
          </h1>
          <p className="text-muted-foreground text-sm">
            Track your transactions and purchase histories.
          </p>
        </div>

        {/* Status Filter Container - Premium SaaS Style */}
        <div className="bg-card/30 backdrop-blur-md border border-border/80 rounded-2xl p-1.5 flex overflow-x-auto gap-1 scrollbar-none shadow-sm max-w-full">
          {[
            "all",
            "pending",
            "awaiting_payment",
            "processing",
            "shipped",
            "completed",
            "cancelled",
            "refunded",
          ].map((status) => {
            const isActive = statusFilter === status;
            let count = 0;
            if (status === "all") {
              count = orders.length;
            } else {
              count = orders.filter(
                (o) => o.status.toLowerCase() === status.toLowerCase(),
              ).length;
            }

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border select-none ${
                  isActive
                    ? "bg-background text-foreground border-border shadow-sm font-bold"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span>{formatStatusLabel(status)}</span>
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-16 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              {orders.length === 0 ? "No Orders Placed Yet" : "No Orders Found"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {orders.length === 0
                ? "Once you make your first purchase at the shop, your order details will appear here."
                : "No orders match the selected filter criteria."}
            </p>
          </div>
          {orders.length === 0 ? (
            <Button
              size="lg"
              className="rounded-xl px-8"
              onClick={onBrowseSnacks}
            >
              Browse Snacks
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-8"
              onClick={() => setStatusFilter("all")}
            >
              Clear Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusConfig(order.status);
            const StatusIcon = statusInfo.icon;
            const formattedDate = format(
              new Date(order.createdAt),
              "dd MMM yyyy, HH:mm",
            );

            return (
              <motion.div
                key={order.publicId}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
                }}
                onClick={() => onSelectOrder(order)}
                className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 cursor-pointer shadow-sm hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color} flex items-center gap-1.5`}
                    >
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar size={12} />
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-4 overflow-hidden py-1">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={`${item.productPublicId}-${item.variantPublicId || "default"}`}
                          className="relative w-12 h-12 rounded-xl border-2 border-background bg-muted overflow-hidden shrink-0"
                        >
                          <Image
                            src={
                              item.imageUrl || "https://placehold.co/150x150"
                            }
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-xl border-2 border-background bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm max-w-xs md:max-w-md truncate">
                        {order.items.map((i) => i.productName).join(", ")}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                        items • Code: {order.publicId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted-foreground font-semibold block">
                      Total Bill
                    </span>
                    <span className="text-2xl font-black text-primary font-heading">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </span>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground/60 hidden md:block group-hover:text-primary group-hover:translate-x-1 transition-all"
                    size={20}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

interface OrderDetailSectionProps {
  selectedOrder: Order;
  onBack: () => void;
  onPay: (order: Order) => void;
  isPaying: boolean;
}

function OrderDetailSection({
  selectedOrder,
  onBack,
  onPay,
  isPaying,
}: Readonly<OrderDetailSectionProps>) {
  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group mb-6"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to My Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-heading tracking-tight">
            Order Details
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            ID: {selectedOrder.publicId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusConfig(selectedOrder.status).color} flex items-center gap-1.5`}
          >
            {(() => {
              const info = getStatusConfig(selectedOrder.status);
              const Icon = info.icon;
              return (
                <>
                  <Icon size={14} />
                  {info.label}
                </>
              );
            })()}
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getPaymentStatusConfig(selectedOrder.paymentStatus)}`}
          >
            Payment: {selectedOrder.paymentStatus.toUpperCase()}
          </span>
          {selectedOrder.paymentStatus.toLowerCase() !== "paid" &&
            selectedOrder.paymentStatus.toLowerCase() !== "refunded" &&
            selectedOrder.status.toLowerCase() !== "cancelled" && (
              <Button
                size="sm"
                onClick={() => onPay(selectedOrder)}
                disabled={isPaying}
                className="rounded-full px-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isPaying ? "Processing..." : "Pay Now"}
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items & Status History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              Purchased Items
            </h3>
            <div className="divide-y divide-border/50">
              {selectedOrder.items.map((item) => (
                <div
                  key={`${item.productPublicId}-${item.variantPublicId || "default"}`}
                  className="flex gap-6 py-6 first:pt-0 last:pb-0 items-center"
                >
                  <div className="w-20 h-20 bg-muted rounded-2xl relative overflow-hidden shrink-0">
                    <Image
                      src={item.imageUrl || "https://placehold.co/150x150"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-lg truncate">
                      {item.productName}
                    </h4>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-primary font-bold mt-1">
                      {formatCurrency(
                        item.unitPrice,
                        selectedOrder.currencyCode,
                      )}{" "}
                      x {item.quantity}
                    </p>
                  </div>
                  <div className="font-black text-lg shrink-0">
                    {formatCurrency(
                      item.unitPrice * item.quantity,
                      selectedOrder.currencyCode,
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          {selectedOrder.shippingAddress && (
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Delivery Destination
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm font-semibold">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wide">
                    Recipient
                  </span>
                  <p className="text-base font-extrabold">
                    {selectedOrder.shippingAddress.recipientName}
                  </p>
                  <p className="text-muted-foreground font-medium">
                    {selectedOrder.shippingAddress.phoneNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wide">
                    Address
                  </span>
                  <p className="font-medium text-foreground">
                    {selectedOrder.shippingAddress.streetAddress}
                  </p>
                  <p className="text-muted-foreground font-medium">
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state},{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary & Shipping Details */}
        <div className="lg:col-span-1 space-y-8">
          {/* Financial Summary */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Transaction Summary</h3>
            <div className="space-y-4 text-sm font-semibold border-b pb-6 border-border/50">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(
                    selectedOrder.subtotal,
                    selectedOrder.currencyCode,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Cost</span>
                <span>
                  {formatCurrency(
                    selectedOrder.shippingAmount,
                    selectedOrder.currencyCode,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>VAT (11%)</span>
                <span>
                  {formatCurrency(
                    selectedOrder.taxAmount,
                    selectedOrder.currencyCode,
                  )}
                </span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discounts</span>
                  <span>
                    -
                    {formatCurrency(
                      selectedOrder.discountAmount,
                      selectedOrder.currencyCode,
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-end">
              <span className="font-bold text-base">Total Pay</span>
              <span className="text-2xl font-black text-primary font-heading">
                {formatCurrency(
                  selectedOrder.totalAmount,
                  selectedOrder.currencyCode,
                )}
              </span>
            </div>
          </div>

          {/* Shipping & Payment Method details */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-sm space-y-6 text-sm font-semibold">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Fulfillment Logs
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard
                  className="text-muted-foreground mt-0.5"
                  size={16}
                />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground block">
                    Payment Method
                  </span>
                  <span>
                    {selectedOrder.paymentMethod
                      ? selectedOrder.paymentMethod.toUpperCase()
                      : "N/A"}
                  </span>
                  {selectedOrder.paymentReference && (
                    <span className="text-xs font-mono text-muted-foreground block mt-0.5">
                      Ref: {selectedOrder.paymentReference}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="text-muted-foreground mt-0.5" size={16} />
                <div className="space-y-0.5">
                  <span className="text-xs text-muted-foreground block">
                    Courier Delivery
                  </span>
                  <span>
                    {selectedOrder.shippingCourier
                      ? selectedOrder.shippingCourier.toUpperCase()
                      : "N/A"}{" "}
                    • {selectedOrder.shippingService}
                  </span>
                  {selectedOrder.shippingTrackingNumber ? (
                    <span className="text-xs font-mono text-primary block mt-1">
                      AWB: {selectedOrder.shippingTrackingNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Awaiting tracking number...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const { user, isHydrated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: orderService.getOrders,
    enabled: isHydrated && !!user,
  });

  const handlePay = async (order: Order) => {
    setIsPaying(true);
    try {
      const payment = await paymentService.getPaymentByOrder(order.publicId);
      if (payment && payment.snapToken) {
        // @ts-ignore
        window.snap.pay(payment.snapToken, {
          onSuccess: function (result: any) {
            console.log("payment success", result);
            refetch();
            setSelectedOrder((prev) =>
              prev ? { ...prev, paymentStatus: "paid", status: "processing" } : null
            );
          },
          onPending: function (result: any) {
            console.log("payment pending", result);
            refetch();
          },
          onError: function (result: any) {
            console.error("payment error", result);
            alert("Payment failed or was declined.");
          },
          onClose: function () {
            console.log("customer closed the popup without finishing the payment");
          },
        });
      } else {
        alert("Failed to retrieve payment Snap token.");
      }
    } catch (err) {
      console.error("Failed to pay", err);
      alert("Error initiating payment checkout.");
    } finally {
      setIsPaying(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase(),
  );

  if (!isHydrated) return null;
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-32 text-center space-y-6">
        <h2 className="text-3xl font-bold">Please Sign In</h2>
        <p className="text-muted-foreground">
          Sign in to your account to view your order history.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-24 space-y-8">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
               key={`order-skeleton-${i}`}
              className="h-44 w-full bg-muted/50 border border-border animate-pulse rounded-3xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-6 py-32 text-center space-y-6">
        <XCircle className="mx-auto text-destructive" size={48} />
        <h2 className="text-3xl font-bold">Failed to load orders</h2>
        <p className="text-muted-foreground">
          There was an error communicating with the order service.
        </p>
        <Button onClick={() => globalThis.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-6 py-24 min-h-screen">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-r24mD6a4g9sE_FhL"
        strategy="lazyOnload"
      />
      <AnimatePresence mode="wait">
        {selectedOrder === null ? (
          <OrderListSection
            orders={orders}
            filteredOrders={filteredOrders}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSelectOrder={setSelectedOrder}
            onBrowseSnacks={() => router.push("/shop")}
          />
        ) : (
          <OrderDetailSection
            selectedOrder={selectedOrder}
            onBack={() => setSelectedOrder(null)}
            onPay={handlePay}
            isPaying={isPaying}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
