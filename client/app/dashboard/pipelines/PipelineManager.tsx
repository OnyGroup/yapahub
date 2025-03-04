"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface Pipeline {
  id: number;
  client_name: string;
  status: number;
  last_updated: string;
}

// Status mappings
const statusLabels: Record<number, string> = {
  1: "Lead",
  2: "Negotiation",
  3: "Onboarding",
  4: "Active",
  5: "Closed",
};

const statusColors: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-yellow-500",
  3: "bg-purple-500",
  4: "bg-green-500",
  5: "bg-gray-500",
};

export default function PipelineManager() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [newClientName, setNewClientName] = useState("");
  const [newStatus, setNewStatus] = useState<number>(1);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const { toast } = useToast();

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    const token = localStorage.getItem("accessToken");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/pipeline/pipelines/", {
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

  const handleCreateOrUpdate = async () => {
    const token = localStorage.getItem("accessToken");
    const url = editingPipeline
      ? `http://127.0.0.1:8000/pipeline/pipelines/${editingPipeline.id}/`
      : "http://127.0.0.1:8000/pipeline/pipelines/";

    const method = editingPipeline ? "PATCH" : "POST";
    const body = JSON.stringify({
      client_name: newClientName,
      status: newStatus,
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
      setNewClientName("");
      setNewStatus(1);
      setEditingPipeline(null);
      setOpenDialog(false);
      fetchPipelines();
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
      const response = await fetch(`http://127.0.0.1:8000/pipeline/pipelines/${id}/`, {
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

  // Filtered pipelines based on selected status
  const filteredPipelines = selectedStatus === "All" 
    ? pipelines 
    : pipelines.filter(pipeline => pipeline.status.toString() === selectedStatus);

  return (
    <div>
      {/* Add New Button & Status Filter Dropdown */}
      <div className="mb-4 flex justify-between items-center">
        <Button
          onClick={() => {
            setEditingPipeline(null); // Reset form for new entry
            setNewClientName("");
            setNewStatus(1);
            setOpenDialog(true);
          }}
        >
          + Add Pipeline
        </Button>

        {/* DROPDOWN FILTER */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell>{pipeline.client_name}</TableCell>
              <TableCell>
                <Badge className={statusColors[pipeline.status]}>{statusLabels[pipeline.status]}</Badge>
              </TableCell>
              <TableCell>{new Date(pipeline.last_updated).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingPipeline(pipeline);
                        setNewClientName(pipeline.client_name);
                        setNewStatus(pipeline.status);
                        setOpenDialog(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the pipeline.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(pipeline.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          <Input
            placeholder="Client Name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
          />
          <Select value={newStatus.toString()} onValueChange={(value) => setNewStatus(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateOrUpdate}>{editingPipeline ? "Update" : "Create"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
