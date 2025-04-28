'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getClothingItems, ClothingItem } from '@/services/clothing';
import { recommendOutfit, RecommendOutfitInput, RecommendOutfitOutput } from '@/ai/flows/outfit-recommendation';
import { ClothingList } from '@/components/clothing-list';
import { FilterOptions } from '@/components/filter-options';
import { OutfitRecommendations } from '@/components/outfit-recommendations';
import { Skeleton } from "@/components/ui/skeleton";

// Dummy data for demonstration
const dummyItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Classic White Tee',
    description: 'A versatile and comfortable cotton t-shirt.',
    imageUrl: 'https://picsum.photos/seed/tee/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
    category: 'T-Shirts',
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    description: 'Stylish dark wash slim fit jeans.',
    imageUrl: 'https://picsum.photos/seed/jeans/400/300',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Dark Wash', 'Light Wash', 'Black'],
    category: 'Jeans',
  },
  {
    id: '3',
    name: 'Floral Sundress',
    description: 'Light and airy floral print sundress, perfect for summer.',
    imageUrl: 'https://picsum.photos/seed/dress/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'],
    category: 'Dresses',
  },
  {
    id: '4',
    name: 'Cozy Knit Sweater',
    description: 'Warm and soft knit sweater for cooler days.',
    imageUrl: 'https://picsum.photos/seed/sweater/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Navy', 'Burgundy'],
    category: 'Sweaters',
  },
   {
    id: '5',
    name: 'Casual Chinos',
    description: 'Comfortable and stylish chinos for everyday wear.',
    imageUrl: 'https://picsum.photos/seed/chinos/400/300',
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Olive', 'Gray'],
    category: 'Pants',
  },
  {
    id: '6',
    name: 'Leather Jacket',
    description: 'Classic biker style leather jacket.',
    imageUrl: 'https://picsum.photos/seed/jacket/400/300',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    category: 'Outerwear',
  },
   {
    id: '7',
    name: 'Striped Button-Down Shirt',
    description: 'A sharp striped shirt for smart-casual looks.',
    imageUrl: 'https://picsum.photos/seed/shirt/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue/White Stripe', 'Gray/White Stripe'],
    category: 'Shirts',
  },
  {
    id: '8',
    name: 'Denim Skirt',
    description: 'A versatile denim mini skirt.',
    imageUrl: 'https://picsum.photos/seed/skirt/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blue Denim', 'Black Denim'],
    category: 'Skirts',
  }
];


export default function Home() {
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [filters, setFilters] = useState<{ category?: string; size?: string; color?: string }>({});
  const [selectedOutfitItems, setSelectedOutfitItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendOutfitOutput | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);


  // Fetch initial data (using dummy data for now)
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      // Replace with actual API call if available
      // const items = await getClothingItems();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setAllClothingItems(dummyItems);
      setFilteredItems(dummyItems); // Initially display all items
      setIsLoadingItems(false);
      setIsInitialLoad(false);
    };
    fetchItems();
  }, []);

  // Filter items whenever filters or allClothingItems change
  useEffect(() => {
    if (isInitialLoad) return; // Don't filter until initial data is loaded

    setIsLoadingItems(true);
    let itemsToFilter = [...allClothingItems];

    if (filters.category) {
      itemsToFilter = itemsToFilter.filter(item => item.category === filters.category);
    }
    if (filters.size) {
      itemsToFilter = itemsToFilter.filter(item => item.sizes.includes(filters.size!));
    }
    if (filters.color) {
      itemsToFilter = itemsToFilter.filter(item => item.colors.includes(filters.color!));
    }

    // Simulate filtering delay
    const timer = setTimeout(() => {
       setFilteredItems(itemsToFilter);
       setIsLoadingItems(false);
    }, 500);

    return () => clearTimeout(timer); // Cleanup timer on unmount or filter change

  }, [filters, allClothingItems, isInitialLoad]);


  // Get outfit recommendations when selected items change
  useEffect(() => {
    if (selectedOutfitItems.length === 0) {
      setRecommendations(null); // Clear recommendations if no items are selected
      return;
    }

    const getRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const input: RecommendOutfitInput = {
          selectedItems: selectedOutfitItems,
          // Add stylePreferences or previouslyViewedItems if needed
        };
        const result = await recommendOutfit(input);
        setRecommendations(result);
      } catch (error) {
        console.error("Error getting recommendations:", error);
        // Handle error appropriately, e.g., show a toast message
        setRecommendations(null); // Clear recommendations on error
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    // Debounce the recommendation call slightly
    const debounceTimer = setTimeout(() => {
        getRecommendations();
    }, 300); // Wait 300ms after the last item addition


     return () => clearTimeout(debounceTimer);
  }, [selectedOutfitItems]);


  const handleFilterChange = useCallback((newFilters: { category?: string; size?: string; color?: string }) => {
    setFilters(newFilters);
  }, []);

  const handleAddToOutfit = useCallback((item: ClothingItem, size: string, color: string) => {
    // Use item.id to track selected items for recommendations
    setSelectedOutfitItems(prev => {
      // Avoid adding duplicates
      if (prev.includes(item.id)) {
        return prev;
      }
      return [...prev, item.id];
    });
    // Here you could also add the item with size/color to a visual "outfit builder" state if needed
  }, []);


  // Memoize filter options to avoid recalculating on every render
  const filterOptions = useMemo(() => {
    const categories = [...new Set(allClothingItems.map(item => item.category))];
    const sizes = [...new Set(allClothingItems.flatMap(item => item.sizes))];
    const colors = [...new Set(allClothingItems.flatMap(item => item.colors))];
    return { categories, sizes, colors };
  }, [allClothingItems]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Our Collection</h1>

      {isInitialLoad ? (
         <div className="mb-6 space-y-4 animate-pulse">
            <div className="h-16 bg-muted rounded-lg"></div> {/* Filter card header placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted rounded-lg">
              <div className="h-10 bg-muted-foreground/20 rounded"></div> {/* Select placeholders */}
              <div className="h-10 bg-muted-foreground/20 rounded"></div>
              <div className="h-10 bg-muted-foreground/20 rounded"></div>
              <div className="h-10 bg-muted-foreground/40 rounded md:col-span-3"></div> {/* Button placeholder */}
            </div>
          </div>
      ) : (
        <FilterOptions
            categories={filterOptions.categories}
            sizes={filterOptions.sizes}
            colors={filterOptions.colors}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
      )}


      <ClothingList
        items={filteredItems}
        onAddToOutfit={handleAddToOutfit}
        isLoading={isLoadingItems}
       />

      <OutfitRecommendations
        recommendations={recommendations}
        clothingData={allClothingItems} // Pass all items for lookup
        onAddToOutfit={handleAddToOutfit}
        isLoading={isLoadingRecommendations}
      />
    </div>
  );
}

