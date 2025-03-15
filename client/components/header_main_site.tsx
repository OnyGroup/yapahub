"use client";

import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

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
          className="font-medium"
        >
          Login
        </Button>
        {/* Removed the theme toggle button */}
      </div>
    </header>
  );
};

export default Header;