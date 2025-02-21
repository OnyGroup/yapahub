import ProductCard from "./StoreProductCard";
import { Product } from "@/types/types_inventory";
import { useCart } from "@/components/CartContext";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const { updateCartCount } = useCart();

  const handleAddToCart = async (productId: number) => {
    try {
      // Send the product ID to the backend
      const response = await axios.post(
        "http://127.0.0.1:8000/store/carts/add/",
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
  
      // Refresh the cart count
      const cartResponse = await axios.get("http://127.0.0.1:8000/store/carts/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
  
      updateCartCount(cartResponse.data.total_items);
    } catch (error) {
      console.error("Failed to add item to cart", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="border p-4 rounded-lg shadow relative"
        >
          {/* Product Card */}
          <ProductCard product={product} />

          {/* Add to Cart Button */}
          <div className="absolute bottom-10 right-10">
            <Button
              onClick={() => handleAddToCart(product.id)}
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
