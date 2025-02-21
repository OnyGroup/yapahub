"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ProductList from "./StoreProductList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/types_inventory";
import Header from "@/components/header_ecommerce";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price"); // Default to ascending price
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `http://127.0.0.1:8000/store/products/?page=${currentPage}&ordering=${sortBy}`;
        if (searchTerm) {
          url += `&search=${searchTerm}`;
        }
        console.log("API Request URL:", url); // Log the API request URL
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("Fetched Products:", response.data); // Log the raw response
        // Extract the 'results' field from the paginated response
        setProducts(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchTerm, sortBy]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Include the Header component */}
      <Header onSearch={setSearchTerm} />

      <div className="container mx-auto p-4">

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product List */}
        <ScrollArea className="h-[600px]">
          {products.length > 0 ? (
            <ProductList products={products} />
          ) : (
            <div>No products available.</div>
          )}
        </ScrollArea>

        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage((prev) => prev + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}