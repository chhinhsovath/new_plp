"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken();
      if (!token) return;

      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: {
          token,
        },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to notification server");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from notification server");
      });

      socketRef.current.on("notification:new", (notification) => {
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
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [getToken]);

  const markNotificationAsRead = (notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("notification:read", notificationId);
    }
  };

  const markAllNotificationsAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit("notification:read-all");
    }
  };

  return {
    socket: socketRef.current,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}