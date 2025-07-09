"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { getToken } = useAuth();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let initializeSocket = true;

    const initSocket = async () => {
      if (!initializeSocket || !mountedRef.current) return;

      const token = await getToken();
      if (!token || !mountedRef.current) return;

      // Cleanup existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        if (mountedRef.current) {
          console.log("Connected to notification server");
        }
      });

      socketRef.current.on("disconnect", () => {
        if (mountedRef.current) {
          console.log("Disconnected from notification server");
        }
      });

      socketRef.current.on("notification:new", (notification) => {
        if (!mountedRef.current) return;

        // Show browser notification if permission granted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/logo.png",
          });
        }

        // Trigger a custom event that components can listen to
        window.dispatchEvent(
          new CustomEvent("new-notification", { detail: notification })
        );
      });

      socketRef.current.on("connect_error", (error) => {
        if (mountedRef.current) {
          console.error("Socket connection error:", error);
        }
      });
    };

    initSocket();

    return () => {
      initializeSocket = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [getToken]);

  const markNotificationAsRead = (notificationId: string) => {
    if (socketRef.current && mountedRef.current) {
      socketRef.current.emit("notification:read", notificationId);
    }
  };

  const markAllNotificationsAsRead = () => {
    if (socketRef.current && mountedRef.current) {
      socketRef.current.emit("notification:read-all");
    }
  };

  return {
    socket: socketRef.current,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}