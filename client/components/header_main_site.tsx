"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  // Set initial state to true for dark mode default
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage, but default to dark if no theme is stored
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Only set to light if explicitly stored as "light"
    setIsDark(storedTheme !== "light");
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

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
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors duration-200 bg-yapa-dark/10 hover:bg-yapa-dark/20 dark:bg-white/10 dark:hover:bg-white/20"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-white" />
          ) : (
            <Moon className="h-5 w-5 text-yapa-dark" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;