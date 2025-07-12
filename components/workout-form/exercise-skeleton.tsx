import { Skeleton } from "@/components/ui/skeleton"

export const ExerciseSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-6 h-6" />
      <Skeleton className="flex-1 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-20 h-10" />
      <Skeleton className="w-24 h-10" />
    </div>
  </div>
)
