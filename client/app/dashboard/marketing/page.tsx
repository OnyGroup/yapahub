"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define TypeScript interfaces for the data
interface Campaign {
  id: number;
  name: string;
  campaign_type: string;
  subject: string;
  scheduled_at: string;
}

interface PerformanceData {
  name: string;
  opens: number;
  clicks: number;
}

interface DiscountCode {
  code: string;
  discount_percentage: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number;
}

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [discountFormData, setDiscountFormData] = useState<DiscountCode>({
    code: "",
    discount_percentage: 0,
    valid_from: "",
    valid_to: "",
    usage_limit: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/marketing/campaigns/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setCampaigns(response.data);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch performance data for the selected campaign
  useEffect(() => {
    if (!selectedCampaignId) return;

    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/marketing/campaigns/${selectedCampaignId}/performance/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setPerformanceData([response.data]); // Wrap in an array for Recharts compatibility
      } catch (error) {
        console.error("Failed to fetch performance data", error);
      }
    };
    fetchPerformanceData();
  }, [selectedCampaignId]);

  // Handle discount form changes
  const handleDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDiscountFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle discount form submission
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/marketing/discounts/", discountFormData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      alert("Discount code created successfully!");
      setDiscountFormData({
        code: "",
        discount_percentage: 0,
        valid_from: "",
        valid_to: "",
        usage_limit: 0,
      });
    } catch (error) {
      console.error("Failed to create discount code", error);
      alert("Failed to create discount code. Please check the details.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Marketing Dashboard</h1>

      {/* Create Discount Code Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Discount Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDiscountSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={discountFormData.code}
                  onChange={handleDiscountChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_percentage">Discount Percentage</Label>
                <Input
                  type="number"
                  id="discount_percentage"
                  name="discount_percentage"
                  value={discountFormData.discount_percentage}
                  onChange={handleDiscountChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  type="datetime-local"
                  id="valid_from"
                  name="valid_from"
                  value={discountFormData.valid_from}
                  onChange={handleDiscountChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="valid_to">Valid To</Label>
                <Input
                  type="datetime-local"
                  id="valid_to"
                  name="valid_to"
                  value={discountFormData.valid_to}
                  onChange={handleDiscountChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={discountFormData.usage_limit}
                  onChange={handleDiscountChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="mt-4">
              Create Discount Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Campaign List */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              onClick={() => setSelectedCampaignId(campaign.id)}
              className={`cursor-pointer ${
                selectedCampaignId === campaign.id ? "border-primary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Type: {campaign.campaign_type}</p>
                <p>Scheduled At: {new Date(campaign.scheduled_at).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Campaign Performance Chart */}
      {selectedCampaignId && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Campaign Performance</h2>
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="opens" fill="#1e40af" name="Opens" />
                  <Bar dataKey="clicks" fill="#ef4444" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;