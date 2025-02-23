import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";

export default function ReturnsExchanges() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6">
          <CardHeader>
            <CardTitle>Returns & Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>Easy Returns</AlertTitle>
              <AlertDescription>
                We accept returns within <strong>7 days</strong> of purchase if the item is unused and in its original packaging.
              </AlertDescription>
            </Alert>
            <p className="text-gray-600">
              If you are not satisfied with your purchase, you may return or exchange it following these steps:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
              <li>Ensure the item is in its original condition</li>
              <li>Fill out the return request form</li>
              <li>Ship the item back to our return center</li>
              <li>Receive a refund or exchange within 5 business days</li>
            </ul>
            <p className="mt-4 text-gray-600">
              Please note that shipping fees for returns are non-refundable unless the return is due to a defect.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
