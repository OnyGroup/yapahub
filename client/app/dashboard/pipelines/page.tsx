import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  lead: "bg-blue-500",
  negotiation: "bg-yellow-500",
  onboarding: "bg-purple-500",
  active: "bg-green-500",
  closed: "bg-gray-500",
};

export default function Pipelines() {
  const [pipelines, setPipelines] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cx_pipeline/pipelines/")
      .then((res) => res.json())
      .then((data) => {
        setPipelines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPipelines = filteredStatus
    ? pipelines.filter((p) => p.status === filteredStatus)
    : pipelines;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Pipelines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Select onValueChange={setFilteredStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {Object.keys(statusColors).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell>{pipeline.client_name}</TableCell>
                  <TableCell>{pipeline.current_stage?.name || "No Stage"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[pipeline.status]}>{pipeline.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(pipeline.last_updated).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
