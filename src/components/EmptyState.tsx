import type { ReactNode } from "react";
import { Owl } from "@/components/Owl";

export function EmptyState({
  title,
  message,
  action,
  owlSize = 88,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  owlSize?: number;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-gold-muted/40 bg-card px-6 py-10 text-center">
      <Owl size={owlSize} alt="" />
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
