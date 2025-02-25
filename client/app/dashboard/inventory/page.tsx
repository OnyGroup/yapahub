"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Category, InventoryItem } from "@/types/types_inventory";
import InventoryActions from "./InventoryActions";

export default function InventoryDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    size: "",
    color: "",
    price: 0,
    stock: 0,
    sku: "",
    category: 1, // Default category ID
    image: null as File | null, // For image upload
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [visibleImages, setVisibleImages] = useState<number[]>([]); // Track visible images by product ID
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch inventory and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory with pagination
        const inventoryResponse = await axios.get(`http://127.0.0.1:8000/store/products/?page=${currentPage}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setInventory(inventoryResponse.data.results);
        setTotalCount(inventoryResponse.data.count);
        setNextPageUrl(inventoryResponse.data.next);
        setPrevPageUrl(inventoryResponse.data.previous);

        // Fetch categories
        const categoriesResponse = await axios.get("http://127.0.0.1:8000/store/categories/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("size", newProduct.size);
      formData.append("color", newProduct.color);
      formData.append("price", newProduct.price.toString());
      formData.append("stock", newProduct.stock.toString());
      formData.append("sku", newProduct.sku);
      formData.append("category", newProduct.category.toString());
      if (newProduct.image) {
        formData.append("images", newProduct.image); // Append image file
      }

      await axios.post("http://127.0.0.1:8000/store/products/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh inventory after adding
      const response = await axios.get(`http://127.0.0.1:8000/store/products/?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setInventory(response.data.results);
      setTotalCount(response.data.count);
      setNextPageUrl(response.data.next);
      setPrevPageUrl(response.data.previous);

      // Reset form and close dialog
      setNewProduct({
        name: "",
        description: "",
        size: "",
        color: "",
        price: 0,
        stock: 0,
        sku: "",
        category: 1,
        image: null,
      });
      setIsDialogOpen(false);

      // Show success toast
      toast({
        title: "Success!",
        description: "The product has been successfully added.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to add product", error);
      toast({
        title: "Error!",
        description: "Failed to add the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStock = async (id: number, newStock: number) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/store/products/${id}/`,
        { stock: newStock },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
      );
    } catch (error) {
      console.error("Failed to update stock", error);
    }
  };

  const handleUpdateProduct = (id: number, updatedData: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
  };

  const handleDeleteProduct = (id: number) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const toggleImageVisibility = (id: number) => {
    if (visibleImages.includes(id)) {
      setVisibleImages((prev) => prev.filter((itemId) => itemId !== id));
    } else {
      setVisibleImages((prev) => [...prev, id]);
    }
  };

    // Function to update the page number in the URL
    const handlePageChange = (newPage: number) => {
      router.push(`?page=${newPage}`, { scroll: false });
    };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {/* Add New Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-6">Add New Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Name</Label>
            <Input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Label>Description</Label>
            <Textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <Label>Size</Label>
            <Input
              value={newProduct.size}
              onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
            />
            <Label>Color</Label>
            <Input
              value={newProduct.color}
              onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
            />
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              value={newProduct.price || ''}  // Empty string when 0
              onChange={(e) => {
                const value = e.target.value;
                setNewProduct({
                  ...newProduct,
                  price: value === '' ? 0 : parseFloat(value) || 0,
                });
              }}
            />
            <Label>Stock</Label>
            <Input
              type="number"
              value={newProduct.stock || ''}  // Empty string when 0
              onChange={(e) => {
                const value = e.target.value;
                setNewProduct({
                  ...newProduct,
                  stock: value === '' ? 0 : parseInt(value) || 0,
                });
              }}
            />
            <Label>SKU</Label>
            <Input
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
            />
            <Label>Category</Label>
            <Select
              value={newProduct.category.toString()}
              onValueChange={(value) => setNewProduct({ ...newProduct, category: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setNewProduct({ ...newProduct, image: file });
                }
              }}
            />
            <Button onClick={handleAddProduct}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inventory Table */}
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{getCategoryName(item.category)}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      defaultValue={item.stock}
                      onBlur={(e) => handleUpdateStock(item.id, parseInt(e.target.value))}
                    />
                  ) : (
                    <span>{item.stock}</span>
                  )}
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                {visibleImages.includes(item.id) && item.images.length > 0 ? (
                  <div className="flex gap-2">
                    {item.images.map((image, index) => (
                      <img
                      loading="lazy"
                        key={index}
                        src={image.image_url}
                        alt={`${item.name} - Image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          console.error("Failed to load image:", image.image_url);
                          e.currentTarget.src = "/placeholder-image.png";
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleImageVisibility(item.id)}
                  >
                    {visibleImages.includes(item.id) ? "Hide Image" : "Show Image"}
                  </Button>
                )}
                </TableCell>
                <TableCell>
                  <InventoryActions
                    item={item}
                    categories={categories}
                    onUpdate={handleUpdateProduct}
                    onDelete={handleDeleteProduct}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

        {/* Pagination */}
        <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={prevPageUrl ? `?page=${currentPage - 1}` : "#"}
              onClick={(e) => {
                e.preventDefault();
                if (prevPageUrl) {
                  handlePageChange(currentPage - 1);
                }
              }}
              className={!prevPageUrl ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href={`?page=${currentPage}`}>{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href={nextPageUrl ? `?page=${currentPage + 1}` : "#"}
              onClick={(e) => {
                e.preventDefault();
                if (nextPageUrl) {
                  handlePageChange(currentPage + 1);
                }
              }}
              className={!nextPageUrl ? "opacity-50 cursor-not-allowed" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}