"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define TypeScript interfaces for the data
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface AnalyticsData {
  total_revenue: number;
  total_goods_sold: number;
  average_order_value: number;
  top_selling_products: Array<{ product__name: string; total_sold: number }>;
  recent_sales: number;
  low_stock_products: Array<{ name: string; stock: number }>;
  inventory_turnover_rate: number;
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    total_revenue: 0,
    total_goods_sold: 0,
    average_order_value: 0,
    top_selling_products: [],
    recent_sales: 0,
    low_stock_products: [],
    inventory_turnover_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("30"); // Default to 30 days

  // Fetch analytics data from the backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/analytics/sales/dashboard/?time_period=${timePeriod}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        // Normalize the response to ensure all fields exist
        const normalizedData = {
          total_revenue: response.data.total_revenue || 0,
          total_goods_sold: response.data.total_goods_sold || 0,
          average_order_value: response.data.average_order_value || 0,
          top_selling_products: response.data.top_selling_products || [],
          recent_sales: response.data.recent_sales || 0,
          low_stock_products: response.data.low_stock_products || [],
          inventory_turnover_rate: response.data.inventory_turnover_rate || 0,
        };

        setAnalyticsData(normalizedData);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timePeriod]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!analyticsData || Object.keys(analyticsData).length === 0) {
    return <p>No analytics data available.</p>;
  }

  // Prepare data for the bar chart
  const topSellingChartData = analyticsData.top_selling_products?.map((item) => ({
    name: item.product__name,
    sales: item.total_sold,
  })) || [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Business Performance Dashboard</h1>

      {/* Time Period Selector */}
      <div className="mb-6">
        <label className="mr-2">Select Time Period:</label>
        <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a time period" />
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
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${analyticsData.total_revenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Goods Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analyticsData.total_goods_sold}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${analyticsData.average_order_value.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellingChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Low Stock Products Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[auto]">
            <ul>
              {analyticsData.low_stock_products?.length > 0 ? (
                analyticsData.low_stock_products.map((product) => (
                  <li key={product.name} className="flex justify-between py-2 border-b">
                    <span>{product.name}</span>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </li>
                ))
              ) : (
                <p>No products running low on stock.</p>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Inventory Turnover Rate */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inventory Turnover Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{analyticsData.inventory_turnover_rate.toFixed(2)}x</p>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{analyticsData.recent_sales} sales in the last 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;