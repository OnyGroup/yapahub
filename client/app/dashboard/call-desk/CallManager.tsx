"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";
import { toast } from "react-hot-toast";

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

const CallManager: React.FC = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeCall, setActiveCall] = useState<CallLog | null>(null);
  const [callStatus, setCallStatus] = useState<"disconnected" | "dialing" | "ringing" | "active">("disconnected");
  const [callerId, setCallerId] = useState('');
  const socket = useRef<WebSocket | null>(null);
  const callSocket = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);

  // Fetch caller ID and initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [callerResponse, logsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/call-center/caller-id/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }),
          axios.get("http://127.0.0.1:8000/call-center/user/call-history/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          })
        ]);
        
        setCallerId(callerResponse.data.caller_id);
        setCallLogs(logsResponse.data);
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize call data");
      }
    };

    initializeData();

    // WebSocket connection for incoming calls
    const wsUrl = `ws://${window.location.hostname}:8001/ws/incoming_calls/`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log("WebSocket connected for incoming calls");
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);
      
      if (data.event === "incoming_call" && callStatus === "disconnected") {
        handleIncomingCall(data);
      } else if (data.event === "call_ended") {
        handleCallEnded(data.session_id);
      }
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error. Please refresh.");
    };

    return () => {
      socket.current?.close();
      callSocket.current?.close();
    };
  }, [callStatus]);

  const handleIncomingCall = (data: any) => {
    const newCall: CallLog = {
      id: Date.now(),
      session_id: data.session_id,
      caller_number: data.caller_number,
      destination_number: data.destination_number,
      direction: "inbound",
      status: "ringing",
      start_time: new Date().toISOString(),
      end_time: null,
      duration: null
    };
    
    setActiveCall(newCall);
    setCallStatus("ringing");
    toast(`Incoming call from ${data.caller_number}`, { 
      duration: 30000,
      icon: '📞',
      position: 'top-right'
    });

    // Play ringtone
    if (audioRef.current) {
      audioRef.current.src = "/sounds/ringtone.mp3";
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio play error:", e));
    }
  };

  const handleCallEnded = (sessionId: string) => {
    if (activeCall?.session_id === sessionId) {
      setActiveCall(null);
      setCallStatus("disconnected");
      stopAudio();
      toast.success("Call ended");
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const initiateCall = async () => {
    if (!phoneNumber.match(/^\+\d{10,15}$/)) {
      toast.error("Please enter a valid phone number (E.164 format)");
      return;
    }

    try {
      setCallStatus("dialing");
      const response = await axios.post(
        "http://127.0.0.1:8000/call-center/make-call/",
        { phone_number: phoneNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );

      const newCall: CallLog = {
        id: Date.now(),
        session_id: response.data.session_id,
        caller_number: callerId,
        destination_number: phoneNumber,
        direction: "outbound",
        status: "dialing",
        start_time: new Date().toISOString(),
        end_time: null,
        duration: null
      };

      setActiveCall(newCall);
      toast(`Calling ${phoneNumber}...`);

      // Connect to call-specific WebSocket
      const callWsUrl = `ws://${window.location.hostname}:8001/ws/call_status/${response.data.session_id}/`;
      callSocket.current = new WebSocket(callWsUrl);

      callSocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Call status update:", data);
        
        if (data.message.status === "active") {
          setCallStatus("active");
          startWebRTCCall(response.data.session_id);
        } else if (data.message.status === "ended") {
          handleCallEnded(response.data.session_id);
        }
      };

    } catch (error) {
      console.error("Call initiation error:", error);
      setCallStatus("disconnected");
      toast.error("Failed to initiate call");
    }
  };

  const answerCall = async () => {
    if (!activeCall) return;
    
    try {
      setCallStatus("active");
      stopAudio();
      
      await axios.post(
        "http://127.0.0.1:8000/call-center/answer-call/",
        { session_id: activeCall.session_id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      
      startWebRTCCall(activeCall.session_id);
      toast.success("Call answered");

    } catch (error) {
      console.error("Error answering call:", error);
      toast.error("Failed to answer call");
    }
  };

  const endCall = async () => {
    if (!activeCall) return;
    
    try {
      await axios.post(
        "http://127.0.0.1:8000/call-center/end-call/",
        { session_id: activeCall.session_id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
      );
      
      handleCallEnded(activeCall.session_id);

    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end call");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implement actual mute functionality with WebRTC
    toast.success(`Microphone ${isMuted ? "unmuted" : "muted"}`);
  };

  const toggleHold = () => {
    setIsOnHold(!isOnHold);
    // Implement actual hold functionality
    toast.success(`Call ${isOnHold ? "resumed" : "placed on hold"}`);
  };

  const startWebRTCCall = (sessionId: string) => {
    console.log("Starting WebRTC connection for session:", sessionId);
    // WebRTC implementation would go here
    // This would include:
    // 1. Creating a peer connection
    // 2. Setting up media streams
    // 3. Handling ICE candidates
    // 4. Connecting to audio/video elements
  };

  return (
    <Container className="space-y-6">
      <h1 className="text-2xl font-bold">Call Desk</h1>
      
      {/* Call Controls */}
      <div className="space-y-4 p-4 border rounded-lg">
        {callStatus === "disconnected" ? (
          <div className="flex space-x-2">
            <Input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number (e.g., +254712345678)"
              className="flex-1"
            />
            <Button onClick={initiateCall} disabled={!callerId}>
              Call
            </Button>
          </div>
        ) : callStatus === "ringing" ? (
          <div className="space-y-2">
            <p className="font-medium">Incoming call from: {activeCall?.caller_number}</p>
            <div className="flex space-x-2">
              <Button onClick={answerCall} className="bg-green-600 hover:bg-green-700">
                Answer
              </Button>
              <Button onClick={endCall} variant="destructive">
                Decline
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">
              {activeCall?.direction === "inbound"
                ? `In call with: ${activeCall?.caller_number}`
                : `Calling: ${activeCall?.destination_number}`}
            </p>
            <div className="flex space-x-2">
              <Button onClick={endCall} variant="destructive">
                End Call
              </Button>
              <Button onClick={toggleMute} variant="outline">
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button onClick={toggleHold} variant="outline">
                {isOnHold ? "Resume" : "Hold"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Call Logs */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">Direction</th>
              <th className="px-6 py-3">Number</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {callLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 capitalize">{log.direction}</td>
                <td className="px-6 py-4">
                  {log.direction === "inbound" ? log.caller_number : log.destination_number}
                </td>
                <td className="px-6 py-4 capitalize">{log.status}</td>
                <td className="px-6 py-4">
                  {new Date(log.start_time).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4">
                  {log.duration ? `${log.duration}s` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </Container>
  );
};

export default CallManager;