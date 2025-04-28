import type { ClothingItem } from '@/services/clothing';
import type { RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';

interface OutfitRecommendationsProps {
  recommendations: RecommendOutfitOutput | null;
  clothingData: ClothingItem[]; // Need all clothing data to find recommended items
  onAddToOutfit: (item: ClothingItem, size: string, color: string) => void;
  isLoading?: boolean;
}

export function OutfitRecommendations({ recommendations, clothingData, onAddToOutfit, isLoading = false }: OutfitRecommendationsProps) {
   if (isLoading) {
    return (
      <Card className="mt-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3">
                 <div className="h-48 bg-muted rounded"></div>
                 <div className="h-6 bg-muted rounded w-3/4"></div>
                 <div className="h-4 bg-muted rounded w-full"></div>
                 <div className="h-4 bg-muted rounded w-1/2"></div> {/* Placeholder for reason */}
                  <div className="flex gap-2 pt-2">
                     <div className="h-10 bg-muted rounded w-1/2"></div>
                     <div className="h-10 bg-muted rounded w-1/2"></div>
                   </div>
                 <div className="h-10 bg-muted rounded w-full"></div>
               </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
       <Card className="mt-8 shadow-md bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Select some items above to get personalized outfit recommendations!
          </p>
        </CardContent>
      </Card>
    );
  }

  const recommendedItems = recommendations.recommendations
    .map(rec => {
      const item = clothingData.find(c => c.id === rec.clothingItemId);
      return item ? { ...rec, itemData: item } : null;
    })
    .filter(rec => rec !== null) as { clothingItemId: string; reason: string; itemData: ClothingItem }[];


  if (recommendedItems.length === 0) {
     return (
       <Card className="mt-8 shadow-md bg-secondary/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" /> AI Outfit Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-center text-muted-foreground py-6">Could not find details for the recommended items.</p>
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
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.map((rec) => (
            <ClothingItemCard
              key={rec.clothingItemId}
              item={rec.itemData}
              onAddToOutfit={onAddToOutfit}
              isRecommendation={true}
              recommendationReason={rec.reason}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
