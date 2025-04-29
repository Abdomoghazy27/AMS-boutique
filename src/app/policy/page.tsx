
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, ShieldCheck } from 'lucide-react'; // Replaced PackageReturn with Package

export default function PolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center">
          <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-4" />
          <CardTitle className="text-4xl font-extrabold tracking-tight">Our Policies</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Shipping, Returns, and Everything In Between.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <Accordion type="single" collapsible className="w-full">

            {/* Shipping Policy */}
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-xl font-semibold text-primary hover:no-underline">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6" />
                  Shipping Policy
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4 text-muted-foreground leading-relaxed">
                <p>We offer shipping across [Your Country/Region - e.g., the United States]. Orders are typically processed within 1-2 business days. Once shipped, delivery times may vary based on your location and the selected shipping method.</p>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Shipping Rates (Example):</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Standard Shipping (5-7 business days): $5.00 (Free on orders over $75)</li>
                    <li>Expedited Shipping (2-3 business days): $15.00</li>
                    <li>Overnight Shipping (1 business day): $30.00</li>
                  </ul>
                   <p className="text-xs mt-2">*Shipping times are estimates and may be affected by carrier delays or other unforeseen circumstances. Rates are subject to change.</p>
                </div>
                <p>You will receive a shipping confirmation email with tracking information once your order is on its way.</p>
              </AccordionContent>
            </AccordionItem>

            <Separator className="my-4" />

            {/* Return Policy */}
            <AccordionItem value="returns">
              <AccordionTrigger className="text-xl font-semibold text-primary hover:no-underline">
                <div className="flex items-center gap-3">
                   <Package className="h-6 w-6" /> {/* Use Package icon */}
                   Return & Exchange Policy
                 </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-4 text-muted-foreground leading-relaxed">
                <p>We want you to love your purchase! If you're not completely satisfied, you can return eligible items within <strong>30 days</strong> of the delivery date for a full refund or exchange.</p>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Eligibility Criteria:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Items must be unworn, unwashed, and in their original condition with tags attached.</li>
                    <li>Final sale items, swimwear (if hygiene seal is broken), and accessories (like jewelry or hats) are generally not eligible for return unless defective.</li>
                    <li>Proof of purchase (order number or receipt) is required.</li>
                  </ul>
                </div>
                 <div>
                  <h4 className="font-medium text-foreground mb-1">How to Initiate a Return/Exchange:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Contact our customer service team at [Your Email Address] or through our website's contact form with your order number and reason for return/exchange.</li>
                    <li>We will provide you with return instructions and a prepaid shipping label (for domestic returns).</li>
                    <li>Pack the item securely and drop it off at the designated carrier.</li>
                    <li>Once we receive and inspect the item, we will process your refund or ship your exchange within 3-5 business days. Refunds may take additional time to reflect in your account depending on your bank.</li>
                  </ol>
                 </div>
                 <p>Please note: Original shipping charges are non-refundable unless the return is due to our error.</p>
              </AccordionContent>
            </AccordionItem>

             <Separator className="my-4" />

             {/* Privacy Policy Snippet */}
             <AccordionItem value="privacy">
               <AccordionTrigger className="text-xl font-semibold text-primary hover:no-underline">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="h-6 w-6" />
                    Privacy Policy (Summary)
                  </div>
               </AccordionTrigger>
               <AccordionContent className="pt-4 space-y-4 text-muted-foreground leading-relaxed">
                 <p>Your privacy is important to us. We collect personal information (like name, address, email) solely for the purpose of processing your orders, providing customer service, and improving your shopping experience (e.g., through AI recommendations if you opt-in).</p>
                 <p>We use secure technologies to protect your data and do not sell your information to third parties for marketing purposes. We may share necessary information with trusted partners (like payment processors and shipping carriers) to fulfill your order.</p>
                 <p>Our AI recommendation feature uses anonymized or aggregated data about item interactions and selections to generate suggestions. We do not use your specific personal identity for this process unless explicitly stated and consented to.</p>
                 <p>For a full understanding of how we handle your data, please refer to our complete [Link to Full Privacy Policy Page - Add later if needed].</p>
               </AccordionContent>
             </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
