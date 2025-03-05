import ClientForm from "./ClientForm";
import ClientTable from "./ClientTable";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fetchAccountManagers = async () => {
  const response = await axios.get("http://127.0.0.1:8000/auth/account-managers/");
  return response.data;
};

export default async function ClientPage() {
  const accountManagers = await fetchAccountManagers();

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-gray-100 p-6">
      {/* Add Client Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" className="mb-4">Add New Client</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a New Client</DialogTitle>
          </DialogHeader>
          <ClientForm accountManagers={accountManagers} />
        </DialogContent>
      </Dialog>

      {/* Client Table */}
      <ClientTable />
    </div>
  );
}
