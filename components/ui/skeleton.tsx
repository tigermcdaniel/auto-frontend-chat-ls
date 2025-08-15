import SkeletonLib from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <SkeletonLib
      className={cn("rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton } 