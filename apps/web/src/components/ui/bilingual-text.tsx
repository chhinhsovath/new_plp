"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface BilingualTextProps {
  en: string;
  km: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showBoth?: boolean;
}

export function BilingualText({
  en,
  km,
  as: Component = "span",
  className,
  showBoth = false,
}: BilingualTextProps) {
  const { language, isKhmer } = useLanguage();

  if (showBoth) {
    return (
      <Component className={cn("space-y-1", className)}>
        <div className={cn(!isKhmer && "font-medium")}>{en}</div>
        <div className={cn("text-sm text-muted-foreground", isKhmer && "font-medium text-base text-foreground")}>
          {km}
        </div>
      </Component>
    );
  }

  const text = isKhmer ? km : en;

  return (
    <Component className={className}>
      {text}
    </Component>
  );
}

// Convenience components for common use cases
export function BilingualHeading({
  en,
  km,
  level = 1,
  className,
  showBoth = false,
}: BilingualTextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  const headingClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-semibold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  };

  return (
    <BilingualText
      en={en}
      km={km}
      as={Component}
      className={cn(headingClasses[level], className)}
      showBoth={showBoth}
    />
  );
}

export function BilingualLabel({
  en,
  km,
  className,
  htmlFor,
}: BilingualTextProps & { htmlFor?: string }) {
  const { isKhmer } = useLanguage();
  const text = isKhmer ? km : en;

  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium", className)}>
      {text}
    </label>
  );
}