"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = "ghost",
  size = "default",
  showLabel = true,
  className,
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: "en" as const, name: "English", flag: "🇬🇧" },
    { code: "km" as const, name: "ភាសាខ្មែរ", flag: "🇰🇭" },
  ];

  const currentLang = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn("gap-2", className)}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="hidden sm:inline">{currentLang?.name}</span>
              <span className="sm:hidden">{currentLang?.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="gap-2"
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}