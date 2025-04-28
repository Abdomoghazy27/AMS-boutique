
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getClothingItems, ClothingItem } from '@/services/clothing';
import { recommendOutfit, RecommendOutfitInput, RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options';
import { OutfitRecommendations } from '@/components/outfit-recommendations';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function Home() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<{ category?: string; size?: string; color?: string }>({});
  // State for items specifically selected for outfit recommendations (distinct from cart)
  const [recommendationInputItems, setRecommendationInputItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendOutfitOutput | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();


  // Fetch initial data
  useEffect(() => {
    const fetchItems = async () => {
      console.log("[Page Effect - Fetch Items] Starting initial fetch...");
      setIsLoadingItems(true);
      try {
        // In a real app, filters could be passed here if needed initially
        const items = await getClothingItems();
        console.log(`[Page Effect - Fetch Items] Fetched ${items.length} items.`);
        setAllClothingItems(items);
        setFilteredItems(items); // Initially display all items
      } catch (error) {
          console.error("[Page Effect - Fetch Items] Failed to fetch clothing items:", error);
          toast({
            title: "Error",
            description: "Could not load clothing items. Please try refreshing.",
            variant: "destructive",
          });
           setAllClothingItems([]); // Set to empty on error
           setFilteredItems([]);
      } finally {
          console.log("[Page Effect - Fetch Items] Finished initial fetch.");
          setIsLoadingItems(false);
          setIsInitialLoad(false);
      }
    };
    fetchItems();
  }, [toast]); // Add toast to dependency array

  // Filter items whenever filters or allClothingItems change
  useEffect(() => {
    if (isInitialLoad) {
        console.log("[Page Effect - Filter] Skipping filter on initial load.");
        return;
    }

    console.log("[Page Effect - Filter] Filters changed, starting filter process:", filters);
    setIsLoadingItems(true);
    // Simulate filtering delay for UX feedback
    const timer = setTimeout(async () => {
       try {
           const items = await getClothingItems(filters.category, filters.size, filters.color);
           console.log(`[Page Effect - Filter] Filtering complete. Found ${items.length} items.`);
           setFilteredItems(items);
       } catch (error) {
            console.error("[Page Effect - Filter] Failed to filter clothing items:", error);
             toast({
               title: "Error",
               description: "Could not apply filters. Please try again.",
               variant: "destructive",
             });
             // Optionally reset filters or keep previous results
             // setFilteredItems(allClothingItems);
       } finally {
          console.log("[Page Effect - Filter] Filter process finished.");
          setIsLoadingItems(false);
       }
    }, 300); // Debounce filtering slightly

    return () => {
        console.log("[Page Effect - Filter] Cleanup: Clearing filter timer.");
        clearTimeout(timer); // Cleanup timer on unmount or filter change
    }

  }, [filters, allClothingItems, isInitialLoad, toast]); // Add toast to dependency array


  // Get outfit recommendations when recommendationInputItems change
  useEffect(() => {
    console.log("[Page Effect - Recs] Triggered. Input items:", recommendationInputItems);

    if (recommendationInputItems.length === 0) {
      console.log("[Page Effect - Recs] No items selected for recommendations. Clearing existing and stopping loading.");
      setRecommendations(null); // Clear recommendations if no items are selected for it
      setIsLoadingRecommendations(false); // Ensure loading stops if selection is cleared
      return;
    }

    // Ensure allClothingItems is loaded before proceeding
    if (allClothingItems.length === 0) {
        console.log("[Page Effect - Recs] Waiting for all clothing items to load before requesting recommendations.");
        // Do not set loading state here, wait for items
        return;
    }

    // Define the async function to get recommendations
    const getRecommendations = async () => {
      console.log("[Page Effect - Recs] Preparing to fetch recommendations...");
      setIsLoadingRecommendations(true);
      setRecommendations(null); // Clear previous recommendations while loading new ones
      try {
         // Pass the *full* list of available item IDs. Filtering happens in the AI flow/tool.
         const allAvailableItemIds = allClothingItems.map(item => item.id);
         console.log(`[Page Effect - Recs] All available item IDs (${allAvailableItemIds.length}):`, allAvailableItemIds);

        const input: RecommendOutfitInput = {
          selectedItems: recommendationInputItems,
          availableItemIds: allAvailableItemIds, // Pass the full list of IDs
          // Potentially add stylePreferences or previouslyViewedItems (from state/context)
        };
        console.log("[Page Effect - Recs] Calling recommendOutfit with input:", JSON.stringify(input, null, 2));
        const result = await recommendOutfit(input);
         console.log("[Page Effect - Recs] Received recommendations result:", JSON.stringify(result, null, 2));

        // Check if the component is still mounted and the input hasn't changed during the async call
        // This check might be needed if state updates rapidly, though unlikely with the debounce
         setRecommendations(result);

      } catch (error) {
        console.error("[Page Effect - Recs] Error getting recommendations:", error);
         toast({
           title: 'Recommendation Error',
           description: 'Could not fetch outfit recommendations.',
           variant: 'destructive',
         });
        setRecommendations(null); // Clear recommendations on error
      } finally {
        console.log("[Page Effect - Recs] Finished fetching recommendations.");
        setIsLoadingRecommendations(false);
      }
    };

    // Debounce the recommendation call
    console.log("[Page Effect - Recs] Setting debounce timer (500ms)...");
    const debounceTimer = setTimeout(getRecommendations, 500); // Wait 500ms

     return () => {
        console.log("[Page Effect - Recs] Cleanup: Clearing recommendation debounce timer.");
        clearTimeout(debounceTimer);
     }
  // IMPORTANT: Include all dependencies that the effect reads
  }, [recommendationInputItems, allClothingItems, toast]);


  const handleFilterChange = useCallback((newFilters: { category?: string; size?: string; color?: string }) => {
    console.log("[Page Handler - FilterChange] New filters received:", newFilters);
    setFilters(newFilters);
  }, []);

   // Handler specifically for adding/removing items to trigger AI recommendations
   const handleToggleOutfitRecs = useCallback((item: ClothingItem) => {
     console.log(`[Page Handler - ToggleRecs] Toggling item: ${item.id} (${item.name})`);
     setRecommendationInputItems(prev => {
       let newItems;
       if (prev.includes(item.id)) {
         // Remove item
         newItems = prev.filter(id => id !== item.id);
         console.log(`[Page Handler - ToggleRecs] Item ${item.id} removed. New input list:`, newItems);
         toast({
            title: 'Stopped Considering Item',
            description: `${item.name} removed from outfit recommendations consideration.`,
            variant: 'default', // Use default or a custom style
          });
       } else {
         // Add item
         newItems = [...prev, item.id];
         console.log(`[Page Handler - ToggleRecs] Item ${item.id} added. New input list:`, newItems);
          toast({
             title: 'Considering Item',
             description: `${item.name} added for outfit recommendations. AI suggestions will update shortly.`,
           });
       }
       return newItems;
     });
   }, [toast]);


  // Memoize filter options to avoid recalculating on every render
  const filterOptions = useMemo(() => {
    console.log("[Page Memo - FilterOptions] Recalculating filter options based on allClothingItems.");
    const categories = [...new Set(allClothingItems.map(item => item.category))].sort();
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))].sort();
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))].sort();
    return { categories, sizes, colors };
  }, [allClothingItems]);

  console.log("[Page Render] Rendering component. isLoadingItems:", isLoadingItems, "isLoadingRecommendations:", isLoadingRecommendations, "Input Items:", recommendationInputItems.length, "Recommendations:", recommendations?.recommendations?.length ?? 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Our Collection</h1>

      {isInitialLoad ? (
         <div className="mb-6 space-y-4 animate-pulse">
            <div className="h-16 bg-muted rounded-lg"></div> {/* Filter card header placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted rounded-lg">
              <div className="h-10 bg-muted-foreground/20 rounded"></div> {/* Select placeholders */}
              <div className="h-10 bg-muted-foreground/20 rounded"></div>
              <div className="h-10 bg-muted-foreground/20 rounded"></div>
              <div className="h-10 bg-primary/40 rounded md:col-span-3"></div> {/* Button placeholder */}
            </div>
          </div>
      ) : (
        <FilterOptions
            categories={filterOptions.categories}
            sizes={filterOptions.sizes}
            colors={filterOptions.colors}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
      )}

      {/* Pass down the toggle handler and the list of IDs being considered */}
      <ClothingList
        items={filteredItems}
        isLoading={isLoadingItems}
        onToggleForRecommendations={handleToggleOutfitRecs}
        recommendationInputItemIds={recommendationInputItems}
       />

      {/* Pass handleToggleOutfitRecs and the list of input IDs */}
      <OutfitRecommendations
        recommendations={recommendations}
        clothingData={allClothingItems} // Pass all items for lookup
        isLoading={isLoadingRecommendations}
        onToggleForRecommendations={handleToggleOutfitRecs} // Pass toggle handler
        recommendationInputItemIds={recommendationInputItems} // Pass the list of IDs being considered
      />
    </div>
  );
}

