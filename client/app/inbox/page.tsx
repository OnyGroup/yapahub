"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import axios from "axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define types for the message
interface Message {
  id: number
  sender: string
  recipient: string
  subject: string
  body: string
  timestamp: string
}

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedSender, setSelectedSender] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<number | null>(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>("http://127.0.0.1:8000/inbox/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        setMessages(response.data)
      } catch (error) {
        console.error("Failed to fetch messages", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newMessage = {
      recipient: formData.get("recipient") as string,
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
    }

    try {
      await axios.post("http://127.0.0.1:8000/inbox/send_message/", newMessage, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      // Refresh messages after sending
      const response = await axios.get<Message[]>("http://127.0.0.1:8000/inbox/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      setMessages(response.data)
      setReplyTo(null)
    } catch (error) {
      console.error("Failed to send message", error)
    }
  }

  const groupedMessages = messages.reduce(
    (acc, message) => {
      if (!acc[message.sender]) {
        acc[message.sender] = []
      }
      acc[message.sender].push(message)
      return acc
    },
    {} as Record<string, Message[]>,
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r">
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Inbox</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">New Message</Button>
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
        <ScrollArea className="h-[calc(100vh-120px)]">
          {Object.entries(groupedMessages).map(([sender, senderMessages]) => (
            <div
              key={sender}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedSender === sender ? "bg-gray-200" : ""}`}
              onClick={() => setSelectedSender(sender)}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${sender}`} />
                  <AvatarFallback>{sender[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{sender}</p>
                  <p className="text-sm text-gray-500 truncate">{senderMessages[senderMessages.length - 1].body}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedSender ? (
          <>
            <div className="bg-white p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedSender}</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              {groupedMessages[selectedSender].map((message) => (
                <Card key={message.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{message.subject}</h3>
                      <span className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{message.body}</p>
                    <Button variant="outline" size="sm" onClick={() => setReplyTo(message.id)}>
                      Reply
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
            {replyTo && (
              <div className="p-4 bg-white border-t">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="recipient" value={selectedSender} hidden readOnly />
                  <Input
                    name="subject"
                    placeholder="Subject"
                    required
                    defaultValue={`Re: ${groupedMessages[selectedSender].find((m) => m.id === replyTo)?.subject}`}
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
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox

