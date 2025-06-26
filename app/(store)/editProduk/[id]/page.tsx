"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import imageCompression from "browser-image-compression";

const defaultWeight = { id: "", value: "", price: 0 };

const kategoriOptions = ["Ruminansia", "Non-ruminansia", "Akuakultur"];
const limbahOptions = [
  "Limbah Pertanian",
  "Limbah Kelautan",
];
const fisikOptions = ["Pelet", "Fermentasi Padat", "Serbuk", "Granul Kasar"];

export default function EditProdukPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
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
    if (!productId) return;
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            name: data.name || "",
            description: data.description || "",
            categoryOptions: data.categoryOptions || "",
            limbahOptions: data.limbahOptions || "",
            fisikOptions: data.fisikOptions || "",
            price: data.price || 0,
            imageUrl: data.imageUrl || "",
            stock: data.stock || 0,
            weights:
              data.weights && data.weights.length > 0
                ? data.weights
                : [{ ...defaultWeight }],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

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
      let imageUrl = form.imageUrl;
      if (imageFile) {
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
        imageUrl = uploadData.url;
      }
      // Generate id untuk setiap weight
      const weights = form.weights.map((w, i) => ({
        ...w,
        id: w.id || `${Date.now()}-${i}`,
      }));
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl, weights }),
      });
      if (res.ok) {
        setSuccess("Produk berhasil diupdate");
        setTimeout(() => router.push("/tokoSaya"), 1000);
      } else {
        setError("Gagal update produk");
      }
    } catch (err: any) {
      setError(err.message || "Gagal update produk");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <section className="min-h-screen bg-[#F7F7F7] py-10 px-2 md:px-0 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-[#39381F] mb-8 text-center">
          Edit Produk
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
          <div>
            <label className="font-medium block mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryOptions"
              value={form.categoryOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            >
              <option value="">Pilih Kategori</option>
              {kategoriOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium block mb-1">
              Jenis Limbah <span className="text-red-500">*</span>
            </label>
            <select
              name="limbahOptions"
              value={form.limbahOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            >
              <option value="">Pilih Jenis Limbah</option>
              {limbahOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium block mb-1">
              Fisik <span className="text-red-500">*</span>
            </label>
            <select
              name="fisikOptions"
              value={form.fisikOptions}
              onChange={handleChange}
              className="input input-bordered w-full rounded"
            >
              <option value="">Pilih Bentuk Fisik</option>
              {fisikOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium block mb-1">
              Harga <span className="text-red-500">*</span>
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
              {(imageFile || form.imageUrl) && (
                <img
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : form.imageUrl
                  }
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              )}
            </div>
          </div>
          <div>
            <label className="font-medium block mb-1">
              Varian Berat & Harga
            </label>
            {form.weights.map((w, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  placeholder="Berat (misal: 1kg)"
                  value={w.value}
                  onChange={(e) =>
                    handleWeightChange(idx, "value", e.target.value)
                  }
                  className="input input-bordered w-1/2 rounded"
                />
                <input
                  placeholder="Harga"
                  type="number"
                  value={w.price}
                  onChange={(e) =>
                    handleWeightChange(idx, "price", Number(e.target.value))
                  }
                  className="input input-bordered w-1/2 rounded"
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() => removeWeight(idx)}
                  disabled={form.weights.length === 1}
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-green-500 text-white px-3 py-1 rounded mt-2"
              onClick={addWeight}
            >
              + Tambah Varian
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 mt-4"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </section>
  );
}
