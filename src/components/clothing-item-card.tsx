
"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart, Wand2, MinusCircle, PlusCircle, CheckCircle, Tag } from 'lucide-react'; // Import icons


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
    // Use sale price if available when adding to cart
    const priceToAdd = item.isOnSale && item.salePrice ? item.salePrice : item.price;
    // Pass the correct price to the addItem function
    addItem({ ...item, price: priceToAdd }, selectedSize, selectedColor);
    // Toast is handled within the addItem function in CartContext
  };

  // Handler for the "Consider for Outfit" / "Remove from Recs" button
   const handleToggleRecsClick = () => {
     if (onToggleForRecommendations) {
       onToggleForRecommendations(item);
       // Toast is handled in the Home component's useCallback
     }
   };

   // Handler for the "Add Recommended Item" button on recommendation cards
   const handleAddRecommendedItemClick = () => {
      if (!selectedSize || !selectedColor) {
        toast({
          title: 'Selection required',
          description: 'Please select a size and color for the recommended item.',
          variant: 'destructive',
        });
        return;
      }
       // Use sale price if available when adding recommended item
      const priceToAdd = item.isOnSale && item.salePrice ? item.salePrice : item.price;
      // Add to cart with correct price
       addItem({ ...item, price: priceToAdd }, selectedSize, selectedColor);
      // If a toggle handler exists AND the item isn't already selected for input, select it.
      if (onToggleForRecommendations && !isSelectedForRecommendations) {
          onToggleForRecommendations(item);
      } else if (onToggleForRecommendations && isSelectedForRecommendations) {
           toast({
             title: 'Item Considered',
             description: `${item.name} is already being considered for the next recommendations.`,
             variant: 'default'
           });
      }
   };


  return (
    <Card className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col ${isSelectedForRecommendations && !isRecommendation ? 'border-green-600 ring-2 ring-green-600/50' : ''} ${isRecommendation ? 'bg-primary/5 border-primary/30' : ''}`}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl || 'https://picsum.photos/400/300'}
          alt={item.name}
          width={400}
          height={300}
          className="object-cover w-full h-48"
        />
         {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold">
             {item.isOnSale && item.salePrice ? (
                <>
                  <span className="text-destructive font-bold mr-1">${item.salePrice.toFixed(2)}</span>
                  <span className="line-through text-muted-foreground text-xs">${item.price.toFixed(2)}</span>
                </>
              ) : (
                <span>${item.price.toFixed(2)}</span>
              )}
          </div>
         {/* Sale Tag */}
         {item.isOnSale && (
              <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1">
                   <Tag className="h-3 w-3" /> SALE
              </div>
            )}
          {/* Considering Badge */}
          {isSelectedForRecommendations && !isRecommendation && (
             <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
               <CheckCircle className="h-3 w-3" /> Considering
             </div>
           )}
           {/* Recommended Badge */}
           {isRecommendation && (
             <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Wand2 className="h-3 w-3" /> Suggested Item
             </div>
           )}
           {/* Trending Badge (Optional, can add if needed) */}
            {item.isTrending && !isRecommendation && !isSelectedForRecommendations && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Trending
                </div>
             )}


      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>
        {/* Recommendation Reason */}
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary/90 italic mt-1 px-1 py-0.5 rounded bg-primary/10">✨ {recommendationReason}</p>
        )}
        <div className="flex gap-2 mt-auto pt-2"> {/* Use mt-auto to push selects down */}
          <Select value={selectedSize} onValueChange={setSelectedSize} disabled={item.sizes.length <= 1 && item.sizes[0] === 'One Size'}>
            <SelectTrigger className="w-full flex-1" aria-label="Select Size">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {item.sizes.map((size) => (
                <SelectItem key={size} value={size} disabled={item.sizes.length <= 1 && item.sizes[0] === 'One Size'}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedColor} onValueChange={setSelectedColor} disabled={item.colors.length <= 1}>
            <SelectTrigger className="w-full flex-1" aria-label="Select Color">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              {item.colors.map((color) => (
                <SelectItem key={color} value={color} disabled={item.colors.length <= 1}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
         {/* Add to Cart */}
         {!isRecommendation && (
             <Button onClick={handleAddToCart} className="w-full" variant="default" disabled={!selectedSize || !selectedColor}>
                 <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
             </Button>
         )}

         {/* Add Recommended Item (Adds to cart AND considers) */}
         {isRecommendation && (
              <Button
                  onClick={handleAddRecommendedItemClick}
                  className="w-full"
                  variant="default"
                  size="sm"
                  disabled={!selectedSize || !selectedColor}
              >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Suggested Item & Consider
              </Button>
          )}


        {/* Consider for Recommendations Button */}
         {onToggleForRecommendations && !isRecommendation && (
            <Button
                onClick={handleToggleRecsClick}
                className="w-full"
                variant={isSelectedForRecommendations ? "secondary" : "outline"}
                size="sm"
            >
                {isSelectedForRecommendations ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSelectedForRecommendations ? 'Stop Considering' : 'Consider for Outfit'}
            </Button>
         )}


      </CardFooter>
    </Card>
  );
}

