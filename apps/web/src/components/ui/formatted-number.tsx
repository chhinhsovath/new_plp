"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { 
  formatKhmerNumber, 
  formatKhmerPercentage, 
  formatKhmerCurrency,
  formatKhmerDuration,
  formatKhmerGrade,
  formatKhmerOrdinal 
} from "@/lib/khmer-utils";
import { cn } from "@/lib/utils";

interface FormattedNumberProps {
  value: number;
  type?: "number" | "percentage" | "currency" | "duration" | "grade" | "ordinal";
  decimals?: number;
  currency?: "KHR" | "USD";
  className?: string;
}

export function FormattedNumber({
  value,
  type = "number",
  decimals = 0,
  currency = "KHR",
  className,
}: FormattedNumberProps) {
  const { isKhmer } = useLanguage();

  let formatted: string;

  if (isKhmer) {
    switch (type) {
      case "percentage":
        formatted = formatKhmerPercentage(value, decimals);
        break;
      case "currency":
        formatted = formatKhmerCurrency(value, currency);
        break;
      case "duration":
        formatted = formatKhmerDuration(value);
        break;
      case "grade":
        formatted = formatKhmerGrade(value);
        break;
      case "ordinal":
        formatted = formatKhmerOrdinal(value);
        break;
      default:
        formatted = formatKhmerNumber(value, decimals);
    }
  } else {
    switch (type) {
      case "percentage":
        formatted = `${value.toFixed(decimals)}%`;
        break;
      case "currency":
        if (currency === "USD") {
          formatted = `$${value.toFixed(2)}`;
        } else {
          formatted = `${value.toLocaleString()} KHR`;
        }
        break;
      case "duration":
        if (value < 60) {
          formatted = `${value} minutes`;
        } else {
          const hours = Math.floor(value / 60);
          const minutes = value % 60;
          formatted = minutes > 0 
            ? `${hours}h ${minutes}m` 
            : `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        break;
      case "grade":
        formatted = `Grade ${value}`;
        break;
      case "ordinal":
        const suffix = ["th", "st", "nd", "rd"][value % 10 > 3 ? 0 : value % 10];
        formatted = `${value}${suffix}`;
        break;
      default:
        formatted = value.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  }

  return <span className={className}>{formatted}</span>;
}