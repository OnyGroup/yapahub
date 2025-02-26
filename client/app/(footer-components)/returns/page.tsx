import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";
import { ArrowPathIcon, CheckCircleIcon, InboxArrowDownIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ReturnsExchanges() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Returns & Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <AlertTitle className="text-lg font-semibold">Easy Returns</AlertTitle>
                  <AlertDescription className="text-gray-700">
                    We accept returns within <strong>7 days</strong> of purchase if the item is unused and in its original packaging.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
            <p className="text-gray-700 mb-4">
              If you're not satisfied with your purchase, follow these steps to return or exchange your item:
            </p>
            <ul className="list-none space-y-4">
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Ensure the item is in its original condition</span>
              </li>
              <li className="flex items-center space-x-3">
                <InboxArrowDownIcon className="h-6 w-6 text-indigo-500" />
                <span className="text-gray-700">Fill out the return request form</span>
              </li>
              <li className="flex items-center space-x-3">
                <ArrowPathIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">Ship the item back to our return center</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                <span className="text-gray-700">Receive a refund or exchange within 5 business days</span>
              </li>
            </ul>
            <p className="mt-6 text-gray-700 flex items-start space-x-3">
              <XCircleIcon className="h-6 w-6 text-red-500" />
              <span>
                Please note that shipping fees for returns are non-refundable unless the return is due to a defect.
              </span>
            </p>
            <p className="mt-6 text-gray-700">
              Have questions?{' '}
              <a href="/support" className="text-blue-500 underline font-semibold">
                Contact our support team
              </a>.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
