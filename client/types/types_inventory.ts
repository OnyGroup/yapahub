export interface Category {
    id: number;
    name: string;
  }
  
  export interface InventoryItem {
    id: number;
    name: string;
    description: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    sku: string;
    category: number; // Foreign key to Category
    images: { image_url: string }[]; // Images are objects with an image_url property
  }

  export interface Product {
    id: number;
    name: string;
    description: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    sku: string;
    category: number;
    category_name: string;
    created_at: string;
    updated_at: string;
    images: { image_url: string }[];
  }