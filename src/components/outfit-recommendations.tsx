
import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, CheckCircle, Info, PlusCircle, MinusCircle, Loader2 } from 'lucide-react'; // Added Loader2
import { Separator } from '@/components/ui/separator';


interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  isLoading?: boolean;
   // Handler to toggle an item's inclusion in the recommendation input
  onToggleForRecommendations: (item: ClothingItem) => void;
  // IDs of items currently selected for recommendations (to update card state AND display in "considering" section)
  recommendationInputItemIds: string[];
}

export function OutfitRecommendations({
    recommendations,
    clothingData,
    isLoading = false,
    onToggleForRecommendations,
    recommendationInputItemIds
}: OutfitRecommendationsProps) {
   const renderStartTime = Date.now();
   console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Props received:`, { isLoading, recommendationsCount: recommendations?.recommendations?.length ?? null, clothingDataCount: clothingData.length, inputItemIds: recommendationInputItemIds });

   // Find the full item details for the input items the user is currently considering
   const inputItemsDetails = recommendationInputItemIds
     .map(id => {
         const item = clothingData.find(item => item.id === id);
         if (!item) {
            console.warn(`[OutfitRecommendations Render @ ${renderStartTime}] Could not find item details for input ID: ${id}`);
         }
         return item;
     })
     .filter((item): item is ClothingItem => item !== undefined); // Type guard to filter out undefined results

    console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Found ${inputItemsDetails.length} details for the ${recommendationInputItemIds.length} input item IDs.`);

    // --- Helper function to render the AI suggestions part ---
   const renderAIRecommendations = () => {
     const aiRenderStartTime = Date.now();
     console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Checking conditions... isLoading: ${isLoading}, Recommendations:`, recommendations);

     // 1. Loading State
     if (isLoading) {
        console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering AI Recommendations LOADING state.`);
        return (
         <Card className="mt-6 border-primary/30 animate-pulse">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" /> {/* Use Loader2 */}
                 Generating AI Suggestions...
              </CardTitle>
               <CardDescription className="text-sm text-muted-foreground">Analyzing your selections...</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Skeleton Loading Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[...Array(Math.min(3, recommendationInputItemIds.length || 1))].map((_, i) => ( // Show up to 3 skeletons
                   <div key={`skel-${i}`} className="w-full max-w-sm overflow-hidden rounded-lg shadow-sm border p-4 space-y-3 flex flex-col bg-muted/50">
                     <div className="h-48 bg-muted rounded"></div> {/* Image Placeholder */}
                      <div className="flex-grow space-y-2 mt-3"> {/* Content Placeholder */}
                         <div className="h-6 bg-muted rounded w-3/4"></div> {/* Title */}
                         <div className="h-4 bg-muted rounded w-full"></div> {/* Desc line 1 */}
                         <div className="h-4 bg-muted rounded w-1/2"></div> {/* Reason Placeholder */}
                      </div>
                      <div className="flex gap-2 pt-4"> {/* Selects Placeholder */}
                         <div className="h-10 bg-muted rounded w-1/2"></div>
                         <div className="h-10 bg-muted rounded w-1/2"></div>
                       </div>
                      <div className="h-10 bg-muted rounded w-full mt-2"></div> {/* Add Button Placeholder */}
                   </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }

       // 2. No AI Recommendations Available (after loading)
       // This covers: null recommendations object, empty recommendations array, or error state where loading finished but result is null/empty
       if (!isLoading && (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0)) {
         console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering AI Recommendations 'NO RESULTS' state.`);
         return (
           <Card className="mt-6 border-dashed">
             <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                   <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
                </CardTitle>
                <CardDescription>Suggestions based on items you're considering.</CardDescription>
             </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-6">
                 No specific AI recommendations generated for your current selection. Try considering different items or combinations.
              </p>
            </CardContent>
          </Card>
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
          // Ensure the recommended item is not already in the input list (extra safety check)
          if (recommendationInputItemIds.includes(rec.clothingItemId)) {
               console.warn(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] AI recommended an item (ID: ${rec.clothingItemId}) that is already in the input list. Filtering out.`);
               return null;
          }
          return { ...rec, itemData: item }; // Combine recommendation reason with full item data
        })
        .filter((rec): rec is { clothingItemId: string; reason: string; itemData: ClothingItem } => rec !== null); // Type guard and filter nulls

       console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Found details for ${recommendedItemsWithDetails.length} valid recommended items.`);

       // Sub-case: AI returned recommendations, but none were valid or matched local data
       if (recommendedItemsWithDetails.length === 0) {
          console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] AI returned recommendations, but none were valid after processing. Rendering 'NO VALID RESULTS' state.`);
          return (
           <Card className="mt-6 border-dashed">
             <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                   <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
                </CardTitle>
                  <CardDescription>Suggestions based on items you're considering.</CardDescription>
             </CardHeader>
            <CardContent>
               <p className="text-center text-muted-foreground py-6">Could not display recommendations. The suggested items might be unavailable or invalid.</p>
             </CardContent>
           </Card>
          );
       }

       // Success Case: Render the valid recommendation cards
       console.log(`[OutfitRecommendations AI Render @ ${aiRenderStartTime}] Rendering ${recommendedItemsWithDetails.length} AI recommendation cards.`);
       return (
         <Card className="mt-6 border-primary/30 bg-primary/5"> {/* Added subtle background */}
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
              </CardTitle>
               <CardDescription className="text-sm text-muted-foreground">Based on your selections, you might also like these:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedItemsWithDetails.map((rec) => (
                  <ClothingItemCard
                    key={`rec-${rec.clothingItemId}`} // Unique key for recommendations
                    item={rec.itemData}
                    onToggleForRecommendations={onToggleForRecommendations} // Allow toggling from recs card
                    // A recommended item is *not* selected for input *by default*, unless the user clicks "Add & Consider"
                    isSelectedForRecommendations={recommendationInputItemIds.includes(rec.clothingItemId)}
                    isRecommendation={true} // Mark this as an AI recommendation output card
                    recommendationReason={rec.reason} // Pass the reason
                  />
                ))}
              </div>
            </CardContent>
          </Card>
       );
   };


   // --- Main Render Logic ---

   // Condition to show the entire component:
   // Show if user is considering items OR if recommendations are loading OR if there are recommendations to display
   const shouldRenderComponent = recommendationInputItemIds.length > 0 || isLoading || (recommendations && recommendations.recommendations.length > 0);

   if (!shouldRenderComponent) {
       console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Initial placeholder: No input items selected and not loading.`);
        return (
           <Card className="mt-8 shadow-md bg-secondary/30 border-dashed">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary/80">
                <Wand2 className="h-5 w-5" /> AI Outfit Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-6 flex flex-col sm:flex-row items-center justify-center gap-2">
                 <Info className="h-5 w-5 text-primary/60 flex-shrink-0"/>
                 <span>
                     Select items from the collection using the <PlusCircle className="inline h-4 w-4 mx-1"/>/<MinusCircle className="inline h-4 w-4 mx-1"/> 'Consider' button to get personalized AI outfit suggestions here!
                 </span>
              </p>
            </CardContent>
          </Card>
        );
   }

  // Render the main structure if conditions met
  console.log(`[OutfitRecommendations Render @ ${renderStartTime}] Rendering main component structure.`);
  return (
    <div className="mt-8 space-y-6">
      {/* Section: Items You're Considering (Only show if there are items) */}
      {inputItemsDetails.length > 0 && (
        <Card className="shadow-md border-green-600/50 bg-green-600/5"> {/* Highlight input section */}
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-700"> {/* Green title */}
              <CheckCircle className="h-5 w-5" /> Items You're Considering
            </CardTitle>
            <CardDescription>The AI will suggest items based on these {inputItemsDetails.length} selection(s).</CardDescription>
          </CardHeader>
          <CardContent>
             {inputItemsDetails.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {inputItemsDetails.map((item) => (
                     <ClothingItemCard
                       key={`input-${item.id}`} // Unique key for input items
                       item={item}
                       onToggleForRecommendations={onToggleForRecommendations} // Allow removal
                       isSelectedForRecommendations={true} // Always true for items in this section
                       isRecommendation={false} // Not an AI output recommendation
                     />
                   ))}
                 </div>
             ) : (
                // This case should technically not be hit if we only render when inputItemsDetails.length > 0, but good fallback
                <p className="text-muted-foreground text-sm">No items currently selected for recommendations.</p>
             )}
          </CardContent>
        </Card>
      )}

      {/* Separator (Only show if input items exist AND AI section will render) */}
      {inputItemsDetails.length > 0 && <Separator className="my-6" />}

      {/* AI Recommendations Section (Rendered by helper function, handles its own states) */}
      {/* Only attempt to render AI section if input items are selected */}
      {inputItemsDetails.length > 0 && renderAIRecommendations()}

    </div>
  );
}
