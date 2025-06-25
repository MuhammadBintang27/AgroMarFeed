export interface Weight {
  id: string;
  value: string;
  price: number;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Product {
  _id: string;
  store_id: string;
  name: string;
  description: string;
  categoryOptions: string;
  limbahOptions: string;
  fisikOptions: string;
  price: number;
  isBestSeller: boolean;
  isSpecialOffer: boolean;
  imageUrl: string;
  rating: number;
  stock: number;
  weights: Weight[];
}

export const fetchProducts = async (storeId?: string): Promise<Product[]> => {
  try {
    let url = "/api/products";
    if (storeId) {
      url += `?store_id=${storeId}`;
    }
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    // Pastikan data array
    const arr = Array.isArray(data) ? data : [];
    const products: Product[] = arr.map((item: any) => ({
      _id: item._id,
      store_id: item.store_id,
      name: item.name,
      description: item.description,
      categoryOptions: item.categoryOptions,
      limbahOptions: item.limbahOptions,
      fisikOptions: item.fisikOptions,
      price: item.price,
      isBestSeller: item.isBestSeller,
      isSpecialOffer: item.isSpecialOffer,
      imageUrl: item.imageUrl,
      rating: item.rating,
      stock: item.stock,
      weights: item.weights,
    }));
    return products;
  } catch (error: any) {
    console.error("Fetch products error:", error);
    throw new Error(error.message || "Failed to fetch products");
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      cache: "no-store",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    const data = await response.json();
    const product: Product = {
      _id: data._id,
      store_id: data.store_id,
      name: data.name,
      description: data.description,
      categoryOptions: data.categoryOptions,
      limbahOptions: data.limbahOptions,
      fisikOptions: data.fisikOptions,
      price: data.price,
      isBestSeller: data.isBestSeller,
      isSpecialOffer: data.isSpecialOffer,
      imageUrl: data.imageUrl,
      rating: data.rating,
      stock: data.stock,
      weights: data.weights,
    };
    return product;
  } catch (error: any) {
    console.error("Fetch product error:", error);
    throw new Error(error.message || "Failed to fetch product");
  }
};

export const createProduct = async (product: Omit<Product, "_id" | "rating"> & { store_id: string }) => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Gagal menambah produk");
  }
  return await response.json();
};

export const fetchStoreById = async (id: string) => {
  const response = await fetch(`/api/stores?id=${id}`, {
    cache: "no-store",
    headers: {
      "ngrok-skip-browser-warning": "true"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch store: ${response.status}`);
  }
  return await response.json();
};