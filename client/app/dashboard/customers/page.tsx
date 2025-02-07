"use client";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Define TypeScript interfaces for the data
interface CustomerData {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  retention_rate: number;
  churn_rate: number;
  average_clv: number;
  top_clv_customers: Array<{ username: string; total_spent: number }>;
  high_spenders: number;
  moderate_spenders: number;
  low_spenders: number;
  active_users: number;
  inactive_users: number;
  at_risk_users: number;
  repeat_purchase_rate: number;
  purchase_frequency: number;
  activity_timeline: Array<{ timestamp__date: string; total_sales: number }>;
}

const CustomersDashboard = () => {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("30"); // Default time period (30 days)

  // Fetch customer analytics data from the backend
  const fetchCustomerData = async (period: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/analytics/customers/dashboard/?time_period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setCustomerData(response.data);
    } catch (error) {
      console.error("Failed to fetch customer data", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and whenever the time period changes
  useEffect(() => {
    fetchCustomerData(timePeriod);
  }, [timePeriod]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Customer Insights</h1>
        {/* Skeleton Loader */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top CLV Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul>
                {[...Array(5)].map((_, index) => (
                  <li key={index} className="flex justify-between py-2 border-b">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-16" />
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerData) {
    return <p>No customer data available.</p>;
  }

  // Prepare data for the activity timeline chart
  const activityTimelineData = customerData.activity_timeline.map((item) => ({
    date: item.timestamp__date,
    sales: item.total_sales,
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Insights</h1>

      {/* Time Period Selector */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Select Time Period:</label>
        <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customerData.total_customers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customerData.active_customers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customerData.new_customers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Retention and Churn Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{customerData.retention_rate.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{customerData.churn_rate.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Average CLV */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Average Customer Lifetime Value (CLV)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${customerData.average_clv.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Top CLV Customers */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top CLV Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <ul>
              {customerData.top_clv_customers.map((customer, index) => (
                <li key={index} className="flex justify-between py-2 border-b">
                  <span>{customer.username}</span>
                  <Badge variant="secondary">${customer.total_spent.toFixed(2)}</Badge>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Activity Timeline Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityTimelineData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Segmentation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            <li className="flex justify-between py-2">
              <span>High Spenders</span>
              <Badge variant="success">{customerData.high_spenders}</Badge>
            </li>
            <li className="flex justify-between py-2">
              <span>Moderate Spenders</span>
              <Badge variant="secondary">{customerData.moderate_spenders}</Badge>
            </li>
            <li className="flex justify-between py-2">
              <span>Low Spenders</span>
              <Badge variant="destructive">{customerData.low_spenders}</Badge>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* User Activity Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Activity Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            <li className="flex justify-between py-2">
              <span>Active Users</span>
              <Badge variant="success">{customerData.active_users}</Badge>
            </li>
            <li className="flex justify-between py-2">
              <span>Inactive Users</span>
              <Badge variant="destructive">{customerData.inactive_users}</Badge>
            </li>
            <li className="flex justify-between py-2">
              <span>At-Risk Users</span>
              <Badge variant="outline">{customerData.at_risk_users}</Badge>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Purchase Behavior */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Purchase Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            <li className="flex justify-between py-2">
              <span>Repeat Purchase Rate</span>
              <Badge variant="success">{customerData.repeat_purchase_rate.toFixed(2)}%</Badge>
            </li>
            <li className="flex justify-between py-2">
              <span>Average Purchase Frequency</span>
              <Badge variant="secondary">{customerData.purchase_frequency.toFixed(2)}</Badge>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersDashboard;