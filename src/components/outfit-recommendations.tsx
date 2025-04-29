
import type { ClothingItem } from '@/services/clothing';
// Removed AI Output type import: import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Loader2, AlertCircle, Shuffle } from 'lucide-react'; // Added AlertCircle for errors, Shuffle for consistency
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


interface OutfitRecommendationsProps {
  recommendedItems: ClothingItem[] | null; // Now accepts an array of items directly
  isLoading?: boolean;
  isGeneratedOutfit?: boolean; // Flag to indicate this is displaying a generated outfit
}

export function OutfitRecommendations({
    recommendedItems,
    isLoading = false,
    isGeneratedOutfit = false, // Default to false
}: OutfitRecommendationsProps) {
   const renderStartTime = Date.now();
   console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Props received:`, { isLoading, recommendationsCount: recommendedItems?.length ?? null, isGeneratedOutfit });

   // --- Helper function to render the suggestions part ---
   const renderRecommendations = () => {
     const renderInnerStartTime = Date.now();
     console.log(`[OutfitRecommendations Inner Render @ ${renderInnerStartTime}] Checking conditions... isLoading: ${isLoading}, RecommendedItems:`, recommendedItems);

     // 1. Loading State
     if (isLoading) {
        console.log(`[OutfitRecommendations Inner Render @ ${renderInnerStartTime}] Rendering Recommendations LOADING state.`);
        return (
             <div className="mt-4">
                 <p className="text-center text-muted-foreground py-2 flex items-center justify-center gap-2">
                   <Loader2 className="h-5 w-5 animate-spin" /> Generating suggestion...
                 </p>
                 {/* Skeleton Loading Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {[...Array(3)].map((_, i) => ( // Show 3 skeletons for the random outfit
                      <div key={`skel-${i}`} className="w-full max-w-sm overflow-hidden rounded-lg shadow-sm border p-4 space-y-3 flex flex-col bg-muted/50 animate-pulse">
                        <Skeleton className="h-48 bg-muted-foreground/20 rounded" /> {/* Image */}
                         <div className="flex-grow space-y-2 mt-3"> {/* Content */}
                            <Skeleton className="h-6 bg-muted-foreground/20 rounded w-3/4" /> {/* Title */}
                            <Skeleton className="h-4 bg-muted-foreground/20 rounded w-full" /> {/* Desc */}
                         </div>
                         <div className="flex gap-2 pt-4"> {/* Selects */}
                            <Skeleton className="h-10 bg-muted-foreground/20 rounded w-1/2" />
                            <Skeleton className="h-10 bg-muted-foreground/20 rounded w-1/2" />
                          </div>
                         <Skeleton className="h-10 bg-muted-foreground/20 rounded w-full mt-2" /> {/* Add Button */}
                      </div>
                   ))}
                 </div>
             </div>
        );
      }

       // 2. No Recommendations or Error State (after loading)
       if (!isLoading && (!recommendedItems || recommendedItems.length === 0)) {
          const noResultTime = Date.now();
          console.log(`[OutfitRecommendations Inner Render @ ${noResultTime}] Rendering 'NO RESULTS or ERROR' state.`);

          // Display a generic message for random generation failure or no items yet
          const reasonText = recommendedItems === null // Check if it was never generated vs. generated as empty
            ? "No outfit suggestions available. Click 'Get Random Outfit'."
            : "Could not generate a random outfit suggestion.";
          const isError = recommendedItems !== null && recommendedItems.length === 0; // Consider empty array after generation an error state

          return (
              <div className="mt-4 text-center py-6 px-4 border border-dashed rounded-md bg-muted/50">
                  <AlertCircle className={`h-8 w-8 mx-auto mb-3 ${isError ? 'text-destructive' : 'text-primary/60'}`} />
                  <p className={`text-muted-foreground ${isError ? 'text-destructive font-medium' : ''}`}>
                      {reasonText}
                  </p>
              </div>
          );
       }

       // 3. Valid Recommendations Received - Render
       // This condition is implicitly met if we passed the previous checks
       console.log(`[OutfitRecommendations Inner Render @ ${Date.now()}] Rendering ${recommendedItems.length} recommendation cards.`);
       return (
           <div className="mt-4">
              {/* Optional: Add a simple title/reason for random suggestions */}
              <p className="text-sm italic text-primary mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                  <Info className="h-4 w-4 inline-block mr-1.5 relative -top-px" />
                  Here's a random selection of items for inspiration!
              </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {recommendedItems.map((item) => (
                 <ClothingItemCard
                   key={`rec-${item.id}`} // Unique key for recommendations
                   item={item}
                 />
               ))}
             </div>
           </div>
       );
   };


   // --- Main Render Logic ---

   // Show initial placeholder only if it's meant for generated outfits, not loading, and no recommendations yet
   if (isGeneratedOutfit && !isLoading && !recommendedItems) {
      console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Initial placeholder: Not generated yet.`);
      return (
         <p className="text-center text-muted-foreground py-6 flex flex-col sm:flex-row items-center justify-center gap-2">
             <Shuffle className="h-5 w-5 text-primary/60 flex-shrink-0"/>
             <span>
                 Click the 'Get Random Outfit' button above to get suggestions!
             </span>
         </p>
      );
   }

  // Render the main content area (handled by the helper function) for loading, results, or errors
  console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Rendering main content area (loading/results/error).`);
  return renderRecommendations();
}
