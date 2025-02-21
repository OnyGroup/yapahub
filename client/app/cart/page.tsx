"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CartItem {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/store/carts/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setCartItems(response.data);
      } catch (error) {
        console.error("Failed to fetch cart items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length > 0 ? (
        <div>
          {cartItems.map((item) => (
            <Card key={item.id} className="mb-4">
              <CardHeader>
                <CardTitle>{item.product_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantity: {item.quantity}</p>
                <p>Total Price: ${item.total_price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}

          <Button className="mt-4">Proceed to Checkout</Button>
        </div>
      ) : (
        <div>Your cart is empty.</div>
      )}
    </div>
  );
}