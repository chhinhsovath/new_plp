"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <Table className="min-w-[600px]">
        {children}
      </Table>
    </div>
  );
}

interface MobileCardData {
  title: string;
  subtitle?: string;
  items: Array<{
    label: string;
    value: ReactNode;
    className?: string;
  }>;
  actions?: ReactNode;
}

interface MobileCardListProps {
  data: MobileCardData[];
  className?: string;
}

export function MobileCardList({ data, className }: MobileCardListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            
            <div className="space-y-2">
              {item.items.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className={cn("font-medium", field.className)}>
                    {field.value}
                  </span>
                </div>
              ))}
            </div>

            {item.actions && (
              <div className="pt-2 border-t">
                {item.actions}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// Hook to determine if we should show mobile view
export function useIsMobileTable() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}