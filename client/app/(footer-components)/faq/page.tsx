import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import Header from "@/components/header_ecommerce";
import Footer from "@/components/footer_ecommerce";
import { Info, Package, CreditCard, RefreshCcw, Lock } from "lucide-react";

export default function FAQ() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow p-6">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="shipping">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-500" />
                    How long does shipping take?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Shipping times vary based on your location. Typically, orders are delivered within 5-7 business days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-green-500" />
                    What is your return policy?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  We accept returns within 7 days of purchase, provided the item is in its original condition.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payments">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    What payment methods do you accept?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards, PayPal, MPESA, and other secure payment options.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="security">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Is my payment information secure?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we use industry-standard encryption and security measures to protect your payment details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="support">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-yellow-500" />
                    How can I contact customer support?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  You can reach our support team via email at{" "}
                  <a className="text-blue-600 hover:text-blue-800 underline" href="mailto:support@yapahub.com">
                    support@yapahub.com
                  </a>
                  , call us at{" "}
                  <a className="text-blue-600 hover:text-blue-800 underline" href="tel:+254011055189">
                    +254 011 055 189
                  </a>
                  , or visit our{" "}
                  <a className="text-blue-600 hover:text-blue-800 underline" href="/support">
                    support page
                  </a>
                  {" "}to submit a request form.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
