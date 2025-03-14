import { Bell, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()

    const handleLogout = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const accessToken = localStorage.getItem('accessToken')
    
        if (!accessToken) {
          console.error('No access token found')
          return
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        // Send the logout request to the backend
        const response = await fetch(`${API_BASE_URL}auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,  // Send the access token in the request
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
    
        if (response.ok) {
          // Clear tokens
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
    
          // Redirect to login page
          router.push('/login')
        } else {
          console.error('Logout failed')
        }
      } catch (error) {
        console.error('An error occurred while logging out:', error)
      }
    }

  return (
    <header className="bg-background border-b flex items-center justify-between px-4 py-2">
      <div className="flex-1 max-w-xl">
        <Input type="search" placeholder="Search..." className="w-full" />
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
