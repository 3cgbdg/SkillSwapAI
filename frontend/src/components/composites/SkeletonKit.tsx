import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PageHeader() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex max-w-xs flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

function CardBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("h-36 rounded-xl", className)} />;
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
  return <Skeleton className={cn("h-24 w-full rounded-xl", className)} />;
}

function StatRow() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-12 rounded-lg" />
    </div>
  );
}

function QuickAccess() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
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
    <div className="flex flex-col gap-8">
      <Skeleton className="h-56 w-full rounded-xl" />
      <Row className="h-40" />
      <Row className="h-32" />
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
    <div className="grid grid-cols-5 gap-6 md:grid">
      <Skeleton className="col-span-3 h-80 w-full rounded-xl" />
      <div className="col-span-2 hidden flex-col gap-8 md:flex">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ChatLayoutSkeleton() {
  return (
    <div className="flex min-h-[min(75dvh,800px)] gap-4">
      <Skeleton className="hidden h-full w-[340px] rounded-xl md:block" />
      <Skeleton className="h-full min-h-[400px] flex-1 rounded-xl" />
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
