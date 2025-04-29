
import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Info, Loader2, AlertCircle } from 'lucide-react'; // Added AlertCircle for errors
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  isLoading?: boolean;
  isGeneratedOutfit?: boolean; // Flag to indicate this is displaying a generated outfit
}

export function OutfitRecommendations({
    recommendations,
    clothingData,
    isLoading = false,
    isGeneratedOutfit = false, // Default to false
}: OutfitRecommendationsProps) {
   const renderStartTime = Date.now();
   console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Props received:`, { isLoading, recommendationsCount: recommendations?.recommendations?.length ?? null, clothingDataCount: clothingData.length, isGeneratedOutfit });

   // --- Helper function to render the AI suggestions part ---
   const renderAIRecommendations = () => {
     const aiRenderStartTime = Date.now();
     console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Checking conditions... isLoading: ${isLoading}, Recommendations:`, recommendations);

     // 1. Loading State
     if (isLoading) {
        console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering AI Recommendations LOADING state.`);
        return (
             <div className="mt-4">
                 <p className="text-center text-muted-foreground py-2 flex items-center justify-center gap-2">
                   <Loader2 className="h-5 w-5 animate-spin" /> Generating suggestion...
                 </p>
                 {/* Skeleton Loading Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {[...Array(3)].map((_, i) => ( // Show up to 3 skeletons
                      <div key={`skel-${i}`} className="w-full max-w-sm overflow-hidden rounded-lg shadow-sm border p-4 space-y-3 flex flex-col bg-muted/50 animate-pulse">
                        <Skeleton className="h-48 bg-muted-foreground/20 rounded" /> {/* Image */}
                         <div className="flex-grow space-y-2 mt-3"> {/* Content */}
                            <Skeleton className="h-6 bg-muted-foreground/20 rounded w-3/4" /> {/* Title */}
                            <Skeleton className="h-4 bg-muted-foreground/20 rounded w-full" /> {/* Desc */}
                            <Skeleton className="h-4 bg-muted-foreground/20 rounded w-1/2" /> {/* Reason/Price */}
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

       // 2. No AI Recommendations or Error State (after loading)
       if (!isLoading && (!recommendations || !recommendations.recommendations || recommendations.recommendations.length < 2)) {
          const noResultTime = Date.now();
          console.log(`[OutfitRecommendations AI Render @ ${noResultTime}] Rendering AI Recommendations 'NO RESULTS or ERROR' state. Reason:`, recommendations?.outfitReason);

          // Display the error reason provided by the flow, or a default message
          const reasonText = recommendations?.outfitReason || "No outfit suggestions available. Click 'Generate New Outfit'.";
          const isError = /error/i.test(reasonText || ''); // Basic check if the reason indicates an error

          return (
              <div className="mt-4 text-center py-6 px-4 border border-dashed rounded-md bg-muted/50">
                  <AlertCircle className={`h-8 w-8 mx-auto mb-3 ${isError ? 'text-destructive' : 'text-primary/60'}`} />
                  <p className={`text-muted-foreground ${isError ? 'text-destructive font-medium' : ''}`}>
                      {reasonText}
                  </p>
              </div>
          );
       }

       // 3. Valid AI Recommendations Received - Process and Render
       // This condition is now implicitly met if we passed the previous check
       console.log(`[OutfitRecommendations AI Render @ ${Date.now()}] Processing ${recommendations.recommendations.length} AI recommendations...`);
       const recommendedItemsWithDetails = recommendations.recommendations
        .map(rec => {
          const item = clothingData.find(c => c.id === rec.clothingItemId);
          if (!item) {
            console.warn(`[OutfitRecommendations AI Render @ ${Date.now()}] Could not find clothing item data for AI recommendation ID: ${rec.clothingItemId}`);
            return null; // Skip if item details not found
          }
          // Note: The 'reason' field per item was removed from the schema, so we just pass itemData
          return item; // Return the full ClothingItem data
        })
        .filter((item): item is ClothingItem => item !== null); // Type guard and filter nulls


       console.log(`[OutfitRecommendations AI Render @ ${Date.now()}] Found details for ${recommendedItemsWithDetails.length} valid recommended items.`);

       // This check should technically be redundant due to the check in step 2, but good as a safeguard.
       if (recommendedItemsWithDetails.length < 2) {
          console.warn(`[OutfitRecommendations AI Render @ ${Date.now()}] AI returned recommendations, but after matching data, fewer than 2 valid items remain. This should have been caught earlier.`);
          return (
            <div className="mt-4 text-center py-6 px-4 border border-dashed rounded-md bg-muted/50">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 text-destructive" />
                <p className="text-muted-foreground text-destructive font-medium">
                   Could not display suggestions. Some recommended items might be unavailable or invalid.
                </p>
            </div>
          );
       }

       // Success Case: Render the valid recommendation cards
       console.log(`[OutfitRecommendations AI Render @ ${Date.now()}] Rendering ${recommendedItemsWithDetails.length} AI recommendation cards.`);
       return (
           <div className="mt-4">
              {/* Display overall outfit reason if provided and it's not an error message */}
              {recommendations.outfitReason && !/error/i.test(recommendations.outfitReason) && (
                  <p className="text-sm italic text-primary mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <Info className="h-4 w-4 inline-block mr-1.5 relative -top-px" />
                    {recommendations.outfitReason}
                  </p>
              )}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {recommendedItemsWithDetails.map((item) => (
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

   // Show initial placeholder only if not loading and no recommendations object exists yet
   if (!isGeneratedOutfit && !isLoading && !recommendations) {
      console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Initial placeholder: Not triggered yet.`);
      return (
         <p className="text-center text-muted-foreground py-6 flex flex-col sm:flex-row items-center justify-center gap-2">
             <Info className="h-5 w-5 text-primary/60 flex-shrink-0"/>
             <span>
                 Click the 'Generate New Outfit' button above to get AI suggestions!
             </span>
         </p>
      );
   }

  // Render the main content area (handled by the helper function) for loading, results, or errors
  console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Rendering main content area (loading/results/error).`);
  return renderAIRecommendations();
}
