
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
import { recommendOutfit, RecommendOutfitInput, RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options';
import { OutfitRecommendations } from '@/components/outfit-recommendations';
import { TrendingProducts } from '@/components/trending-products'; // Import TrendingProducts
import { NewArrivals } from '@/components/new-arrivals'; // Import NewArrivals
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Flame, Sparkles, Tags, Loader2 } from 'lucide-react'; // Import icons


export default function Home() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<ClothingItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<GetClothingItemsFilters>({});
  const [recommendationInputItems, setRecommendationInputItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendOutfitOutput | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingNewArrivals, setIsLoadingNewArrivals] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();


  // Fetch initial data for all sections
  useEffect(() => {
    const fetchAllData = async () => {
      console.log("[Page Effect - Fetch All] Starting initial data fetch...");
      setIsLoadingItems(true);
      setIsLoadingTrending(true);
      setIsLoadingNewArrivals(true);
      setIsInitialLoad(true); // Ensure this is true at the start
      try {
        // Fetch all items first
        const allItems = await getClothingItems();
        console.log(`[Page Effect - Fetch All] Fetched ${allItems.length} total items.`);
        setAllClothingItems(allItems);
        setFilteredItems(allItems); // Initially display all in main list

        // Fetch trending items (using the filter)
        const trending = await getClothingItems({ isTrending: true });
        console.log(`[Page Effect - Fetch All] Fetched ${trending.length} trending items.`);
        setTrendingItems(trending);

        // Fetch new arrivals (simulate by taking last 5 added items - adjust logic as needed)
        const arrivals = allItems.slice(-5); // Example: newest are last
        console.log(`[Page Effect - Fetch All] Determined ${arrivals.length} new arrivals.`);
        setNewArrivals(arrivals);

      } catch (error) {
          console.error("[Page Effect - Fetch All] Failed to fetch initial data:", error);
          toast({
            title: "Error Loading Content",
            description: "Could not load some products. Please try refreshing.",
            variant: "destructive",
          });
           // Set all states to empty on error to prevent partial loading display
           setAllClothingItems([]);
           setFilteredItems([]);
           setTrendingItems([]);
           setNewArrivals([]);
      } finally {
          console.log("[Page Effect - Fetch All] Finished initial data fetch.");
          setIsLoadingItems(false);
          setIsLoadingTrending(false);
          setIsLoadingNewArrivals(false);
          setIsInitialLoad(false); // Mark initial load as complete
      }
    };
    fetchAllData();
  }, [toast]);

  // Filter main clothing list whenever filters or allClothingItems change (but not during initial load)
  useEffect(() => {
    if (isInitialLoad) {
        console.log("[Page Effect - Filter] Skipping filter on initial load.");
        return;
    }

    console.log("[Page Effect - Filter] Applying filters:", filters);
    setIsLoadingItems(true);
    const timer = setTimeout(async () => {
       try {
           // Pass the current filters object
           const items = await getClothingItems(filters);
           console.log(`[Page Effect - Filter] Filtering complete. Found ${items.length} items.`);
           setFilteredItems(items);
       } catch (error) {
            console.error("[Page Effect - Filter] Failed to filter clothing items:", error);
             toast({
               title: "Error Filtering",
               description: "Could not apply filters. Please try again.",
               variant: "destructive",
             });
       } finally {
          console.log("[Page Effect - Filter] Filter process finished.");
          setIsLoadingItems(false);
       }
    }, 300); // Debounce filter application slightly

    return () => {
        console.log("[Page Effect - Filter] Cleanup: Clearing filter timer.");
        clearTimeout(timer);
    }

  }, [filters, allClothingItems, isInitialLoad, toast]); // Depend on filters and all items


 // Get outfit recommendations when recommendationInputItems change OR when allClothingItems are loaded (if inputItems exist)
 useEffect(() => {
    const effectTriggerTime = Date.now();
    console.log(`[Page Effect - Recs @ ${effectTriggerTime}] Triggered. Input items count:`, recommendationInputItems.length, "All items loaded:", allClothingItems.length > 0);

    // Condition 1: No items selected for recommendations. Clear state and stop loading.
    if (recommendationInputItems.length === 0) {
        console.log(`[Page Effect - Recs @ ${effectTriggerTime}] No items selected. Clearing recommendations and stopping loading.`);
        if (recommendations !== null) setRecommendations(null);
        if (isLoadingRecommendations) setIsLoadingRecommendations(false);
        return; // Exit early
    }

    // Condition 2: Items are selected, but all clothing data isn't loaded yet. Wait.
    if (allClothingItems.length === 0) {
        console.log(`[Page Effect - Recs @ ${effectTriggerTime}] Input items selected, but ALL clothing items not yet loaded. Waiting...`);
        // Optionally set loading state here if needed, but might cause flickering if data loads quickly after
        // setIsLoadingRecommendations(true); // Consider uncommenting if you want loading state while waiting for base data
        return; // Exit early
    }

    // Condition 3: Items selected AND all clothing data is available. Proceed to fetch recommendations.
    const getRecommendations = async () => {
        const fetchStartTime = Date.now();
        console.log(`[Page Effect - Recs - Fetch @ ${fetchStartTime}] Conditions met. Preparing to fetch AI recommendations...`);
        setIsLoadingRecommendations(true);
        // Don't clear previous recommendations immediately, maybe show stale ones while loading?
        // setRecommendations(null); // Clearing here causes flicker if API is slow

        try {
            // Ensure we have the latest list of *all* available item IDs
            const allAvailableItemIds = allClothingItems.map(item => item.id);
            if (allAvailableItemIds.length === 0) {
                console.error(`[Page Effect - Recs - Fetch @ ${fetchStartTime}] Error: All clothing items loaded, but IDs list is empty. Cannot proceed.`);
                throw new Error("No available item IDs found to provide to AI.");
            }
            console.log(`[Page Effect - Recs - Fetch @ ${fetchStartTime}] Total available item IDs for AI: ${allAvailableItemIds.length}`);

             // Check if there are enough items to recommend FROM (available - selected > 0)
             const potentialRecommendationCount = allAvailableItemIds.filter(id => !recommendationInputItems.includes(id)).length;
             if (potentialRecommendationCount === 0) {
                  console.warn(`[Page Effect - Recs - Fetch @ ${fetchStartTime}] No items available to recommend (all available items are already selected). Skipping AI call.`);
                   setRecommendations({ recommendations: [] }); // Set empty result explicitly
                   setIsLoadingRecommendations(false);
                   return; // Don't call AI if nothing can be recommended
             }


            const input: RecommendOutfitInput = {
                selectedItems: recommendationInputItems, // The items the user explicitly selected
                availableItemIds: allAvailableItemIds, // The *entire* catalog
                // Add style preferences or previously viewed items if available/implemented
                // stylePreferences: "casual", // Example
                // previouslyViewedItems: ["1", "5"] // Example
            };

            console.log(`[Page Effect - Recs - Fetch @ ${fetchStartTime}] Calling recommendOutfit AI flow with input:`, JSON.stringify(input, null, 2));
            const result = await recommendOutfit(input);
            const fetchEndTime = Date.now();
            console.log(`[Page Effect - Recs - Fetch @ ${fetchEndTime}] Received AI recommendations result (took ${fetchEndTime - fetchStartTime}ms):`, JSON.stringify(result, null, 2));

             // Validate the result structure before setting state
            if (result && Array.isArray(result.recommendations)) {
                console.log(`[Page Effect - Recs - Fetch @ ${fetchEndTime}] Setting recommendations state with ${result.recommendations.length} items.`);
                setRecommendations(result);
             } else {
                console.warn(`[Page Effect - Recs - Fetch @ ${fetchEndTime}] Received invalid or null recommendation structure from AI flow. Setting recommendations to empty. Result:`, result);
                setRecommendations({ recommendations: [] }); // Set to empty array to avoid UI errors
             }

        } catch (error) {
            const errorTime = Date.now();
            console.error(`[Page Effect - Recs - Fetch @ ${errorTime}] CRITICAL ERROR getting recommendations:`, error);
            toast({
                title: 'Recommendation Error',
                description: 'Could not fetch outfit suggestions. Please try again later.',
                variant: 'destructive',
            });
            setRecommendations({ recommendations: [] }); // Clear recommendations on error
        } finally {
            const finallyTime = Date.now();
            console.log(`[Page Effect - Recs - Fetch @ ${finallyTime}] Finished recommendations fetch process. Setting isLoadingRecommendations to false.`);
            setIsLoadingRecommendations(false); // Stop loading regardless of outcome
        }
    };

    // Use debounce to avoid rapid API calls if user clicks items quickly
    console.log(`[Page Effect - Recs @ ${effectTriggerTime}] Setting debounce timer (500ms) before calling getRecommendations...`);
    const debounceTimer = setTimeout(getRecommendations, 500);

    // Cleanup function to clear the timer if dependencies change before it fires
    return () => {
        const cleanupTime = Date.now();
        console.log(`[Page Effect - Recs @ ${cleanupTime}] Cleanup: Clearing recommendation debounce timer ID ${debounceTimer}.`);
        clearTimeout(debounceTimer);
        // Optional: If the component unmounts while loading, stop the loading state
        // setIsLoadingRecommendations(false); // May cause issues if another effect triggers immediately
    }
    // Dependencies: Run when selected items change OR when all clothing items are loaded (to ensure `availableItemIds` is ready)
}, [recommendationInputItems, allClothingItems, toast]); // `allClothingItems` is crucial here


  const handleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
    console.log("[Page Handler - FilterChange] New filters received:", newFilters);
    setFilters(newFilters);
  }, []);

   const handleToggleOutfitRecs = useCallback((item: ClothingItem) => {
     const toggleTime = Date.now();
     console.log(`[Page Handler - ToggleRecs @ ${toggleTime}] Toggling item ID: ${item.id} (${item.name})`);
     setRecommendationInputItems(prev => {
       const isSelected = prev.includes(item.id);
       let newItems;
       if (isSelected) {
         newItems = prev.filter(id => id !== item.id);
         console.log(`[Page Handler - ToggleRecs @ ${toggleTime}] Item ${item.id} REMOVED. New input list (${newItems.length} items):`, newItems);
         toast({
            title: 'Removed from Consideration',
            description: `${item.name} will no longer be used for generating the next AI recommendations.`,
            variant: 'default', // Use default or secondary
          });
       } else {
         // Optional: Limit the number of items that can be considered
         const MAX_CONSIDERED_ITEMS = 5;
          if (prev.length >= MAX_CONSIDERED_ITEMS) {
              toast({
                  title: 'Selection Limit Reached',
                  description: `You can consider up to ${MAX_CONSIDERED_ITEMS} items at a time for recommendations.`,
                  variant: 'destructive',
               });
              return prev; // Return previous state without adding
          }

         newItems = [...prev, item.id];
         console.log(`[Page Handler - ToggleRecs @ ${toggleTime}] Item ${item.id} ADDED. New input list (${newItems.length} items):`, newItems);
          toast({
             title: 'Added for Consideration',
             description: `${item.name} added. AI suggestions will update shortly based on this selection.`,
           });
       }
       // IMPORTANT: This state update triggers the useEffect for recommendations
       return newItems;
     });
   }, [toast]);


  const filterOptions = useMemo(() => {
    // Prevent recalculation if allClothingItems is empty initially
    if (!allClothingItems || allClothingItems.length === 0) {
        console.log("[Page Memo - FilterOptions] allClothingItems is empty, returning empty options.");
        return { categories: [], sizes: [], colors: [] };
    }
    console.log("[Page Memo - FilterOptions] Recalculating filter options based on allClothingItems.");
    const categories = [...new Set(allClothingItems.map(item => item.category))].sort();
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))].sort();
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))].sort();
    console.log("[Page Memo - FilterOptions] Calculated options:", { categories, sizes, colors });
    return { categories, sizes, colors };
  }, [allClothingItems]);

  console.log("[Page Render] Rendering Home component. States:", { isLoadingItems, isLoadingRecommendations, isLoadingTrending, isLoadingNewArrivals, isInitialLoad, inputItemsCount: recommendationInputItems.length, recommendationsCount: recommendations?.recommendations?.length ?? 0 });

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
       {/* Headline Section */}
       <Card className="text-center shadow-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-none overflow-hidden">
        <CardHeader className="p-8 md:p-12">
           <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
              Welcome to AMS Boutique
           </CardTitle>
           <CardDescription className="text-lg text-muted-foreground mt-3">
              Discover Your Style. Elevate Your Wardrobe.
           </CardDescription>
         </CardHeader>
         <CardContent className="pb-8 md:pb-12">
           <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
             Explore our curated collection of modern fashion essentials. Use our AI-powered assistant to find the perfect outfit combinations, discover trending styles, and shop our latest arrivals.
           </p>
            <div className="flex flex-wrap justify-center gap-4">
                 <Button asChild size="lg">
                     <Link href="#explore-collection">Explore Collection</Link>
                 </Button>
                 <Button variant="outline" asChild size="lg">
                      <Link href="/sale">
                        <Tags className="mr-2 h-5 w-5" /> Shop Sale
                      </Link>
                 </Button>
            </div>
         </CardContent>
       </Card>

        {/* Trending Products Section */}
        <section>
             <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
               <Flame className="h-7 w-7 text-primary" /> Trending Now
             </h2>
             <TrendingProducts
                items={trendingItems}
                isLoading={isLoadingTrending}
                onToggleForRecommendations={handleToggleOutfitRecs} // Pass handler
                recommendationInputItemIds={recommendationInputItems}
             />
        </section>

        <Separator />

       {/* New Arrivals Section */}
       <section>
            <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Sparkles className="h-7 w-7 text-primary" /> New Arrivals
            </h2>
            <NewArrivals
                items={newArrivals}
                isLoading={isLoadingNewArrivals}
                onToggleForRecommendations={handleToggleOutfitRecs} // Pass handler
                recommendationInputItemIds={recommendationInputItems}
            />
       </section>


       <Separator />


       {/* Main Collection Section */}
       <section id="explore-collection">
           <h2 className="text-3xl font-bold mb-6 text-center">Explore Our Collection</h2>
            {(isLoadingItems && isInitialLoad) || (allClothingItems.length === 0 && isLoadingItems) ? ( // Show filter skeleton only during initial item load or if still loading and no items yet
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

            <ClothingList
              items={filteredItems}
              // Show loading state if initial load is happening OR if filtering is in progress
              isLoading={isInitialLoad || isLoadingItems}
              onToggleForRecommendations={handleToggleOutfitRecs}
              recommendationInputItemIds={recommendationInputItems}
             />
        </section>

       <Separator />

        {/* Outfit Recommendations Section */}
         <section>
            {/* Only render OutfitRecommendations if base data is loaded, otherwise it might get empty data */}
            {!isInitialLoad && allClothingItems.length > 0 ? (
              <OutfitRecommendations
                recommendations={recommendations}
                clothingData={allClothingItems} // Pass all items for lookup
                isLoading={isLoadingRecommendations} // Pass the specific loading state for recs
                onToggleForRecommendations={handleToggleOutfitRecs} // Handler to toggle items *from* recs cards
                recommendationInputItemIds={recommendationInputItems} // Pass the IDs being considered
              />
            ) : (
                // Optional: Placeholder while initial data loads
                <Card className="mt-8 shadow-md bg-secondary/30 border-dashed animate-pulse">
                     <CardHeader>
                       <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary/80">
                         <Loader2 className="h-5 w-5 animate-spin" /> Loading Recommendations...
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <p className="text-center text-muted-foreground py-6">
                         Loading products before generating AI suggestions...
                       </p>
                     </CardContent>
               </Card>
            )}
         </section>

    </div>
  );
}
