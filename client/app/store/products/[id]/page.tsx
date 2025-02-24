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

export default function ProductDetails() {
  const { id } = useParams(); // Get product ID from dynamic route
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="container mx-auto p-6 flex-grow">
        {loading ? (
          <Skeleton className="w-full h-96" />
        ) : product ? (
          <Card className="max-w-4xl mx-auto p-6">
            <CardHeader className="flex flex-col items-center">
              {product.images.length > 0 ? (
                <Image 
                  src={product.images[0].image_url} // Display first image
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
                <strong>Stock:</strong> {product.stock} | <strong>SKU:</strong> {product.sku}
              </p>
              <p className="text-gray-600 mt-1">
                <strong>Category:</strong> {product.category_name}
              </p>
              <p className="text-primary font-bold text-lg mt-4">Ksh {product.price}</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
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
