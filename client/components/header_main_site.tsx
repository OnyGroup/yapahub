"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const Header: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    document.documentElement.classList.remove("dark")
    localStorage.removeItem("theme")
  }, [])

  const handleLogin = () => {
    router.push("/login")
  }

  const handleJoinWaitlist = () => {
    router.push("/cx/contact")
  }

  return (
    <header className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <a href="/">
          <img src="/images/Logo.svg" alt="Yapa Hub Logo" width="118" height="38" />
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogin}
          className="font-medium border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400"
        >
          Login
        </Button>
        <Button
          size="sm"
          onClick={handleJoinWaitlist}
          className="font-medium bg-[#FF4500] hover:bg-[#E63F00] text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          Join Waitlist
        </Button>
      </div>
    </header>
  )
}

export default Header

