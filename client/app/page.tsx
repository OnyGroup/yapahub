"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ProductList from "./StoreProductList";
import { Product } from "@/types/types_inventory";
import Header from "@/components/header_ecommerce";
import { Skeleton } from "@/components/ui/skeleton";
import FooterEcommerce from "@/components/footer_ecommerce";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price"); // Default to ascending price
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${API_BASE_URL}store/products/?page=${currentPage}&ordering=${sortBy}`;
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

  // Function to update the page number in the URL
  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`, { scroll: false });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Include the Header component */}
      <Header onSearch={setSearchTerm} />
  
      <div className="container mx-auto p-4 flex-grow">
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
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <Skeleton className="w-full h-40 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            products.length > 0 ? <ProductList products={products} /> : <div>No products available.</div>
          )}
        </div>
  
        {/* Pagination */}
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${Math.max(currentPage - 1, 1)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(Math.max(currentPage - 1, 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`?page=${currentPage}`}>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href={`?page=${currentPage + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
  
      {/* Footer */}
      <FooterEcommerce />
    </div>
  );
}