"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart, Wand2, MinusCircle, PlusCircle } from 'lucide-react'; // Import icons


interface ClothingItemCardProps {
  item: ClothingItem;
  // Handler to toggle item inclusion for recommendations
  onToggleForRecommendations?: (item: ClothingItem) => void;
   // Indicates if the item is currently selected for recommendation input
  isSelectedForRecommendations?: boolean;
  // Indicates if this card is rendering a recommendation *output*
  isRecommendation?: boolean;
  recommendationReason?: string;
}

export function ClothingItemCard({
    item,
    onToggleForRecommendations,
    isSelectedForRecommendations = false,
    isRecommendation = false,
    recommendationReason
}: ClothingItemCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(item.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(item.colors[0]);
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function from cart context

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selection required',
        description: 'Please select a size and color.',
        variant: 'destructive',
      });
      return;
    }
    addItem(item, selectedSize, selectedColor); // Use addItem from context
    // Toast is now handled within the addItem function in CartContext
  };

  // Handler for the "Consider for Outfit" button
   const handleToggleRecsClick = () => {
     if (onToggleForRecommendations) {
       onToggleForRecommendations(item);
       // Toast is handled in the Home component's useCallback
     }
   };

   // Use the recommendation *output* card's Add button to also toggle its consideration state
   const handleAddRecommendedItemClick = () => {
      if (!selectedSize || !selectedColor) {
        toast({
          title: 'Selection required',
          description: 'Please select a size and color for the recommended item.',
          variant: 'destructive',
        });
        return;
      }
      // Add to cart first
       addItem(item, selectedSize, selectedColor);
       // Then, if a toggle handler exists, also toggle its consideration status
      if (onToggleForRecommendations) {
          onToggleForRecommendations(item);
      }
   };


  return (
    <Card className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col ${isSelectedForRecommendations ? 'border-primary ring-2 ring-primary' : ''} ${isRecommendation ? 'bg-primary/5' : ''}`}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl || 'https://picsum.photos/400/300'}
          alt={item.name}
          width={400}
          height={300}
          className="object-cover w-full h-48"
        />
         <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold">
            ${item.price.toFixed(2)}
         </div>
          {isSelectedForRecommendations && !isRecommendation && (
             <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
               <Wand2 className="h-3 w-3" /> Considering
             </div>
           )}
           {isRecommendation && (
             <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Wand2 className="h-3 w-3 text-primary" /> Recommended
             </div>
           )}
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary/80 italic mt-1">✨ {recommendationReason}</p>
        )}
        <div className="flex gap-2 mt-auto pt-2"> {/* Use mt-auto to push selects down */}
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full flex-1" aria-label="Select Size">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {item.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-full flex-1" aria-label="Select Color">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              {item.colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
         {/* Standard Add to Cart Button */}
         <Button onClick={handleAddToCart} className="w-full" variant="default" disabled={!selectedSize || !selectedColor}>
             <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
         </Button>

        {/* Add/Remove for Recommendations Button (only if handler provided and not a recommendation card itself) */}
         {onToggleForRecommendations && !isRecommendation && (
            <Button
                onClick={handleToggleRecsClick}
                className="w-full"
                variant={isSelectedForRecommendations ? "secondary" : "outline"}
                size="sm"
            >
                {isSelectedForRecommendations ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSelectedForRecommendations ? 'Remove from Recs' : 'Consider for Recs'}
            </Button>
         )}

         {/* Special Button for Recommendation Output Cards */}
         {isRecommendation && (
              <Button
                  onClick={handleAddRecommendedItemClick}
                  className="w-full"
                  variant="secondary" // Or another distinct variant
                  size="sm"
                  disabled={!selectedSize || !selectedColor}
              >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Recommended Item
              </Button>
          )}
      </CardFooter>
    </Card>
  );
}
