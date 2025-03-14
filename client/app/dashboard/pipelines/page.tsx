"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PipelineManager from "./PipelineManager";

interface Pipeline {
  id: number;
  client_name: string;
  status: number;
  last_updated: string;
}

// Map numeric status values to labels and colors
const statusLabels: Record<number, string> = {
  1: "Lead",
  2: "Negotiation",
  3: "Onboarding",
  4: "Active",
  5: "Closed",
};

const statusColors: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-yellow-500",
  3: "bg-purple-500",
  4: "bg-green-500",
  5: "bg-gray-500",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Pipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No access token found. User might not be logged in.");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}pipeline/pipelines/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPipelines(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Pipelines</CardTitle>
      </CardHeader>
      <CardContent>
        <PipelineManager />
        {loading && <Skeleton className="h-40 w-full" />}
      </CardContent>
    </Card>
  );
}
