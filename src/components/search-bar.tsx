
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent form submission if used in a form
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      // Navigate to a search results page (e.g., /search?q=...)
      console.log(`Searching for: ${trimmedSearchTerm}`);
      router.push(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`); // Navigate to search page
      setSearchTerm(''); // Optional: Clear search bar after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="search"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow h-9" // Adjust height if needed
        aria-label="Search products"
      />
      <Button type="submit" size="sm" variant="default" aria-label="Submit search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
