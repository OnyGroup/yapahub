"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartContext";
import Header from "@/components/header_ecommerce";
import FooterEcommerce from "@/components/footer_ecommerce"; 
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  product: {
    id: number;
    price: number;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/store/cart-items/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setCartItems(response.data);
      const totalItems = response.data.reduce(
        (sum: number, item: CartItem) => sum + item.quantity,
        0
      );
      updateCartCount(totalItems);
    } catch (error) {
      console.error("Failed to fetch cart items", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart items. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await axios.patch(
        `http://127.0.0.1:8000/store/cart-items/${itemId}/`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      await fetchCartItems();
      toast({
        title: "Success",
        description: "Cart updated successfully",
      });
    } catch (error) {
      console.error("Failed to update item quantity", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity. Please try again.",
      });
    }
  };

  const removeItem = async (itemId: number, productName: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/store/cart-items/${itemId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      await fetchCartItems();
      toast({
        title: "Item Removed",
        description: `${productName} has been removed from your cart.`,
      });
    } catch (error) {
      console.error("Failed to remove item", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item. Please try again.",
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  if (loading) {
    return (
      <>
        <Header onSearch={setSearchTerm} />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">  
      <Header onSearch={setSearchTerm} />
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {cartItems.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex items-center p-4 space-x-4">
                    <div className="flex-grow">
                      <CardHeader className="p-0">
                        <CardTitle className="text-lg">{item.product_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-2">
                        <p className="text-sm text-gray-600">
                          Price per item: ${(item.total_price / item.quantity).toFixed(2)}
                        </p>
                        <p className="font-medium mt-1">
                          Total: ${item.total_price.toFixed(2)}
                        </p>
                      </CardContent>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeItem(item.id, item.product_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-xl">${calculateTotal().toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        )}
        </div>
          <Toaster />
        <div className="mt-auto">
        <FooterEcommerce />
      </div>
    </div>
  );
}