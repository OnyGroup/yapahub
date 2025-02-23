import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function ShippingDelivery() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6">
          <CardHeader>
            <CardTitle>Shipping & Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We offer reliable shipping services to ensure your order reaches you on time.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
              <li>Standard shipping: 5-7 business days</li>
              <li>Express shipping: 2-3 business days</li>
              <li>International shipping available</li>
              <li>Tracking numbers provided for all orders</li>
            </ul>
            <p className="mt-4 text-gray-600">
              For more details on shipping costs and policies, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
