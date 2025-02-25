"use client"

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, HelpCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function HelpSupport() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Help & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              Need assistance? Our support team is here to help you with any inquiries. Feel free to reach out to us through the following channels:
            </p>
    <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-blue-500" />
                <a href="mailto:support@yapahub.com" className="text-gray-700">
                  support@yapahub.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-green-500" />
                <a href="tel:+254011055189" className="text-gray-700">
                  +254 011 055 189
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-red-500" />
                <span className="text-gray-700">Westlands, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-indigo-500" />
                <span className="text-gray-700">Mon - Fri: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
              <div className="mt-6">
                <Button
                  className="w-full flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => router.push('/contact')}
                >
                  <HelpCircle className="w-6 h-6" />
                  Contact Support
                </Button>
              </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
