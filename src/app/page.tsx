
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
import { Flame, Sparkles, Tags } from 'lucide-react'; // Import icons


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
          setIsInitialLoad(false);
      }
    };
    fetchAllData();
  }, [toast]);

  // Filter main clothing list whenever filters or allClothingItems change
  useEffect(() => {
    if (isInitialLoad) {
        console.log("[Page Effect - Filter] Skipping filter on initial load.");
        return;
    }

    console.log("[Page Effect - Filter] Filters changed, starting filter process:", filters);
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
    }, 300);

    return () => {
        console.log("[Page Effect - Filter] Cleanup: Clearing filter timer.");
        clearTimeout(timer);
    }

  }, [filters, allClothingItems, isInitialLoad, toast]);


 // Get outfit recommendations when recommendationInputItems change OR when allClothingItems are loaded (if inputItems exist)
 useEffect(() => {
    console.log("[Page Effect - Recs] Triggered. Input items count:", recommendationInputItems.length, "All items loaded:", allClothingItems.length > 0);

    // Condition 1: No items selected for recommendations, clear state
    if (recommendationInputItems.length === 0) {
        console.log("[Page Effect - Recs] No items selected for recommendations. Clearing existing state.");
        if (recommendations !== null) setRecommendations(null); // Only clear if needed
        if (isLoadingRecommendations) setIsLoadingRecommendations(false); // Stop loading if it was running
        return;
    }

    // Condition 2: Items are selected, but all clothing data isn't loaded yet. Wait.
    if (allClothingItems.length === 0) {
        console.log("[Page Effect - Recs] Input items selected, but waiting for all clothing items to load...");
        // Optionally set loading state here if desired, but might cause flickering
        // setIsLoadingRecommendations(true);
        return;
    }

    // Condition 3: Items selected AND all clothing data is loaded. Proceed to fetch recommendations.
    const getRecommendations = async () => {
        console.log("[Page Effect - Recs] Preparing to fetch recommendations...");
        setIsLoadingRecommendations(true);
        setRecommendations(null); // Clear previous recommendations

        try {
            // Ensure we have the latest list of *all* available item IDs
            const allAvailableItemIds = allClothingItems.map(item => item.id);
            if (allAvailableItemIds.length === 0) {
                console.error("[Page Effect - Recs] Error: All clothing items loaded, but IDs list is empty.");
                throw new Error("No available item IDs found.");
            }
            console.log(`[Page Effect - Recs] Total available item IDs for AI: ${allAvailableItemIds.length}`);

            const input: RecommendOutfitInput = {
                selectedItems: recommendationInputItems, // The items the user explicitly selected
                availableItemIds: allAvailableItemIds, // The *entire* catalog
                // Add style preferences or previously viewed items if available
            };

            console.log("[Page Effect - Recs] Calling recommendOutfit with input:", JSON.stringify(input, null, 2));
            const result = await recommendOutfit(input);
            console.log("[Page Effect - Recs] Received recommendations result:", JSON.stringify(result, null, 2));

             // Basic validation of the result structure before setting state
            if (result && Array.isArray(result.recommendations)) {
                setRecommendations(result);
             } else {
                console.warn("[Page Effect - Recs] Received invalid recommendation structure from AI flow. Setting recommendations to empty.", result);
                setRecommendations({ recommendations: [] }); // Set to empty array to avoid errors
             }


        } catch (error) {
            console.error("[Page Effect - Recs] Error getting recommendations:", error);
            toast({
                title: 'Recommendation Error',
                description: 'Could not fetch outfit recommendations. Please try again later.',
                variant: 'destructive',
            });
            setRecommendations(null); // Clear on error
        } finally {
            console.log("[Page Effect - Recs] Finished fetching recommendations process.");
            setIsLoadingRecommendations(false); // Stop loading regardless of outcome
        }
    };

    // Use debounce to avoid rapid API calls if user clicks items quickly
    console.log("[Page Effect - Recs] Setting debounce timer (500ms)...");
    const debounceTimer = setTimeout(getRecommendations, 500);

    // Cleanup function to clear the timer if dependencies change before it fires
    return () => {
        console.log("[Page Effect - Recs] Cleanup: Clearing recommendation debounce timer.");
        clearTimeout(debounceTimer);
    }
    // Dependencies: trigger when selected items change OR when all items finish loading
}, [recommendationInputItems, allClothingItems, toast]); // Add allClothingItems here


  const handleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
    console.log("[Page Handler - FilterChange] New filters received:", newFilters);
    setFilters(newFilters);
  }, []);

   const handleToggleOutfitRecs = useCallback((item: ClothingItem) => {
     console.log(`[Page Handler - ToggleRecs] Toggling item: ${item.id} (${item.name})`);
     setRecommendationInputItems(prev => {
       let newItems;
       if (prev.includes(item.id)) {
         newItems = prev.filter(id => id !== item.id);
         console.log(`[Page Handler - ToggleRecs] Item ${item.id} removed. New input list:`, newItems);
         toast({
            title: 'Stopped Considering Item',
            description: `${item.name} removed from outfit recommendations consideration.`,
            variant: 'default',
          });
       } else {
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


  const filterOptions = useMemo(() => {
    console.log("[Page Memo - FilterOptions] Recalculating filter options based on allClothingItems.");
    const categories = [...new Set(allClothingItems.map(item => item.category))].sort();
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))].sort();
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))].sort();
    return { categories, sizes, colors };
  }, [allClothingItems]);

  console.log("[Page Render] Rendering component. isLoadingItems:", isLoadingItems, "isLoadingRecommendations:", isLoadingRecommendations, "Input Items:", recommendationInputItems.length, "Recommendations:", recommendations?.recommendations?.length ?? 0);

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
                onToggleForRecommendations={handleToggleOutfitRecs} // Pass handler if needed on these cards too
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
            {isInitialLoad && !isLoadingItems ? ( // Show filters placeholder only during initial load
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
               !isInitialLoad && ( // Show filters *after* initial load completes
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
              isLoading={isLoadingItems} // Use the correct loading state for the main list
              onToggleForRecommendations={handleToggleOutfitRecs}
              recommendationInputItemIds={recommendationInputItems}
             />
        </section>

       <Separator />

        {/* Outfit Recommendations Section */}
         <section>
            {/* This component handles its own title/structure */}
              <OutfitRecommendations
                recommendations={recommendations}
                clothingData={allClothingItems} // Pass all items for lookup
                isLoading={isLoadingRecommendations} // Pass the specific loading state for recs
                onToggleForRecommendations={handleToggleOutfitRecs}
                recommendationInputItemIds={recommendationInputItems} // Pass the IDs being considered
              />
         </section>

    </div>
  );
}
