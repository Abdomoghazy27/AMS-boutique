
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
   * The price of the clothing item.
   */
  price: number;
}

// More extensive dummy data with prices
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
  }
];


/**
 * Asynchronously retrieves clothing items based on specified filters.
 * This is a mock implementation using dummy data and simulates network delay.
 *
 * @param category The category to filter clothing items.
 * @param size The size to filter clothing items.
 * @param color The color to filter clothing items.
 * @returns A promise that resolves to an array of ClothingItem objects that match the specified filters.
 */
export async function getClothingItems(
  category?: string,
  size?: string,
  color?: string
): Promise<ClothingItem[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredItems = dummyItems;

  if (category) {
    filteredItems = filteredItems.filter(item => item.category === category);
  }
  if (size) {
    filteredItems = filteredItems.filter(item => item.sizes.includes(size));
  }
  if (color) {
    filteredItems = filteredItems.filter(item => item.colors.includes(color));
  }

  return filteredItems;
}
