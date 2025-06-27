"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/fetchProducts";
import imageCompression from "browser-image-compression";
import { useUser } from "@/contexts/UserContext";

const defaultWeight = { id: "", value: "", price: 0 };

const kategoriOptions = ["Ruminansia", "Non-ruminansia", "Akuakultur"];
const limbahOptions = ["Limbah Pertanian", "Limbah Kelautan"];
const fisikOptions = ["Pelet", "Fermentasi Padat", "Serbuk", "Granul Kasar"];

export default function TambahProdukPage() {
  const router = useRouter();
  const { user } = useUser();
  const [storeId, setStoreId] = useState<string>("");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Ambil store user (endpoint /api/stores?user_id=xxx)
    const fetchStore = async () => {
      try {
        if (!user?._id) return;
        const resStore = await fetch(`/api/stores?user_id=${user._id}`);
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
  }, [user]);

  const handleChange = (e: React.ChangeEvent<any>) => {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      if (file.size > 300 * 1024) {
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          });
          setImageFile(compressedFile);
        } catch (err) {
          alert("Gagal kompres gambar, gunakan file asli.");
          setImageFile(file);
        }
      } else {
        setImageFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
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
        !form.stock
      ) {
        setError("Semua field wajib diisi.");
        setLoading(false);
        return;
      }
      if (!imageFile) {
        setError("Upload gambar produk wajib.");
        setLoading(false);
        return;
      }
      // Upload gambar ke /api/store
      const imgForm = new FormData();
      imgForm.append("file", imageFile);
      const uploadRes = await fetch("/api/store", {
        method: "POST",
        body: imgForm,
      });
      if (!uploadRes.ok) {
        setError("Gagal upload gambar produk");
        setLoading(false);
        return;
      }
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;
      // Generate id untuk setiap weight
      const weights = form.weights.map((w, i) => ({
        ...w,
        id: w.id || `${Date.now()}-${i}`,
      }));
      await createProduct({
        ...form,
        imageUrl,
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
    <section className="min-h-screen bg-[#F7F7F7] py-10 px-2 md:px-0 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-[#39381F] mb-8 text-center">
          Tambah Produk
        </h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
          <div>
            <label className="font-semibold block mb-2 text-[#39381F]">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg"
              placeholder="Masukkan nama produk"
            />
          </div>
          <div>
            <label className="font-semibold block mb-2 text-[#39381F]">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg"
              placeholder="Deskripsi produk"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryOptions"
                value={form.categoryOptions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg bg-white"
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Jenis Limbah <span className="text-red-500">*</span>
              </label>
              <select
                name="limbahOptions"
                value={form.limbahOptions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg bg-white"
              >
                <option value="">Pilih Jenis Limbah</option>
                {limbahOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Bentuk Fisik <span className="text-red-500">*</span>
              </label>
              <select
                name="fisikOptions"
                value={form.fisikOptions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg bg-white"
              >
                <option value="">Pilih Bentuk Fisik</option>
                {fisikOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Harga Satuan <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg"
                placeholder="Harga produk"
              />
            </div>
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-400 outline-none text-lg"
                placeholder="Stok produk"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-2 text-[#39381F]">
              Upload Gambar Produk <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
              />
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-2 text-[#39381F]">
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
            className="bg-yellow-400 hover:bg-yellow-500 text-[#39381F] w-full py-3 rounded-xl font-bold text-lg shadow-lg transition mt-2"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </section>
  );
}
