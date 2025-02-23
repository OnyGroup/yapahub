import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function HelpSupport() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6">
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Need help? Our support team is available to assist you with any inquiries.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>support@yapahub.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>+254 011 055 189</span>
              </div>
            </div>
            <div className="mt-6">
              <Button className="w-full flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
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
