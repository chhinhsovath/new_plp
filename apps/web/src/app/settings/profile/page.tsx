"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  School,
  Save,
  CheckCircle,
} from "lucide-react";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  phoneNumber?: string;
  address?: string;
  school?: string;
  grade?: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function ProfileSettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phoneNumber: "",
    address: "",
    school: "",
    grade: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          school: data.school || "",
          grade: data.grade || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("purpose", "profile");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    const fileUrl = data.files[0].fileUrl;

    // Update profile with new avatar
    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: fileUrl }),
    });

    return fileUrl;
  };

  const handleAvatarRemove = async () => {
    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-start gap-6">
                <AvatarUpload
                  currentImageUrl={profile?.avatarUrl}
                  userName={`${formData.firstName} ${formData.lastName}`}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  size="lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-gray-600">
                    Upload a profile picture to personalize your account.
                    Recommended size: 200x200px
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+855 12 345 678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Phnom Penh, Cambodia"
                  />
                </div>
              </div>

              {saved && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your profile has been updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education Information</CardTitle>
              <CardDescription>
                Manage your school and grade information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school">School</Label>
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-gray-400" />
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    placeholder="Your school name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grade 1</SelectItem>
                    <SelectItem value="2">Grade 2</SelectItem>
                    <SelectItem value="3">Grade 3</SelectItem>
                    <SelectItem value="4">Grade 4</SelectItem>
                    <SelectItem value="5">Grade 5</SelectItem>
                    <SelectItem value="6">Grade 6</SelectItem>
                    <SelectItem value="7">Grade 7</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Privacy settings are coming soon. We take your privacy seriously and are working on giving you more control over your data.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Member since {profile ? new Date(profile.createdAt).toLocaleDateString() : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}