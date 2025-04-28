"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart, Wand2, MinusCircle, PlusCircle, CheckCircle } from 'lucide-react'; // Import icons


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

  // Handler for the "Consider for Outfit" / "Remove from Recs" button
   const handleToggleRecsClick = () => {
     if (onToggleForRecommendations) {
       onToggleForRecommendations(item);
       // Toast is handled in the Home component's useCallback
     }
   };

   // Handler for the "Add Recommended Item" button on recommendation cards
   // This button primarily adds to cart, but *also* implicitly marks it for consideration
   // for the *next* round of recommendations if the user chooses to update later.
   const handleAddRecommendedItemClick = () => {
      if (!selectedSize || !selectedColor) {
        toast({
          title: 'Selection required',
          description: 'Please select a size and color for the recommended item.',
          variant: 'destructive',
        });
        return;
      }
      // Add to cart
       addItem(item, selectedSize, selectedColor);
      // If a toggle handler exists AND the item isn't already selected for input, select it.
      // This makes it easy to build outfits iteratively.
      if (onToggleForRecommendations && !isSelectedForRecommendations) {
          onToggleForRecommendations(item);
      } else if (onToggleForRecommendations && isSelectedForRecommendations) {
          // Optional: Provide feedback if they click "Add Recommended" when it's already being considered
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
         <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold">
            ${item.price.toFixed(2)}
         </div>
          {/* Badge for "Considering" (Input items, not AI recs) */}
          {isSelectedForRecommendations && !isRecommendation && (
             <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
               <CheckCircle className="h-3 w-3" /> Considering
             </div>
           )}
           {/* Badge for "Recommended" (AI recs) */}
           {isRecommendation && (
             <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Wand2 className="h-3 w-3" /> Suggested Item
             </div>
           )}
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>
        {/* Recommendation Reason (Only on AI recommendation cards) */}
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary/90 italic mt-1 px-1 py-0.5 rounded bg-primary/10">✨ {recommendationReason}</p>
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
         {/* Primary Action: Add to Cart (Always present unless it's a recommendation card) */}
         {!isRecommendation && (
             <Button onClick={handleAddToCart} className="w-full" variant="default" disabled={!selectedSize || !selectedColor}>
                 <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
             </Button>
         )}

         {/* Primary Action for Recommendation Cards: Add Recommended Item (Adds to cart AND considers) */}
         {isRecommendation && (
              <Button
                  onClick={handleAddRecommendedItemClick}
                  className="w-full"
                  variant="default" // Make it the primary action on these cards
                  size="sm"
                  disabled={!selectedSize || !selectedColor}
              >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Suggested Item & Consider
              </Button>
          )}


        {/* Secondary Action: Add/Remove for Recommendations Button (Only if handler provided and not an AI rec card) */}
         {onToggleForRecommendations && !isRecommendation && (
            <Button
                onClick={handleToggleRecsClick}
                className="w-full"
                variant={isSelectedForRecommendations ? "secondary" : "outline"}
                 // Using secondary variant might clash if primary is also secondary. Outline is safer.
                 // Let's use outline for add, secondary for remove.
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
