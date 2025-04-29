
"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react'; // Added useEffect
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/cart-context'; // Import useCart
import { ShoppingCart, Tag, Info } from 'lucide-react'; // Removed Wand2, MinusCircle, PlusCircle, CheckCircle


interface ClothingItemCardProps {
  item: ClothingItem;
  // Removed recommendation-related props
}

export function ClothingItemCard({ item }: ClothingItemCardProps) {
  // Initialize size/color with the first available option, handle 'One Size'
  const initialSize = item.sizes.length > 0 ? item.sizes[0] : undefined;
  const initialColor = item.colors.length > 0 ? item.colors[0] : undefined;

  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialSize);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor);
  const { toast } = useToast();
  const { addItem } = useCart(); // Get addItem function from cart context

  // Re-select size/color if item prop changes (e.g., in dynamic lists)
  useEffect(() => {
    setSelectedSize(item.sizes.length > 0 ? item.sizes[0] : undefined);
    setSelectedColor(item.colors.length > 0 ? item.colors[0] : undefined);
  }, [item]);


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

    // Determine if selections are valid
    const canAddToCart = !!selectedSize && !!selectedColor;

  return (
    <Card className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group`}>
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
           {/* Trending Badge */}
            {item.isTrending && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow">
                    <Info className="h-3 w-3" /> Trending
                </div>
             )}
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{item.description}</CardDescription>

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

         {/* Primary Action: Add to Cart */}
         <Button
             onClick={handleAddToCart}
             className="w-full"
             variant="default"
             disabled={!canAddToCart}
             aria-label={`Add ${item.name} to cart`}
         >
             <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
         </Button>

         {/* Removed "Consider for Outfit" button */}

      </CardFooter>
    </Card>
  );
}
