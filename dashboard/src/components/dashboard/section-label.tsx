"use client";

import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SectionLabelProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function SectionLabel({ icon: Icon, title, description }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="p-1.5 rounded-md bg-muted">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
          )}
        </div>
      </div>
      <Separator className="flex-1" />
    </div>
  );
}
