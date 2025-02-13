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

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch campaigns and performance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch campaigns
        const campaignsResponse = await axios.get("http://127.0.0.1:8000/marketing/campaigns/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setCampaigns(campaignsResponse.data);

        // Fetch performance data (example endpoint)
        const performanceResponse = await axios.get("http://127.0.0.1:8000/marketing/campaigns/performance/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setPerformanceData(performanceResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Marketing Dashboard</h1>

      {/* Campaign List */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
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
    </div>
  );
};

export default MarketingDashboard;