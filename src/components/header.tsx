import { ShoppingBag } from 'lucide-react';
import { CartIcon } from './cart-icon'; // Import CartIcon

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between"> {/* Use justify-between */}
        <div className="flex items-center"> {/* Group logo and title */}
          <a href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">AMS Boutique</span>
          </a>
          {/* Add navigation links here if needed */}
        </div>
        <div className="flex items-center"> {/* Container for icons/actions */}
           <CartIcon /> {/* Add CartIcon */}
           {/* Add other actions like user profile/login here */}
        </div>
      </div>
    </header>
  );
}
