"use client";

import type { ClothingItem } from '@/services/clothing';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { recommendOutfit, RecommendOutfitInput } from '@/ai/flows/outfit-recommendation';

interface ClothingItemCardProps {
  item: ClothingItem;
  onAddToOutfit: (item: ClothingItem, size: string, color: string) => void;
  isRecommendation?: boolean;
  recommendationReason?: string;
}

export function ClothingItemCard({ item, onAddToOutfit, isRecommendation = false, recommendationReason }: ClothingItemCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(item.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(item.colors[0]);
  const { toast } = useToast();

  const handleAddToOutfit = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: 'Selection required',
        description: 'Please select a size and color.',
        variant: 'destructive',
      });
      return;
    }
    onAddToOutfit(item, selectedSize, selectedColor);
    toast({
      title: 'Item Added',
      description: `${item.name} (${selectedSize}, ${selectedColor}) added to outfit recommendations.`,
    });
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Image
          src={item.imageUrl || 'https://picsum.photos/400/300'} // Use placeholder if imageUrl is missing
          alt={item.name}
          width={400}
          height={300}
          className="object-cover w-full h-48"
        />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{item.description}</CardDescription>
        {isRecommendation && recommendationReason && (
          <p className="text-xs text-primary italic">Reason: {recommendationReason}</p>
        )}
        <div className="flex gap-2 mt-2">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-full" aria-label="Select Size">
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
            <SelectTrigger className="w-full" aria-label="Select Color">
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
        <Button onClick={handleAddToOutfit} className="w-full" variant="default" disabled={!selectedSize || !selectedColor}>
          {isRecommendation ? 'Add Recommended Item' : 'Add to Outfit Recs'}
        </Button>
      </CardFooter>
    </Card>
  );
}
