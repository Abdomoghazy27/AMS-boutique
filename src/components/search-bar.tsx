
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Update internal state if the URL search param changes (e.g., back/forward navigation)
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);


  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent form submission if used in a form
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      console.log(`Navigating to products page with search: ${trimmedSearchTerm}`);
      // Navigate to the products page with the search query
      router.push(`/products?search=${encodeURIComponent(trimmedSearchTerm)}`);
    } else {
        // If search term is empty, navigate to products page without search query
        console.log("Search term is empty, navigating to products page.");
        router.push('/products');
    }
  };

  const clearSearch = () => {
      setSearchTerm('');
      router.push('/products'); // Navigate back to the base products page
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2 relative">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow h-9 pl-8 pr-8" // Add padding for icons
        aria-label="Search products"
      />
       {searchTerm && (
           <Button
             type="button"
             variant="ghost"
             size="icon"
             className="absolute right-10 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
             onClick={clearSearch}
             aria-label="Clear search"
           >
              <X className="h-4 w-4" />
           </Button>
        )}
      <Button type="submit" size="sm" variant="default" aria-label="Submit search" className="h-9">
        Search
      </Button>
    </form>
  );
}
