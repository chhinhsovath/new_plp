/**
 * Khmer language utilities for number and date formatting
 */

// Khmer numerals mapping
const khmerNumerals: Record<string, string> = {
  "0": "០",
  "1": "១",
  "2": "២",
  "3": "៣",
  "4": "៤",
  "5": "៥",
  "6": "៦",
  "7": "៧",
  "8": "៨",
  "9": "៩",
};

// Convert Arabic numerals to Khmer numerals
export function toKhmerNumeral(num: number | string): string {
  return num
    .toString()
    .split("")
    .map((digit) => khmerNumerals[digit] || digit)
    .join("");
}

// Format number with Khmer numerals and separators
export function formatKhmerNumber(num: number, decimals = 0): string {
  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return toKhmerNumeral(formatted);
}

// Khmer month names
const khmerMonths = [
  "មករា",      // January
  "កុម្ភៈ",     // February
  "មីនា",      // March
  "មេសា",      // April
  "ឧសភា",      // May
  "មិថុនា",     // June
  "កក្កដា",     // July
  "សីហា",      // August
  "កញ្ញា",      // September
  "តុលា",      // October
  "វិច្ឆិកា",   // November
  "ធ្នូ",       // December
];

// Khmer day names
const khmerDays = [
  "អាទិត្យ",    // Sunday
  "ច័ន្ទ",      // Monday
  "អង្គារ",     // Tuesday
  "ពុធ",        // Wednesday
  "ព្រហស្បតិ៍", // Thursday
  "សុក្រ",      // Friday
  "សៅរ៍",       // Saturday
];

// Format date in Khmer
export function formatKhmerDate(date: Date, format: "short" | "long" | "full" = "short"): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dayOfWeek = date.getDay();

  switch (format) {
    case "short":
      // DD/MM/YYYY in Khmer numerals
      return `${toKhmerNumeral(day)}/${toKhmerNumeral(month + 1)}/${toKhmerNumeral(year)}`;
    
    case "long":
      // DD Month YYYY in Khmer
      return `${toKhmerNumeral(day)} ${khmerMonths[month]} ${toKhmerNumeral(year)}`;
    
    case "full":
      // DayName, DD Month YYYY in Khmer
      return `${khmerDays[dayOfWeek]}, ${toKhmerNumeral(day)} ${khmerMonths[month]} ${toKhmerNumeral(year)}`;
    
    default:
      return formatKhmerDate(date, "short");
  }
}

// Format time in Khmer
export function formatKhmerTime(date: Date, format: "12h" | "24h" = "12h"): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (format === "24h") {
    return `${toKhmerNumeral(hours.toString().padStart(2, "0"))}:${toKhmerNumeral(
      minutes.toString().padStart(2, "0")
    )}`;
  }

  const period = hours >= 12 ? "ល្ងាច" : "ព្រឹក";
  const displayHours = hours % 12 || 12;
  
  return `${toKhmerNumeral(displayHours)}:${toKhmerNumeral(
    minutes.toString().padStart(2, "0")
  )} ${period}`;
}

// Format relative time in Khmer
export function formatKhmerRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "មុននេះបន្តិច";
  } else if (diffMinutes < 60) {
    return `${toKhmerNumeral(diffMinutes)} នាទីមុន`;
  } else if (diffHours < 24) {
    return `${toKhmerNumeral(diffHours)} ម៉ោងមុន`;
  } else if (diffDays < 7) {
    return `${toKhmerNumeral(diffDays)} ថ្ងៃមុន`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${toKhmerNumeral(weeks)} សប្តាហ៍មុន`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${toKhmerNumeral(months)} ខែមុន`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${toKhmerNumeral(years)} ឆ្នាំមុន`;
  }
}

// Format percentage in Khmer
export function formatKhmerPercentage(value: number, decimals = 0): string {
  return `${formatKhmerNumber(value, decimals)}%`;
}

// Format currency in Khmer (Riel)
export function formatKhmerCurrency(amount: number, currency: "KHR" | "USD" = "KHR"): string {
  if (currency === "USD") {
    return `$${formatKhmerNumber(amount, 2)}`;
  }
  
  // For KHR (Cambodian Riel)
  return `${formatKhmerNumber(amount)}៛`;
}

// Grade level formatter
export function formatKhmerGrade(grade: number): string {
  return `ថ្នាក់ទី${toKhmerNumeral(grade)}`;
}

// Ordinal numbers in Khmer
export function formatKhmerOrdinal(num: number): string {
  return `ទី${toKhmerNumeral(num)}`;
}

// Duration formatter (for time spent studying)
export function formatKhmerDuration(minutes: number): string {
  if (minutes < 60) {
    return `${toKhmerNumeral(minutes)} នាទី`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${toKhmerNumeral(hours)} ម៉ោង`;
  }
  
  return `${toKhmerNumeral(hours)} ម៉ោង ${toKhmerNumeral(remainingMinutes)} នាទី`;
}