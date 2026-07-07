import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The contextual side panel that accompanies the circle on each tab. */
export function SidePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-5 rounded-xl border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </aside>
  );
}

/** A labelled section inside the side panel. */
export function PanelSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[0.68rem] font-bold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </section>
  );
}
