"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/fetchProducts";

const defaultWeight = { id: "", value: "", price: 0 };

export default function TambahProdukPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryOptions: "",
    limbahOptions: "",
    fisikOptions: "",
    price: 0,
    imageUrl: "",
    stock: 0,
    weights: [{ ...defaultWeight }],
  });
  const [storeId, setStoreId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Ambil store user (endpoint /api/stores?user_id=xxx)
    const fetchStore = async () => {
      try {
        const resUser = await fetch("/api/auth/current-user");
        const userData = await resUser.json();
        if (!userData?.user?._id) return;
        const resStore = await fetch(
          `/api/stores?user_id=${userData.user._id}`
        );
        const storeData = await resStore.json();
        // storeData bisa array atau object tergantung backend
        if (
          Array.isArray(storeData) &&
          storeData.length > 0 &&
          storeData[0]._id
        ) {
          setStoreId(storeData[0]._id);
        } else if (storeData?._id) {
          setStoreId(storeData._id);
        } else {
          setStoreId("");
        }
      } catch (e) {
        setStoreId("");
      }
    };
    fetchStore();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleWeightChange = (
    idx: number,
    field: string,
    value: string | number
  ) => {
    setForm((prev) => {
      const weights = [...prev.weights];
      weights[idx] = { ...weights[idx], [field]: value };
      return { ...prev, weights };
    });
  };

  const addWeight = () => {
    setForm((prev) => ({
      ...prev,
      weights: [...prev.weights, { ...defaultWeight }],
    }));
  };

  const removeWeight = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Validasi semua field wajib
      if (!storeId) {
        setError("Toko tidak ditemukan. Silakan buka toko terlebih dahulu.");
        setLoading(false);
        return;
      }
      if (
        !form.name ||
        !form.description ||
        !form.categoryOptions ||
        !form.limbahOptions ||
        !form.fisikOptions ||
        !form.price ||
        !form.imageUrl ||
        !form.stock
      ) {
        setError("Semua field wajib diisi.");
        setLoading(false);
        return;
      }
      if (
        !form.weights.length ||
        form.weights.some((w) => !w.value || !w.price)
      ) {
        setError(
          "Minimal 1 varian berat & harga, dan semua varian wajib diisi."
        );
        setLoading(false);
        return;
      }
      // Generate id untuk setiap weight
      const weights = form.weights.map((w, i) => ({
        ...w,
        id: w.id || `${Date.now()}-${i}`,
      }));
      await createProduct({
        ...form,
        store_id: storeId,
        weights,
        isBestSeller: false,
        isSpecialOffer: false,
      });
      setSuccess("Produk berhasil ditambahkan");
      setTimeout(() => router.push("/tokoSaya"), 1000);
    } catch (err: any) {
      setError(err.message || "Gagal menambah produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white w-full text-black py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5">
          <div>
            <label className="font-medium block mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <input
              name="categoryOptions"
              value={form.categoryOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Jenis Limbah <span className="text-red-500">*</span>
            </label>
            <input
              name="limbahOptions"
              value={form.limbahOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Fisik <span className="text-red-500">*</span>
            </label>
            <input
              name="fisikOptions"
              value={form.fisikOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Harga Satuan (default) <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Stok <span className="text-red-500">*</span>
            </label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              URL Gambar <span className="text-red-500">*</span>
            </label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            />
          </div>
          <div>
            <label className="font-medium block mb-1">
              Varian Berat & Harga <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {form.weights.map((w, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    placeholder="Berat (misal: 1kg)"
                    value={w.value}
                    onChange={(e) =>
                      handleWeightChange(idx, "value", e.target.value)
                    }
                    className="input input-bordered rounded"
                  />
                  <input
                    placeholder="Harga"
                    type="number"
                    value={w.price}
                    onChange={(e) =>
                      handleWeightChange(idx, "price", Number(e.target.value))
                    }
                    className="input input-bordered rounded"
                  />
                  {form.weights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWeight(idx)}
                      className="btn btn-error btn-xs"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWeight}
                className="btn btn-secondary btn-sm mt-1 w-fit"
              >
                Tambah Varian
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </section>
  );
}
