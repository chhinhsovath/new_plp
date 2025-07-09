"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";

type UserRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

interface UserRoleContextType {
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isStudent: boolean;
  refetch: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async () => {
    if (!user || !isLoaded) return;
    
    setLoading(true);
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUserRole(response.data.role as UserRole);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoading(false);
    }
  }, [user, isLoaded]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const contextValue = useMemo(() => ({
    userRole,
    loading,
    isAdmin: userRole === "ADMIN",
    isTeacher: userRole === "TEACHER",
    isParent: userRole === "PARENT",
    isStudent: userRole === "STUDENT",
    refetch: fetchUserRole,
  }), [userRole, loading, fetchUserRole]);

  return (
    <UserRoleContext.Provider value={contextValue}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}