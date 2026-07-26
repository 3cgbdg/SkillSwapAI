"use client";

import useProfile from "@/hooks/useProfile";
import useMatches from "@/hooks/useMatches";
import useSessions from "@/hooks/useSessions";
import {
  Award,
  Calendar,
  MessageSquare,
  Star,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data: user, isLoading: profileLoading } = useProfile();
  const { data: matches = [], isLoading: matchesLoading } = useMatches();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const now = new Date();
  const loading = profileLoading || matchesLoading;

  const upcoming = sessions.filter((s) => {
    const startDate = new Date();
    startDate.setHours(s.start, 0, 0, 0);
    return now <= startDate;
  });

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-0 bg-surface-raised shadow-sm">
        <CardContent className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
          {loading ? (
            <div className="flex w-full flex-col gap-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : (
            <div className="flex max-w-xl flex-col gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Welcome back</p>
                <h1 className="text-foreground text-3xl font-bold">
                  {user?.name ?? "there"}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Your journey to mastering new skills and sharing your expertise
                starts here.
              </p>
              <Link
                href="/profile"
                className={buttonVariants({ className: "w-fit" })}
              >
                View My Profile
              </Link>
            </div>
          )}
          <div className="relative hidden aspect-square w-64 md:block">
            <Image
              src="/dashboardImage.png"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Dashboard preview"
              className="rounded-lg object-cover"
            />
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Your Stats</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                icon={Award}
                value={user?.knownSkills?.length ?? 0}
                label="Skills Learned"
              />
              <StatCard
                icon={Star}
                value={user?.completedSessionsCount ?? 0}
                label="Sessions Completed"
              />
              <StatCard
                icon={Users}
                value={matches.length}
                label="Active Matches"
              />
            </>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Quick Access</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickLink href="/profile" icon={User} label="My Profile" />
          <QuickLink href="/matches" icon={Users} label="Matches" />
          <QuickLink href="/chats" icon={MessageSquare} label="Chat" />
          <QuickLink href="/calendar" icon={Calendar} label="Calendar" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Upcoming Sessions</h2>
        {sessionsLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : upcoming.length > 0 ? (
          upcoming.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>
                  {item.start}:00 – {item.end}:00
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming sessions"
            description="Schedule a session with a match to see it here."
            action={
              <Link
                href="/calendar"
                className={buttonVariants({ variant: "outline" })}
              >
                Open calendar
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
};

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Award;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-6">
        <Icon className="text-primary size-10" />
        <span className="text-primary text-3xl font-bold">{value}</span>
        <span className="text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof User;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <Icon className="text-accent size-10" />
          <span className="font-semibold">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}

export default Page;
