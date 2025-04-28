'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Badge } from '@/components/ui/badge';

export function CartIcon() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Link href="/cart" className="relative flex items-center p-2 rounded-md hover:bg-accent">
      <ShoppingCart className="h-6 w-6 text-foreground" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </Badge>
      )}
       <span className="sr-only">View Shopping Cart ({itemCount} items)</span>
    </Link>
  );
}
