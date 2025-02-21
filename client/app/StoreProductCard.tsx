import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Product } from "@/types/types_inventory";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <img
          src={product.images[0]?.image_url || "/placeholder-image.png"}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md"
          onError={(e) => {
            console.error("Failed to load image:", product.images[0]?.image_url);
            e.currentTarget.src = "/placeholder-image.png"; // Fallback image
          }}
        />
      </CardHeader>
      <CardContent>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <div className="mt-4 flex justify-between items-center">
          <Badge variant="secondary">${product.price.toFixed(2)}</Badge>
          <Button size="sm">Add to Cart</Button>
        </div>
      </CardContent>
    </Card>
  );
}