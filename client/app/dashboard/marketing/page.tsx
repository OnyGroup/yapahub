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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

interface CustomerSegment {
  label: string;
  value: string;
  count: number;
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
  const [newCampaignData, setNewCampaignData] = useState({
    name: "",
    campaign_type: "email",
    subject: "",
    content: "",
    scheduled_at: "",
  });
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}marketing/campaigns/`, {
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

  // Fetch customer segments
  useEffect(() => {
    const fetchCustomerSegments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}analytics/customers/dashboard/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const segments: CustomerSegment[] = [
          { label: "High Spenders", value: "high_spenders", count: response.data.high_spenders },
          { label: "Moderate Spenders", value: "moderate_spenders", count: response.data.moderate_spenders },
          { label: "Low Spenders", value: "low_spenders", count: response.data.low_spenders },
          { label: "Active Users", value: "active_users", count: response.data.active_users },
          { label: "Inactive Users", value: "inactive_users", count: response.data.inactive_users },
          { label: "At-Risk Users", value: "at_risk_users", count: response.data.at_risk_users },
        ];
        setCustomerSegments(segments);
      } catch (error) {
        console.error("Failed to fetch customer segments", error);
      }
    };
    fetchCustomerSegments();
  }, []);

  // Fetch performance data for the selected campaign
  useEffect(() => {
    if (!selectedCampaignId) return;

    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}marketing/campaigns/${selectedCampaignId}/performance/`,
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

  // Handle new campaign form changes
  const handleNewCampaignChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCampaignData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle audience segment selection
  const handleSegmentSelection = async (segments: string[]) => {
    setSelectedSegments(segments);

    // Fetch user IDs for the selected segments
    const audienceIds: number[] = [];
    for (const segment of segments) {
      try {
        const response = await axios.get(`${API_BASE_URL}analytics/customers/segment/${segment}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        audienceIds.push(...response.data.map((user: { id: number }) => user.id));
      } catch (error) {
        console.error(`Failed to fetch users for segment ${segment}`, error);
      }
    }
    setNewCampaignData((prevData) => ({
      ...prevData,
      audience: audienceIds,
    }));
  };

  // Handle new campaign form submission
  const handleNewCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: newCampaignData.name,
            campaign_type: newCampaignData.campaign_type,
            segments: selectedSegments, // Include the selected segments
            subject: newCampaignData.subject,
            content: newCampaignData.content,
            scheduled_at: newCampaignData.scheduled_at,
        };

        await axios.post(`${API_BASE_URL}marketing/campaigns/`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });

        alert("Campaign created successfully and emails sent!");
        setNewCampaignData({
            name: "",
            campaign_type: "email",
            subject: "",
            content: "",
            scheduled_at: "",
        });
        setSelectedSegments([]);

        // Refresh campaigns after creation
        const response = await axios.get(`${API_BASE_URL}marketing/campaigns/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        setCampaigns(response.data);
    } catch (error) {
        console.error("Failed to create campaign", error);
        alert("Failed to create campaign. Please check the details.");
    }
};

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
      await axios.post(`${API_BASE_URL}marketing/discounts/`, discountFormData, {
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

      {/* Create New Campaign Section */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">Create New Campaign</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewCampaignSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newCampaignData.name}
                  onChange={handleNewCampaignChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="campaign_type">Type</Label>
                <Select
                  name="campaign_type"
                  value={newCampaignData.campaign_type}
                  onValueChange={(value) =>
                    setNewCampaignData((prev) => ({ ...prev, campaign_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={newCampaignData.subject}
                  onChange={handleNewCampaignChange}
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={newCampaignData.content}
                  onChange={handleNewCampaignChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="scheduled_at">Scheduled At</Label>
                <Input
                  type="datetime-local"
                  id="scheduled_at"
                  name="scheduled_at"
                  value={newCampaignData.scheduled_at}
                  onChange={handleNewCampaignChange}
                  required
                />
              </div>
              <div>
                <Label>Audience Segments</Label>
                {customerSegments.map((segment) => (
                    <div key={segment.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={segment.value}
                            checked={selectedSegments.includes(segment.value)}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    handleSegmentSelection([...selectedSegments, segment.value]);
                                } else {
                                    handleSegmentSelection(selectedSegments.filter((val) => val !== segment.value));
                                }
                            }}
                        />
                        <Label htmlFor={segment.value}>
                            {segment.label} ({segment.count})
                        </Label>
                    </div>
                ))}
            </div>
            </div>
            <Button type="submit" className="mt-4">
              Create Campaign
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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