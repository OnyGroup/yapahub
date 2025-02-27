"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import axios from "axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast";

// Define types for the message
interface Message {
  id: number;
  sender_username: string; // Username of the sender
  recipient_username: string; // Username of the recipient
  subject: string;
  body: string;
  timestamp: string;
}

// Define type for WebSocket message
interface WebSocketMessage {
  message: string;
  sender: string;
  recipient?: string;
  subject?: string;
  timestamp?: string;
  id?: number;
}

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});

  // Fetch the current user's username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/auth/me/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setCurrentUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUsername) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    // Create WebSocket connection
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${currentUsername}/?token=${token}`);
    socketRef.current = socket;

    // Connection opened
    socket.addEventListener("open", () => console.log("WebSocket connected"));

    // Listen for messages
    socket.addEventListener('message', (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      // Handle incoming message
      if (data.message && data.sender) {
        // Create a new message object
        const newMessage: Message = {
          id: data.id || Date.now(), // Use provided ID or generate a temporary one
          sender_username: data.sender,
          recipient_username: currentUsername,
          subject: data.subject || "New message",
          body: data.message,
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        // Add message to state
        setMessages(prevMessages => {
          if (!prevMessages.some(msg => msg.id === newMessage.id)) {
            return [...prevMessages, newMessage]; // Prevent duplicates
          }
          return prevMessages;
        });        
        
        // Show notification
        toast({
          title: `New message from ${data.sender}`,
          description: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
        });
      }
    });

    // Connection closed
    socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed, attempting to reconnect...");
      setTimeout(() => {
        if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
          const token = localStorage.getItem("accessToken");
          socketRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${currentUsername}/?token=${token}`);
        }
      }, 3000);  // Reconnect after 3 seconds
    });    

    // Connection error
    socket.addEventListener("error", (event) => console.error("WebSocket error:", event));

    return () => socket.close();
  }, [currentUsername, toast]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>("http://127.0.0.1:8000/inbox/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Organize messages into conversations
  useEffect(() => {
    if (!currentUsername) return;
    
    const newConversations: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      // Determine the conversation partner (the other person)
      const conversationPartner = 
        message.sender_username === currentUsername 
          ? message.recipient_username 
          : message.sender_username;
      
      if (!newConversations[conversationPartner]) {
        newConversations[conversationPartner] = [];
      }
      
      newConversations[conversationPartner].push(message);
    });
    
    // Sort messages in each conversation by timestamp
    Object.keys(newConversations).forEach(partner => {
      newConversations[partner].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
    
    setConversations(newConversations);
  }, [messages, currentUsername]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const recipient = formData.get("recipient") as string;
    const subject = formData.get("subject") as string;
    const body = formData.get("body") as string;
    
    const newMessage = {
      recipient,
      subject,
      body,
    };
  
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        // Send message via WebSocket
        socketRef.current.send(JSON.stringify({
          message: body,
          recipient: recipient,
          subject: subject
        }));
        
        // Add the sent message to our local state
        const sentMessage: Message = {
          id: Date.now(), // Temporary ID
          sender_username: currentUsername,
          recipient_username: recipient,
          subject,
          body,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        
        // Close the dialog
        setIsDialogOpen(false);
        setReplyTo(null);
        
        // Show success toast
        toast({
          title: "Message Sent",
          description: "Your message was sent successfully.",
          variant: "default",
        });
        
        // Clear form
        if (event.currentTarget) {
          event.currentTarget.reset();
        }
      } else {
        // Fallback to HTTP if WebSocket is not available
        const response = await axios.post("http://127.0.0.1:8000/inbox/send_message/", newMessage, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        // Same handling as before...
        const sentMessage: Message = {
          id: response.data.id || Date.now(),
          sender_username: currentUsername,
          recipient_username: recipient,
          subject,
          body,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        setIsDialogOpen(false);
        setReplyTo(null);
        
        toast({
          title: "Message Sent",
          description: "Your message was sent successfully.",
          variant: "default",
        });
        
        if (event.currentTarget) {
          event.currentTarget.reset();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to send message", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-1/3 border-r bg-background">
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Inbox</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setIsDialogOpen(true)}>New Message</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="recipient" placeholder="Recipient" required />
                <Input name="subject" placeholder="Subject" required />
                <Textarea name="body" placeholder="Message body" required className="min-h-[100px]" />
                <Button type="submit" className="w-full">
                  Send
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {Object.entries(conversations).map(([partner, partnerMessages]) => {
            const lastMessage = partnerMessages[partnerMessages.length - 1];
            return (
              <Card
                key={partner}
                onClick={() => setSelectedConversation(partner)}
                className={`mb-4 mx-4 cursor-pointer ${
                  selectedConversation === partner ? "border-primary" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${partner}`} />
                      <AvatarFallback>{partner[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{partner}</CardTitle>
                      <CardContent className="text-sm text-muted-foreground p-0">
                        {lastMessage?.body.substring(0, 30)}
                        {lastMessage?.body.length > 30 ? '...' : ''}
                      </CardContent>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="bg-white p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedConversation}</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              {conversations[selectedConversation]?.map((message) => (
                <Card key={message.id} className={`mb-4 ${message.sender_username === currentUsername ? 'ml-12 bg-primary/10' : 'mr-12'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{message.subject}</h3>
                      <span className="text-sm text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="font-medium text-xs text-muted-foreground">
                        {message.sender_username === currentUsername ? 'You' : message.sender_username}
                      </span>
                    </div>
                    <p className="text-foreground mb-4">{message.body}</p>
                    {message.sender_username !== currentUsername && (
                      <Button variant="outline" size="sm" onClick={() => setReplyTo(message.id)}>
                        Reply
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
            {replyTo && (
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="recipient" value={selectedConversation} hidden readOnly />
                  <Input
                    name="subject"
                    placeholder="Subject"
                    required
                    defaultValue={`Re: ${conversations[selectedConversation]?.find((m) => m.id === replyTo)?.subject}`}
                  />
                  <Textarea name="body" placeholder="Type your reply..." required className="min-h-[100px]" />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Reply</Button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox