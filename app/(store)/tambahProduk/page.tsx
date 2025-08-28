"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/api/fetchProducts";
import imageCompression from "browser-image-compression";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
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
  XCircle,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";

const defaultWeight = { id: "", value: "", price: "", isCustom: false };

const kategoriOptions = ["Ruminansia", "Non-ruminansia", "Akuakultur"];
const limbahOptions = ["Limbah Pertanian", "Limbah Kelautan"];
const fisikOptions = ["Pelet", "Fermentasi Padat", "Serbuk", "Granul Kasar"];
const weightOptions = ["1kg", "2kg", "5kg", "10kg", "15kg", "20kg"];

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
    .replace(/^\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/^\*(.*?)\*/g, '<em class="italic">$1</em>')
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

  // Touch events for mobile drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };
  const handleTouchEnd = () => {
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
      <div className="bg-white rounded-lg p-2 sm:p-6 max-w-full w-full sm:max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Gambar (1:1)</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Canvas Container */}
          <div className="flex-1 w-full overflow-auto flex justify-center">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block w-full max-w-[400px]">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="block cursor-move w-full h-auto max-w-full"
                style={{ maxWidth: "100%", height: "auto" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-64 space-y-4">
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

export default function TambahProdukPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [storeId, setStoreId] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryOptions: "",
    limbahOptions: "",
    fisikOptions: "",
    price: 0,
    imageUrl: "",
    stock: "",
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
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [selectedImageType, setSelectedImageType] = useState<"original" | "ai">(
    "original"
  );
  const [cropSource, setCropSource] = useState<{
    file: File;
    type: "ai" | "original";
  } | null>(null);
  const [aiEditUsed, setAiEditUsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!userLoading && !user) {
      console.log("❌ User not authenticated, redirecting to login");
      router.push("/auth/login");
      return;
    }
  }, [user, userLoading, router]);

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

  useEffect(() => {
    // Deteksi mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    value: string | number,
    isCustomMode?: boolean
  ) => {
    setForm((prev) => {
      const weights = [...prev.weights];
      
      // If we're changing the value and setting custom mode
      if (field === "value" && isCustomMode !== undefined) {
        weights[idx] = { ...weights[idx], [field]: String(value), isCustom: isCustomMode };
      } else {
        weights[idx] = { ...weights[idx], [field]: String(value) };
      }

      // Calculate minimum price from all weights
      const minPrice = Math.min(...weights.map(w => Number(w.price) || 0).filter(p => p > 0));
      const price = isFinite(minPrice) ? minPrice : 0;

      return { ...prev, weights, price };
    });
  };

  const addWeight = () => {
    setForm((prev) => {
      const weights = [...prev.weights, { ...defaultWeight }];
      // Calculate minimum price from all weights
      const minPrice = Math.min(...weights.map(w => Number(w.price) || 0).filter(p => p > 0));
      const price = isFinite(minPrice) ? minPrice : 0;

      return { ...prev, weights, price };
    });
  };

  const removeWeight = (idx: number) => {
    setForm((prev) => {
      const weights = prev.weights.filter((_, i) => i !== idx);
      // Calculate minimum price from remaining weights
      const minPrice = Math.min(...weights.map(w => Number(w.price) || 0).filter(p => p > 0));
      const price = isFinite(minPrice) ? minPrice : 0;

      return { ...prev, weights, price };
    });
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

  const handleEditImage = () => {
    if (selectedImageType === "ai" && aiImage) {
      // Convert base64 to File for cropper
      const byteString = atob(aiImage);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const aiFile = new File([ab], "ai-enhanced.jpg", { type: "image/jpeg" });
      setCropSource({ file: aiFile, type: "ai" });
      setShowCropModal(true);
    } else if (originalImageFile) {
      setCropSource({ file: originalImageFile, type: "original" });
      setShowCropModal(true);
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
        `Gagal menghubungi AI: ${err instanceof Error ? err.message : String(err)
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

  const handleCopyToClipboard = async () => {
    try {
      // Strip HTML tags from reviewResult for plain text copy
      let plainText = reviewResult.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      
      // Extract only the content after "Saran perbaikan:"
      const saranIndex = plainText.toLowerCase().indexOf('saran perbaikan:');
      if (saranIndex !== -1) {
        plainText = plainText.substring(saranIndex + 'saran perbaikan:'.length).trim();
      }
      
      // Remove the last paragraph if it contains generic closing statements
      const paragraphs = plainText.split('\n\n').filter(p => p.trim() !== '');
      if (paragraphs.length > 1) {
        const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
        if (lastParagraph.includes('dengan memperhatikan') || 
            lastParagraph.includes('deskripsi produk ini akan') ||
            lastParagraph.includes('lebih menarik dan informatif') ||
            lastParagraph.includes('semoga bermanfaat')) {
          paragraphs.pop();
        }
      }
      
      const finalText = paragraphs.join('\n\n').trim();
      
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      let plainText = reviewResult.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      
      // Extract only the content after "Saran perbaikan:"
      const saranIndex = plainText.toLowerCase().indexOf('saran perbaikan:');
      if (saranIndex !== -1) {
        plainText = plainText.substring(saranIndex + 'saran perbaikan:'.length).trim();
      }
      
      // Remove the last paragraph if it contains generic closing statements
      const paragraphs = plainText.split('\n\n').filter(p => p.trim() !== '');
      if (paragraphs.length > 1) {
        const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
        if (lastParagraph.includes('dengan memperhatikan') || 
            lastParagraph.includes('deskripsi produk ini akan') ||
            lastParagraph.includes('lebih menarik dan informatif') ||
            lastParagraph.includes('semoga bermanfaat')) {
          paragraphs.pop();
        }
      }
      
      const finalText = paragraphs.join('\n\n').trim();
      
      const textArea = document.createElement('textarea');
      textArea.value = finalText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  const handleAIEnhance = async () => {
    setAiLoading(true);
    setAiError("");
    setAiImage(null);
    try {
      if (!originalImageFile) {
        setAiError("Upload gambar terlebih dahulu.");
        setAiLoading(false);
        return;
      }
      if (!form.name.trim() || !form.description.trim()) {
        setAiError("Nama produk dan deskripsi wajib diisi untuk AI Edit.");
        setAiLoading(false);
        return;
      }
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
      const formData = new FormData();
      formData.append("file", originalImageFile);
      formData.append("name", form.name);
      formData.append("description", form.description);
      const res = await fetch(`${API_BASE}/api/chat/enhance-image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        // Check for validation error from backend
        let isValidationError = false;
        try {
          const errJson = JSON.parse(errText);
          if (
            errJson?.error &&
            errJson.error.toLowerCase().includes("tidak sesuai ketentuan")
          ) {
            isValidationError = true;
          }
        } catch { }
        setAiError("Gagal mengedit gambar dengan AI: " + errText);
        if (!isValidationError) setAiEditUsed(true); // Only disable if not validation error
        setAiLoading(false);
        return;
      }
      const data = await res.json();
      if (data.image) {
        setAiImage(data.image);
        setSelectedImageType("ai");
        setAiEditUsed(true); // Only disable after success
      } else {
        setAiError("Gagal mendapatkan gambar dari AI.");
        setAiEditUsed(true);
      }
    } catch (err: any) {
      setAiError(err.message || "Gagal mengedit gambar dengan AI");
      setAiEditUsed(true);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCropComplete = (croppedImage: File) => {
    if (cropSource?.type === "ai") {
      // Update aiImage
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = (e.target?.result as string)?.split(",")[1];
        setAiImage(base64 || null);
      };
      reader.readAsDataURL(croppedImage);
    } else {
      setImageFile(croppedImage);
      setOriginalImageFile(croppedImage);
    }
    setShowCropModal(false);
    setCropSource(null);
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
        !form.stock
      ) {
        setError("Semua field wajib diisi.");
        setLoading(false);
        return;
      }

      // Validate that at least one weight with price is provided
      const validWeights = form.weights.filter(w => w.value && Number(w.price) > 0);
      if (validWeights.length === 0) {
        setError("Harap isi minimal satu varian berat dan harga.");
        setLoading(false);
        return;
      }
      if (!imageFile) {
        setError("Upload gambar produk wajib.");
        setLoading(false);
        return;
      }

      // Validate product type using the validation endpoint
      try {
        const validationRes = await axios.post('/api/chat/validate', {
          name: form.name,
          description: form.description,
        });

        if (!validationRes.data.isValid) {
          setError(validationRes.data.error);
          setLoading(false);
          return;
        }
      } catch (validationError: any) {
        console.error('Validation error:', validationError);
        const errorMessage = validationError.response?.data?.error || 'Gagal memvalidasi produk. Silakan coba lagi.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Use selected image (original or AI)
      let uploadImageFile = imageFile;
      if (selectedImageType === "ai" && aiImage) {
        // Convert base64 to File
        const byteString = atob(aiImage);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        uploadImageFile = new File(
          [ab],
          originalImageFile?.name || "ai-enhanced.jpg",
          { type: "image/jpeg" }
        );
      }
      // Upload gambar ke /api/store
      const imgForm = new FormData();
      imgForm.append("file", uploadImageFile);
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
        price: Number(w.price) || 0,
      }));

      // Calculate minimum price from weights
      const minPrice = Math.min(...weights.map(w => w.price || 0).filter(p => p > 0));
      const finalPrice = isFinite(minPrice) ? minPrice : 0;

      await createProduct({
        ...form,
        price: finalPrice,
        imageUrl,
        store_id: storeId,
        stock: Number(form.stock) || 0,
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
    <section className="min-h-screen py-10 px-4 md:px-6 lg:px-8 overflow-x-hidden">
      {/* Show loading while checking authentication */}
      {userLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      )}

      {/* Show message if user is not authenticated */}
      {!userLoading && !user && (
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600 mb-4">
            Anda harus login terlebih dahulu untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-yellow-400 hover:bg-yellow-500 text-[#39381F] px-6 py-2 rounded-lg font-bold transition"
          >
            Login Sekarang
          </button>
        </div>
      )}

      {/* Show main content if user is authenticated */}
      {!userLoading && user && (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100 overflow-hidden">
          {/* Tombol Back */}
          <button
            type="button"
            onClick={() => router.push("/tokoSaya")}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-yellow-600 mb-4 font-semibold"
          >
            <ArrowLeft size={18} />
            Kembali ke Toko Saya
          </button>
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
                placeholder=""
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
                placeholder=""
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 gap-4">
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
                  placeholder=""
                  min="1"
                />
              </div>
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
                {imageFile && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative">
                        <img
                          src={
                            selectedImageType === "ai" && aiImage
                              ? `data:image/jpeg;base64,${aiImage}`
                              : URL.createObjectURL(imageFile)
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
                    {/* AI Enhance Button and Previews */}
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        type="button"
                        onClick={handleAIEnhance}
                        className="bg-3 text-white px-3 py-1 rounded hover:bg-yellow-600 w-fit disabled:opacity-50 flex items-center gap-2"
                        disabled={
                          aiLoading ||
                          !originalImageFile ||
                          !form.name.trim() ||
                          !form.description.trim() ||
                          aiEditUsed
                        }
                      >
                        <Sparkles size={16} />
                        {aiLoading ? "Memproses dengan AI..." : "AI Edit"}
                      </button>

                      {aiError && (
                        <div className="text-red-500 text-xs">{aiError}</div>
                      )}
                      {(aiImage || aiLoading) && (
                        <div className="flex gap-4 items-center mt-2">
                          <div className="flex flex-col items-center">
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                checked={selectedImageType === "original"}
                                onChange={() =>
                                  setSelectedImageType("original")
                                }
                              />
                              <span className="text-xs">Gambar Asli</span>
                            </label>
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="Original"
                              className="w-20 h-20 object-cover rounded border mt-1"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                checked={selectedImageType === "ai"}
                                onChange={() => setSelectedImageType("ai")}
                                disabled={!aiImage}
                              />
                              <span className="text-xs">AI Edit</span>
                            </label>
                            {aiLoading ? (
                              <div className="w-20 h-20 flex items-center justify-center border rounded bg-gray-100 animate-pulse">
                                <span className="text-xs text-gray-400">
                                  Loading...
                                </span>
                              </div>
                            ) : aiImage ? (
                              <img
                                src={`data:image/jpeg;base64,${aiImage}`}
                                alt="AI Enhanced"
                                className="w-20 h-20 object-cover rounded border mt-1"
                              />
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-2 text-[#39381F]">
                Varian Berat & Harga <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4 max-w-full">
                {form.weights.map((w, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Berat
                        </label>
                        <div className="space-y-2">
                          <select
                            value={w.isCustom ? "Custom" : (weightOptions.includes(w.value) ? w.value : "")}
                            onChange={(e) => {
                              if (e.target.value === "Custom") {
                                handleWeightChange(idx, "value", "", true);
                              } else {
                                handleWeightChange(idx, "value", e.target.value, false);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white text-sm"
                          >
                            <option value="">Pilih Berat</option>
                            {weightOptions.filter(option => option !== "Custom").map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                            <option value="Custom">Custom</option>
                          </select>
                          {w.isCustom && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Masukkan berat"
                                value={w.value.replace("kg", "")}
                                onChange={(e) => {
                                  const numValue = e.target.value;
                                  handleWeightChange(idx, "value", numValue ? `${numValue}kg` : "", true);
                                }}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-sm"
                                min="0.1"
                                step="0.1"
                              />
                              <span className="text-sm text-gray-500 font-medium whitespace-nowrap">kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Harga
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Rp</span>
                          <input
                            type="number"
                            placeholder=""
                            value={w.price}
                            onChange={(e) =>
                              handleWeightChange(idx, "price", e.target.value)
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-sm"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                    {form.weights.length > 1 && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeWeight(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={addWeight}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm shadow-sm"
                  >
                    + Tambah Varian
                  </button>
                </div>

                {/* Display minimum price */}
                {form.weights.some(w => Number(w.price) > 0) && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      Harga Produk (otomatis dari harga termurah):
                      <span className="ml-1 font-bold text-yellow-600">
                        Rp {Math.min(...form.weights.map(w => Number(w.price) || 0).filter(p => p > 0)).toLocaleString('id-ID')}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Harga ini akan otomatis diambil dari varian dengan harga paling murah
                    </p>
                  </div>
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-[1.02] transition-all duration-200 w-full py-3 rounded-xl font-bold text-lg shadow-lg mt-6"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </form>

          {/* Review Popup Window */}
          {showReviewPopup && (
            <div
              className={`fixed z-50 pointer-events-none ${isMobile
                ? "inset-0 flex items-center justify-center px-4 py-8"
                : "inset-0"
                }`}
              style={
                isMobile
                  ? {
                    left: undefined,
                    top: undefined,
                    width: "100vw",
                    height: "100vh",
                    padding: 0,
                  }
                  : {
                    left: `${popupPosition.x}px`,
                    top: `${popupPosition.y}px`,
                    width: `${popupSize.width}px`,
                    height: `${popupSize.height}px`,
                  }
              }
            >
              <div
                className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-full h-full flex flex-col pointer-events-auto backdrop-blur-sm transform transition-all duration-300 scale-100 opacity-100 ${isMobile ? "max-w-full max-h-full w-full h-auto animate-in slide-in-from-bottom-4" : "animate-in zoom-in-95"
                  }`}
                style={
                  isMobile
                    ? {
                      maxWidth: "100vw",
                      maxHeight: "85vh",
                      minHeight: "50vh",
                      minWidth: "0",
                      margin: 0,
                      padding: 0,
                    }
                    : {}
                }
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 rounded-t-2xl flex items-center justify-between ${isMobile ? "cursor-default" : "cursor-move"
                    }`}
                  onMouseDown={
                    isMobile ? undefined : (e) => handleMouseDown(e, "drag")
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <img
                        src="/images/ai1.png"
                        alt="AgroMarFeed AI"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Review AI
                      </h3>
                      <p className="text-yellow-100 text-sm">
                        AgroMarFeed Intelligence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyToClipboard}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-300" />
                      ) : (
                        <Copy size={16} className="text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowReviewPopup(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                      title="Close"
                    >
                      <X size={18} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-white">
                  {reviewLoading ? (
                    <div className="text-center py-12">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-yellow-300 mx-auto animate-ping"></div>
                      </div>
                      <div className="mt-6 space-y-2">
                        <p className="text-lg font-semibold text-gray-800">
                          🤖 AI sedang menganalisis...
                        </p>
                        <p className="text-sm text-gray-600">
                          Memberikan review dan saran untuk deskripsi produk Anda
                        </p>
                      </div>
                      <div className="mt-8 flex justify-center">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* AI Badge */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          <img
                            src="/images/ai1.png"
                            alt="AI"
                            className="w-3 h-3 object-contain"
                          />
                          AI Review Complete
                        </div>
                      </div>

                      {/* Content with styling */}
                      <div
                        className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.6',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: markdownToHtml(reviewResult),
                        }}
                      />

                      {/* Footer Actions */}
                      <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Powered by AgroMarFeed AI</span>
                          <span>{new Date().toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resize Handle (desktop only) */}
                {!isMobile && (
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity"
                    onMouseDown={(e) => handleMouseDown(e, "resize")}
                  >
                    <div className="absolute bottom-1 right-1">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-400"></div>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-b-[4px] border-b-gray-300 absolute bottom-0 right-1"></div>
                      <div className="w-0 h-0 border-l-[2px] border-l-transparent border-b-[2px] border-b-gray-200 absolute bottom-0 right-2"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Cropper Modal */}
          {showCropModal && cropSource && (
            <ImageCropper
              imageFile={cropSource.file}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropModal(false);
                setCropSource(null);
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
