
import type { ClothingItem } from '@/services/clothing';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton


interface NewArrivalsProps {
  items: ClothingItem[];
  isLoading?: boolean;
  // Removed recommendation-related props
}

export function NewArrivals({ items, isLoading = false }: NewArrivalsProps) {

  if (isLoading) {
     return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => ( // Show fewer skeletons for arrivals usually
           <div key={i} className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg border p-4 space-y-3 animate-pulse flex flex-col bg-muted">
             <Skeleton className="h-48 bg-muted-foreground/20 rounded" /> {/* Image */}
             <div className="flex-grow space-y-2 mt-3"> {/* Content */}
                 <Skeleton className="h-6 bg-muted-foreground/20 rounded w-3/4" /> {/* Title */}
                 <Skeleton className="h-4 bg-muted-foreground/20 rounded w-full" /> {/* Desc line 1 */}
                  <Skeleton className="h-4 bg-muted-foreground/20 rounded w-2/3" /> {/* Desc line 2 */}
             </div>
              <div className="flex gap-2 pt-4"> {/* Selects */}
                 <Skeleton className="h-10 bg-muted-foreground/20 rounded w-1/2" />
                 <Skeleton className="h-10 bg-muted-foreground/20 rounded w-1/2" />
               </div>
               <Skeleton className="h-10 bg-muted-foreground/20 rounded w-full mt-2" /> {/* Button */}
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Check back soon for new arrivals!</p>;
  }

  // Use the main grid layout for consistency, limit number if needed via slicing `items` before map
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          // Removed recommendation-related props
        />
      ))}
    </div>
  );
}
