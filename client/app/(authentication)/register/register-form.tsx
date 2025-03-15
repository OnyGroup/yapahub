"use client" 

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Phone, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import useDictionary from "@/locales/dictionary-hook"
import { registerUser } from "@/services/auth"
import type { RegisterUserData } from "@/types/auth"

export default function RegisterForm() {
  const router = useRouter()
  const dict = useDictionary()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<RegisterUserData>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    access_level: "business_owner" // Set default access level to business_owner
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await registerUser(formData)
      if (response) {
        toast({
          title: "Registration Successful",
          description: "Your business owner account has been created successfully.",
          variant: "default",
        })
        
        // Redirect after a short delay to allow the toast to be seen
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Registration failed"
      setError(errorMessage)
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="first_name"
              name="first_name"
              type="text"
              required
              disabled={submitting}
              value={formData.first_name}
              onChange={handleChange}
              className="pl-10"
              placeholder="John"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="last_name"
              name="last_name"
              type="text"
              required
              disabled={submitting}
              value={formData.last_name}
              onChange={handleChange}
              className="pl-10"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">{dict.signup.form.username}</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            name="username"
            type="text"
            required
            disabled={submitting}
            value={formData.username}
            onChange={handleChange}
            className="pl-10"
            placeholder="johndoe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dict.signup.form.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={submitting}
            value={formData.email}
            onChange={handleChange}
            className="pl-10"
            placeholder="john.doe@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            disabled={submitting}
            value={formData.phone_number}
            onChange={handleChange}
            className="pl-10"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{dict.signup.form.password}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={submitting}
            value={formData.password}
            onChange={handleChange}
            className="pl-10"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full mt-2">
        {submitting ? "Registering..." : dict.signup.form.submit}
      </Button>
    </form>
  )
}