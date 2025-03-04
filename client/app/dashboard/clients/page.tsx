import ClientForm from "./ClientForm";
import axios from "axios";

const fetchAccountManagers = async () => {
  const response = await axios.get("http://127.0.0.1:8000/auth/account-managers/");
  return response.data;
};

export default async function ClientPage() {
  const accountManagers = await fetchAccountManagers();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ClientForm accountManagers={accountManagers} />
    </div>
  );
}
