
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { CartItem } from '@/types/cart';
import type { ClothingItem } from '@/services/clothing';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: ClothingItem, size: string, color: string, quantity?: number) => void;
  removeItem: (itemId: string, size: string, color: string) => void;
  updateQuantity: (itemId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial mount (client-side only)
   useEffect(() => {
     if (typeof window !== 'undefined') {
       const storedCart = localStorage.getItem('ams-boutique-cart');
       if (storedCart) {
         try {
           const parsedItems = JSON.parse(storedCart);
            // Basic validation (check if it's an array)
           if (Array.isArray(parsedItems)) {
             setCartItems(parsedItems);
           } else {
              console.warn("Invalid cart data found in localStorage. Resetting cart.");
              localStorage.removeItem('ams-boutique-cart');
           }
         } catch (error) {
           console.error("Failed to parse cart from localStorage", error);
           localStorage.removeItem('ams-boutique-cart'); // Clear corrupted data
         }
       }
     }
   }, []);

   // Save cart to localStorage whenever it changes
   useEffect(() => {
     if (typeof window !== 'undefined') {
       localStorage.setItem('ams-boutique-cart', JSON.stringify(cartItems));
     }
   }, [cartItems]);


  const addItem = useCallback((item: ClothingItem, size: string, color: string, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id && cartItem.selectedSize === size && cartItem.selectedColor === color
      );

       // Determine the correct price to use (sale price if available, otherwise original price)
       const priceToAdd = item.isOnSale && item.salePrice ? item.salePrice : item.price;

      if (existingItemIndex > -1) {
        // Item exists, update quantity and ensure price is current
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          price: priceToAdd, // Ensure price reflects current sale status
          isOnSale: item.isOnSale, // Update sale status
          salePrice: item.salePrice, // Update sale price
        };
        toast({
           title: 'Cart Updated',
           description: `${item.name} (${size}, ${color}) quantity increased to ${updatedItems[existingItemIndex].quantity}.`,
         });
        return updatedItems;
      } else {
        // Add new item with the correct price
         toast({
           title: 'Item Added to Cart',
           description: `${item.name} (${size}, ${color}) added.`,
         });
          // Create the new CartItem object, ensuring all necessary fields from ClothingItem are included
         const newItem: CartItem = {
            ...item, // Spread all properties from the base ClothingItem
            price: priceToAdd, // Use the determined price
            selectedSize: size,
            selectedColor: color,
            quantity: quantity
         };
         return [...prevItems, newItem];
      }
    });
  }, [toast]);

  const removeItem = useCallback((itemId: string, size: string, color: string) => {
    setCartItems(prevItems => {
       const itemToRemove = prevItems.find(i => i.id === itemId && i.selectedSize === size && i.selectedColor === color);
       if (itemToRemove) {
         toast({
            title: 'Item Removed',
            description: `${itemToRemove.name} (${size}, ${color}) removed from cart.`,
            variant: 'destructive'
          });
       }
       return prevItems.filter(
         item => !(item.id === itemId && item.selectedSize === size && item.selectedColor === color)
       );
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, size: string, color: string, quantity: number) => {
     const itemToUpdate = cartItems.find(i => i.id === itemId && i.selectedSize === size && i.selectedColor === color);

    if (quantity <= 0) {
      removeItem(itemId, size, color);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );

      if(itemToUpdate){
         toast({
           title: 'Quantity Updated',
           description: `${itemToUpdate.name} (${size}, ${color}) quantity set to ${quantity}.`,
         });
      }
  }, [removeItem, cartItems, toast]);

  const clearCart = useCallback(() => {
    setCartItems([]);
     toast({
        title: 'Cart Cleared',
        description: 'All items removed from your cart.',
        variant: 'destructive'
      });
  }, [toast]);

  const getCartTotal = useCallback(() => {
     // Ensure the calculation uses the price stored in the cart item,
     // which already reflects the sale price if applicable when added.
     return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
   }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, removeItem, updateQuantity, clearCart, getCartTotal, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
