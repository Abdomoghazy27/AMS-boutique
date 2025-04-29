
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Keep router for potential future use, but remove push
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  // const router = useRouter(); // Keep router instance if needed later, but don't use push

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault(); // Prevent form submission if used in a form
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      // TODO: Implement search filtering on the current page or via global state
      // Currently, just logs the search term.
      console.log(`Search submitted for: ${trimmedSearchTerm}`);
      // router.push(`/search?q=${encodeURIComponent(trimmedSearchTerm)}`); // Removed navigation
      // setSearchTerm(''); // Keep term in bar for user reference? Or clear? Keep for now.
    } else {
        console.log("Search submitted with empty query.");
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
