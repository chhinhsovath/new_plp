"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { 
  formatKhmerDate, 
  formatKhmerTime, 
  formatKhmerRelativeTime 
} from "@/lib/khmer-utils";
import { format, formatDistanceToNow } from "date-fns";
import { km } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FormattedDateProps {
  date: Date | string;
  format?: "short" | "long" | "full" | "relative" | "time";
  showTime?: boolean;
  className?: string;
}

export function FormattedDate({
  date: dateProp,
  format: formatType = "short",
  showTime = false,
  className,
}: FormattedDateProps) {
  const { isKhmer } = useLanguage();
  const date = typeof dateProp === "string" ? new Date(dateProp) : dateProp;

  let formatted: string;

  if (isKhmer) {
    switch (formatType) {
      case "relative":
        formatted = formatKhmerRelativeTime(date);
        break;
      case "time":
        formatted = formatKhmerTime(date);
        break;
      default:
        formatted = formatKhmerDate(date, formatType);
        if (showTime) {
          formatted += ` ${formatKhmerTime(date)}`;
        }
    }
  } else {
    switch (formatType) {
      case "short":
        formatted = format(date, "MM/dd/yyyy");
        break;
      case "long":
        formatted = format(date, "MMMM d, yyyy");
        break;
      case "full":
        formatted = format(date, "EEEE, MMMM d, yyyy");
        break;
      case "relative":
        formatted = formatDistanceToNow(date, { addSuffix: true });
        break;
      case "time":
        formatted = format(date, "h:mm a");
        break;
      default:
        formatted = format(date, "MM/dd/yyyy");
    }

    if (showTime && formatType !== "time") {
      formatted += ` at ${format(date, "h:mm a")}`;
    }
  }

  return <span className={className}>{formatted}</span>;
}