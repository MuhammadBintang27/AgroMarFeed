"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import imageCompression from "browser-image-compression";
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Move,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

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

// Image Cropper Component
const ImageCropper = ({
  imageFile,
  onCropComplete,
  onCancel,
}: {
  imageFile: File;
  onCropComplete: (croppedImage: File) => void;
  onCancel: () => void;
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageFile && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set canvas size to 400x400 (1:1 ratio)
        canvas.width = 400;
        canvas.height = 400;

        // Calculate initial scale to fit image in canvas
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const initialScale = Math.max(scaleX, scaleY);

        setScale(initialScale);
        drawImage();
      };

      img.src = URL.createObjectURL(imageFile);
      imageRef.current = img;
    }
  }, [imageFile]);

  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply transformations
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    ctx.drawImage(
      img,
      -img.width / 2 + position.x / scale,
      -img.height / 2 + position.y / scale,
      img.width,
      img.height
    );

    // Restore context
    ctx.restore();
  };

  useEffect(() => {
    drawImage();
  }, [scale, rotation, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          onCropComplete(croppedFile);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Gambar (1:1)</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Canvas Container */}
          <div className="flex-1">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="block cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="lg:w-64 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Zoom</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(3, scale + 0.1))}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rotasi</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotation(rotation - 90)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <RotateCw size={16} />
                </button>
                <span className="text-sm min-w-[60px] text-center">
                  {rotation}°
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={resetTransform}
                className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleCrop}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                <Crop size={16} className="inline mr-2" />
                Crop & Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);

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
          setOriginalImageFile(compressedFile);
          setImageFile(compressedFile);
        } catch (err) {
          alert("Gagal kompres gambar, gunakan file asli.");
          setOriginalImageFile(file);
          setImageFile(file);
        }
      } else {
        setOriginalImageFile(file);
        setImageFile(file);
      }
    }
  };

  const handleCropComplete = (croppedImage: File) => {
    setImageFile(croppedImage);
    setShowCropModal(false);
  };

  const handleEditImage = () => {
    if (originalImageFile) {
      setShowCropModal(true);
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
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white"
              />
              {(imageFile || form.imageUrl) && (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : form.imageUrl
                      }
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    {originalImageFile && (
                      <button
                        type="button"
                        onClick={handleEditImage}
                        className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition"
                        title="Edit Gambar"
                      >
                        <Crop size={12} />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Ukuran: 1:1 (Persegi)</p>
                    <p>Format: JPG, PNG</p>
                    {originalImageFile && (
                      <button
                        type="button"
                        onClick={handleEditImage}
                        className="text-blue-500 hover:text-blue-600 underline"
                      >
                        Klik untuk edit posisi & ukuran
                      </button>
                    )}
                  </div>
                </div>
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

        {/* Image Cropper Modal */}
        {showCropModal && originalImageFile && (
          <ImageCropper
            imageFile={originalImageFile}
            onCropComplete={handleCropComplete}
            onCancel={() => setShowCropModal(false)}
          />
        )}
      </div>
    </section>
  );
}
