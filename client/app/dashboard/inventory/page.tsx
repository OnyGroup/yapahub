"use client";

import { useState } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for inventory
const mockInventory = [
  {
    id: 1,
    name: "Smartphone X",
    stock: 50,
    price: 999.99,
  },
  {
    id: 2,
    name: "Laptop Pro",
    stock: 20,
    price: 1499.99,
  },
];

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState(mockInventory);
  const [newProduct, setNewProduct] = useState({
    name: "",
    stock: 0,
    price: 0,
  });

  // Add a new product
  const handleAddProduct = () => {
    setInventory([...inventory, { ...newProduct, id: inventory.length + 1 }]);
    setNewProduct({ name: "", stock: 0, price: 0 });
  };

  // Update stock for a product
  const handleUpdateStock = (id: number, newStock: number) => {
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, stock: newStock } : item
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {/* Add New Product Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6">Add New Product</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details to add a new product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Name</Label>
            <Input
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
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