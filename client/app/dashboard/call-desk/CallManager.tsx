"use client";

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";

interface CallLog {
  id: number;
  session_id: string;
  phone_number: string;
  status: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
}

const CallManager: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const socket = useRef<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/call-center/user/call-history/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setCallLogs(response.data);

        // Set session ID from the first call log for testing purposes
        if (response.data.length > 0) {
          setSessionId(response.data[0].session_id);
        }
      } catch (error) {
        console.error('Error fetching call logs:', error);
      }
    };

    fetchCallLogs();

    if (sessionId) {
      // Set up WebSocket connection
      socket.current = io(`ws://${window.location.hostname}:8000/ws/call_status/${sessionId}/`, {
        path: '/ws/call_status/',
        transports: ['websocket'],
        extraHeaders: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      socket.current.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.current.on('call_status_message', (data: any) => {
        // Handle real-time call status updates
        setCallLogs((prevLogs) =>
          prevLogs.map((log) =>
            log.session_id === data.session_id ? { ...log, status: data.status } : log
          )
        );
      });

      socket.current.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [sessionId]);

  const initiateCall = async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/call-center/make-call/',
        { phone_number: phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      // Optionally, update the UI or show a success message
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  return (
    <Container>
      <h1>Call Manager</h1>
      <Input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
      />
      <Button onClick={initiateCall}>Initiate Call</Button>
      <Table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {callLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.session_id}</td>
              <td>{log.phone_number}</td>
              <td>{log.status}</td>
              <td>{new Date(log.start_time).toLocaleString()}</td>
              <td>{log.end_time ? new Date(log.end_time).toLocaleString() : 'N/A'}</td>
              <td>{log.duration ? `${log.duration}s` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CallManager;
