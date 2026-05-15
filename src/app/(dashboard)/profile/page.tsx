"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Loader2, Save } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useProfile, useUpdateProfile, useUploadFile } from "@/hooks/use-api";

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  designation?: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = data as ProfileData | undefined;

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDesignation(profile.designation || "");
      setAvatar(profile.avatar || "");
    }
  }, [profile]);

  const displayName = name || session?.user?.name || "";
  const displayAvatar = avatar || session?.user?.image || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const uploaded = await uploadFile.mutateAsync(file);
    setAvatar(uploaded.url);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updated = (await updateProfile.mutateAsync({
      name: name.trim(),
      designation: designation.trim(),
      avatar: avatar || undefined,
    })) as ProfileData;

    await updateSession({
      name: updated.name,
      image: updated.avatar,
      designation: updated.designation,
    });
  };

  const isSaving = updateProfile.isPending || uploadFile.isPending;

  return (
    <div>
      <Header title="Profile" subtitle="Update your name, photo, and job role" />

      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <Card animate={false}>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                This information is visible to teammates across Tobedone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-slate-200">
                      <AvatarImage src={displayAvatar || undefined} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadFile.isPending}
                      className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      {uploadFile.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-semibold text-slate-900 text-lg">{displayName}</p>
                    <p className="text-sm text-slate-500">{profile?.email || session?.user?.email}</p>
                    {designation && (
                      <p className="text-sm text-indigo-600 mt-1">{designation}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-designation">Designation</Label>
                  <Input
                    id="profile-designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Product Designer, Engineering Lead"
                  />
                  <p className="text-xs text-slate-500">Your job title or role on the team</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    value={profile?.email || session?.user?.email || ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
