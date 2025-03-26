"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch inbound call logs
    const fetchIncomingCalls = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/call-center/user/call-history/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        // Filter for inbound calls
        const inboundCalls = response.data.filter((call: CallLog) => call.direction === "inbound");
        setIncomingCalls(inboundCalls);
      } catch (error) {
        console.error("Error fetching inbound call logs:", error);
      }
    };

    fetchIncomingCalls();
  }, []);

  useEffect(() => {
    // Establish WebSocket connection for real-time updates
    const wsUrl = `ws://${window.location.hostname}:8001/ws/incoming_calls/`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log("WebSocket connected for incoming calls");
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Incoming call notification:", data);

      // Update incoming call logs in real-time
      setIncomingCalls((prevCalls) => [
        ...prevCalls,
        {
          id: prevCalls.length + 1,
          session_id: data.sessionId,
          caller_number: data.callerNumber,
          destination_number: data.destinationNumber,
          direction: "inbound", // Ensure this is set correctly
          status: data.callSessionState || "Ringing",
          start_time: new Date().toISOString(),
          end_time: null,
          duration: null,
        },
      ]);
    };

    socket.current.onclose = () => {
      console.log("WebSocket disconnected for incoming calls");
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error for incoming calls:", error);
    };

    // Cleanup WebSocket connection on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  return (
    <Container>
      <h1>Incoming Call Manager</h1>
      <Table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Caller Number</th>
            <th>Destination Number</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {incomingCalls.map((call) => (
            <tr key={call.id}>
              <td>{call.session_id}</td>
              <td>{call.caller_number}</td>
              <td>{call.destination_number || "N/A"}</td>
              <td>{call.status}</td>
              <td>{new Date(call.start_time).toLocaleString()}</td>
              <td>{call.end_time ? new Date(call.end_time).toLocaleString() : "N/A"}</td>
              <td>{call.duration ? `${call.duration}s` : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default IncomingCallManager;