
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
import { ClothingList } from '@/components/clothing-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log(`[SearchPage Effect] Searching for: "${query}"`);
      try {
        // Implement basic search logic: filter by name or description containing the query (case-insensitive)
        const allItems = await getClothingItems(); // Get all items
        const lowerCaseQuery = query.toLowerCase();
        const results = allItems.filter(item =>
          item.name.toLowerCase().includes(lowerCaseQuery) ||
          item.description.toLowerCase().includes(lowerCaseQuery) ||
          item.category.toLowerCase().includes(lowerCaseQuery)
        );
        console.log(`[SearchPage Effect] Found ${results.length} results for "${query}"`);
        setSearchResults(results);
      } catch (error) {
          console.error(`[SearchPage Effect] Failed to fetch search results for "${query}":`, error);
          toast({
            title: "Search Error",
            description: "Could not perform search. Please try again later.",
            variant: "destructive",
          });
          setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" /> Search Results
          </CardTitle>
          {query ? (
            <CardDescription>Showing results for: "{query}"</CardDescription>
          ) : (
             <CardDescription>Please enter a search term in the header bar.</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {query ? (
             <ClothingList items={searchResults} isLoading={isLoading} />
           ) : (
             <p className="text-center text-muted-foreground py-6">Start typing in the search bar above to find products.</p>
           )}
          {!isLoading && query && searchResults.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No products found matching "{query}". Try a different search term.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// Wrap the component with Suspense for useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchResults />
    </Suspense>
  );
}

// Simple loading component shown while Suspense resolves
function LoadingState() {
    return (
         <div className="container mx-auto px-4 py-8">
           <Card className="mb-8 shadow-md animate-pulse">
             <CardHeader>
               <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
               <div className="h-4 bg-muted rounded w-1/2"></div>
             </CardHeader>
             <CardContent>
                {/* Placeholder for loading state of ClothingList */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3 flex flex-col bg-muted">
                       <div className="h-48 bg-muted-foreground/20 rounded"></div> {/* Image */}
                       <div className="flex-grow space-y-2 mt-3"> {/* Content */}
                           <div className="h-6 bg-muted-foreground/20 rounded w-3/4"></div> {/* Title */}
                           <div className="h-4 bg-muted-foreground/20 rounded w-full"></div> {/* Desc line 1 */}
                            <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div> {/* Desc line 2 */}
                       </div>
                        <div className="flex gap-2 pt-4"> {/* Selects */}
                           <div className="h-10 bg-muted-foreground/20 rounded w-1/2"></div>
                           <div className="h-10 bg-muted-foreground/20 rounded w-1/2"></div>
                         </div>
                         <div className="h-10 bg-muted-foreground/20 rounded w-full mt-2"></div> {/* Button */}
                    </div>
                  ))}
                </div>
             </CardContent>
           </Card>
         </div>
    );
}
