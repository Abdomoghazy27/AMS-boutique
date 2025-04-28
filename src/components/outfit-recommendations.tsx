
import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, CheckCircle, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';


interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  isLoading?: boolean;
   // Handler to toggle an item's inclusion in the recommendation input
  onToggleForRecommendations: (item: ClothingItem) => void;
  // IDs of items currently selected for recommendations (to update card state)
  recommendationInputItemIds: string[];
}

export function OutfitRecommendations({
    recommendations,
    clothingData,
    isLoading = false,
    onToggleForRecommendations,
    recommendationInputItemIds
}: OutfitRecommendationsProps) {
   console.log("[OutfitRecommendations Render] Props received:", { isLoading, recommendations: recommendations ? recommendations.recommendations.length : null, clothingDataCount: clothingData.length, inputItemIds: recommendationInputItemIds });

   // Find the full item details for the input items
   const inputItemsDetails = recommendationInputItemIds
     .map(id => clothingData.find(item => item.id === id))
     .filter((item): item is ClothingItem => item !== undefined); // Filter out undefined if an ID wasn't found

    // --- Helper function to render the AI recommendations section ---
   const renderAIRecommendations = () => {
     if (isLoading) {
        console.log("[OutfitRecommendations Render] Rendering AI Recommendations loading state.");
        return (
         <Card className="mt-6 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Wand2 className="h-5 w-5 animate-spin" /> {/* Spin icon */}
                 Generating AI Suggestions...
              </CardTitle>
               <CardDescription className="text-sm text-muted-foreground">Based on the items you're considering.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                 {[...Array(Math.min(3, recommendationInputItemIds.length || 1))].map((_, i) => ( // Show up to 3 skeletons
                   <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-sm border p-4 space-y-3 flex flex-col bg-muted/50">
                     <div className="h-48 bg-muted rounded"></div> {/* Image Placeholder */}
                      <div className="flex-grow space-y-2 mt-3"> {/* Content Placeholder */}
                         <div className="h-6 bg-muted rounded w-3/4"></div> {/* Title */}
                         <div className="h-4 bg-muted rounded w-full"></div> {/* Description line 1 */}
                         <div className="h-4 bg-muted rounded w-1/2"></div> {/* Reason Placeholder */}
                      </div>
                      <div className="flex gap-2 pt-4"> {/* Selects Placeholder */}
                         <div className="h-10 bg-muted rounded w-1/2"></div>
                         <div className="h-10 bg-muted rounded w-1/2"></div>
                       </div>
                      <div className="h-10 bg-muted rounded w-full mt-2"></div> {/* Add Button Placeholder */}
                       <div className="h-8 bg-muted rounded w-full mt-1"></div> {/* Consider Button Placeholder */}
                   </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }

       // Show placeholder only if NOT loading AND (no AI recommendations OR empty AI recommendations array)
       // AND there ARE items selected for input
       if (!isLoading && recommendationInputItemIds.length > 0 && (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0)) {
         console.log("[OutfitRecommendations Render] Rendering AI Recommendations placeholder state (input selected, but no AI results yet or error).");
         return (
           <Card className="mt-6 border-dashed">
             <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                   <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
                </CardTitle>
             </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-6">
                 No specific AI recommendations found based on your current selection. Try adding more items or different combinations.
              </p>
            </CardContent>
          </Card>
        );
      }

       // Handle case where recommendation IDs don't match clothing data (after loading is done)
       console.log("[OutfitRecommendations Render] Processing AI recommendations to find matching items...");
       const recommendedItems = recommendations?.recommendations
        ?.map(rec => {
          const item = clothingData.find(c => c.id === rec.clothingItemId);
          if (!item) {
            console.warn(`[OutfitRecommendations] Could not find clothing item data for AI recommendation ID: ${rec.clothingItemId}`);
          }
          return item ? { ...rec, itemData: item } : null;
        })
        ?.filter(rec => rec !== null) as { clothingItemId: string; reason: string; itemData: ClothingItem }[] ?? []; // Default to empty array if recommendations are null

       console.log(`[OutfitRecommendations Render] Found ${recommendedItems.length} matching items for the AI recommendations.`);


       if (recommendationInputItemIds.length > 0 && recommendedItems.length === 0 && !isLoading) {
         // This case handles if the AI returned IDs, but none matched our local data, OR if AI returned empty list
         console.log("[OutfitRecommendations Render] No matching items found for the AI recommendation IDs. Rendering 'not found' message.");
         return (
           <Card className="mt-6 border-dashed">
            <CardHeader>
               <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                 <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
               </CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-center text-muted-foreground py-6">Could not find details for the recommended items or no suggestions were generated. Try selecting different items.</p>
             </CardContent>
           </Card>
         );
       }

        // Only render if there are actual recommendations to show
       if (recommendedItems.length > 0) {
           console.log("[OutfitRecommendations Render] Rendering AI recommendation cards.");
           return (
            <Card className="mt-6 border-primary/30">
               <CardHeader>
                 <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
                   <Wand2 className="h-5 w-5" /> AI Outfit Suggestions
                 </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">Based on your selections, you might also like these:</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                   {recommendedItems.map((rec) => (
                     <ClothingItemCard
                       key={`rec-${rec.clothingItemId}`} // Add prefix to key
                       item={rec.itemData}
                       onToggleForRecommendations={onToggleForRecommendations}
                       isSelectedForRecommendations={recommendationInputItemIds.includes(rec.clothingItemId)}
                       isRecommendation={true} // Mark this as an AI recommendation output card
                       recommendationReason={rec.reason}
                     />
                   ))}
                 </div>
               </CardContent>
             </Card>
           );
       }

       // Fallback if none of the above conditions are met (e.g., initial state with inputs but before loading starts)
        return null;

   };


   // --- Main Render Logic ---

   // Only render the whole section if there are input items OR it's loading OR there are AI recommendations
   if (inputItemsDetails.length === 0 && !isLoading && (!recommendations || recommendations.recommendations.length === 0)) {
       console.log("[OutfitRecommendations Render] Rendering initial placeholder (no input items selected).");
        return (
           <Card className="mt-8 shadow-md bg-secondary/30 border-dashed">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary/80">
                <Wand2 className="h-5 w-5" /> AI Outfit Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-6 flex items-center justify-center gap-2">
                 <Info className="h-5 w-5 text-primary/60"/>
                 Select items from the collection using the <PlusCircleIcon className="inline h-4 w-4 mx-1"/>/<MinusCircleIcon className="inline h-4 w-4 mx-1"/> buttons to get personalized AI outfit recommendations!
              </p>
            </CardContent>
          </Card>
        );
   }

  return (
    <div className="mt-8 space-y-6">
      {/* Section: Items You're Considering */}
      {inputItemsDetails.length > 0 && (
        <Card className="shadow-md border-secondary">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" /> Items You're Considering
            </CardTitle>
            <CardDescription>The AI will suggest items based on these selections.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inputItemsDetails.map((item) => (
                <ClothingItemCard
                  key={`input-${item.id}`} // Add prefix to key
                  item={item}
                  onToggleForRecommendations={onToggleForRecommendations}
                  isSelectedForRecommendations={true} // Always true for items in this section
                  isRecommendation={false} // Not an AI output recommendation
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Separator and AI Recommendations Section */}
      {inputItemsDetails.length > 0 && <Separator className="my-6" />}

      {/* Render AI Recommendations (handles loading, results, placeholders internally) */}
       {inputItemsDetails.length > 0 && renderAIRecommendations()}

    </div>
  );
}


// Helper icon components (could be moved to a separate file)
const PlusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const MinusCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
