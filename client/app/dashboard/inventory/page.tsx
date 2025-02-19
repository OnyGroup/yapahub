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

interface InventoryItem {
  id: number;
  name: string;
  stock: number;
  price: number;
}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    stock: 0,
    price: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/store/products/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setInventory(response.data);
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleAddProduct = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/store/products/",
        newProduct,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const response = await axios.get("http://127.0.0.1:8000/store/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setInventory(response.data);
      setNewProduct({ name: "", stock: 0, price: 0 });
    } catch (error) {
      console.error("Failed to add product", error);
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
      <Dialog>
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