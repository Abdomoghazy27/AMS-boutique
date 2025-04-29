
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt } from 'lucide-react'; // Import Shirt icon

export default function ProductsPage() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<GetClothingItemsFilters>({});
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  // Fetch all clothing items initially
  useEffect(() => {
    const fetchAllItems = async () => {
      console.log("[ProductsPage Effect - Fetch All] Starting initial item fetch...");
      setIsLoadingItems(true);
      setIsInitialLoad(true);
      try {
        const allItems = await getClothingItems();
        console.log(`[ProductsPage Effect - Fetch All] Fetched ${allItems.length} total items.`);
        setAllClothingItems(allItems);
        setFilteredItems(allItems); // Initially display all items
      } catch (error) {
          console.error("[ProductsPage Effect - Fetch All] Failed to fetch items:", error);
          toast({
            title: "Error Loading Products",
            description: "Could not load products. Please try refreshing.",
            variant: "destructive",
          });
          setAllClothingItems([]);
          setFilteredItems([]);
      } finally {
          console.log("[ProductsPage Effect - Fetch All] Finished initial item fetch.");
          setIsLoadingItems(false);
          setIsInitialLoad(false);
      }
    };
    fetchAllItems();
  }, [toast]);

  // Apply filters whenever filters change or all items are loaded (after initial load)
  useEffect(() => {
    if (isInitialLoad) {
        console.log("[ProductsPage Effect - Filter] Skipping filter on initial load.");
        return;
    }

    console.log("[ProductsPage Effect - Filter] Applying filters:", filters);
    setIsLoadingItems(true); // Show loading state while filtering
    const timer = setTimeout(async () => {
       try {
           // Fetch items based on current filters
           const items = await getClothingItems(filters);
           console.log(`[ProductsPage Effect - Filter] Filtering complete. Found ${items.length} items.`);
           setFilteredItems(items);
       } catch (error) {
            console.error("[ProductsPage Effect - Filter] Failed to filter clothing items:", error);
             toast({
               title: "Error Filtering",
               description: "Could not apply filters. Please try again.",
               variant: "destructive",
             });
       } finally {
          console.log("[ProductsPage Effect - Filter] Filter process finished.");
          setIsLoadingItems(false); // Hide loading state after filtering
       }
    }, 300); // Debounce filter application slightly

    return () => {
        console.log("[ProductsPage Effect - Filter] Cleanup: Clearing filter timer.");
        clearTimeout(timer);
    }

  }, [filters, allClothingItems, isInitialLoad, toast]); // Depend on filters and all items

  // Handler for filter changes
  const handleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
    console.log("[ProductsPage Handler - FilterChange] New filters received:", newFilters);
    setFilters(newFilters);
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

  console.log("[ProductsPage Render] Rendering ProductsPage component. States:", { isLoadingItems, isInitialLoad, filters });

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
              Browse all available products and use filters to find exactly what you need.
           </CardDescription>
         </CardHeader>
      </Card>

      {/* Filter Options Section */}
       {(isLoadingItems && isInitialLoad) || (allClothingItems.length === 0 && isLoadingItems) ? (
          // Skeleton for filters while loading initially or if still loading without items
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
          // Render filters only when *not* initial load AND filter options are ready
          !isInitialLoad && filterOptions.categories.length > 0 && (
            <FilterOptions
               categories={filterOptions.categories}
               sizes={filterOptions.sizes}
               colors={filterOptions.colors}
               onFilterChange={handleFilterChange}
               initialFilters={filters}
             />
          )
       )}

      {/* Clothing List Section */}
      <ClothingList
        items={filteredItems}
        // Show loading state if initial load is happening OR if filtering is in progress
        isLoading={isInitialLoad || isLoadingItems}
       />

       {/* Message if no items found after filtering */}
        {!isLoadingItems && filteredItems.length === 0 && allClothingItems.length > 0 && (
         <p className="text-center text-muted-foreground py-10">No products found matching your current filters.</p>
       )}

        {/* Message if no items loaded initially */}
        {!isLoadingItems && allClothingItems.length === 0 && (
            <p className="text-center text-muted-foreground py-10">There are currently no products available. Check back later!</p>
        )}
    </div>
  );
}

