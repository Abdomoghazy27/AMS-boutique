
"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart, Wand2, MinusCircle, PlusCircle, CheckCircle, Tag, Info } from 'lucide-react'; // Added icons


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
  // Initialize size/color with the first available option, handle 'One Size'
  const initialSize = item.sizes.length > 0 ? item.sizes[0] : undefined;
  const initialColor = item.colors.length > 0 ? item.colors[0] : undefined;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialSize);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor);
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function from cart context

  // Ensure size/color are re-selected if item changes (though unlikely with current setup)
  useState(() => {
     setSelectedSize(initialSize);
     setSelectedColor(initialColor);
  });


  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selection Required',
        description: 'Please select a size and color before adding to cart.',
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

  // Handler for the "Consider for Outfit" / "Stop Considering" button on *regular* cards
   const handleToggleRecsClick = () => {
     if (onToggleForRecommendations) {
       console.log(`[ClothingItemCard ${item.id}] Toggling recommendation consideration.`);
       onToggleForRecommendations(item);
       // Toast is handled in the Home component's useCallback to provide context
     } else {
        console.warn(`[ClothingItemCard ${item.id}] onToggleForRecommendations handler is missing.`);
        toast({ title: 'Action Unavailable', description: 'Cannot toggle recommendation status currently.', variant: 'destructive' });
     }
   };

   // Handler for the "Add Suggested Item" button on *recommendation* cards
   const handleAddRecommendedItemClick = () => {
      if (!selectedSize || !selectedColor) {
        toast({
          title: 'Selection Required',
          description: 'Please select size and color for the suggested item.',
          variant: 'destructive',
        });
        return;
      }
       // Use sale price if available when adding recommended item
      const priceToAdd = item.isOnSale && item.salePrice ? item.salePrice : item.price;
      console.log(`[ClothingItemCard ${item.id}] Adding recommended item to cart: ${item.name} (${selectedSize}, ${selectedColor}) at price $${priceToAdd}`);
      // Add to cart with correct price
      addItem({ ...item, price: priceToAdd }, selectedSize, selectedColor); // Toast is in addItem

      // // Optional: Automatically consider the added recommended item for the *next* round?
      // if (onToggleForRecommendations && !isSelectedForRecommendations) {
      //    console.log(`[ClothingItemCard ${item.id}] Also considering the added recommended item for next AI round.`);
      //    onToggleForRecommendations(item); // This would trigger another AI call immediately
      // }
   };

    // Determine if selections are valid
    const canAddToCart = !!selectedSize && !!selectedColor;
    // Determine if the card represents an item that *can* be considered (has handler)
    const canBeConsidered = !!onToggleForRecommendations;

  return (
    <Card className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group ${isSelectedForRecommendations && !isRecommendation ? 'border-green-600 ring-2 ring-green-600/50' : ''} ${isRecommendation ? 'bg-primary/5 border-primary/30' : ''}`}>
      <CardHeader className="p-0 relative">
        <Image
          src={item.imageUrl || 'https://picsum.photos/seed/default/400/300'} // Default placeholder
          alt={item.name}
          width={400}
          height={300}
          className="object-cover w-full h-48"
          onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/error/400/300'; }} // Fallback image
        />
         {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 rounded-md text-sm font-semibold shadow">
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
              <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 shadow">
                   <Tag className="h-3 w-3" /> SALE
              </div>
            )}
          {/* Badge for "Considering" (item is input for AI) */}
          {isSelectedForRecommendations && !isRecommendation && (
             <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow">
               <CheckCircle className="h-3 w-3" /> Considering
             </div>
           )}
           {/* Badge for "Suggested" (item is output from AI) */}
           {isRecommendation && (
             <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow">
                <Wand2 className="h-3 w-3" /> Suggested Item
             </div>
           )}
           {/* Trending Badge (Optional, only if not recommended/considering) */}
            {item.isTrending && !isRecommendation && !isSelectedForRecommendations && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow">
                     {/* Using Info icon for Trending, or Flame */}
                    <Info className="h-3 w-3" /> Trending
                </div>
             )}


      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>

        {/* Display Recommendation Reason if applicable */}
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary/90 italic mt-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 flex items-start gap-1.5">
            <Wand2 className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary"/>
            <span>{recommendationReason}</span>
          </p>
        )}

        {/* Size and Color Selectors */}
        <div className="flex gap-2 mt-auto pt-2">
          <Select
            value={selectedSize}
            onValueChange={setSelectedSize}
            disabled={item.sizes.length <= 1 && item.sizes[0] === 'One Size'}
          >
            <SelectTrigger className="w-full flex-1" aria-label="Select Size">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {item.sizes.map((size) => (
                <SelectItem
                    key={size}
                    value={size}
                    // Disable selection if only 'One Size' exists and it's the default
                    disabled={item.sizes.length === 1 && size === 'One Size'}
                 >
                  {size}
                </SelectItem>
              ))}
              {/* Add a default state if no sizes */}
              {item.sizes.length === 0 && <SelectItem value="" disabled>No sizes</SelectItem>}
            </SelectContent>
          </Select>

          <Select
            value={selectedColor}
            onValueChange={setSelectedColor}
            disabled={item.colors.length <= 1}
          >
            <SelectTrigger className="w-full flex-1" aria-label="Select Color">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              {item.colors.map((color) => (
                <SelectItem key={color} value={color} disabled={item.colors.length === 1}>
                  {color}
                </SelectItem>
              ))}
               {/* Add a default state if no colors */}
              {item.colors.length === 0 && <SelectItem value="" disabled>No colors</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex flex-col gap-2 items-stretch"> {/* Ensure buttons stretch */}

         {/* Primary Action: Add to Cart (for regular cards) or Add Suggested (for rec cards) */}
         {isRecommendation ? (
             <Button
                  onClick={handleAddRecommendedItemClick}
                  className="w-full"
                  variant="default" // Prominent variant for suggested item
                  size="sm"
                  disabled={!canAddToCart}
                  aria-label={`Add suggested item ${item.name} to cart`}
             >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Suggested Item
             </Button>
         ) : (
             <Button
                 onClick={handleAddToCart}
                 className="w-full"
                 variant="default"
                 disabled={!canAddToCart}
                 aria-label={`Add ${item.name} to cart`}
             >
                 <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
             </Button>
         )}


        {/* Secondary Action: Consider/Stop Considering (Only for regular cards with handler) */}
         {canBeConsidered && !isRecommendation && (
            <Button
                onClick={handleToggleRecsClick}
                className="w-full"
                variant={isSelectedForRecommendations ? "secondary" : "outline"}
                size="sm"
                 aria-label={isSelectedForRecommendations ? `Stop considering ${item.name} for outfit recommendations` : `Consider ${item.name} for outfit recommendations`}
            >
                {isSelectedForRecommendations ? <MinusCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSelectedForRecommendations ? 'Stop Considering' : 'Consider for Outfit'}
            </Button>
         )}


      </CardFooter>
    </Card>
  );
}
