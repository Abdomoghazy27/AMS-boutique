
import Link from 'next/link';
import { Separator } from './ui/separator';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted text-muted-foreground border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and About */}
          <div className="space-y-4">
             <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
                <ShoppingBag className="h-7 w-7" />
                <span className="font-bold text-lg">AMS Boutique</span>
              </Link>
            <p className="text-sm">
              Your destination for curated modern fashion. Discover your style with our unique collection and AI-powered recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
               {/* Add link to product listing if needed */}
               {/* <li><Link href="/products">All Products</Link></li> */}
            </ul>
          </div>

           {/* Policies & Contact */}
           <div className="space-y-2">
             <h4 className="font-semibold text-foreground mb-3">Information</h4>
             <ul className="space-y-1 text-sm">
               <li><Link href="/policy" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
               <li><Link href="/policy#privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                {/* Add Terms of Service link if needed */}
               {/* <li><Link href="/terms">Terms of Service</Link></li> */}
               <li><span className="cursor-default">Contact: info@amsboutique.example</span></li> {/* Replace with actual contact */}
             </ul>
           </div>
        </div>

        <Separator className="mb-6" />

        <div className="text-center text-xs space-y-1">
          <p>&copy; {currentYear} AMS Boutique. All rights reserved. (This is a fictional boutique for demonstration purposes)</p>
          <p>Developed by Abdelrahman Ahmed Moghazy Sheta</p>
        </div>
      </div>
    </footer>
  );
}
