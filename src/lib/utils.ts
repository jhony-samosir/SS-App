import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount);
}
