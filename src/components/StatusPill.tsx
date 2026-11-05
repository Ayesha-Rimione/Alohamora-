import { BadgeCheck, CircleDashed, CircleHelp } from "lucide-react";
import type { SkillStatus } from "@/data/skills";
import { STATUS_LABEL } from "@/data/skills";
import { cn } from "@/lib/utils";

/** Skill status pill — never communicates status by color alone:
 *  each status has its own icon + label. */
export function StatusPill({
  status,
  className,
}: {
  status: SkillStatus;
  className?: string;
}) {
  const conf = {
    demonstrated: {
      icon: BadgeCheck,
      classes: "bg-success/15 text-success border-success/40",
    },
    developing: {
      icon: CircleDashed,
      classes: "bg-gold/25 text-gold-muted border-gold-muted/50",
    },
    missing: {
      icon: CircleHelp,
      classes: "bg-muted text-muted-foreground border-border",
    },
  }[status];
  const Icon = conf.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        conf.classes,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function DemoBadge({ label = "Demo data", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-lavender/60 bg-lavender/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-plum",
        className,
      )}
      title="Prototype data — not a live integration"
    >
      {label}
    </span>
  );
}
