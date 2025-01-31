'use client'

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth";

export default function HeaderLogout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("No refresh token found");
      return;
    }

    const success = await logout(refreshToken);

    if (success) {
      router.push("/login");
    }
  };

  return (
    <div onClick={handleLogout} onKeyDown={handleLogout} role="button" tabIndex={0}>
      {children}
    </div>

  )
}