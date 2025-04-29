
import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Info, Loader2 } from 'lucide-react'; // Removed CheckCircle, PlusCircle, MinusCircle
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  isLoading?: boolean;
  isGeneratedOutfit?: boolean; // Flag to indicate this is displaying a generated outfit
  // Removed recommendationInputItemIds and onToggleForRecommendations
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
                 {/* Skeleton Loading Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

       // 2. No AI Recommendations Available (after loading, or initially if not loading)
       // This covers: null recommendations object, empty recommendations array, or error state
       if (!isLoading && (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0)) {
         console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering AI Recommendations 'NO RESULTS' state.`);
         return (
           <div className="mt-4">
             <p className="text-center text-muted-foreground py-6">
               {isGeneratedOutfit ? "Could not generate an outfit suggestion. Please try again." : "No outfit suggestions available yet. Click 'Generate New Outfit'."}
             </p>
           </div>
         );
       }

       // 3. AI Recommendations Received - Process and Render
       console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Processing ${recommendations.recommendations.length} AI recommendations to find matching items...`);
       const recommendedItemsWithDetails = recommendations.recommendations
        .map(rec => {
          const item = clothingData.find(c => c.id === rec.clothingItemId);
          if (!item) {
            console.warn(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Could not find clothing item data for AI recommendation ID: ${rec.clothingItemId}`);
            return null; // Skip if item details not found
          }
          return { ...rec, itemData: item }; // Combine recommendation reason with full item data
        })
        .filter((rec): rec is { clothingItemId: string; reason: string; itemData: ClothingItem } => rec !== null); // Type guard and filter nulls

       console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Found details for ${recommendedItemsWithDetails.length} valid recommended items.`);

       // Sub-case: AI returned recommendations, but none were valid or matched local data
       if (recommendedItemsWithDetails.length === 0) {
          console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] AI returned recommendations, but none were valid after processing. Rendering 'NO VALID RESULTS' state.`);
          return (
            <div className="mt-4">
              <p className="text-center text-muted-foreground py-6">Could not display suggestions. The suggested items might be unavailable or invalid.</p>
            </div>
          );
       }

       // Success Case: Render the valid recommendation cards
       console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering ${recommendedItemsWithDetails.length} AI recommendation cards.`);
       return (
           <div className="mt-4">
              {/* Display overall outfit reason if provided */}
              {recommendations.outfitReason && (
                  <p className="text-sm italic text-primary mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">{recommendations.outfitReason}</p>
              )}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {recommendedItemsWithDetails.map((rec) => (
                 <ClothingItemCard
                   key={`rec-${rec.clothingItemId}`} // Unique key for recommendations
                   item={rec.itemData}
                   // Removed recommendation-related props
                 />
               ))}
             </div>
           </div>
       );
   };


   // --- Main Render Logic ---

   // Always render the container if it's meant for generated outfits or if loading.
   // The content inside handles the specific states (loading, no results, results).
   if (!isGeneratedOutfit && !isLoading && !recommendations) {
      // Initial state before generation button is clicked
      console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Initial placeholder: Not for generated outfit and not loading/no data.`);
      return (
         <p className="text-center text-muted-foreground py-6 flex flex-col sm:flex-row items-center justify-center gap-2">
             <Info className="h-5 w-5 text-primary/60 flex-shrink-0"/>
             <span>
                 Click the 'Generate New Outfit' button above to get AI suggestions!
             </span>
         </p>
      );
   }

  // Render the main content area (handled by the helper function)
  console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Rendering main content area.`);
  return renderAIRecommendations();
}
