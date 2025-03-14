"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Client {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  company_name: string;
  industry: string;
}

interface EditClientFormProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditClientForm = ({ client, isOpen, onClose, onUpdate }: EditClientFormProps) => {
  const [formData, setFormData] = useState<Client | null>(client);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Unauthorized: No access token found.");

      await axios.patch(`${API_BASE_URL}auth/clients/${formData.id}/`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      toast({ title: "Client updated", description: "Client information was successfully updated." });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        {formData && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
            <Input name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} />
            <Input name="company_name" placeholder="Company Name" value={formData.company_name} onChange={handleChange} />
            <Input name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} />
            <Button type="submit" className="w-full">Update Client</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditClientForm;
