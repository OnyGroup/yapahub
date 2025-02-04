"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import useDictionary from "@/locales/dictionary-hook"
import { registerUser } from "@/services/auth"
import type { RegisterUserData } from "@/types/auth"

export default function RegisterForm() {
  const router = useRouter()
  const dict = useDictionary()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<RegisterUserData>({
    username: "",
    email: "",
    password: "",
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
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          />
        </div>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Registering..." : dict.signup.form.submit}
      </Button>
    </form>
  )
}

