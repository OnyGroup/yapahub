"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface CartContextType {
  cartCount: number;
  updateCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  updateCartCount: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  // Initialize cart count when the component mounts
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/store/cart-items/',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        
        // Calculate total quantity from cart items
        const totalItems = response.data.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        
        setCartCount(totalItems);
      } catch (error) {
        console.error('Failed to fetch cart count', error);
      }
    };

    if (localStorage.getItem('accessToken')) {
      fetchCartCount();
    }
  }, []);

  const updateCartCount = (count: number) => {
    setCartCount(count);
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;