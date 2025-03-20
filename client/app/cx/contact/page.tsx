"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Header from "@/components/header_main_site"

interface FormData {
  name: string
  email: string
  phone: string
  company: string
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    }
    if (!formData.company) {
      newErrors.company = "Company name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please check the form for errors")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "b4aa257b-307a-4313-88b8-414e2203aedf",
          ...formData,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
        toast.success("Form submitted successfully!")
      } else {
        throw new Error("Submission failed")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
    })
    setSubmitted(false)
    setErrors({})
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020220] text-gray-900 dark:text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Thank You for Joining!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your application has been received. We'll be in touch soon to schedule your demo and discuss how Yapa Hub
              can transform your business.
            </p>
            <div className="space-x-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#FF4500] text-white rounded-lg font-semibold hover:bg-[#E63F00] transition"
              >
                Submit Another Response
              </button>
              <Link href="/" className="inline-flex items-center text-[#FF4500] hover:text-[#E63F00] transition">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020220] text-gray-900 dark:text-white">
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center text-[#FF4500] hover:text-[#E63F00] mb-8 transition">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Join the Waitlist</h1>
          <p className="text-gray-300 mb-8">
            Complete the form below to join our waiting list and be among the first to experience Yapa Hub's AI-powered
            customer experience platform.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] focus:outline-none"
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] focus:outline-none"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] focus:outline-none"
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] focus:outline-none"
                placeholder="Acme Inc."
              />
              {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#FF4500] text-white rounded-lg font-semibold hover:bg-[#E63F00] transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Join Waitlist"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
