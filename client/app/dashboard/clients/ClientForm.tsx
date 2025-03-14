"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone_number: z.string().min(10, "Invalid phone number"),
  company_name: z.string().min(2, "Company name is required"),
  industry: z.string().min(2, "Industry is required"),
  account_manager: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const ClientForm = ({ accountManagers }: { accountManagers: {
  full_name: string; id: number; username: string 
}[] }) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue, 
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });
  
  // Handle Select Change
  const handleAccountManagerChange = (value: string) => {
    setValue("account_manager", value); // Manually setting the value
  };
  

  const { toast } = useToast();

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
  
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Unauthorized: No access token found.");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
      await axios.post(`${API_BASE_URL}auth/clients/`, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      toast({
        variant: "default",
        title: "Success!",
        description: "Client added successfully!",
      });
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive", 
          title: "Error",
          description: error.response?.data?.detail || "Failed to add client.",
        });
      } else {
        // Handle non-Axios error
        toast({
          variant: "destructive", 
          title: "Unexpected Error",
          description: "An unexpected error occurred.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg border rounded-2xl p-6 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Add a New Client</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Client Name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="Client Email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input type="tel" {...register("phone_number")} placeholder="Client Phone Number" />
            {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}
          </div>

          <div>
            <Label>Company Name</Label>
            <Input {...register("company_name")} placeholder="Company Name" />
            {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
          </div>

          <div>
            <Label>Industry</Label>
            <Input {...register("industry")} placeholder="Industry" />
            {errors.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
          </div>

          <div>
            <Label>Account Manager</Label>
            <Select onValueChange={handleAccountManagerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an account manager" />
              </SelectTrigger>
              <SelectContent>
                {accountManagers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id.toString()}>
                    {manager.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
