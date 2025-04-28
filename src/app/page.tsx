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
      setIsLoadingItems(true);
      try {
        // In a real app, filters could be passed here if needed initially
        const items = await getClothingItems();
        setAllClothingItems(items);
        setFilteredItems(items); // Initially display all items
      } catch (error) {
          console.error("Failed to fetch clothing items:", error);
          toast({
            title: "Error",
            description: "Could not load clothing items. Please try refreshing.",
            variant: "destructive",
          });
           setAllClothingItems([]); // Set to empty on error
           setFilteredItems([]);
      } finally {
          setIsLoadingItems(false);
          setIsInitialLoad(false);
      }
    };
    fetchItems();
  }, [toast]); // Add toast to dependency array

  // Filter items whenever filters or allClothingItems change
  useEffect(() => {
    if (isInitialLoad) return; // Don't filter until initial data is loaded

    setIsLoadingItems(true);
    // Simulate filtering delay for UX feedback
    const timer = setTimeout(async () => {
       try {
           const items = await getClothingItems(filters.category, filters.size, filters.color);
           setFilteredItems(items);
       } catch (error) {
            console.error("Failed to filter clothing items:", error);
             toast({
               title: "Error",
               description: "Could not apply filters. Please try again.",
               variant: "destructive",
             });
             // Optionally reset filters or keep previous results
             // setFilteredItems(allClothingItems);
       } finally {
          setIsLoadingItems(false);
       }
    }, 300); // Debounce filtering slightly

    return () => clearTimeout(timer); // Cleanup timer on unmount or filter change

  }, [filters, allClothingItems, isInitialLoad, toast]); // Add toast to dependency array


  // Get outfit recommendations when recommendationInputItems change
  useEffect(() => {
    if (recommendationInputItems.length === 0) {
      setRecommendations(null); // Clear recommendations if no items are selected for it
      setIsLoadingRecommendations(false); // Ensure loading stops if selection is cleared
      return;
    }

    const getRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
         // Extract all available item IDs from the fetched data
         const allAvailableItemIds = allClothingItems.map(item => item.id);

        const input: RecommendOutfitInput = {
          selectedItems: recommendationInputItems,
          availableItemIds: allAvailableItemIds, // Pass all available IDs
          // Potentially add stylePreferences or previouslyViewedItems (from state/context)
        };
        console.log("Requesting recommendations with:", input);
        const result = await recommendOutfit(input);
         console.log("Received recommendations:", result);
        setRecommendations(result);
      } catch (error) {
        console.error("Error getting recommendations:", error);
         toast({
           title: 'Recommendation Error',
           description: 'Could not fetch outfit recommendations.',
           variant: 'destructive',
         });
        setRecommendations(null); // Clear recommendations on error
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    // Debounce the recommendation call
    const debounceTimer = setTimeout(getRecommendations, 500); // Wait 500ms

     return () => clearTimeout(debounceTimer);
  }, [recommendationInputItems, allClothingItems, toast]); // Add allClothingItems dependency


  const handleFilterChange = useCallback((newFilters: { category?: string; size?: string; color?: string }) => {
    setFilters(newFilters);
  }, []);

   // Handler specifically for adding/removing items to trigger AI recommendations
   const handleToggleOutfitRecs = useCallback((item: ClothingItem) => {
     setRecommendationInputItems(prev => {
       if (prev.includes(item.id)) {
         // Remove item
         toast({
            title: 'Item Removed from Consideration',
            description: `${item.name} removed from outfit recommendations.`,
            variant: 'default', // Use default or a custom style
          });
         return prev.filter(id => id !== item.id);
       } else {
         // Add item
          toast({
             title: 'Considering Item',
             description: `${item.name} added for outfit recommendations.`,
           });
         return [...prev, item.id];
       }
     });
   }, [toast]);


  // Memoize filter options to avoid recalculating on every render
  const filterOptions = useMemo(() => {
    const categories = [...new Set(allClothingItems.map(item => item.category))].sort();
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))].sort();
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))].sort();
    return { categories, sizes, colors };
  }, [allClothingItems]);


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

      {/* Pass handleToggleOutfitRecs specifically for adding items for AI recs */}
      <OutfitRecommendations
        recommendations={recommendations}
        clothingData={allClothingItems}
        isLoading={isLoadingRecommendations}
         // Pass toggle handler to recommendation cards as well, if needed
        onToggleForRecommendations={handleToggleOutfitRecs}
        recommendationInputItemIds={recommendationInputItems}
      />
    </div>
  );
}
