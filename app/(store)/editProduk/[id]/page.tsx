"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import imageCompression from "browser-image-compression";
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
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 50, y: 50 });
  const [popupSize, setPopupSize] = useState({ width: 500, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    <section className="min-h-screen py-10 px-2 md:px-0 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white p-8">
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
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-[#39381F]">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleReviewDescription}
                disabled={!form.description.trim() || reviewLoading}
                className="flex items-center gap-2 px-3 py-1 bg-3 text-white rounded-lg text-sm hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="bg-red-500 text-white px-2 rounded-[25]"
                  onClick={() => removeWeight(idx)}
                  disabled={form.weights.length === 1}
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-2 text-white px-3 py-1 rounded-[25] mt-2"
              onClick={addWeight}
            >
              + Tambah Varian
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <button
            type="submit"
            className="bg-3 text-white px-6 py-2 rounded-[25] font-semibold hover:bg-blue-700 mt-4"
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
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
