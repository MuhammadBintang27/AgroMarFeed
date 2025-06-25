// lib/api/fetchKonsultan.ts
export interface Konsultan {
  _id: string;
  nama: string;
  profesi: string;
  jadwal: {
    jam_mulai: string;
    jam_berakhir: string;
  }[];
  description: string;
  price: number;
  image_url: string;
  rating: number;
  jumlah_penanganan: number;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function fetchKonsultan(): Promise<Konsultan[]> {
  try {
    const response = await fetch(`${API_BASE}/api/konsultan`, {
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error("Failed to fetch konsultan");
    }
    const data = (await response.json()) as Konsultan[];
    // Shuffle and return 3 random konsultan
    return shuffleArray(data).slice(0, 3);
  } catch (error) {
    console.error("Error fetching konsultan:", error);
    return [];
  }
}

export async function fetchKonsultanById(id: string): Promise<Konsultan | null> {
  try {
    const response = await fetch(`${API_BASE}/api/konsultan/${id}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch konsultan");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching konsultan ${id}:`, error);
    return null;
  }
} 