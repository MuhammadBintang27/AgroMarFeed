// components/ui/card.tsx
import { cn } from "@/lib/utils"; // Atau sesuaikan jika tidak pakai 'cn' helper

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border bg-white text-black shadow-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
