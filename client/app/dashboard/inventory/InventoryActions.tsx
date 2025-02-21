"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Category, InventoryItem } from "@/types/types_inventory";

interface InventoryActionsProps {
  item: InventoryItem;
  categories: Category[];
  onUpdate: (id: number, updatedData: Partial<InventoryItem>) => void;
  onDelete: (id: number) => void;
}

export default function InventoryActions({ item, categories, onUpdate, onDelete }: InventoryActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: item.name,
    description: item.description,
    size: item.size,
    color: item.color,
    price: item.price,
    stock: item.stock,
    sku: item.sku,
    category: item.category,
    image: null as File | null,
  });
  const { toast } = useToast();

  const handleEditProduct = async () => {
    try {
      console.log(`Sending PATCH request to /store/products/${item.id}/`);
  
      // Create FormData to handle both JSON data and file uploads
      const formData = new FormData();
      formData.append("name", editedProduct.name);
      formData.append("description", editedProduct.description);
      formData.append("size", editedProduct.size);
      formData.append("color", editedProduct.color);
      formData.append("price", editedProduct.price.toString());
      formData.append("stock", editedProduct.stock.toString());
      formData.append("sku", editedProduct.sku);
      formData.append("category", editedProduct.category.toString());
  
      // Append the image file if a new one is selected
      if (editedProduct.image) {
        formData.append("images", editedProduct.image);
      }
  
      await axios.patch(
        `http://127.0.0.1:8000/store/products/${item.id}/`,
        formData, // Send FormData instead of JSON
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data", // Use multipart/form-data for file uploads
          },
        }
      );
  
      // Notify parent to update the inventory state
      onUpdate(item.id, {
        name: editedProduct.name,
        description: editedProduct.description,
        size: editedProduct.size,
        color: editedProduct.color,
        price: editedProduct.price,
        stock: editedProduct.stock,
        sku: editedProduct.sku,
        category: editedProduct.category,
        images: editedProduct.image ? [URL.createObjectURL(editedProduct.image)] : [], // Update images if a new one is uploaded
      });
  
      // Close the dialog
      setIsEditDialogOpen(false);
  
      // Show success toast
      toast({
        title: "Success!",
        description: "The product has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to edit product", error);
      toast({
        title: "Error!",
        description: "Failed to update the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      console.log(`Sending DELETE request to /store/products/${item.id}/`);
      await axios.delete(`http://127.0.0.1:8000/store/products/${item.id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Notify parent to remove the product from the inventory state
      onDelete(item.id);

      // Show success toast
      toast({
        title: "Success!",
        description: "The product has been successfully deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete product", error);
      toast({
        title: "Error!",
        description: "Failed to delete the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Badge variant="outline" className="mr-2 cursor-pointer">
            Edit
          </Badge>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Name</Label>
            <Input
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
            />
            <Label>Description</Label>
            <Input
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
            />
            <Label>Size</Label>
            <Input
              value={editedProduct.size}
              onChange={(e) => setEditedProduct({ ...editedProduct, size: e.target.value })}
            />
            <Label>Color</Label>
            <Input
              value={editedProduct.color}
              onChange={(e) => setEditedProduct({ ...editedProduct, color: e.target.value })}
            />
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editedProduct.price}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
            <Label>Stock</Label>
            <Input
              type="number"
              value={editedProduct.stock}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  stock: parseInt(e.target.value),
                })
              }
            />
            <Label>SKU</Label>
            <Input
              value={editedProduct.sku}
              onChange={(e) => setEditedProduct({ ...editedProduct, sku: e.target.value })}
            />
            <Label>Category</Label>
            <Select
              value={editedProduct.category.toString()}
              onValueChange={(value) => setEditedProduct({ ...editedProduct, category: parseInt(value) })}
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
                    setEditedProduct({ ...editedProduct, image: file });
                  }
                }}
              />


            <Button onClick={handleEditProduct}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Action */}
      <Badge
        variant="destructive"
        className="cursor-pointer"
        onClick={handleDeleteProduct}
      >
        Delete
      </Badge>
    </>
  );
}