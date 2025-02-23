"use client";

import React from "react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, SearchIcon, ShoppingCartIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useCart } from "./CartContext";

// Define types for navigation links
interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
];

interface HeaderProps {
  onSearch?: (term: string) => void; // makes onsearch optional 
}

export default function Header({ onSearch }: HeaderProps) {
  const { cartCount } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate authentication
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) { // Only call if defined
      onSearch(term);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            Yapa Store
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <Link href={item.href} className="text-sm font-medium hover:text-primary">
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-grow max-w-md mx-4">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-md"
          />
          <Button variant="ghost" size="icon" className="ml-2">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions (Cart, User) */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCartIcon className="h-5 w-5" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </Badge>
          </Button>
          </Link>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsAuthenticated(false)}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/register">Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} className="text-lg font-medium">
                  {item.label}
                </Link>
              ))}
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-4"
              />
              <Button variant="outline" className="mt-4">
                Cart ({cartCount})
              </Button>
              {isAuthenticated ? (
                <>
                  <Button variant="link" asChild>
                    <Link href="/profile">Profile</Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href="/orders">Orders</Link>
                  </Button>
                  <Button variant="link" onClick={() => setIsAuthenticated(false)}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="link" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button variant="link" asChild>
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}