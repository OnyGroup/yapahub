import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";
import { TruckIcon, ClockIcon, GlobeAltIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function ShippingDelivery() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow p-6 bg-gray-100">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Shipping & Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mt-4">
              We offer reliable shipping services to ensure your order reaches you on time.
            </p>
            <ul className="list-none mt-6 space-y-4">
              <li className="flex items-center space-x-4">
                <TruckIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Standard shipping: 5-7 business days</span>
              </li>
              <li className="flex items-center space-x-4">
                <ClockIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Express shipping: 2-3 business days</span>
              </li>
              <li className="flex items-center space-x-4">
                <GlobeAltIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">International shipping available</span>
              </li>
              <li className="flex items-center space-x-4">
                <MapPinIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Tracking numbers provided for all orders</span>
              </li>
            </ul>
            <p className="mt-6 text-gray-700">
              For more details on shipping costs and policies, please{' '}
              <a href="/support" className="text-blue-500 underline font-semibold">
                contact our support team
              </a>.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
