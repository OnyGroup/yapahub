"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil } from "lucide-react";
import EditClientForm from "./EditClientForm";

interface Client {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  company_name: string;
  industry: string;
  account_manager: string;
}

const ClientTable = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Unauthorized: No access token found.");
      }
      const response = await axios.get("http://127.0.0.1:8000/auth/clients/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Unauthorized: No access token found.");
      }
      await axios.delete(`http://127.0.0.1:8000/auth/clients/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setClients(clients.filter(client => client.id !== id));
      toast({ title: "Client deleted", description: "The client has been removed." });
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditing(true);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="w-full shadow-lg border rounded-2xl p-6 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Manage Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full"
        />
        <div className="overflow-x-auto">
          <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone_number}</TableCell>
                <TableCell>{client.company_name}</TableCell>
                <TableCell>{client.industry}</TableCell>
                <TableCell className="flex space-x-2">
                <Button size="icon" variant="outline" onClick={() => handleEditClick(client)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(client.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
      <EditClientForm client={selectedClient} isOpen={isEditing} onClose={() => setIsEditing(false)} onUpdate={fetchClients} />
    </Card>
  );
};

export default ClientTable;
