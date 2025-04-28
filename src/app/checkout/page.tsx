
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2, ShoppingBag, CheckCircle } from 'lucide-react'; // Import icons

export default function CheckoutPage() {
  const { cartItems, clearCart, getCartTotal, getItemCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getCartTotal();
  const itemCount = getItemCount();

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    // Simulate API call/processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Clear the cart
    clearCart();

    // Show success toast
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. Your items will be shipped soon.',
      variant: 'default', // Use default style for success
      action: ( // Optional: Add an action to go back home
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          Shop More
        </Button>
      ),
    });

    setIsProcessing(false);

    // Redirect to home page after a short delay to allow toast visibility
    setTimeout(() => {
        router.push('/');
    }, 2000);
  };

   // If cart is empty after checkout simulation or initially, redirect or show empty message
  if (itemCount === 0 && !isProcessing) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
        <Button onClick={() => router.push('/')}>Start Shopping</Button>
      </div>
    );
   }


  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl"> {/* Constrain width */}
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>{itemCount} item(s) in your cart</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Cart Items */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Scrollable item list */}
            {cartItems.map(item => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0">
                 <div className="flex items-center gap-3">
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover flex-shrink-0"
                    />
                    <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                        {item.selectedSize} / {item.selectedColor} / Qty: {item.quantity}
                        </p>
                    </div>
                 </div>
                <p className="font-semibold text-right">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="space-y-1 pt-4 border-t">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Free (Simulated)</span>
            </div>
             <div className="flex justify-between text-muted-foreground">
              <span>Taxes</span>
              <span>$0.00 (Simulated)</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
               <>
                <CheckCircle className="mr-2 h-4 w-4" /> Place Order (Simulated)
               </>
            )}
          </Button>
           <Button variant="outline" className="w-full" onClick={() => router.back()} disabled={isProcessing}>
                Go Back
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
