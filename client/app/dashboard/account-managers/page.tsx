"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import EditDeleteManagers from "./EditDeleteManagers";

interface AccountManager {
  id: number;
  full_name: string;
  email: string;
  username: string;
  phone_number: string;
  access_level: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface Client {
  id: number;
  name: string;
  company_name: string;
  account_manager: number | null;
  account_manager_name?: string;
}

export default function AccountManagerDashboard() {
  const { toast } = useToast();
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedManager, setSelectedManager] = useState<number | "">("");
  const [newManager, setNewManager] = useState<Partial<AccountManager>>({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone_number: "",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [token, setToken] = useState<string | null>(null); // Store token in state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAccountManagers();
      fetchClients();
    }
  }, [token]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchAccountManagers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}auth/account-managers/`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch. Status: ${response.status}`);
      const data = await response.json();
      console.log("Account managers data:", data);
      setAccountManagers(data);
    } catch (error) {
      console.error("Error fetching account managers:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}auth/clients/`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch. Status: ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const assignManager = async (clientId: number) => {
    if (!selectedManager) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an account manager",
      });
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}auth/clients/${clientId}/`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ account_manager: selectedManager }),
      });
  
      if (!response.ok) throw new Error(`Failed to update. Status: ${response.status}`);
  
      toast({
        variant: "default",
        title: "Success",
        description: "Account Manager updated",
      });
  
      fetchClients();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating manager",
      });
    }
  };
  

// Modified createAccountManager function
const createAccountManager = async () => {
  if (!newManager.username || !newManager.password || !newManager.email || !newManager.first_name || !newManager.last_name || !newManager.phone_number) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "All fields are required",
    });
    return;
  }

  const payload = {
    first_name: newManager.first_name,
    last_name: newManager.last_name,
    email: newManager.email,
    username: newManager.username,
    phone_number: newManager.phone_number,
    password: newManager.password,
    access_level: "account_manager",
  };

  try {
    const registerHeaders = {
      "Content-Type": "application/json",
    };
    
    const response = await fetch(`${API_BASE_URL}auth/register/`, {
      method: "POST",
      headers: registerHeaders,  // Use headers without Authorization
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create manager. Status: ${response.status}`);
    }

    toast({
      variant: "default",
      title: "Success",
      description: "Account Manager added",
    });

    fetchAccountManagers();
    setIsDialogOpen(false);
    setNewManager({ first_name: "", last_name: "", email: "", username: "", phone_number: "", password: "" });
  } catch (error) {
    // Cast error to any or Error type
    const typedError = error as Error;
    toast({
      variant: "destructive",
      title: "Error",
      description: typedError.message || "Error creating manager",
    });
  }
};
  

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Manage Account Managers</h2>

      <Input placeholder="Search Account Managers" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>Add Account Manager</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account Manager</DialogTitle>
          </DialogHeader>
          <Input placeholder="First Name" onChange={(e) => setNewManager({ ...newManager, first_name: e.target.value })} />
          <Input placeholder="Last Name" onChange={(e) => setNewManager({ ...newManager, last_name: e.target.value })} />
          <Input placeholder="Email" onChange={(e) => setNewManager({ ...newManager, email: e.target.value })} />
          <Input placeholder="Username" onChange={(e) => setNewManager({ ...newManager, username: e.target.value })} />
          <Input placeholder="Phone Number" onChange={(e) => setNewManager({ ...newManager, phone_number: e.target.value })} />
          <Input type="password" placeholder="Password" onChange={(e) => setNewManager({ ...newManager, password: e.target.value })} />
          <Button onClick={createAccountManager}>Create</Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Assigned Clients</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accountManagers
            .filter((manager) => manager.full_name.toLowerCase().includes(searchQuery))
            .map((manager) => (
              <TableRow key={manager.id}>
                <TableCell>{manager.full_name}</TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>
                  {clients
                    .filter((client) => client.account_manager === manager.id)
                    .map((client) => client.name)
                    .join(", ") || "No Clients"}
                </TableCell>
                <TableCell>
                  <EditDeleteManagers 
                    manager={manager} 
                    onManagerUpdated={fetchAccountManagers} 
                    onDelete={fetchAccountManagers}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{client.company_name}</p>
              <>
                <Select onValueChange={(value) => setSelectedManager(Number(value))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={client.account_manager_name || "Select Manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accountManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="mt-2 w-full" onClick={() => assignManager(client.id)}>
                  Assign Manager
                </Button>
              </>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
