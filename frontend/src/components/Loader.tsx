import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  label?: string
  className?: string
}

export default function Loader({ label, className }: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}
