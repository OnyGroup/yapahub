"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface AccountManager {
  id: number;
  full_name: string;
  email: string;
}

interface Client {
  id: number;
  name: string;
  company_name: string;
  account_manager: number | null;
  account_manager_name?: string;
}

export default function AccountManagerDashboard() {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedManager, setSelectedManager] = useState<number | "">("");
  const [newManager, setNewManager] = useState<Partial<AccountManager>>({ full_name: "", email: "" });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [token, setToken] = useState<string | null>(null); // Store token in state

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
  }, [token]); // Only fetch data when the token is available

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  };

  const fetchAccountManagers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/account-managers/", { headers });
      if (!response.ok) throw new Error(`Failed to fetch. Status: ${response.status}`);
      const data = await response.json();
      setAccountManagers(data);
    } catch (error) {
      console.error("Error fetching account managers:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/clients/", { headers });
      if (!response.ok) throw new Error(`Failed to fetch. Status: ${response.status}`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const assignManager = async (clientId: number) => {
    if (!selectedManager) {
      toast.error("Please select an account manager");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/clients/${clientId}/`, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ account_manager: selectedManager }),
      });

      if (!response.ok) throw new Error(`Failed to update. Status: ${response.status}`);

      toast.success("Account Manager updated");
      fetchClients();
    } catch (error) {
      toast.error("Error updating manager");
    }
  };

  const createAccountManager = async () => {
    if (!newManager.full_name || !newManager.email) {
      toast.error("All fields are required");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/account-managers/", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(newManager),
      });
      if (!response.ok) throw new Error(`Failed to create manager. Status: ${response.status}`);
      toast.success("Account Manager added");
      fetchAccountManagers();
    } catch (error) {
      toast.error("Error creating manager");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Manage Account Managers</h2>

      <Input placeholder="Search Account Managers" onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />

      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Account Manager</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account Manager</DialogTitle>
          </DialogHeader>
          <Input placeholder="Full Name" onChange={(e) => setNewManager({ ...newManager, full_name: e.target.value })} />
          <Input placeholder="Email" onChange={(e) => setNewManager({ ...newManager, email: e.target.value })} />
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
