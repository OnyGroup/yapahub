"use client";
import { useRouter } from "next/navigation";
import ProductCard from "./StoreProductCard";
import { Product } from "@/types/types_inventory";
import { useCart } from "@/components/CartContext";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const router = useRouter();
  const { updateCartCount } = useCart();

  const handleAddToCart = async (productId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents navigating when clicking 'Add to Cart'
    try {
      // First add the item to cart
      const response = await axios.post(
        "http://127.0.0.1:8000/store/carts/add/",
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Get the cart ID from the response
      const cartId = response.data.id;

      // Get the total items using the correct endpoint
      const cartItemsResponse = await axios.get(
        `http://127.0.0.1:8000/store/carts/${cartId}/total-items/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Update the cart count with the total_items value
      updateCartCount(cartItemsResponse.data.total_items);
    } catch (error) {
      console.error("Failed to add item to cart", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded-lg shadow relative cursor-pointer hover:shadow-lg transition"
          onClick={() => router.push(`/store/products/${product.id}`)}
        >
          {/* Product Card */}
          <ProductCard product={product} />

          {/* Add to Cart Button (Fixes Unintended Navigation) */}
          <div className="absolute bottom-10 right-10">
            <Button
              onClick={(e) => handleAddToCart(product.id, e)} // Pass event to stop propagation
              className="px-4 py-2 text-sm hover:scale-105 transition-transform"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
