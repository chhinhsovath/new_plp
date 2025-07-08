"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Trophy, Users, Menu, Shield } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSignedIn && user) {
        try {
          const response = await fetch("/api/user/current");
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.role === "ADMIN");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        }
      }
    };
    
    checkAdminStatus();
  }, [isSignedIn, user]);

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PLP</span>
            </Link>

            {isSignedIn && (
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Home className="inline-block w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <Link
                  href="/subjects"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <BookOpen className="inline-block w-4 h-4 mr-1" />
                  Subjects
                </Link>
                <Link
                  href="/progress"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Trophy className="inline-block w-4 h-4 mr-1" />
                  Progress
                </Link>
                <Link
                  href="/forum"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  <Users className="inline-block w-4 h-4 mr-1" />
                  Forum
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

          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <span className="hidden md:block text-sm text-gray-600">
                  Hi, {user?.firstName}!
                </span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </div>
            )}

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isSignedIn && (
          <div className="md:hidden py-4 space-y-2">
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
              href="/forum"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Forum
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