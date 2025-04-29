
/**
 * Represents a clothing item with its details.
 */
export interface ClothingItem {
  /**
   * The unique identifier for the clothing item.
   */
  id: string;
  /**
   * The name or title of the clothing item.
   */
  name: string;
  /**
   * The description of the clothing item.
   */
  description: string;
  /**
   * The URL of the image for the clothing item.
   */
  imageUrl: string;
  /**
   * The available sizes for the clothing item.
   */
  sizes: string[];
  /**
   * The available colors for the clothing item.
   */
  colors: string[];
  /**
   * The category of the clothing item.
   */
  category: string;
  /**
   * The original price of the clothing item.
   */
  price: number;
  /**
   * Indicates if the item is currently on sale.
   */
  isOnSale?: boolean;
   /**
    * The sale price of the item, if applicable.
    */
  salePrice?: number;
   /**
    * Indicates if the item is currently trending.
    * (Using this as a simple flag, could be based on views/sales in a real app)
    */
   isTrending?: boolean;
}

// Generate 200 dummy items
const categories = ['T-Shirts', 'Jeans', 'Dresses', 'Sweaters', 'Pants', 'Outerwear', 'Shirts', 'Skirts', 'Accessories', 'Shorts', 'Tops', 'Shoes', 'Bags'];
const sizes = [['S', 'M', 'L', 'XL'], ['XS', 'S', 'M'], ['28', '30', '32', '34', '36'], ['One Size'], ['6', '7', '8', '9', '10']];
const colors = [
    ['White', 'Black', 'Gray'], ['Dark Wash', 'Light Wash', 'Black'], ['Pink Floral', 'Blue Floral', 'Yellow Floral'],
    ['Cream', 'Navy', 'Burgundy'], ['Khaki', 'Olive', 'Gray'], ['Black', 'Brown'], ['Blue/White Stripe', 'Gray/White Stripe'],
    ['Blue Denim', 'Black Denim'], ['Black', 'Heather Gray', 'Navy'], ['Emerald Green', 'Deep Red', 'Navy Blue'],
    ['Olive Green', 'Black', 'Maroon'], ['White', 'Navy', 'Red', 'Green'], ['Blush Pink', 'Black', 'Forest Green'],
    ['Beige', 'White', 'Light Blue'], ['Camel', 'Charcoal Gray', 'Light Pink'], ['Ivory', 'Black', 'Dusty Rose'],
    ['Natural', 'Navy Stripe', 'Black'], ['Denim Blue', 'White', 'Khaki'], ['Champagne', 'Black', 'Silver']
];
const namePrefixes = ['Classic', 'Modern', 'Vintage', 'Essential', 'Stylish', 'Comfortable', 'Elegant', 'Casual', 'Formal', 'Urban', 'Retro', 'Minimalist'];
const nameSuffixes = ['Tee', 'Jeans', 'Dress', 'Sweater', 'Pants', 'Jacket', 'Shirt', 'Skirt', 'Scarf', 'Shorts', 'Top', 'Blouse', 'Coat', 'Bag', 'Sneakers', 'Boots', 'Sandals', 'Hat'];
const descriptions = [
    'A versatile addition to your wardrobe.', 'Perfect for any occasion.', 'Made with high-quality materials.',
    'Designed for comfort and style.', 'A must-have fashion staple.', 'Elevate your look with this piece.',
    'Timeless design, modern fit.', 'Effortlessly chic and comfortable.', 'Stay warm and stylish.', 'Lightweight and breathable fabric.'
];

const generateDummyItems = (count: number): ClothingItem[] => {
    const items: ClothingItem[] = [];
    const usedIds = new Set<string>();

    for (let i = 1; i <= count; i++) {
        let id = String(i);
        while (usedIds.has(id)) {
            id = String(Math.floor(Math.random() * 10000) + count); // Ensure uniqueness if count overlaps initial IDs
        }
        usedIds.add(id);

        const category = categories[Math.floor(Math.random() * categories.length)];
        const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
        let suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
        // Try to match suffix to category for more realism
        if (category === 'T-Shirts' || category === 'Tops') suffix = 'Tee';
        if (category === 'Jeans' || category === 'Pants' || category === 'Shorts') suffix = category.slice(0, -1); // Jeans, Pant, Short
        if (category === 'Dresses') suffix = 'Dress';
        if (category === 'Sweaters') suffix = 'Sweater';
        if (category === 'Outerwear') suffix = ['Jacket', 'Coat', 'Bomber'][Math.floor(Math.random() * 3)];
        if (category === 'Shirts') suffix = ['Shirt', 'Blouse', 'Polo'][Math.floor(Math.random() * 3)];
        if (category === 'Skirts') suffix = 'Skirt';
        if (category === 'Accessories') suffix = ['Scarf', 'Hat', 'Bag'][Math.floor(Math.random() * 3)];
        if (category === 'Shoes') suffix = ['Sneakers', 'Boots', 'Sandals'][Math.floor(Math.random() * 3)];


        const name = `${prefix} ${suffix}`;
        const description = descriptions[Math.floor(Math.random() * descriptions.length)] + ` Style: ${name}.`;
        const itemSizes = sizes[Math.floor(Math.random() * sizes.length)];
        const itemColors = colors[Math.floor(Math.random() * colors.length)];
        const price = parseFloat((Math.random() * 180 + 20).toFixed(2)); // Price between 20 and 200
        const isOnSale = Math.random() < 0.2; // 20% chance of being on sale
        const salePrice = isOnSale ? parseFloat((price * (Math.random() * 0.4 + 0.5)).toFixed(2)) : undefined; // Sale price 50-90% of original
        const isTrending = Math.random() < 0.15; // 15% chance of being trending

        items.push({
            id,
            name,
            description,
            imageUrl: `https://picsum.photos/seed/${id}/400/300`,
            sizes: itemSizes,
            colors: itemColors,
            category,
            price,
            isOnSale,
            salePrice,
            isTrending,
        });
    }
    return items;
};


const dummyItems: ClothingItem[] = generateDummyItems(200);


/**
 * Interface defining the filter options for retrieving clothing items.
 */
export interface GetClothingItemsFilters {
  category?: string;
  size?: string;
  color?: string;
  isOnSale?: boolean; // Added filter for sale items
  isTrending?: boolean; // Added filter for trending items
}


/**
 * Asynchronously retrieves clothing items based on specified filters.
 * This is a mock implementation using dummy data and simulates network delay.
 *
 * @param filters Optional object containing filter criteria.
 * @returns A promise that resolves to an array of ClothingItem objects that match the specified filters.
 */
export async function getClothingItems(
  filters: GetClothingItemsFilters = {}
): Promise<ClothingItem[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay for faster filtering

  let filteredItems = dummyItems;

  if (filters.category) {
    filteredItems = filteredItems.filter(item => item.category === filters.category);
  }
  if (filters.size) {
    // Handle 'One Size' items correctly
    filteredItems = filteredItems.filter(item => item.sizes.includes(filters.size!) || item.sizes.includes('One Size'));
  }
  if (filters.color) {
    filteredItems = filteredItems.filter(item => item.colors.includes(filters.color!));
  }
  if (filters.isOnSale !== undefined) { // Allow explicitly filtering for non-sale items too
    filteredItems = filteredItems.filter(item => item.isOnSale === filters.isOnSale);
  }
    if (filters.isTrending !== undefined) { // Allow explicitly filtering for non-trending items
    filteredItems = filteredItems.filter(item => item.isTrending === filters.isTrending);
  }


  return filteredItems;
}
