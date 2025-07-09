"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Home, Trophy, Users, Menu, Shield, Video, Library, GraduationCap, FileQuestion, Award } from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserRole } from "@/contexts/UserRoleContext";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PointsDisplay } from "@/components/gamification/PointsDisplay";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const { t } = useLanguage();
  const { userRole, isAdmin, isTeacher, isParent, isStudent } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">PLP</span>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Home className="inline-block w-4 h-4 mr-1" />
                  {t("nav.dashboard")}
                </Link>
                <Link
                  href="/subjects"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <BookOpen className="inline-block w-4 h-4 mr-1" />
                  {t("nav.subjects")}
                </Link>
                <Link
                  href="/progress"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Trophy className="inline-block w-4 h-4 mr-1" />
                  {t("nav.progress")}
                </Link>
                <Link
                  href="/videos"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Video className="inline-block w-4 h-4 mr-1" />
                  {t("nav.videos")}
                </Link>
                <Link
                  href="/library"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Library className="inline-block w-4 h-4 mr-1" />
                  {t("nav.library")}
                </Link>
                <Link
                  href="/forum"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Users className="inline-block w-4 h-4 mr-1" />
                  {t("nav.forum")}
                </Link>
                {isTeacher && (
                  <>
                    <Link
                      href="/teacher/dashboard"
                      className="text-sm font-medium text-gray-700 hover:text-primary"
                    >
                      <GraduationCap className="inline-block w-4 h-4 mr-1" />
                      {t("nav.teacherDashboard")}
                    </Link>
                    <Link
                      href="/professional-development"
                      className="text-sm font-medium text-gray-700 hover:text-primary"
                    >
                      <GraduationCap className="inline-block w-4 h-4 mr-1" />
                      PD
                    </Link>
                  </>
                )}
                {isParent && (
                  <Link
                    href="/parent/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    <Users className="inline-block w-4 h-4 mr-1" />
                    {t("nav.parentDashboard")}
                  </Link>
                )}
                {(isStudent || isTeacher) && (
                  <Link
                    href="/assessments"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    <FileQuestion className="inline-block w-4 h-4 mr-1" />
                    Tests
                  </Link>
                )}
                <Link
                  href="/practice"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Brain className="inline-block w-4 h-4 mr-1" />
                  Practice
                </Link>
                <Link
                  href="/achievements"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Award className="inline-block w-4 h-4 mr-1" />
                  {t("nav.achievements")}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    <Shield className="inline-block w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher variant="ghost" size="sm" showLabel={false} className="hidden sm:flex" />
            {isSignedIn ? (
              <>
                <PointsDisplay variant="compact" className="hidden md:flex" />
                <span className="hidden lg:block text-sm text-gray-600">
                  Hi, {user?.firstName}!
                </span>
                <NotificationBell className="hidden sm:block" />
                <UserButton afterSignOutUrl="/" />
                <MobileNav />
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Button asChild variant="ghost">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </div>
                <button
                  className="sm:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu for non-authenticated users */}
        {mobileMenuOpen && !isSignedIn && (
          <div className="sm:hidden py-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Dashboard
            </Link>
            <Link
              href="/subjects"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Subjects
            </Link>
            <Link
              href="/progress"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Progress
            </Link>
            <Link
              href="/videos"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Videos
            </Link>
            <Link
              href="/library"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Library
            </Link>
            <Link
              href="/forum"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Forum
            </Link>
            {isTeacher && (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                >
                  Teacher Dashboard
                </Link>
                <Link
                  href="/professional-development"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                >
                  Professional Development
                </Link>
              </>
            )}
            {isParent && (
              <Link
                href="/parent/dashboard"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Parent Dashboard
              </Link>
            )}
            {(isStudent || isTeacher) && (
              <Link
                href="/assessments"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Assessments
              </Link>
            )}
            <Link
              href="/practice"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Practice
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
              >
                Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}