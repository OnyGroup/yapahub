"use client";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface OverdueStatusIndicatorProps {
  startDate: string;
  expectedDurationDays: number | null;
}

export default function OverdueStatusIndicator({
  startDate,
  expectedDurationDays,
}: OverdueStatusIndicatorProps) {
  if (!expectedDurationDays) return null;

  const start = new Date(startDate);
  const now = new Date();
  const expectedEndDate = new Date(start.setDate(start.getDate() + expectedDurationDays));

  const isOverdue = now > expectedEndDate;

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-4 w-4" /> Overdue
      </Badge>
    );
  }

  return null;
}