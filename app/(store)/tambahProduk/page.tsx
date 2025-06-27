"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/fetchProducts";
import imageCompression from "browser-image-compression";
import { useUser } from "@/contexts/UserContext";
import { Sparkles, X, Maximize2, Minimize2, Move } from "lucide-react";

const defaultWeight = { id: "", value: "", price: 0 };

const kategoriOptions = ["Ruminansia", "Non-ruminansia", "Akuakultur"];
const limbahOptions = ["Limbah Pertanian", "Limbah Kelautan"];
const fisikOptions = ["Pelet", "Fermentasi Padat", "Serbuk", "Granul Kasar"];

// Markdown to HTML converter
const markdownToHtml = (markdown: string) => {
  return markdown
    .replace(
      /^\*\*(.*?)\*\*$/gm,
      '<h1 class="text-2xl font-bold text-gray-900 mb-2">$1</h1>'
    )
    .replace(
      /^\*(.*?)\*$/gm,
      '<h2 class="text-xl font-semibold text-gray-800 mb-2">$1</h2>'
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n/g, "<br>")
    .replace(/^- (.*)/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-4 mb-2">$1</ul>');
};

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
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 50, y: 50 });
  const [popupSize, setPopupSize] = useState({ width: 500, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const handleReviewDescription = async () => {
    if (!form.description.trim()) {
      alert("Silakan isi deskripsi terlebih dahulu");
      return;
    }

    setReviewLoading(true);
    setReviewResult("");
    setShowReviewPopup(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log("🔍 Review AI - API Base:", API_BASE);
      console.log("🔍 Review AI - Description:", form.description);

      const requestBody = { description: form.description };
      console.log("🔍 Review AI - Request Body:", requestBody);

      const res = await fetch(`${API_BASE}/api/chat/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      console.log("🔍 Review AI - Response Status:", res.status);
      console.log(
        "🔍 Review AI - Response Headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("🔍 Review AI - Error Response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("🔍 Review AI - Response Data:", data);

      const aiReview =
        data.choices?.[0]?.message?.content ||
        "AI tidak dapat memberikan review.";
      console.log("🔍 Review AI - AI Review Result:", aiReview);

      setReviewResult(aiReview);
    } catch (err) {
      console.error("🔍 Review AI - Error Details:", err);
      console.error(
        "🔍 Review AI - Error Message:",
        err instanceof Error ? err.message : String(err)
      );
      setReviewResult(
        `Gagal menghubungi AI: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize") => {
    e.preventDefault();
    if (type === "drag") {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - popupPosition.x,
        y: e.clientY - popupPosition.y,
      });
    } else {
      setIsResizing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPopupPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    } else if (isResizing) {
      setPopupSize({
        width: Math.max(300, e.clientX - popupPosition.x),
        height: Math.max(200, e.clientY - popupPosition.y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove as any);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove as any);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, popupPosition, dragOffset]);

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
    <section className="min-h-screen py-10 px-2 md:px-0 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-8">
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
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-[#39381F]">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleReviewDescription}
                disabled={!form.description.trim() || reviewLoading}
                className="font-bold flex items-center gap-2 px-3 py-1 bg-3 text-white rounded-lg text-sm hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} />
                {reviewLoading ? "Reviewing..." : "Review - AgroMarFeed AI"}
              </button>
            </div>
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
                      className="bg-red-500 text-white px-2 rounded-[25]"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addWeight}
                className="bg-2 text-white px-3 py-1 rounded-[25] mt-1 w-fit"
              >
                + Tambah Varian
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="bg-3 hover:bg-yellow-500 text-white hover:scale-105 transition w-full py-3 rounded-[25] font-bold text-lg shadow-lg transition mt-2"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>

        {/* Review Popup Window */}
        {showReviewPopup && (
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              width: `${popupSize.width}px`,
              height: `${popupSize.height}px`,
            }}
          >
            <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 w-full h-full flex flex-col pointer-events-auto">
              {/* Header */}
              <div
                className="bg-gray-100 px-4 py-2 rounded-t-lg flex items-center justify-between cursor-move"
                onMouseDown={(e) => handleMouseDown(e, "drag")}
              >
                <div className="flex items-center gap-2">
                  <Move size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Review - AgroMarFeed AI
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowReviewPopup(false)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-auto">
                {reviewLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                      AI sedang menganalisis deskripsi...
                    </p>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: markdownToHtml(reviewResult),
                    }}
                  />
                )}
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={(e) => handleMouseDown(e, "resize")}
              >
                <div className="w-0 h-0 border-l-8 border-l-transparent border-b-8 border-b-gray-400"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
