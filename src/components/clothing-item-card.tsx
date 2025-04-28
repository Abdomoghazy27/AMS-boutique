"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart } from 'lucide-react'; // Import icon


interface ClothingItemCardProps {
  item: ClothingItem;
  onAddToOutfit?: (item: ClothingItem, size: string, color: string) => void; // Keep for recommendations if needed elsewhere
  isRecommendation?: boolean;
  recommendationReason?: string;
}

export function ClothingItemCard({ item, onAddToOutfit, isRecommendation = false, recommendationReason }: ClothingItemCardProps) {
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

  // Use the original onAddToOutfit for recommendation adding if provided
  const handleAddToOutfitClick = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selection required',
        description: 'Please select a size and color.',
        variant: 'destructive',
      });
      return;
    }
     if (onAddToOutfit) {
       onAddToOutfit(item, selectedSize, selectedColor);
        toast({
           title: 'Item Considered for Recs',
           description: `${item.name} (${selectedSize}, ${selectedColor}) added for outfit recommendations.`,
         });
     } else {
        // Fallback or alternative action if needed when it's a recommendation card
        // but no specific onAddToOutfit is passed (maybe add to cart directly?)
        handleAddToCart();
     }
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
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
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary italic mt-1">Reason: {recommendationReason}</p>
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
      <CardFooter className="p-4 pt-0">
        {isRecommendation ? (
           <Button onClick={handleAddToOutfitClick} className="w-full" variant="secondary" disabled={!selectedSize || !selectedColor}>
             Add Recommended Item
           </Button>
        ) : (
           <Button onClick={handleAddToCart} className="w-full" variant="default" disabled={!selectedSize || !selectedColor}>
             <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
           </Button>
        )}

      </CardFooter>
    </Card>
  );
}
