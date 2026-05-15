"use client";

import { Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface ActivityUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ActivityItem {
  _id: string;
  action: string;
  entityType: string;
  createdAt: string;
  user?: ActivityUser;
}

interface ActivityTimelineProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export function ActivityTimeline({ activities = [], isLoading }: ActivityTimelineProps) {
  return (
    <Card animate={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-50" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            No recent activity yet
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const initials = activity.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={activity._id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={activity.user?.avatar} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">
                        {activity.user?.name || "Someone"}
                      </span>{" "}
                      <span className="text-slate-500">{activity.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
