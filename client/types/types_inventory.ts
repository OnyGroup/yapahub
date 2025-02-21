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
    images: string[]; // URLs of images stored in Cloudinary
  }