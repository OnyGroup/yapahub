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
import { CheckCircle, AlertTriangle, MoveRight } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  // Function to fetch transitions
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

  // Fetch transitions when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchTransitions();
    }
  }, [isOpen, pipelineId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
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
            {transitions.map((transition) => {
              // Determine which icon to use based on status
              let IconComponent = MoveRight; // Default icon for general transitions
              let iconColor = "text-gray-500"; // Default color

              if (transition.is_overdue) {
                IconComponent = AlertTriangle; // Overdue transition
                iconColor = "text-red-500";
              } else if (!transition.is_active && transition.exit_date) {
                IconComponent = CheckCircle; // Completed transition
                iconColor = "text-green-500";
              }

              return (
                <TimelineItem key={transition.id} className="relative flex gap-3 pl-6 sm:pl-10">
                  {/* Dynamic Icon Marker */}
                  <IconComponent
                    className={`absolute left-0 top-3 h-4 w-4 ${iconColor}`}
                    aria-label={transition.is_overdue ? "Overdue Transition" : "Completed Transition"}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{transition.from_stage_name || "Initial"}</span>
                      <span>→</span>
                      <span className="font-semibold">{transition.to_stage_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Entered: {new Date(transition.entry_date).toLocaleString()}
                    </div>
                    {transition.exit_date && (
                      <div className="text-sm text-muted-foreground">
                        Exited: {new Date(transition.exit_date).toLocaleString()}
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
                  </div>
                </TimelineItem>
              );
            })}
          </Timeline>
        ) : (
          <p>No transitions found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}