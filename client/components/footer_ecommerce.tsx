import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Logo & About */}
        <div>
          <h2 className="text-2xl font-bold">Yapa Store</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Your one-stop shop for the best deals and quality products.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/faq" className="hover:text-white">FAQs</a></li>
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Support</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="/shipping" className="hover:text-white">Shipping & Delivery</a></li>
            <li><a href="/returns" className="hover:text-white">Returns & Exchanges</a></li>
            <li><a href="/support" className="hover:text-white">Help & Support</a></li>
          </ul>
        </div>

        {/* Column 4: Newsletter & Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
          <div className="flex items-center space-x-2">
            <Input type="email" placeholder="Enter your email" className="text-black" />
            <Button><Mail className="w-5 h-5" /></Button>
          </div>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-blue-400"><Facebook /></a>
            <a href="#" className="hover:text-pink-500"><Instagram /></a>
            <a href="#" className="hover:text-blue-300"><Twitter /></a>
            <a href="#" className="hover:text-red-500"><Youtube /></a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} Yapa Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
