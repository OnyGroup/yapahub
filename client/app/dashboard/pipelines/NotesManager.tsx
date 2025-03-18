"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import NoteHistory from "./NoteHistory";

interface NotesManagerProps {
  pipelineId: number;
  initialNotes: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NotesManager({ pipelineId, initialNotes }: NotesManagerProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveNotes = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await fetch(`${API_BASE_URL}pipeline/pipelines/${pipelineId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) throw new Error("Failed to update notes");

      toast({
        variant: "default",
        title: "Success",
        description: "Notes updated successfully",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notes",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Notes</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Notes</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Notes</TabsTrigger>
            <TabsTrigger value="history">Note History</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes here..."
              className="h-32"
            />
            <Button onClick={handleSaveNotes} className="mt-4">
              Save Notes
            </Button>
          </TabsContent>
          <TabsContent value="history">
            <NoteHistory pipelineId={pipelineId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}