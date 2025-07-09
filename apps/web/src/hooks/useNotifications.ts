"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { markNotificationAsRead: socketMarkAsRead, markAllNotificationsAsRead: socketMarkAllAsRead } = useSocket();
  const fetchNotificationsRef = useRef<() => Promise<void>>();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update ref on every render to maintain fresh closure
  fetchNotificationsRef.current = fetchNotifications;

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        
        // Emit socket event
        socketMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [socketMarkAsRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        
        // Emit socket event
        socketMarkAllAsRead();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [socketMarkAllAsRead]);

  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications using ref
    const interval = setInterval(() => {
      fetchNotificationsRef.current?.();
    }, 30000); // Poll every 30 seconds

    // Listen for new notifications via custom event
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("new-notification", handleNewNotification as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener("new-notification", handleNewNotification as EventListener);
    };
  }, []); // Empty dependency array is now safe

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}