
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options'; // Re-use filter component if desired
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tags } from 'lucide-react';

export default function SalePage() {
  const [saleItems, setSaleItems] = useState<ClothingItem[]>([]);
  const [filteredSaleItems, setFilteredSaleItems] = useState<ClothingItem[]>([]); // State for filtered results within sale page
  const [filters, setFilters] = useState<GetClothingItemsFilters>({}); // Filters specific to sale items
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load specifically for sale items
  const { toast } = useToast();
  // Removed recommendation state

  // Fetch initial sale items
  useEffect(() => {
    const fetchSaleItems = async () => {
      console.log("[SalePage Effect - Fetch] Starting initial sale item fetch...");
      setIsLoading(true);
      try {
        // Fetch only items marked as on sale
        const items = await getClothingItems({ isOnSale: true });
        console.log(`[SalePage Effect - Fetch] Fetched ${items.length} sale items.`);
        setSaleItems(items);
        setFilteredSaleItems(items); // Initially display all sale items
      } catch (error) {
          console.error("[SalePage Effect - Fetch] Failed to fetch sale items:", error);
          toast({
            title: "Error Loading Sale",
            description: "Could not load sale items. Please try refreshing.",
            variant: "destructive",
          });
           setSaleItems([]);
           setFilteredSaleItems([]);
      } finally {
          console.log("[SalePage Effect - Fetch] Finished initial sale fetch.");
          setIsLoading(false);
          setIsInitialLoad(false); // Mark initial load as complete
      }
    };
    fetchSaleItems();
  }, [toast]);

   // Filter sale items when filters change (specific to this page)
   useEffect(() => {
     if (isInitialLoad) {
       console.log("[SalePage Effect - Filter] Skipping filter on initial load.");
       return;
     }

     console.log("[SalePage Effect - Filter] Sale filters changed:", filters);
     setIsLoading(true); // Show loading while filtering sale items

      // Apply filters locally first, then fetch if necessary (optimization)
      // Since we already have all sale items, we can filter locally unless complex backend filtering is needed
     let currentlyFiltered = saleItems;
     if (filters.category) {
         currentlyFiltered = currentlyFiltered.filter(item => item.category === filters.category);
     }
     if (filters.size) {
         currentlyFiltered = currentlyFiltered.filter(item => item.sizes.includes(filters.size!) || item.sizes.includes('One Size'));
     }
      if (filters.color) {
         currentlyFiltered = currentlyFiltered.filter(item => item.colors.includes(filters.color!));
     }

     // Simulate filtering delay for UX
     const timer = setTimeout(() => {
         console.log(`[SalePage Effect - Filter] Local filtering complete. Found ${currentlyFiltered.length} items.`);
         setFilteredSaleItems(currentlyFiltered);
         setIsLoading(false);
     }, 300);


     return () => {
       console.log("[SalePage Effect - Filter] Cleanup: Clearing filter timer.");
       clearTimeout(timer);
     }

   }, [filters, saleItems, isInitialLoad]); // Depend on filters and the base saleItems list


   // Handler for filter changes specific to the sale page
    const handleSaleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
        console.log("[SalePage Handler - FilterChange] New sale filters received:", newFilters);
        // Keep the isOnSale filter active implicitly for this page
        setFilters({ ...newFilters, isOnSale: true });
    }, []);

    // Removed recommendation toggle handler


   // Prepare filter options based ONLY on the available sale items
    const saleFilterOptions = {
       categories: [...new Set(saleItems.map(item => item.category))].sort(),
       sizes: [...new Set(saleItems.flatMap(item => item.sizes))].sort(),
       colors: [...new Set(saleItems.flatMap(item => item.colors))].sort(),
    };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sale Page Header */}
      <Card className="mb-8 text-center shadow-lg bg-gradient-to-r from-destructive/10 to-secondary/10 border-none">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Tags className="h-12 w-12 text-destructive" />
           </div>
           <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-destructive">
             Shop Our Sale
           </CardTitle>
           <CardDescription className="text-lg text-muted-foreground mt-2">
              Amazing deals on your favorite styles! Limited time only.
           </CardDescription>
         </CardHeader>
      </Card>

      {/* Optional Filters for Sale Items */}
        {!isInitialLoad && saleItems.length > 0 && ( // Show filters after load if there are items
          <FilterOptions
            categories={saleFilterOptions.categories}
            sizes={saleFilterOptions.sizes}
            colors={saleFilterOptions.colors}
            onFilterChange={handleSaleFilterChange}
            initialFilters={filters} // Pass sale-specific filters
          />
        )}

      {/* Sale Items List */}
      <ClothingList
        items={filteredSaleItems}
        isLoading={isLoading}
       />

       {/* Message if no sale items found after filtering */}
      {!isLoading && filteredSaleItems.length === 0 && saleItems.length > 0 && (
         <p className="text-center text-muted-foreground py-10">No sale items found matching your current filters.</p>
      )}

      {/* Message if no sale items loaded initially */}
      {!isLoading && saleItems.length === 0 && (
          <p className="text-center text-muted-foreground py-10">There are currently no items on sale. Check back later!</p>
      )}

    </div>
  );
}
