
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
import { Flame, Sparkles, Tags, Loader2, Wand2 } from 'lucide-react'; // Import icons


export default function Home() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<ClothingItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<GetClothingItemsFilters>({});
  // State specifically for AI recommendations generated via button click
  const [generatedOutfit, setGeneratedOutfit] = useState<RecommendOutfitOutput | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false); // Renamed for clarity
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
        // Ensure we don't take more than available if total items < 5
        const arrivals = allItems.slice(Math.max(0, allItems.length - 5));
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


  // Handler for filter changes
  const handleFilterChange = useCallback((newFilters: GetClothingItemsFilters) => {
    console.log("[Page Handler - FilterChange] New filters received:", newFilters);
    setFilters(newFilters);
  }, []);


   // Handler for the "Generate Outfit Suggestion" button click
    const handleGenerateOutfit = useCallback(async () => {
      const generationStartTime = Date.now();
      console.log(`[Page Handler - GenerateOutfit @ ${generationStartTime}] Button clicked. Starting outfit generation...`);
      setIsLoadingRecommendations(true);
      setGeneratedOutfit(null); // Clear previous results

      if (allClothingItems.length < 2) { // Need at least 2 items to form an outfit
         console.error(`[Page Handler - GenerateOutfit @ ${generationStartTime}] Error: Cannot generate outfit, not enough items available (${allClothingItems.length}).`);
         toast({ title: 'Error', description: 'Not enough products loaded yet to generate an outfit. Please wait or refresh.', variant: 'destructive' });
         setIsLoadingRecommendations(false);
         return;
      }

      try {
        const allAvailableItemIds = allClothingItems.map(item => item.id);
        console.log(`[Page Handler - GenerateOutfit @ ${generationStartTime}] Total available item IDs for AI: ${allAvailableItemIds.length}`);

         // Prepare input for the AI flow
         const input: RecommendOutfitInput = {
             availableItemIds: allAvailableItemIds,
             // stylePreferences: "casual chic" // Example: Add if you implement preferences
         };

          console.log(`[Page Handler - GenerateOutfit @ ${generationStartTime}] Calling recommendOutfit AI flow with input...`); // Removed input logging for brevity
          const result = await recommendOutfit(input);
          const generationEndTime = Date.now();
          console.log(`[Page Handler - GenerateOutfit @ ${generationEndTime}] Received AI recommendations result (took ${generationEndTime - generationStartTime}ms):`, JSON.stringify(result, null, 2));

           // --- Set State and Show Toast Based on Result ---
           setGeneratedOutfit(result); // Set the result regardless of success/failure, the component handles display

           if (result && result.recommendations && result.recommendations.length >= 2) {
               // Success case: We have at least 2 valid recommendations
               console.log(`[Page Handler - GenerateOutfit @ ${generationEndTime}] Generation successful. Setting generatedOutfit state with ${result.recommendations.length} items.`);
               toast({
                   title: 'Outfit Suggestion Ready!',
                   description: result.outfitReason || 'AI has generated an outfit for you.', // Show AI reason or default
                });
           } else {
               // Failure case: Less than 2 recommendations, or other error indicated by outfitReason
                console.warn(`[Page Handler - GenerateOutfit @ ${generationEndTime}] Generation failed or resulted in less than 2 valid items. Result:`, result);
                 toast({
                   title: 'Generation Issue',
                   // Use the reason from the AI response if available, otherwise provide a generic message
                   description: result?.outfitReason || 'Could not generate a valid outfit suggestion at this time. Please try again.',
                   variant: 'destructive', // Use destructive variant for errors/issues
                });
           }

      } catch (error) {
        const errorTime = Date.now();
        console.error(`[Page Handler - GenerateOutfit @ ${errorTime}] CRITICAL ERROR generating outfit:`, error);
         toast({
            title: 'Generation Error',
            description: 'An unexpected error occurred while generating the outfit suggestion.',
            variant: 'destructive',
          });
         // Set an error state in generatedOutfit to be displayed by the component
         setGeneratedOutfit({ recommendations: [], outfitReason: "An unexpected error occurred during generation." });
      } finally {
        const finallyTime = Date.now();
        console.log(`[Page Handler - GenerateOutfit @ ${finallyTime}] Finished outfit generation process. Setting isLoadingRecommendations to false.`);
        setIsLoadingRecommendations(false);
      }
    }, [allClothingItems, toast]);


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

  console.log("[Page Render] Rendering Home component. States:", { isLoadingItems, isLoadingRecommendations, isLoadingTrending, isLoadingNewArrivals, isInitialLoad, generatedOutfitCount: generatedOutfit?.recommendations?.length ?? 0 });

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


        {/* AI Outfit Generation Button & Recommendations Section */}
        <section>
            <Card className="mt-8 shadow-md bg-primary/5 border-primary/30">
                 <CardHeader>
                   <CardTitle className="text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-primary">
                      <div className='flex items-center gap-2'>
                          <Wand2 className="h-6 w-6" /> AI Outfit Suggestion
                      </div>
                       <Button
                          onClick={handleGenerateOutfit}
                          disabled={isLoadingRecommendations || allClothingItems.length < 2} // Disable if loading or not enough items loaded
                          className="mt-2 sm:mt-0"
                        >
                          {isLoadingRecommendations ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                              </>
                          ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" /> Generate New Outfit
                              </>
                          )}
                       </Button>
                   </CardTitle>
                   <CardDescription>Click the button to get a complete outfit suggestion generated by AI from our entire collection.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     {/* Render the OutfitRecommendations component */}
                     <OutfitRecommendations
                       recommendations={generatedOutfit} // Pass the generated outfit state
                       clothingData={allClothingItems} // Pass all items for lookup
                       isLoading={isLoadingRecommendations} // Pass the specific loading state
                       isGeneratedOutfit={true} // Indicate this is from the button click
                     />
                 </CardContent>
             </Card>
        </section>


        {/* Trending Products Section */}
        <section>
             <h2 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
               <Flame className="h-7 w-7 text-primary" /> Trending Now
             </h2>
             <TrendingProducts
                items={trendingItems}
                isLoading={isLoadingTrending}
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
             />
        </section>

    </div>
  );
}
