"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Define types for Category and Product
interface Category {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  sku: string;
  category: number; // Foreign key to Category
  images: string[]; // URLs of images stored in Cloudinary
}

export default function InventoryDashboard() {
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
  const { toast } = useToast(); // Initialize the toast hook

  // Fetch inventory and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch inventory
        const inventoryResponse = await axios.get("http://127.0.0.1:8000/store/products/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setInventory(inventoryResponse.data);

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
  }, []);

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
        formData.append("images", newProduct.image); // Append the image file
      }

      await axios.post("http://127.0.0.1:8000/store/products/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh inventory after adding
      const response = await axios.get("http://127.0.0.1:8000/store/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setInventory(response.data);

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
      setIsDialogOpen(false); // Close the dialog

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
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <Label>Description</Label>
            <Textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
            <Label>Size</Label>
            <Input
              value={newProduct.size}
              onChange={(e) =>
                setNewProduct({ ...newProduct, size: e.target.value })
              }
            />
            <Label>Color</Label>
            <Input
              value={newProduct.color}
              onChange={(e) =>
                setNewProduct({ ...newProduct, color: e.target.value })
              }
            />
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
            <Label>Stock</Label>
            <Input
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: parseInt(e.target.value),
                })
              }
            />
            <Label>SKU</Label>
            <Input
              value={newProduct.sku}
              onChange={(e) =>
                setNewProduct({ ...newProduct, sku: e.target.value })
              }
            />
            <Label>Category</Label>
            <Select
              value={newProduct.category.toString()}
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, category: parseInt(value) })
              }
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
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    defaultValue={item.stock}
                    onBlur={(e) =>
                      handleUpdateStock(item.id, parseInt(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="destructive">Delete</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}