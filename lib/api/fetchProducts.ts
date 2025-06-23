export interface Weight {
  id: string;
  value: string;
  price: number;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Product {
  _id: string;
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

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/products`, {
      cache: "no-store",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw API response:", data); // Debug raw data
    // Ensure data matches Product interface
    const products: Product[] = data.map((item: any) => ({
      _id: item._id,
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
    console.log("Parsed products:", products);
    return products;
  } catch (error: any) {
    console.error("Fetch products error:", error);
    throw new Error(error.message || "Failed to fetch products");
  }
};

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    console.log("Fetching product with ID:", id);
    const response = await fetch(`${API_BASE}/api/products/${id}`, {
      cache: "no-store",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw product response:", data);
    const product: Product = {
      _id: data._id,
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
    console.log("Parsed product:", product);
    return product;
  } catch (error: any) {
    console.error("Fetch product error:", error);
    throw new Error(error.message || "Failed to fetch product");
  }
};