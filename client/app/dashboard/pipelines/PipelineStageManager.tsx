"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [newStageDescription, setNewStageDescription] = useState("");
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<number | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false); // New state for add dialog
  const { toast } = useToast();

  useEffect(() => {
    fetchStages();
  }, []);

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
          description: newStageDescription,
        }),
      });
      if (!response.ok) throw new Error("Failed to create stage");
      toast({
        variant: "default",
        title: "Success",
        description: "Stage created successfully",
      });
      setNewStageName("");
      setNewStageDescription("");
      setOpenAddDialog(false); // Close the dialog
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

  const handleSaveEdit = async () => {
    if (!editingStage) return;
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipeline-stages/${editingStage.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingStage.name,
          description: editingStage.description,
          order: editingStage.order,
          expected_duration_days: editingStage.expected_duration_days,
        }),
      });
      if (!response.ok) throw new Error("Failed to update stage");
      toast({
        variant: "default",
        title: "Success",
        description: "Stage updated successfully",
      });
      setOpenEditDialog(false);
      setEditingStage(null);
      fetchStages();
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stage",
      });
    }
  };

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

      {/* Add Stage Button and Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Stage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Stage Name</h3>
                <Input
                  placeholder="Enter Stage Name"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <Input
                  placeholder="Enter Description"
                  value={newStageDescription}
                  onChange={(e) => setNewStageDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStage}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage List */}
        <div className="space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <h3 className="font-semibold">{stage.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingStage(stage);
                    setOpenEditDialog(true);
                  }}
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

        {/* Edit Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stage</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Stage Name</h3>
                <Input
                  placeholder="Enter Stage Name"
                  value={editingStage?.name || ""}
                  onChange={(e) =>
                    setEditingStage((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <Input
                  placeholder="Enter Description"
                  value={editingStage?.description || ""}
                  onChange={(e) =>
                    setEditingStage((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}