import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  isLoading?: boolean;
   // Handler to toggle an item's inclusion in the recommendation input
  onToggleForRecommendations: (item: ClothingItem) => void;
  // IDs of items currently selected for recommendations (to update card state)
  recommendationInputItemIds: string[];
}

export function OutfitRecommendations({ recommendations, clothingData, isLoading = false, onToggleForRecommendations, recommendationInputItemIds }: OutfitRecommendationsProps) {
   if (isLoading) {
    return (
      <Card className="mt-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary animate-spin" /> {/* Spin icon */}
             AI Outfit Recommendations
          </CardTitle>
           <p className="text-sm text-muted-foreground">Generating recommendations based on your selections...</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3 flex flex-col bg-muted/50">
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

  // Show placeholder only if NOT loading AND (no recommendations OR empty recommendations array)
   if (!isLoading && (!recommendations || !recommendations.recommendations || recommendations.recommendations.length === 0)) {
    return (
       <Card className="mt-8 shadow-md bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
             Select items from the collection using the ✨ button to get personalized outfit recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Handle case where recommendation IDs don't match clothing data (after loading is done)
   const recommendedItems = recommendations!.recommendations // We know recommendations is not null/empty here
    .map(rec => {
      const item = clothingData.find(c => c.id === rec.clothingItemId);
      if (!item) {
        console.warn(`[OutfitRecommendations] Could not find clothing item data for recommendation ID: ${rec.clothingItemId}`);
      }
      return item ? { ...rec, itemData: item } : null;
    })
    .filter(rec => rec !== null) as { clothingItemId: string; reason: string; itemData: ClothingItem }[];


  if (recommendedItems.length === 0) {
     // This case handles if the AI returned IDs, but none matched our local data
     return (
       <Card className="mt-8 shadow-md bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-center text-muted-foreground py-6">Could not find details for the recommended items. Try selecting different items.</p>
         </CardContent>
       </Card>
     );
   }

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
        </CardTitle>
         <p className="text-sm text-muted-foreground">Based on your selections, you might like these:</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.map((rec) => (
            <ClothingItemCard
              key={rec.clothingItemId}
              item={rec.itemData}
              // Pass the toggle handler - allows adding a recommended item to also mark it for *next* recs
              onToggleForRecommendations={onToggleForRecommendations}
               // Indicate if this *recommended* item happens to be *also* currently selected for input
              isSelectedForRecommendations={recommendationInputItemIds.includes(rec.clothingItemId)}
              isRecommendation={true} // Mark this as a recommendation output card
              recommendationReason={rec.reason}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
