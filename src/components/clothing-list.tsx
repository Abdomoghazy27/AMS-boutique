import type { ClothingItem } from '@/services/clothing';
import { ClothingItemCard } from '@/components/clothing-item-card';

interface ClothingListProps {
  items: ClothingItem[];
  isLoading?: boolean;
  // Handler to toggle an item's inclusion in the recommendation input
  onToggleForRecommendations: (item: ClothingItem) => void;
  // IDs of items currently selected for recommendations (to update card state)
  recommendationInputItemIds: string[];
}

export function ClothingList({ items, isLoading = false, onToggleForRecommendations, recommendationInputItemIds }: ClothingListProps) {

   if (isLoading) {
    // Display skeletons while loading
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
           <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3 animate-pulse flex flex-col">
             <div className="h-48 bg-muted rounded"></div> {/* Image Placeholder */}
             <div className="flex-grow space-y-2 mt-3"> {/* Content Placeholder */}
                 <div className="h-6 bg-muted rounded w-3/4"></div> {/* Title */}
                 <div className="h-4 bg-muted rounded w-full"></div> {/* Description line 1 */}
                  <div className="h-4 bg-muted rounded w-2/3"></div> {/* Description line 2 */}
             </div>
              <div className="flex gap-2 pt-4"> {/* Selects Placeholder */}
                 <div className="h-10 bg-muted rounded w-1/2"></div>
                 <div className="h-10 bg-muted rounded w-1/2"></div>
               </div>
               <div className="flex justify-between items-center mt-2"> {/* Buttons Placeholder */}
                <div className="h-10 bg-muted rounded w-2/5"></div> {/* Add to Cart */}
                <div className="h-8 bg-muted rounded w-2/5"></div> {/* Consider for Recs */}
              </div>

          </div>
        ))}
      </div>
    );
  }


  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No clothing items found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          // Pass the toggle handler down to the card
          onToggleForRecommendations={onToggleForRecommendations}
          // Let the card know if it's currently selected for recommendations
          isSelectedForRecommendations={recommendationInputItemIds.includes(item.id)}
        />
      ))}
    </div>
  );
}
