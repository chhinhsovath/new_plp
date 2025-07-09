"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { BilingualText } from "@/components/ui/bilingual-text";
import {
  Home,
  BookOpen,
  Trophy,
  Video,
  Library,
  Users,
  Brain,
  GraduationCap,
  FileQuestion,
  Shield,
  Menu,
  X,
  ChevronRight,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  labelKm: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    labelKm: "ផ្ទាំងគ្រប់គ្រង",
    icon: Home,
  },
  {
    href: "/subjects",
    label: "Subjects",
    labelKm: "មុខវិជ្ជា",
    icon: BookOpen,
  },
  {
    href: "/progress",
    label: "Progress",
    labelKm: "វឌ្ឍនភាព",
    icon: Trophy,
  },
  {
    href: "/videos",
    label: "Videos",
    labelKm: "វីដេអូ",
    icon: Video,
  },
  {
    href: "/library",
    label: "Library",
    labelKm: "បណ្ណាល័យ",
    icon: Library,
  },
  {
    href: "/forum",
    label: "Forum",
    labelKm: "វេទិកា",
    icon: Users,
  },
  {
    href: "/practice",
    label: "Practice",
    labelKm: "លំហាត់",
    icon: Brain,
  },
  {
    href: "/teacher/dashboard",
    label: "Teacher",
    labelKm: "គ្រូ",
    icon: GraduationCap,
    roles: ["TEACHER"],
  },
  {
    href: "/parent/dashboard",
    label: "Parent",
    labelKm: "មាតាបិតា",
    icon: Users,
    roles: ["PARENT"],
  },
  {
    href: "/professional-development",
    label: "PD",
    labelKm: "PD",
    icon: GraduationCap,
    roles: ["TEACHER"],
  },
  {
    href: "/assessments",
    label: "Tests",
    labelKm: "ការធ្វើតេស្ត",
    icon: FileQuestion,
    roles: ["STUDENT", "TEACHER"],
  },
  {
    href: "/admin",
    label: "Admin",
    labelKm: "Admin",
    icon: Shield,
    roles: ["ADMIN"],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isKhmer } = useLanguage();
  const { userRole } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-left">
            <BilingualText en="Menu" km="ម៉ឺនុយ" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User info */}
          {user && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.firstName}</p>
                  <p className="text-sm text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">
                    {isKhmer ? item.labelKm : item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Bottom actions */}
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-5 w-5 mr-3" />
              <BilingualText en="Settings" km="ការកំណត់" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={() => setIsOpen(false)}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <BilingualText en="Logout" km="ចាកចេញ" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}