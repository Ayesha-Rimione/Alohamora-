import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-gold-muted/30 p-8 shadow-magic",
        className
      )}
      style={{
        backgroundColor: "rgba(255, 249, 239, 0.96)",
        color: "#211631",
      }}
    >
      <div>
        <h1 className="flex items-center gap-3 font-display text-3xl font-semibold tracking-wide text-plum sm:text-4xl">
          {icon && <span className="text-gold-muted">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-3xl text-base text-plum/80 leading-relaxed font-sans">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
