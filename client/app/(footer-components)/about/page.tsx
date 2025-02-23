import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="flex-grow flex items-center justify-center p-6">
        <Card className="max-w-4xl mx-auto p-6">
          <CardHeader>
            <CardTitle>About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Welcome to Yapa Store! We are passionate about providing high-quality products
              at affordable prices. Our journey started with a simple mission: to make online
              shopping a seamless and enjoyable experience. With a dedicated team and a commitment
              to customer satisfaction, we strive to bring you the best products curated for
              your needs.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
