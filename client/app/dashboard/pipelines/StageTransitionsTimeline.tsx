"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface StageTransition {
  id: number;
  from_stage_name: string | null;
  to_stage_name: string;
  entry_date: string;
  exit_date: string | null;
  duration_readable: string;
  is_active: boolean;
  is_overdue: boolean;
}

interface StageTransitionsTimelineProps {
  pipelineId: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function StageTransitionsTimeline({ pipelineId }: StageTransitionsTimelineProps) {
  const [transitions, setTransitions] = useState<StageTransition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransitions = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch(`${API_BASE_URL}pipeline/pipelines/${pipelineId}/transitions/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch transitions");
        const data = await response.json();
        setTransitions(data);
      } catch (error) {
        console.error("Error fetching transitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransitions();
  }, [pipelineId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-blue-500 hover:underline">View Transitions</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stage Transitions Timeline</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Loading...</p>
        ) : transitions.length > 0 ? (
          <Timeline>
            {transitions.map((transition) => (
              <TimelineItem key={transition.id}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{transition.from_stage_name || "Initial"}</span>
                  <span>→</span>
                  <span className="font-semibold">{transition.to_stage_name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Entered: {new Date(transition.entry_date).toLocaleDateString()}
                </div>
                {transition.exit_date && (
                  <div className="text-sm text-muted-foreground">
                    Exited: {new Date(transition.exit_date).toLocaleDateString()}
                  </div>
                )}
                <div className="text-sm">
                  Duration: {transition.duration_readable}
                  {transition.is_overdue && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </div>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <p>No transitions found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}