"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Trophy,
  Brain,
  User,
} from "lucide-react";

interface BottomNavItem {
  href: string;
  label: string;
  labelKm: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bottomNavItems: BottomNavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    labelKm: "ទំព័រដើម",
    icon: Home,
  },
  {
    href: "/subjects",
    label: "Learn",
    labelKm: "រៀន",
    icon: BookOpen,
  },
  {
    href: "/practice",
    label: "Practice",
    labelKm: "លំហាត់",
    icon: Brain,
  },
  {
    href: "/progress",
    label: "Progress",
    labelKm: "វឌ្ឍនភាព",
    icon: Trophy,
  },
  {
    href: "/profile",
    label: "Profile",
    labelKm: "ប្រវត្តិរូប",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isKhmer } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "scale-110")} />
              <span className="truncate">
                {isKhmer ? item.labelKm : item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}