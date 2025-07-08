"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  FileText,
  GraduationCap,
  Megaphone,
  Video,
  MessageSquare,
  Trophy,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any;
  };
  onMarkAsRead: (id: string) => void;
}

const notificationIcons: Record<string, any> = {
  ASSIGNMENT_CREATED: FileText,
  ASSIGNMENT_DUE_SOON: FileText,
  ASSIGNMENT_GRADED: GraduationCap,
  CLASS_ANNOUNCEMENT: Megaphone,
  LIVE_CLASS_STARTING: Video,
  NEW_MESSAGE: MessageSquare,
  ACHIEVEMENT_EARNED: Trophy,
  SUBSCRIPTION_EXPIRING: CreditCard,
  SYSTEM_ALERT: AlertCircle,
};

const notificationColors: Record<string, string> = {
  ASSIGNMENT_CREATED: "text-blue-600 bg-blue-100",
  ASSIGNMENT_DUE_SOON: "text-orange-600 bg-orange-100",
  ASSIGNMENT_GRADED: "text-green-600 bg-green-100",
  CLASS_ANNOUNCEMENT: "text-purple-600 bg-purple-100",
  LIVE_CLASS_STARTING: "text-red-600 bg-red-100",
  NEW_MESSAGE: "text-indigo-600 bg-indigo-100",
  ACHIEVEMENT_EARNED: "text-yellow-600 bg-yellow-100",
  SUBSCRIPTION_EXPIRING: "text-pink-600 bg-pink-100",
  SYSTEM_ALERT: "text-gray-600 bg-gray-100",
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type] || AlertCircle;
  const colorClass = notificationColors[notification.type] || "text-gray-600 bg-gray-100";

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data) {
      switch (notification.type) {
        case "ASSIGNMENT_CREATED":
        case "ASSIGNMENT_DUE_SOON":
          if (notification.data.assignmentId) {
            window.location.href = `/assignments/${notification.data.assignmentId}`;
          }
          break;
        case "ASSIGNMENT_GRADED":
          if (notification.data.submissionId) {
            window.location.href = `/assignments/${notification.data.assignmentId}/submission`;
          }
          break;
        case "CLASS_ANNOUNCEMENT":
          if (notification.data.classId) {
            window.location.href = `/classes/${notification.data.classId}`;
          }
          break;
        case "LIVE_CLASS_STARTING":
          if (notification.data.liveClassId) {
            window.location.href = `/live/${notification.data.classId}`;
          }
          break;
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
        !notification.read && "bg-blue-50/50"
      )}
      onClick={handleClick}
    >
      <div className={cn("p-2 rounded-full", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.read && "font-semibold")}>
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
      )}
    </div>
  );
}