
'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, Search as SearchIcon } from 'lucide-react'; // Import Shirt and Search icons

// Wrap the main component logic in a separate component to use Suspense
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get('search') || '';

  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<GetClothingItemsFilters>({ searchQuery: initialSearchQuery });
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchQuery); // Store the active search term

  const { toast } = useToast();


  // Fetch all clothing items initially (only needed for filter options)
  useEffect(() => {
    const fetchAllItemsForFilters = async () => {
      console.log("[ProductsPage Effect - Fetch All] Starting item fetch for filter options...");
      // No need to set loading here as the main filtering handles loading state
      try {
        const allItems = await getClothingItems(); // Fetch all without filters for options
        console.log(`[ProductsPage Effect - Fetch All] Fetched ${allItems.length} total items for filter options.`);
        setAllClothingItems(allItems);
      } catch (error) {
          console.error("[ProductsPage Effect - Fetch All] Failed to fetch items for filter options:", error);
          // Don't need toast here, main fetch will handle errors
          setAllClothingItems([]);
      } finally {
          console.log("[ProductsPage Effect - Fetch All] Finished item fetch for filter options.");
          // No need to set loading or initial load here
      }
    };
    fetchAllItemsForFilters();
  }, []); // Run only once on mount


  // Apply filters (including search) whenever filters or search params change
   useEffect(() => {
     const searchQueryFromUrl = searchParams.get('search') || '';
     console.log("[ProductsPage Effect - Filter] Detected URL search param:", searchQueryFromUrl);

     // Combine URL search query with existing filters
     const combinedFilters = { ...filters, searchQuery: searchQueryFromUrl };
     console.log("[ProductsPage Effect - Filter] Applying combined filters:", combinedFilters);

     setCurrentSearchTerm(searchQueryFromUrl); // Update displayed search term info
     setIsLoadingItems(true); // Show loading state while fetching/filtering
     setIsInitialLoad(true); // Treat filter changes like an initial load for loading state


     const timer = setTimeout(async () => {
        try {
            // Fetch items based on current combined filters
            const items = await getClothingItems(combinedFilters);
            console.log(`[ProductsPage Effect - Filter] Filtering complete. Found ${items.length} items.`);
            setFilteredItems(items);
            if (items.length === 0 && combinedFilters.searchQuery) {
                // Optionally toast if search yields no results
                // toast({ title: "No Results", description: `No products found for "${combinedFilters.searchQuery}".` });
            }
        } catch (error) {
             console.error("[ProductsPage Effect - Filter] Failed to filter clothing items:", error);
              toast({
                title: "Error Filtering",
                description: "Could not apply filters. Please try again.",
                variant: "destructive",
              });
              setFilteredItems([]); // Clear items on error
        } finally {
           console.log("[ProductsPage Effect - Filter] Filter process finished.");
           setIsLoadingItems(false); // Hide loading state after filtering
           setIsInitialLoad(false); // Mark load as complete
        }
     }, 300); // Debounce filter application slightly

     return () => {
         console.log("[ProductsPage Effect - Filter] Cleanup: Clearing filter timer.");
         clearTimeout(timer);
     }

   }, [searchParams, filters, toast]); // Depend on searchParams and filters


  // Handler for filter changes from FilterOptions component
  const handleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
    console.log("[ProductsPage Handler - FilterChange] New filters received:", newFilters);
     // Keep the current search query from the URL when applying dropdown filters
    setFilters(prevFilters => ({ ...newFilters, searchQuery: prevFilters.searchQuery }));
  }, []);

  // Calculate filter options based on all loaded items
  const filterOptions = useMemo(() => {
    if (!allClothingItems || allClothingItems.length === 0) {
        console.log("[ProductsPage Memo - FilterOptions] allClothingItems is empty, returning empty options.");
        return { categories: [], sizes: [], colors: [] };
    }
    console.log("[ProductsPage Memo - FilterOptions] Recalculating filter options based on allClothingItems.");
    const categories = [...new Set(allClothingItems.map(item => item.category))].sort();
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))].sort();
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))].sort();
    console.log("[ProductsPage Memo - FilterOptions] Calculated options:", { categories, sizes, colors });
    return { categories, sizes, colors };
  }, [allClothingItems]);

  console.log("[ProductsPage Render] Rendering ProductsPageContent. States:", { isLoadingItems, isInitialLoad, filters, currentSearchTerm });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Products Page Header */}
      <Card className="mb-8 text-center shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-none">
        <CardHeader>
           <div className="flex justify-center mb-4">
             <Shirt className="h-12 w-12 text-primary" />
           </div>
           <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
             Explore Our Collection
           </CardTitle>
           <CardDescription className="text-lg text-muted-foreground mt-2">
              Browse products or use search and filters to find exactly what you need.
           </CardDescription>
         </CardHeader>
      </Card>

        {/* Display current search term if active */}
        {currentSearchTerm && !isLoadingItems && (
           <div className="mb-4 p-3 rounded-md bg-secondary border border-border flex items-center gap-2">
             <SearchIcon className="h-5 w-5 text-primary" />
              <p className="text-sm">
                Showing results for: <span className="font-semibold">{currentSearchTerm}</span>
              </p>
           </div>
        )}


      {/* Filter Options Section */}
       {(isLoadingItems && isInitialLoad && allClothingItems.length === 0) ? ( // Show skeleton only if absolutely no items loaded yet and loading
          // Skeleton for filters while loading initially
          <div className="mb-6 space-y-4 animate-pulse">
             <div className="h-16 bg-muted rounded-lg"></div> {/* Filter card header placeholder */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted rounded-lg">
               <div className="h-10 bg-muted-foreground/20 rounded"></div>
               <div className="h-10 bg-muted-foreground/20 rounded"></div>
               <div className="h-10 bg-muted-foreground/20 rounded"></div>
               <div className="h-10 bg-primary/40 rounded md:col-span-3"></div>
             </div>
           </div>
       ) : (
          // Render filters only when filter options are ready (even if items are still loading from filter change)
           allClothingItems.length > 0 && filterOptions.categories.length > 0 && (
            <FilterOptions
               categories={filterOptions.categories}
               sizes={filterOptions.sizes}
               colors={filterOptions.colors}
               onFilterChange={handleFilterChange}
               // Pass filters *without* the search query to the component
               initialFilters={{ category: filters.category, size: filters.size, color: filters.color }}
             />
          )
       )}

      {/* Clothing List Section */}
      <ClothingList
        items={filteredItems}
        // Show loading state if initial load is happening OR if filtering is in progress
        isLoading={isLoadingItems} // Use unified loading state
       />

       {/* Message if no items found after filtering/searching */}
        {!isLoadingItems && filteredItems.length === 0 && (
             <p className="text-center text-muted-foreground py-10">
                 {currentSearchTerm
                    ? `No products found matching "${currentSearchTerm}" and your filters.`
                    : "No products found matching your current filters."
                  }
             </p>
       )}

        {/* Message if no items loaded initially (should be rare now) */}
        {!isLoadingItems && allClothingItems.length === 0 && filteredItems.length === 0 && (
            <p className="text-center text-muted-foreground py-10">There are currently no products available. Check back later!</p>
        )}
    </div>
  );
}


// Wrap the component needing useSearchParams with Suspense
export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading filters...</div>}>
            <ProductsPageContent />
        </Suspense>
    );
}
