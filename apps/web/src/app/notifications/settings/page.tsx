"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Bell, Smartphone, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationPreferences {
  emailAssignments: boolean;
  emailGrades: boolean;
  emailAnnouncements: boolean;
  emailMessages: boolean;
  pushAssignments: boolean;
  pushGrades: boolean;
  pushAnnouncements: boolean;
  pushMessages: boolean;
  pushLiveClasses: boolean;
  inAppAll: boolean;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        router.push("/notifications");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!preferences) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/notifications">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notifications
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 mt-1">
          Choose how you want to be notified about your activities
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Receive notifications via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-assignments" className="cursor-pointer">
                <div>
                  <p className="font-medium">New Assignments</p>
                  <p className="text-sm text-gray-500">
                    Get notified when teachers post new assignments
                  </p>
                </div>
              </Label>
              <Switch
                id="email-assignments"
                checked={preferences.emailAssignments}
                onCheckedChange={() => handleToggle("emailAssignments")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="email-grades" className="cursor-pointer">
                <div>
                  <p className="font-medium">Grades & Feedback</p>
                  <p className="text-sm text-gray-500">
                    Get notified when your work is graded
                  </p>
                </div>
              </Label>
              <Switch
                id="email-grades"
                checked={preferences.emailGrades}
                onCheckedChange={() => handleToggle("emailGrades")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="email-announcements" className="cursor-pointer">
                <div>
                  <p className="font-medium">Class Announcements</p>
                  <p className="text-sm text-gray-500">
                    Important updates from your teachers
                  </p>
                </div>
              </Label>
              <Switch
                id="email-announcements"
                checked={preferences.emailAnnouncements}
                onCheckedChange={() => handleToggle("emailAnnouncements")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="email-messages" className="cursor-pointer">
                <div>
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-gray-500">
                    Direct messages from teachers and classmates
                  </p>
                </div>
              </Label>
              <Switch
                id="email-messages"
                checked={preferences.emailMessages}
                onCheckedChange={() => handleToggle("emailMessages")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <CardTitle>Push Notifications</CardTitle>
            </div>
            <CardDescription>
              Receive notifications on your mobile device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-assignments" className="cursor-pointer">
                <div>
                  <p className="font-medium">New Assignments</p>
                  <p className="text-sm text-gray-500">
                    Instant alerts for new assignments
                  </p>
                </div>
              </Label>
              <Switch
                id="push-assignments"
                checked={preferences.pushAssignments}
                onCheckedChange={() => handleToggle("pushAssignments")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="push-grades" className="cursor-pointer">
                <div>
                  <p className="font-medium">Grades & Feedback</p>
                  <p className="text-sm text-gray-500">
                    Know immediately when work is graded
                  </p>
                </div>
              </Label>
              <Switch
                id="push-grades"
                checked={preferences.pushGrades}
                onCheckedChange={() => handleToggle("pushGrades")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="push-live" className="cursor-pointer">
                <div>
                  <p className="font-medium">Live Classes</p>
                  <p className="text-sm text-gray-500">
                    Reminders before live classes start
                  </p>
                </div>
              </Label>
              <Switch
                id="push-live"
                checked={preferences.pushLiveClasses}
                onCheckedChange={() => handleToggle("pushLiveClasses")}
              />
            </div>
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>In-App Notifications</CardTitle>
            </div>
            <CardDescription>
              See notifications within the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp-all" className="cursor-pointer">
                <div>
                  <p className="font-medium">All In-App Notifications</p>
                  <p className="text-sm text-gray-500">
                    Show all notifications in the notification center
                  </p>
                </div>
              </Label>
              <Switch
                id="inapp-all"
                checked={preferences.inAppAll}
                onCheckedChange={() => handleToggle("inAppAll")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}