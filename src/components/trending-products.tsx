
import type { ClothingItem } from '@/services/clothing';
import { ClothingItemCard } from '@/components/clothing-item-card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface TrendingProductsProps {
  items: ClothingItem[];
  isLoading?: boolean;
  // Removed recommendation-related props
}

export function TrendingProducts({ items, isLoading = false }: TrendingProductsProps) {

  if (isLoading) {
    return (
       <ScrollArea className="w-full whitespace-nowrap rounded-md border p-4">
           <div className="flex space-x-4">
               {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-[280px] flex-shrink-0 space-y-3 rounded-lg border p-4 animate-pulse bg-muted">
                       <Skeleton className="h-40 rounded-md bg-muted-foreground/20" /> {/* Image */}
                       <Skeleton className="h-5 w-3/4 bg-muted-foreground/20" /> {/* Title */}
                       <Skeleton className="h-4 w-1/2 bg-muted-foreground/20" /> {/* Price */}
                       <div className="flex gap-2 pt-2">
                           <Skeleton className="h-8 flex-1 bg-muted-foreground/20" /> {/* Select */}
                           <Skeleton className="h-8 flex-1 bg-muted-foreground/20" /> {/* Select */}
                       </div>
                       <Skeleton className="h-9 w-full bg-muted-foreground/20" /> {/* Button */}
                   </div>
               ))}
           </div>
         <ScrollBar orientation="horizontal" />
       </ScrollArea>
    );
  }


  if (!items || items.length === 0) {
    return <p className="text-center text-muted-foreground py-6">No trending items found right now.</p>;
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {items.map((item) => (
          <div key={item.id} className="w-[280px] flex-shrink-0"> {/* Fixed width for cards */}
            <ClothingItemCard
              item={item}
              // Removed recommendation-related props
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
