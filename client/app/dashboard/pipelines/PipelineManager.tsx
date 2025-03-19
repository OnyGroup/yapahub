"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import NotesManager from "./NotesManager";
import PipelineStageManager from "./PipelineStageManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StageTransitionsTimeline from "./StageTransitionsTimeline";
import { AlertTriangle } from "lucide-react";
import OverdueStatusIndicator from "./OverdueStatusIndicator"; // Import the new component

interface Pipeline {
  id: number;
  client_name: string;
  last_updated: string;
  notes: string;
  client: number;
  is_current_stage_overdue: boolean;
  stage_name: string | null;
  stage: number | null;
  expected_duration_days: number | null; // New field
}

interface Client {
  id: number;
  name: string;
}

interface PipelineStage {
  id: number;
  name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PipelineManager() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newNotes, setNewNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [newExpectedDuration, setNewExpectedDuration] = useState<number | null>(null); // New state
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPipelines();
    fetchClients();
    fetchPipelineStages();
  }, []);

  const fetchPipelines = async () => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipelines/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pipelines");
      const data = await response.json();
      setPipelines(data);
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pipelines",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}auth/clients/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch clients");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load clients",
      });
    }
  };

  const fetchPipelineStages = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipeline-stages/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pipeline stages");
      const data = await response.json();
      setPipelineStages(data);
    } catch (error) {
      console.error("Error fetching pipeline stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pipeline stages",
      });
    }
  };

  const handleCreateOrUpdate = async () => {
    const token = localStorage.getItem("accessToken");
    const url = editingPipeline
      ? `${API_BASE_URL}pipeline/pipelines/${editingPipeline.id}/`
      : `${API_BASE_URL}pipeline/pipelines/`;
    const method = editingPipeline ? "PATCH" : "POST";
    const body = JSON.stringify({
      client: selectedClientId,
      stage: selectedStageId,
      notes: newNotes,
      expected_duration_days: newExpectedDuration || null, // Include expected duration
    });
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      if (!response.ok) throw new Error("Failed to save pipeline");
      toast({
        variant: "default",
        title: "Success",
        description: `Pipeline ${editingPipeline ? "updated" : "created"} successfully`,
      });

      // Update pipelines state directly instead of refetching
      setPipelines((prevPipelines) =>
        prevPipelines.map((p) =>
          p.id === editingPipeline?.id
            ? { ...p, notes: newNotes, stage: selectedStageId }
            : p
        )
      );

      setSelectedClientId(null);
      setSelectedStageId(null);
      setNewNotes("");
      setNewExpectedDuration(null); // Reset expected duration
      setEditingPipeline(null);
      setOpenDialog(false);
      // fetchPipelines();
    } catch (error) {
      console.error("Error saving pipeline:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save pipeline",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipelines/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete pipeline");
      toast({
        variant: "default",
        title: "Success",
        description: "Pipeline deleted successfully",
      });
      setOpenAlertDialog(false);
      fetchPipelines();
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete pipeline",
      });
    }
  };

  return (
    <Tabs defaultValue="pipelines">
      <TabsList>
        <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
        <TabsTrigger value="stages">Stages</TabsTrigger>
      </TabsList>
      {/* Pipelines Tab */}
      <TabsContent value="pipelines">
        <div>
          {/* Add New Button */}
          <div className="mb-4 flex justify-end">
            <Button
              onClick={() => {
                setEditingPipeline(null);
                setSelectedClientId(null);
                setSelectedStageId(null);
                setNewNotes("");
                setNewExpectedDuration(null);
                setOpenDialog(true);
              }}
            >
              + Add Pipeline
            </Button>
          </div>
          {/* Pipeline Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell>{pipeline.client_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge>{pipeline.stage_name || "No Stage"}</Badge>
                      <OverdueStatusIndicator
                        startDate={pipeline.last_updated}
                        expectedDurationDays={pipeline.expected_duration_days}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(pipeline.last_updated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                  <NotesManager
                    pipelineId={pipeline.id}
                    initialNotes={pipeline.notes || ""}
                    onNotesUpdated={(pipelineId, newNotes) => {
                      setPipelines((prevPipelines) =>
                        prevPipelines.map((p) =>
                          p.id === pipelineId ? { ...p, notes: newNotes } : p
                        )
                      );
                    }}
                  />
                  </TableCell>
                  <TableCell>
                    <StageTransitionsTimeline pipelineId={pipeline.id} />
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPipeline(pipeline);
                        setSelectedClientId(pipeline.client);
                        setSelectedStageId(pipeline.stage);
                        setNewNotes(pipeline.notes || "");
                        setNewExpectedDuration(pipeline.expected_duration_days || null); // Pre-fill expected duration
                        setOpenDialog(true);
                      }}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pipeline.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await handleDelete(pipeline.id);
                              setOpenAlertDialog(false);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Dialog for Add/Edit */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPipeline ? "Edit Pipeline" : "Add Pipeline"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Client Selection */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
                <Select
                  value={selectedClientId?.toString()}
                  onValueChange={(value) => setSelectedClientId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Select Stage */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Stages</h3>
                <Select
                  value={selectedStageId?.toString()}
                  onValueChange={(value) => setSelectedStageId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelineStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id.toString()}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes Input */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                <Input
                  placeholder="Add Notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
                </div>

              {/* Expected Duration (Days) */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Expected Duration (Days)</h3>
                <Input
                  type="number"
                  placeholder="Expected Duration (days)"
                  value={newExpectedDuration || ""}
                  onChange={(e) => setNewExpectedDuration(Number(e.target.value))}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button onClick={handleCreateOrUpdate}>
                  {editingPipeline ? "Update" : "Create"}
                </Button>
              </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>
      {/* Stages Tab */}
      <TabsContent value="stages">
        <PipelineStageManager />
      </TabsContent>
    </Tabs>
  );
}