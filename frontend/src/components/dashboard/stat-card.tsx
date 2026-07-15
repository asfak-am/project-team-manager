import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardVariant =
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "cyan";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant?: StatCardVariant;
};

const variantStyles: Record<
  StatCardVariant,
  {
    gradient: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  blue: {
    gradient:
      "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/15",
    iconColor:
      "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    gradient:
      "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/15",
    iconColor:
      "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    gradient:
      "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/15",
    iconColor:
      "text-amber-600 dark:text-amber-400",
  },
  rose: {
    gradient:
      "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/15",
    iconColor:
      "text-rose-600 dark:text-rose-400",
  },
  violet: {
    gradient:
      "from-violet-500/10 via-violet-500/5 to-transparent",
    iconBg: "bg-violet-500/15",
    iconColor:
      "text-violet-600 dark:text-violet-400",
  },
  cyan: {
    gradient:
      "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/15",
    iconColor:
      "text-cyan-600 dark:text-cyan-400",
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "blue",
}: StatCardProps) {
  const style = variantStyles[variant];

  return (
    <Card className="relative overflow-hidden border-transparent shadow-lg shadow-black/5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}
      />

      <div className="relative z-10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>

          <div
            className={`flex size-9 items-center justify-center rounded-xl ${style.iconBg}`}
          >
            <Icon
              className={`size-5 ${style.iconColor}`}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold tracking-tight">
            {value}
          </div>

          <p className="mt-1.5 text-xs text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}