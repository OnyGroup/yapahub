"use client";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface NoteHistoryProps {
  pipelineId: number;
}

interface Activity {
  id: number;
  timestamp: string;
  user_name: string | null;
  old_value: string | null;
  new_value: string | null;
  activity_type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NoteHistory({ pipelineId }: NoteHistoryProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch(`${API_BASE_URL}pipeline/pipelines/${pipelineId}/activities/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        // Filter activities to only include note changes
        const noteChanges = data.filter((activity: Activity) => activity.activity_type === "note_added");
        setActivities(noteChanges);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load note history",
        });
      }
    };
    fetchActivities();
  }, [pipelineId]);

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Note History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                <TableCell>{activity.user_name || "Unknown"}</TableCell>
                <TableCell>{activity.old_value || "None"}</TableCell>
                <TableCell>{activity.new_value || "None"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No note changes recorded.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}