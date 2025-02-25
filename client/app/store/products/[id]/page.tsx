"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; 
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header_ecommerce";
import FooterEcommerce from "@/components/footer_ecommerce";
import Image from "next/image";
import { Product } from "@/types/types_inventory";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetails() {
  const { id } = useParams(); // Get product ID from dynamic route
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateCartCount } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/store/products/${id}/`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

    // ✅ Function to add the product to the cart
    const handleAddToCart = async () => {
      if (!product) return;
  
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/store/carts/add/",
          { product_id: product.id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
  
        const cartId = response.data.id;
  
        // ✅ Fetch updated cart total items
        const cartItemsResponse = await axios.get(
          `http://127.0.0.1:8000/store/carts/${cartId}/total-items/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
  
        // ✅ Update cart count in context
        updateCartCount(cartItemsResponse.data.total_items);

        // ✅ Show success toast
        toast({
          title: "Added to Cart 🛒",
          description: `${product.name} has been added to your cart!`,
          variant: "default",
        });

      } catch (error) {
        console.error("Failed to add item to cart", error);

        // ✅ Show error toast
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="flex flex-col min-h-screen">
        <Header />
  
        <div className="container mx-auto p-6 flex-grow">
          {loading ? (
            <div className="max-w-4xl mx-auto p-6">
              <Card className="p-6">
                <Skeleton className="w-full h-64 mb-4" /> 
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/3 mb-4" />
                <Skeleton className="h-10 w-1/2" />
              </Card>
            </div>
          ) : product ? (
            <Card className="max-w-4xl mx-auto p-6">
              <CardHeader className="flex flex-col items-center">
                {product.images.length > 0 ? (
                  <Image 
                    src={product.images[0].image_url} 
                    alt={product.name} 
                    width={400} 
                    height={300} 
                    className="object-cover w-full h-64"
                  />
                ) : (
                  <Image 
                    src="/placeholder.png" 
                    alt="Placeholder image" 
                    width={400} 
                    height={300} 
                    className="object-cover w-full h-64"
                  />
                )}
              </CardHeader>
              <CardContent>
                <CardTitle>{product.name}</CardTitle>
                <p className="text-gray-600 mt-2">{product.description}</p>
                <p className="text-gray-600 mt-1">
                  <strong>Size:</strong> {product.size} | <strong>Color:</strong> {product.color}
                </p>
                <p className="text-gray-600 mt-1">
                  <strong>Category:</strong> {product.category_name}
                </p>
                <p className="text-primary font-bold text-lg mt-4">KSh {product.price}</p>
  
                {/* ✅ Working Add to Cart Button */}
                <button 
                  onClick={handleAddToCart} 
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add to Cart
                </button>
              </CardContent>
            </Card>
          ) : (
            <p className="text-center text-gray-500">Product not found.</p>
          )}
        </div>
  
        <FooterEcommerce />
      </div>
    );
  }
