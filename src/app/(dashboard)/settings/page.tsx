"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, User, Bell, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PushNotificationsSettings } from "@/components/settings/push-notifications-settings";
import { InstallPwaCard } from "@/components/settings/install-pwa-card";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" subtitle="Account and app preferences" />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
        <PushNotificationsSettings />

        <Card animate={false}>
          <CardHeader>
            <CardTitle>Install app</CardTitle>
            <CardDescription>Add Tobedone to your phone or desktop home screen</CardDescription>
          </CardHeader>
          <CardContent>
            <InstallPwaCard />
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your profile and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link
              href="/profile"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-900">Profile</p>
                  <p className="text-xs text-slate-500">Name, photo, and designation</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>
            <Link
              href="/notifications"
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">View alerts and activity</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
            </Link>
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Sign out of Tobedone on this device</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
