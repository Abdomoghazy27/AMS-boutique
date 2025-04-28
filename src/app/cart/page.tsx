'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeItem, updateQuantity, clearCart, getCartTotal, getItemCount } = useCart();
  const total = getCartTotal();
  const itemCount = getItemCount();

  const handleQuantityChange = (itemId: string, size: string, color: string, newQuantity: number) => {
    updateQuantity(itemId, size, color, Math.max(1, newQuantity)); // Ensure quantity doesn't go below 1
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 shadow-sm">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={100}
                height={100}
                className="rounded-md object-cover w-full sm:w-24 h-auto sm:h-24 flex-shrink-0"
              />
              <div className="flex-grow space-y-1">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>
                  Size: {item.selectedSize}, Color: {item.selectedColor}
                </CardDescription>
                <p className="font-semibold text-primary">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-normal">
                 <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, item.selectedSize, item.selectedColor, parseInt(e.target.value, 10))}
                    className="w-16 h-9 text-center"
                    aria-label={`Quantity for ${item.name}`}
                  />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                  className="text-destructive hover:text-destructive"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
           <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearCart} className="text-destructive border-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
              </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 shadow-md"> {/* Make summary sticky */}
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" size="lg">Proceed to Checkout</Button>
               <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Continue Shopping</Link>
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
