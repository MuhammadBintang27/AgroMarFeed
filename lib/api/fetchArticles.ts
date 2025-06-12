// lib/api/fetchArticles.ts
export interface Author {
  nama: string;
  avatar: string;
  role?: string;
}

export interface Article {
  _id: string;
  judul: string;
  konten: string;
  tanggal_publikasi: string;
  penulis: Author[];
  gambar_sampul: string;
  view_count: number;
  kategori: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchArticles(): Promise<Article[]> {
  try {
    const response = await fetch("http://localhost:4000/api/artikels", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const response = await fetch(`http://localhost:4000/api/artikels/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch article");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }
}