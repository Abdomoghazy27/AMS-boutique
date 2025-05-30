
import Link from 'next/link'; // Import Link
import { ShoppingBag, Tags, User, Settings, Search, Shirt } from 'lucide-react'; // Added Search and Shirt icons
import { CartIcon } from './cart-icon'; // Import CartIcon
import { Button } from './ui/button'; // Import Button for styling links
import { SearchBar } from './search-bar'; // Import SearchBar

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4"> {/* Adjusted gap */}
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
                <Link href="/products">
                    <Shirt className="mr-1 h-4 w-4" /> Products {/* Added Products Link */}
                </Link>
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
          </nav>
        </div>

         {/* Search Bar - Always render, but hide visually on smaller screens using Tailwind classes */}
         <div className="flex-1 flex justify-center px-4 hidden lg:flex">
             {/* Pass key based on path or search to re-render if needed */}
             {/* <SearchBar key={router.asPath} /> */}
             <SearchBar />
         </div>

        <div className="flex items-center gap-1"> {/* Reduced gap for icons */}
           {/* Search Icon (Acts as trigger on small screens? Or just visual cue?) */}
           {/* Removing the button action for search icon as search bar is now below */}
           <span className="lg:hidden text-muted-foreground p-2">
               <Search className="h-5 w-5" />
           </span>

           {/* Settings Icon */}
           <Button variant="ghost" size="icon" asChild>
             <Link href="/settings" aria-label="View Settings">
                <Settings className="h-5 w-5" />
             </Link>
           </Button>
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
       {/* Mobile Navigation & Search */}
       <div className="md:hidden flex flex-col border-t">
          {/* Search Bar on Mobile */}
           <div className="p-2 border-b">
               {/* Pass key based on path or search to re-render if needed */}
               {/* <SearchBar key={router.asPath + '-mobile'} /> */}
               <SearchBar />
           </div>
           {/* Mobile Nav Links */}
           <nav className="flex justify-center items-center gap-1 py-2 overflow-x-auto text-sm"> {/* Reduced gap, smaller text */}
               <Button variant="link" size="sm" asChild>
                  <Link href="/">Home</Link>
               </Button>
               <Button variant="link" size="sm" asChild>
                  <Link href="/products">
                    <Shirt className="mr-1 h-4 w-4" /> Products {/* Added Products Link */}
                  </Link>
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
               {/* Removed Settings/Profile links from mobile nav as they are icons now */}
           </nav>
       </div>
    </header>
  );
}
