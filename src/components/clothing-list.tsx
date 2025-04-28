import type { ClothingItem } from '@/services/clothing';
import { ClothingItemCard } from '@/components/clothing-item-card';

interface ClothingListProps {
  items: ClothingItem[];
  onAddToOutfit: (item: ClothingItem, size: string, color: string) => void;
  isLoading?: boolean;
}

export function ClothingList({ items, onAddToOutfit, isLoading = false }: ClothingListProps) {

   if (isLoading) {
    // Display skeletons while loading
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
           <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3 animate-pulse">
             <div className="h-48 bg-muted rounded"></div>
             <div className="h-6 bg-muted rounded w-3/4"></div>
             <div className="h-4 bg-muted rounded w-full"></div>
             <div className="flex gap-2 pt-2">
                <div className="h-10 bg-muted rounded w-1/2"></div>
                <div className="h-10 bg-muted rounded w-1/2"></div>
              </div>
             <div className="h-10 bg-muted rounded w-full"></div>
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
        <ClothingItemCard key={item.id} item={item} onAddToOutfit={onAddToOutfit} />
      ))}
    </div>
  );
}
