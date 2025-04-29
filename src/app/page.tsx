'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getClothingItems, ClothingItem, GetClothingItemsFilters } from '@/services/clothing';
// Removed ClothingList and FilterOptions imports
import { OutfitRecommendations } from '@/components/outfit-recommendations';
import { TrendingProducts } from '@/components/trending-products';
import { NewArrivals } from '@/components/new-arrivals';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Flame, Sparkles, Tags, Loader2, Wand2, Shirt } from 'lucide-react'; // Added Shirt icon, removed Shuffle

export default function Home() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  // Removed filteredItems and filters state
  const [trendingItems, setTrendingItems] = useState<ClothingItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ClothingItem[]>([]);
  // State for randomly generated outfit items
  const [randomOutfitItems, setRandomOutfitItems] = useState<ClothingItem[] | null>(null);
  // Removed isLoadingItems state
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingNewArrivals, setIsLoadingNewArrivals] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();


  // Fetch initial data for trending, new arrivals, and AI suggestions
  useEffect(() => {
    const fetchAllData = async () => {
      console.log("[Page Effect - Fetch All] Starting initial data fetch for homepage sections...");
      // Removed setIsLoadingItems(true);
      setIsLoadingTrending(true);
      setIsLoadingNewArrivals(true);
      setIsInitialLoad(true);
      try {
        // Fetch all items needed for random suggestions and arrivals
        const allItems = await getClothingItems();
        console.log(`[Page Effect - Fetch All] Fetched ${allItems.length} total items.`);
        setAllClothingItems(allItems); // Keep all items for random suggestions

        // Fetch trending items
        const trending = await getClothingItems({ isTrending: true });
        console.log(`[Page Effect - Fetch All] Fetched ${trending.length} trending items.`);
        setTrendingItems(trending);

        // Fetch new arrivals
        const arrivals = allItems.slice(-Math.min(5, allItems.length));
        console.log(`[Page Effect - Fetch All] Determined ${arrivals.length} new arrivals.`);
        setNewArrivals(arrivals);

      } catch (error) {
          console.error("[Page Effect - Fetch All] Failed to fetch initial data:", error);
          toast({
            title: "Error Loading Content",
            description: "Could not load some products. Please try refreshing.",
            variant: "destructive",
          });
           // Set all relevant states to empty on error
           setAllClothingItems([]);
           setTrendingItems([]);
           setNewArrivals([]);
      } finally {
          console.log("[Page Effect - Fetch All] Finished initial data fetch.");
          // Removed setIsLoadingItems(false);
          setIsLoadingTrending(false);
          setIsLoadingNewArrivals(false);
          setIsInitialLoad(false);
      }
    };
    fetchAllData();
  }, [toast]);

  // Removed the useEffect hook for filtering items as it's no longer needed on the homepage

  // Removed handleFilterChange callback


   // Handler for the "Generate Random Outfit" button click
    const handleGenerateRandomOutfit = useCallback(async () => {
      const generationStartTime = Date.now();
      console.log(`[Page Handler - GenerateRandomOutfit @ ${generationStartTime}] Button clicked. Starting random outfit generation...`);
      setIsLoadingRecommendations(true);
      setRandomOutfitItems(null); // Clear previous results

      if (allClothingItems.length < 3) { // Need at least 3 items to pick randomly
         console.error(`[Page Handler - GenerateRandomOutfit @ ${generationStartTime}] Error: Cannot generate outfit, not enough items available (${allClothingItems.length}).`);
         toast({ title: 'Error', description: 'Not enough products loaded yet to generate an outfit (need 3+). Please wait or refresh.', variant: 'destructive' });
         setIsLoadingRecommendations(false);
         return;
      }

      try {
           // Simulate short delay for UX
           await new Promise(resolve => setTimeout(resolve, 300));

           // Select 3 random distinct items
           const shuffled = [...allClothingItems].sort(() => 0.5 - Math.random());
           const selectedItems = shuffled.slice(0, 3);

           const generationEndTime = Date.now();
           console.log(`[Page Handler - GenerateRandomOutfit @ ${generationEndTime}] Random selection complete (took ${generationEndTime - generationStartTime}ms). Selected IDs:`, selectedItems.map(i => i.id).join(', '));

           setRandomOutfitItems(selectedItems); // Set the selected items

           toast({
               title: 'AI Suggestion Ready!', // Updated toast title
               description: 'Here are 3 randomly selected items for inspiration.',
           });

      } catch (error) {
        const errorTime = Date.now();
        console.error(`[Page Handler - GenerateRandomOutfit @ ${errorTime}] CRITICAL ERROR generating random outfit:`, error);
         toast({
            title: 'Generation Error',
            description: 'An unexpected error occurred while selecting random items.',
            variant: 'destructive',
          });
         setRandomOutfitItems([]); // Set empty array on error
      } finally {
        const finallyTime = Date.now();
        console.log(`[Page Handler - GenerateRandomOutfit @ ${finallyTime}] Finished random outfit generation process. Setting isLoadingRecommendations to false.`);
        setIsLoadingRecommendations(false);
      }
    }, [allClothingItems, toast]);


  // Removed useMemo for filterOptions as it's no longer needed here

  console.log("[Page Render] Rendering Home component. States:", { isLoadingRecommendations, isLoadingTrending, isLoadingNewArrivals, isInitialLoad, randomOutfitItemsCount: randomOutfitItems?.length ?? 0 });

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
             Explore our curated collection of modern fashion essentials. Get inspired with AI suggestions, discover trending styles, and shop our latest arrivals.
           </p>
            <div className="flex flex-wrap justify-center gap-4">
                 {/* Updated button to link to /products */}
                 <Button asChild size="lg">
                     <Link href="/products">
                        <Shirt className="mr-2 h-5 w-5" /> Explore Collection
                     </Link>
                 </Button>
                 <Button variant="outline" asChild size="lg">
                      <Link href="/sale">
                        <Tags className="mr-2 h-5 w-5" /> Shop Sale
                      </Link>
                 </Button>
            </div>
         </CardContent>
       </Card>


        {/* AI Outfit Suggestion Section */}
        <section>
            <Card className="mt-8 shadow-md bg-primary/5 border-primary/30">
                 <CardHeader>
                   <CardTitle className="text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-primary">
                      <div className='flex items-center gap-2'>
                          <Wand2 className="h-6 w-6" /> AI Suggestion
                      </div>
                       <Button
                          onClick={handleGenerateRandomOutfit}
                          disabled={isLoadingRecommendations || allClothingItems.length < 3}
                          className="mt-2 sm:mt-0"
                        >
                          {isLoadingRecommendations ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                              </>
                          ) : (
                              <>
                                <Wand2 className="mr-2 h-4 w-4" /> Get AI Suggestion
                              </>
                          )}
                       </Button>
                   </CardTitle>
                   <CardDescription>Click the button to get an AI-generated selection of 3 items from our collection for inspiration.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     <OutfitRecommendations
                       recommendedItems={randomOutfitItems}
                       isLoading={isLoadingRecommendations}
                       isGeneratedOutfit={true}
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

       {/* REMOVED Main Collection Section */}
       {/* <Separator /> */}
       {/* <section id="explore-collection"> ... </section> */}

    </div>
  );
}
