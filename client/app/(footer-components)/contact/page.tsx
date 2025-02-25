import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function ContactUs() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow p-6 flex items-center justify-center">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg mb-6">
              Have questions or need assistance? Our team is here to help!
            </p>
            <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-blue-500" />
              <a href="mailto:support@yapahub.com" className="text-gray-700">support@yapahub.com</a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-green-500" />
              <a href="tel:+254011055189" className="text-gray-700">+254 011 055 189</a>
            </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-red-500" />
                <span className="text-gray-700">123 Westlands, Nairobi, Kenya</span>
              </div>
            </div>
            <form className="mt-6 space-y-4">
              <Input type="text" placeholder="Your Name" required className="p-3 border rounded-md w-full" />
              <Input type="email" placeholder="Your Email" required className="p-3 border rounded-md w-full" />
              <Textarea placeholder="Your Message" required className="p-3 border rounded-md w-full" />
              <Button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
                <Send className="w-5 h-5" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
