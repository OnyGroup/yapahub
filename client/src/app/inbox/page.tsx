"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Input from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import axios from "axios"

// Define types for the message
interface Message {
  id: number
  sender: string
  recipient: string
  subject: string
  body: string
}

const Inbox = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isComposing, setIsComposing] = useState<boolean>(false)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>("http://127.0.0.1:8000/inbox/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      setIsComposing(false)
      // Optionally, refresh the messages list here
    } catch (error) {
      console.error("Failed to send message", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Inbox</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Compose</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="recipient" placeholder="Recipient" required />
                <Input name="subject" placeholder="Subject" required />
                <Textarea name="body" placeholder="Message body" required className="min-h-[100px]" />
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : (
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <Card key={message.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl font-medium text-gray-800">{message.subject}</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {message.sender}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{message.body}</p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" onClick={() => alert(`View message ${message.id}`)} className="text-sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center text-gray-500">No messages found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox

