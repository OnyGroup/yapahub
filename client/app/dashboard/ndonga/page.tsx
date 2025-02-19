"use client"

import React, { useState } from "react";
import axios from "axios";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // Send request to the backend
    try {
      const response = await axios.post("/chat", { message: input });
      const botReply = response.data.response;

      // Add bot reply to the chat
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ccc", padding: "10px" }}>
      <div style={{ height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <strong>{msg.sender === "user" ? "You" : "Ndonga"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "70%", padding: "5px" }}
        />
        <button onClick={sendMessage} style={{ marginLeft: "5px", padding: "5px 10px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;