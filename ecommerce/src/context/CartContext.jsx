"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      try {
        const userId = user?.id || "guest";
        const storedCart = localStorage.getItem(`cart_${userId}`);

        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          // Ensure all prices are numbers
          const items = parsedCart.items.map((item) => ({
            ...item,
            price: Number(item.price),
          }));
          setCart({
            items,
            total: calculateTotal(items),
          });
        } else {
          setCart({ items: [], total: 0 });
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        setCart({ items: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const userId = user?.id || "guest";
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, loading, user]);

  // Calculate total whenever items change
  const calculateTotal = (items) => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  };

  const addToCart = (product, quantity = 1) => {
    if (!product) {
      throw new Error("Product not found");
    }

    setCart((prevCart) => {
      // Check if product is already in cart
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product_id === product.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Update quantity if product is already in cart
        const existingItem = prevCart.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }

        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
      } else {
        // Check if requested quantity is available
        if (quantity > product.stock) {
          throw new Error(`Only ${product.stock} items available in stock`);
        }

        // Add new item to cart
        updatedItems = [
          ...prevCart.items,
          {
            id: Date.now(), // Generate a temporary ID
            product_id: product.id,
            name: product.name,
            price: Number(product.price), // Ensure price is a number
            image: product.images?.[0]?.url || "/placeholder.svg", // Use the first image URL
            quantity,
          },
        ];
      }

      // Calculate new total
      const total = calculateTotal(updatedItems);

      return {
        items: updatedItems,
        total,
      };
    });

    return Promise.resolve({ success: true });
  };

  const updateCartItem = (itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    });

    return Promise.resolve({ success: true });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId);

      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    });

    return Promise.resolve({ success: true });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
    return Promise.resolve({ success: true });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
