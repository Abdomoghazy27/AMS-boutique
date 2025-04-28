import type { ClothingItem } from '@/services/clothing';

/**
 * Represents an item within the shopping cart.
 * Includes the clothing item details, selected size, color, and quantity.
 */
export interface CartItem extends ClothingItem {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}
