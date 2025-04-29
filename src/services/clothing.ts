
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

// More extensive dummy data with prices, sale items, and trending flags
const dummyItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Classic White Tee',
    description: 'A versatile and comfortable cotton t-shirt.',
    imageUrl: 'https://picsum.photos/seed/tee/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Gray'],
    category: 'T-Shirts',
    price: 25.00,
    isTrending: true,
  },
  {
    id: '2',
    name: 'Slim Fit Jeans',
    description: 'Stylish dark wash slim fit jeans.',
    imageUrl: 'https://picsum.photos/seed/jeans/400/300',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Dark Wash', 'Light Wash', 'Black'],
    category: 'Jeans',
    price: 75.50,
    isTrending: true,
  },
  {
    id: '3',
    name: 'Floral Sundress',
    description: 'Light and airy floral print sundress, perfect for summer.',
    imageUrl: 'https://picsum.photos/seed/dress/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pink Floral', 'Blue Floral', 'Yellow Floral'],
    category: 'Dresses',
    price: 89.99,
    isOnSale: true,
    salePrice: 69.99,
    isTrending: true,
  },
  {
    id: '4',
    name: 'Cozy Knit Sweater',
    description: 'Warm and soft knit sweater for cooler days.',
    imageUrl: 'https://picsum.photos/seed/sweater/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Navy', 'Burgundy'],
    category: 'Sweaters',
    price: 65.00,
  },
   {
    id: '5',
    name: 'Casual Chinos',
    description: 'Comfortable and stylish chinos for everyday wear.',
    imageUrl: 'https://picsum.photos/seed/chinos/400/300',
    sizes: ['30', '32', '34', '36'],
    colors: ['Khaki', 'Olive', 'Gray'],
    category: 'Pants',
    price: 55.00,
  },
  {
    id: '6',
    name: 'Leather Jacket',
    description: 'Classic biker style leather jacket.',
    imageUrl: 'https://picsum.photos/seed/jacket/400/300',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    category: 'Outerwear',
    price: 199.99,
    isTrending: true,
  },
   {
    id: '7',
    name: 'Striped Button-Down Shirt',
    description: 'A sharp striped shirt for smart-casual looks.',
    imageUrl: 'https://picsum.photos/seed/shirt/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue/White Stripe', 'Gray/White Stripe'],
    category: 'Shirts',
    price: 49.50,
  },
  {
    id: '8',
    name: 'Denim Skirt',
    description: 'A versatile denim mini skirt.',
    imageUrl: 'https://picsum.photos/seed/skirt/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blue Denim', 'Black Denim'],
    category: 'Skirts',
    price: 45.00,
    isOnSale: true,
    salePrice: 35.00,
  },
   {
    id: '9',
    name: 'Graphic Hoodie',
    description: 'Comfortable hoodie with a cool graphic print.',
    imageUrl: 'https://picsum.photos/seed/hoodie/400/300',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Heather Gray', 'Navy'],
    category: 'Sweaters', // Or could be Outerwear depending on classification
    price: 68.00,
  },
   {
    id: '10',
    name: 'Maxi Dress',
    description: 'Elegant flowing maxi dress for special occasions.',
    imageUrl: 'https://picsum.photos/seed/maxidress/400/300',
    sizes: ['S', 'M', 'L'],
    colors: ['Emerald Green', 'Deep Red', 'Navy Blue'],
    category: 'Dresses',
    price: 120.00,
  },
   {
    id: '11',
    name: 'Bomber Jacket',
    description: 'A trendy lightweight bomber jacket.',
    imageUrl: 'https://picsum.photos/seed/bomber/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive Green', 'Black', 'Maroon'],
    category: 'Outerwear',
    price: 95.00,
    isTrending: true,
  },
   {
    id: '12',
    name: 'Polo Shirt',
    description: 'Classic polo shirt for a preppy look.',
    imageUrl: 'https://picsum.photos/seed/polo/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Red', 'Green'],
    category: 'Shirts',
    price: 39.95,
    isOnSale: true,
    salePrice: 29.95,
  },
  {
    id: '13',
    name: 'Pleated Midi Skirt',
    description: 'Elegant pleated midi skirt for a sophisticated look.',
    imageUrl: 'https://picsum.photos/seed/midiskirt/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blush Pink', 'Black', 'Forest Green'],
    category: 'Skirts',
    price: 62.00,
  },
   {
    id: '14',
    name: 'Linen Blend Trousers',
    description: 'Lightweight and breathable linen blend trousers.',
    imageUrl: 'https://picsum.photos/seed/linentrousers/400/300',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'White', 'Light Blue'],
    category: 'Pants',
    price: 69.00,
  },
  {
    id: '15',
    name: 'Cashmere Scarf',
    description: 'Luxuriously soft cashmere scarf.',
    imageUrl: 'https://picsum.photos/seed/scarf/400/300',
    sizes: ['One Size'],
    colors: ['Camel', 'Charcoal Gray', 'Light Pink'],
    category: 'Accessories',
    price: 85.00,
  },
  {
    id: '16',
    name: 'V-Neck Blouse',
    description: 'A flattering V-neck blouse, easy to dress up or down.',
    imageUrl: 'https://picsum.photos/seed/blouse/400/300',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Black', 'Dusty Rose'],
    category: 'Shirts',
    price: 48.00,
  },
   {
    id: '17',
    name: 'Wool Blend Coat',
    description: 'A warm and stylish wool blend coat for winter.',
    imageUrl: 'https://picsum.photos/seed/coat/400/300',
    sizes: ['S', 'M', 'L'],
    colors: ['Camel', 'Gray', 'Black'],
    category: 'Outerwear',
    price: 250.00,
    isOnSale: true,
    salePrice: 199.99,
  },
   {
    id: '18',
    name: 'Canvas Tote Bag',
    description: 'Durable and spacious canvas tote bag.',
    imageUrl: 'https://picsum.photos/seed/totebag/400/300',
    sizes: ['One Size'],
    colors: ['Natural', 'Navy Stripe', 'Black'],
    category: 'Accessories',
    price: 35.00,
  },
   {
    id: '19',
    name: 'High-Waisted Shorts',
    description: 'Comfortable high-waisted shorts for warm weather.',
    imageUrl: 'https://picsum.photos/seed/shorts/400/300',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Denim Blue', 'White', 'Khaki'],
    category: 'Shorts',
    price: 42.00,
  },
  {
    id: '20',
    name: 'Silk Camisole',
    description: 'A luxurious silk camisole top.',
    imageUrl: 'https://picsum.photos/seed/camisole/400/300',
    sizes: ['S', 'M', 'L'],
    colors: ['Champagne', 'Black', 'Silver'],
    category: 'Tops', // Could also be T-Shirts or Shirts depending on taxonomy
    price: 58.00,
    isTrending: true,
  }
];


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
  await new Promise(resolve => setTimeout(resolve, 500));

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
  if (filters.isOnSale) {
    filteredItems = filteredItems.filter(item => item.isOnSale === true);
  }
    if (filters.isTrending) {
    filteredItems = filteredItems.filter(item => item.isTrending === true);
  }


  return filteredItems;
}
