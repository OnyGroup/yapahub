"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AccountManager {
  id: number;
  full_name: string;
  email: string;
  username: string;
  phone_number: string;
  access_level: string;
  password?: string;
  first_name: string;
  last_name: string;
}

interface EditDeleteAccountManagerProps {
  manager: AccountManager;
  onManagerUpdated: () => Promise<void>;
  onDelete: () => void;
}

export default function EditDeleteAccountManager({ manager, onManagerUpdated, onDelete }: EditDeleteAccountManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedManager, setUpdatedManager] = useState<Partial<AccountManager>>({ ...manager });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUpdatedManager({ ...manager });
  }, [manager]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/account-managers/${manager.id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updatedManager),
      });

      if (!response.ok) throw new Error("Failed to update manager");

      toast({
        variant: "default",
        title: "Success",
        description: "Account Manager updated successfully",
      });
      setIsDialogOpen(false);
      await onManagerUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update account manager",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/account-managers/${manager.id}/`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) throw new Error("Failed to delete manager");

      toast({
        variant: "default",
        title: "Success",
        description: "Account Manager deleted successfully",
      });
      onDelete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete account manager",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit/Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account Manager</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="First Name"
          value={updatedManager.first_name || ""}
          onChange={(e) => setUpdatedManager({ ...updatedManager, first_name: e.target.value })}
        />
        <Input
          placeholder="Last Name"
          value={updatedManager.last_name || ""}
          onChange={(e) => setUpdatedManager({ ...updatedManager, last_name: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={updatedManager.email || ""}
          onChange={(e) => setUpdatedManager({ ...updatedManager, email: e.target.value })}
        />
        <Input
          placeholder="Username"
          value={updatedManager.username || ""}
          onChange={(e) => setUpdatedManager({ ...updatedManager, username: e.target.value })}
        />
        <Input
          placeholder="Phone Number"
          value={updatedManager.phone_number || ""}
          onChange={(e) => setUpdatedManager({ ...updatedManager, phone_number: e.target.value })}
        />
        <div className="flex justify-between mt-4">
          <Button onClick={handleUpdate}>Update</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
