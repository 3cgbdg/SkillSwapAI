import { Skeleton } from "@/components/ui/skeleton";

export default function ChatsLoading() {
  return (
    <div className="flex h-[70vh] gap-4">
      <Skeleton className="hidden h-full w-72 rounded-xl md:block" />
      <Skeleton className="h-full flex-1 rounded-xl" />
    </div>
  );
}
