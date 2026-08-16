import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PageHeader() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-40 w-full max-w-md rounded-xl" />
    </div>
  );
}

function CardBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("h-[440px] rounded-xl", className)} />;
}

function CardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardBlock key={i} />
      ))}
    </div>
  );
}

function Row({ className }: { className?: string }) {
  return <Skeleton className={cn("h-28 w-full rounded-xl", className)} />;
}

function StatRow() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-12 rounded-lg" />
    </div>
  );
}

function QuickAccess() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48" />
        <CardGrid />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <Row />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <StatRow />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-36" />
        <QuickAccess />
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
      <Skeleton className="h-72 w-full rounded-xl md:col-span-3" />
      <Skeleton className="h-48 w-full rounded-xl md:col-span-2" />
    </div>
  );
}

function MatchesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <CardGrid count={6} />
    </div>
  );
}

function CalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-[440px] w-full rounded-xl" />
      <Row />
    </div>
  );
}

function CalendarWeekFallback() {
  return <Skeleton className="h-[520px] w-full rounded-xl" />;
}

function PublicProfileGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
      <Skeleton className="h-80 w-full rounded-xl md:col-span-3" />
      <Skeleton className="h-48 w-full rounded-xl md:col-span-2" />
    </div>
  );
}

function ChatLayoutSkeleton() {
  return (
    <div className="flex min-h-[var(--chat-panel-min-h)] gap-4 md:min-h-[var(--chat-panel-min-h-md)]">
      <Skeleton className="hidden h-full w-[340px] rounded-xl md:block" />
      <Skeleton className="h-full flex-1 rounded-xl" />
    </div>
  );
}

export const SkeletonKit = {
  PageHeader,
  CardBlock,
  CardGrid,
  Row,
  StatRow,
  QuickAccess,
  DashboardPage,
  ProfilePage,
  MatchesPage,
  CalendarPage,
  CalendarWeekFallback,
  PublicProfileGrid,
  ChatLayoutSkeleton,
};
