import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";
import { Users, ShoppingCart, Globe, Heart } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg mb-6">
              Welcome to <span className="font-semibold text-blue-600">Yapa Store</span>! We are passionate about providing high-quality products at affordable prices.
              Our journey started with a simple mission: to make online shopping a seamless and enjoyable experience.
            </p>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-500" />
                <span className="text-gray-700">A dedicated team committed to customer satisfaction.</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-6 h-6 text-green-500" />
                <span className="text-gray-700">Curated products tailored to your needs.</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-indigo-500" />
                <span className="text-gray-700">A seamless online shopping experience.</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-red-500" />
                <span className="text-gray-700">Customer satisfaction at the heart of everything we do.</span>
              </div>
            </div>
            <p className="mt-6 text-gray-700 text-lg">
              Thank you for being part of our journey. We look forward to serving you with the best shopping experience!
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
