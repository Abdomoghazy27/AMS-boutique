
import Link from 'next/link'; // Import Link
import { ShoppingBag, Tags, User } from 'lucide-react'; // Added Tags and User icons
import { CartIcon } from './cart-icon'; // Import CartIcon
import { Button } from './ui/button'; // Import Button for styling links

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between"> {/* Increased height slightly */}
        <div className="flex items-center gap-4"> {/* Group logo, title, and nav */}
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-7 w-7 text-primary" /> {/* Slightly larger icon */}
            <span className="font-bold text-lg inline-block">AMS Boutique</span> {/* Slightly larger text */}
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1"> {/* Reduced gap slightly */}
             <Button variant="ghost" asChild>
                 <Link href="/">Home</Link>
             </Button>
             <Button variant="ghost" asChild>
                <Link href="/about">About Us</Link>
             </Button>
             <Button variant="ghost" asChild>
                <Link href="/policy">Policies</Link>
             </Button>
              <Button variant="ghost" asChild className="text-destructive hover:text-destructive hover:bg-destructive/10">
                 <Link href="/sale">
                    <Tags className="mr-1 h-4 w-4" /> Sale
                 </Link>
              </Button>
             {/* Add more links here if needed */}
          </nav>
        </div>
        <div className="flex items-center gap-2"> {/* Container for icons/actions */}
           {/* Profile Link/Icon */}
           <Button variant="ghost" size="icon" asChild>
             <Link href="/profile" aria-label="View Profile">
                <User className="h-5 w-5" />
             </Link>
           </Button>
           <CartIcon /> {/* Add CartIcon */}
           {/* Add other actions like login here */}
        </div>
      </div>
       {/* Mobile Navigation (Optional - can be implemented with a Sheet component) */}
       <nav className="md:hidden flex justify-center items-center gap-2 border-t py-2 overflow-x-auto"> {/* Make mobile nav scrollable */}
           <Button variant="link" size="sm" asChild>
              <Link href="/">Home</Link>
           </Button>
           <Button variant="link" size="sm" asChild>
              <Link href="/about">About</Link>
           </Button>
           <Button variant="link" size="sm" asChild>
              <Link href="/policy">Policies</Link>
           </Button>
           <Button variant="link" size="sm" asChild className="text-destructive">
              <Link href="/sale">
                <Tags className="mr-1 h-4 w-4" /> Sale
              </Link>
           </Button>
           {/* Add Profile link for mobile */}
            <Button variant="link" size="sm" asChild>
              <Link href="/profile">
                 <User className="mr-1 h-4 w-4" /> Profile
              </Link>
            </Button>
       </nav>
    </header>
  );
}
