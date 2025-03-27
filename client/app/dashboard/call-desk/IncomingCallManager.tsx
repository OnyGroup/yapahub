"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "@/components/ui/table";
import { Container } from "@/components/ui/container";

interface CallLog {
  id: number;
  session_id: string;
  caller_number: string;
  destination_number: string;
  direction: string;
  status: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
}

const IncomingCallManager: React.FC = () => {
  const [incomingCalls, setIncomingCalls] = useState<CallLog[]>([]);

  useEffect(() => {
    const fetchIncomingCalls = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/call-center/user/call-history/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setIncomingCalls(response.data);
      } catch (error) {
        console.error("Error fetching incoming calls:", error);
      }
    };

    fetchIncomingCalls();
  }, []);

  return (
    <Container>
      <h2>Recent Incoming Calls</h2>
      <Table>
        <thead>
          <tr>
            <th>Caller</th>
            <th>Time</th>
            <th>Status</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {incomingCalls.map((call) => (
            <tr key={call.id}>
              <td>{call.caller_number}</td>
              <td>{new Date(call.start_time).toLocaleTimeString()}</td>
              <td>{call.status}</td>
              <td>{call.duration ? `${call.duration}s` : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default IncomingCallManager;