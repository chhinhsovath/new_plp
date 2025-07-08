"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  FileText, 
  GraduationCap, 
  Megaphone, 
  Video, 
  Trophy,
  Send,
  Loader2
} from "lucide-react";
import { NotificationService, NotificationTriggers } from "@/lib/notifications";

export default function NotificationDemoPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const simulateNotification = async (type: string) => {
    setLoading(type);
    setSuccess(null);

    try {
      // In a real app, these would be triggered by actual events
      switch (type) {
        case "assignment":
          // Simulate assignment creation notification
          await fetch("/api/demo/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ASSIGNMENT_CREATED",
              title: "New Assignment",
              message: "New assignment 'Math Homework Chapter 5' has been posted",
            }),
          });
          break;

        case "grade":
          await fetch("/api/demo/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ASSIGNMENT_GRADED",
              title: "Assignment Graded",
              message: "Your submission for 'Science Quiz' has been graded: 95%",
            }),
          });
          break;

        case "announcement":
          await fetch("/api/demo/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "CLASS_ANNOUNCEMENT",
              title: "Class Announcement",
              message: "Important: Class schedule changed for next week",
            }),
          });
          break;

        case "live":
          await fetch("/api/demo/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "LIVE_CLASS_STARTING",
              title: "Live Class Starting",
              message: "English Grammar class is starting in 5 minutes",
            }),
          });
          break;

        case "achievement":
          await fetch("/api/demo/notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "ACHIEVEMENT_EARNED",
              title: "Achievement Unlocked!",
              message: "You've earned the 'Perfect Week' achievement",
            }),
          });
          break;
      }

      setSuccess(type);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setLoading(null);
    }
  };

  const notificationTypes = [
    {
      type: "assignment",
      icon: FileText,
      title: "New Assignment",
      description: "Simulate a new assignment notification",
      color: "text-blue-600 bg-blue-100",
    },
    {
      type: "grade",
      icon: GraduationCap,
      title: "Assignment Graded",
      description: "Simulate a graded assignment notification",
      color: "text-green-600 bg-green-100",
    },
    {
      type: "announcement",
      icon: Megaphone,
      title: "Class Announcement",
      description: "Simulate a class announcement",
      color: "text-purple-600 bg-purple-100",
    },
    {
      type: "live",
      icon: Video,
      title: "Live Class Starting",
      description: "Simulate a live class reminder",
      color: "text-red-600 bg-red-100",
    },
    {
      type: "achievement",
      icon: Trophy,
      title: "Achievement Earned",
      description: "Simulate earning an achievement",
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Notification System Demo</h1>
        <p className="text-gray-600">
          Test the real-time notification system by triggering different notification types
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Click any button below to simulate a notification. You'll see it appear in the notification bell in the navigation bar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Notifications appear instantly in the bell icon</p>
            <p>• Browser notifications work if you grant permission</p>
            <p>• Unread count updates automatically</p>
            <p>• Click notifications to mark them as read</p>
            <p>• All notifications sync across your devices in real-time</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notificationTypes.map((notification) => {
          const Icon = notification.icon;
          const isLoading = loading === notification.type;
          const isSuccess = success === notification.type;

          return (
            <Card key={notification.type} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${notification.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{notification.title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {notification.description}
                </p>
                <Button
                  onClick={() => simulateNotification(notification.type)}
                  disabled={isLoading}
                  className="w-full"
                  variant={isSuccess ? "default" : "outline"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : isSuccess ? (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </CardContent>
              {isSuccess && (
                <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Browser Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              if ("Notification" in window) {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                  new Notification("Test Notification", {
                    body: "Browser notifications are now enabled!",
                    icon: "/logo.png",
                  });
                }
              }
            }}
          >
            Enable Browser Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}