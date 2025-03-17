"use client";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PipelineStage {
  id: number;
  name: string;
  description: string;
  order: number;
  expected_duration_days: number;
  is_default: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PipelineStageManager() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [newStageDuration, setNewStageDuration] = useState(7);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch stages from the backend
  const fetchStages = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipeline-stages/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stages");
      const data = await response.json();
      setStages(data);
    } catch (error) {
      console.error("Error fetching stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pipeline stages",
      });
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  // Handle stage creation
  const handleCreateStage = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipeline-stages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newStageName,
          expected_duration_days: newStageDuration,
        }),
      });
      if (!response.ok) throw new Error("Failed to create stage");
      toast({
        variant: "default",
        title: "Success",
        description: "Stage created successfully",
      });
      setNewStageName("");
      setNewStageDuration(7);
      fetchStages();
    } catch (error) {
      console.error("Error creating stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create stage",
      });
    }
  };

  // Handle stage deletion
  const handleDeleteStage = async () => {
    const token = localStorage.getItem("accessToken");
    if (!stageToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipeline-stages/${stageToDelete}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete stage");
      toast({
        variant: "default",
        title: "Success",
        description: "Stage deleted successfully",
      });
      setOpenDeleteDialog(false);
      fetchStages();
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete stage",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Pipeline Stages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stage List */}
        <div className="space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <h3 className="font-semibold">{stage.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Duration: {stage.expected_duration_days} days
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingStage(stage)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStageToDelete(stage.id);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the stage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteStage}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Stage */}
        <div className="space-y-2">
          <Input
            placeholder="Stage Name"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Expected Duration (days)"
            value={newStageDuration}
            onChange={(e) => setNewStageDuration(Number(e.target.value))}
          />
          <Button onClick={handleCreateStage}>
            <Plus className="mr-2 h-4 w-4" /> Add Stage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}