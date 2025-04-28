'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

interface FilterOptionsProps {
  categories: string[];
  sizes: string[];
  colors: string[];
  onFilterChange: (filters: { category?: string; size?: string; color?: string }) => void;
  initialFilters?: { category?: string; size?: string; color?: string };
}

export function FilterOptions({
  categories,
  sizes,
  colors,
  onFilterChange,
  initialFilters = {},
}: FilterOptionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialFilters.category);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(initialFilters.size);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialFilters.color);

  const handleFilter = () => {
    onFilterChange({
      category: selectedCategory || undefined, // Pass undefined if 'all' is selected or no selection
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    onFilterChange({});
  };

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" /> Filter Products
        </CardTitle>
        {(selectedCategory || selectedSize || selectedColor) && (
           <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground hover:text-foreground">
             <X className="h-4 w-4 mr-1"/> Clear Filters
           </Button>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedSize || ''} onValueChange={(value) => setSelectedSize(value === 'all' ? undefined : value)}>
          <SelectTrigger aria-label="Filter by size">
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Size</SelectLabel>
              <SelectItem value="all">All Sizes</SelectItem>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={selectedColor || ''} onValueChange={(value) => setSelectedColor(value === 'all' ? undefined : value)}>
          <SelectTrigger aria-label="Filter by color">
            <SelectValue placeholder="Select Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Color</SelectLabel>
              <SelectItem value="all">All Colors</SelectItem>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button onClick={handleFilter} className="md:col-span-3" variant="default">Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
