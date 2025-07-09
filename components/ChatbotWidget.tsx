"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MessageCircle, X, Send, Bot, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  stock: number;
  categoryOptions: string;
  limbahOptions: string;
  fisikOptions: string;
}

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  products?: Product[];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const pathname = usePathname();

  // Hide chatbot on auth pages to prevent interference with login
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    const userName = user?.name || "User";
    setChatHistory([
      {
        type: "ai",
        content: `Halo ${userName}! Saya AgroMarFeed AI, Silahkan tanyakan sesuatu jika butuh bantuan!`,
      },
    ]);
  }, [user?.name]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChatHistory((prev) => [...prev, { type: "user", content: userMsg }]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg }),
      });

      const data = await res.json();
      const aiReply =
        data.choices?.[0]?.message?.content || "AI tidak dapat merespons.";

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: aiReply,
          products: data.products || [],
        },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Gagal menghubungi server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Function to parse markdown-like formatting
  const parseMarkdown = (text: string) => {
    // Handle headers first
    let processedText = text.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    processedText = processedText.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    processedText = processedText.replace(/^# (.*$)/gm, "<h1>$1</h1>");

    // Handle other markdown elements
    processedText = processedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    processedText = processedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    processedText = processedText.replace(/`(.*?)`/g, "<code>$1</code>");

    // Split by tags and process
    const segments = processedText.split(/(<[^>]+>.*?<\/[^>]+>)/);

    return segments.map((segment, index) => {
      if (segment.startsWith("<h1>")) {
        const content = segment.replace(/<\/?h1>/g, "");
        return (
          <h1 key={index} className="font-bold text-lg mt-3 mb-2 text-gray-900">
            {content}
          </h1>
        );
      }
      if (segment.startsWith("<h2>")) {
        const content = segment.replace(/<\/?h2>/g, "");
        return (
          <h2
            key={index}
            className="font-bold text-base mt-2 mb-1 text-gray-900"
          >
            {content}
          </h2>
        );
      }
      if (segment.startsWith("<h3>")) {
        const content = segment.replace(/<\/?h3>/g, "");
        return (
          <h3
            key={index}
            className="font-semibold text-sm mt-2 mb-1 text-gray-900"
          >
            {content}
          </h3>
        );
      }
      if (segment.startsWith("<strong>")) {
        const content = segment.replace(/<\/?strong>/g, "");
        return (
          <strong key={index} className="font-bold">
            {content}
          </strong>
        );
      }
      if (segment.startsWith("<em>")) {
        const content = segment.replace(/<\/?em>/g, "");
        return (
          <em key={index} className="italic">
            {content}
          </em>
        );
      }
      if (segment.startsWith("<code>")) {
        const content = segment.replace(/<\/?code>/g, "");
        return (
          <code
            key={index}
            className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono"
          >
            {content}
          </code>
        );
      }
      return segment;
    });
  };

  return (
    <>
      {!isAuthPage && (
        <div className="fixed bottom-14 right-6 z-40 lg:bottom-6 lg:z-50">
          {isOpen ? (
            <Card className="w-80 md:w-96 rounded-2xl shadow-2xl border-0 bg-white overflow-hidden">
              {/* Header */}
              <div className="bg-[#6d8044] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/ai1.png"
                      alt="AI Assistant"
                      width={76}
                      height={76}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      AgroMarFeed AI
                    </div>
                    <div className="text-white/80 text-xs">
                      Online • Siap membantu
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup chat"
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <CardContent className="p-0 flex flex-col h-96">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {chatHistory.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#6d8044]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bot size={20} className="text-[#6d8044]" />
                        </div>
                        <div className="text-sm text-gray-500">
                          Memulai percakapan...
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${
                            msg.type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                              msg.type === "user"
                                ? "bg-[#6d8044] text-white rounded-br-md"
                                : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                            }`}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {msg.type === "ai"
                                ? parseMarkdown(msg.content)
                                : msg.content}
                            </div>

                            {/* Product Recommendations */}
                            {msg.type === "ai" &&
                              msg.products &&
                              msg.products.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <div className="text-xs font-medium text-gray-600 mb-2">
                                    Rekomendasi Produk:
                                  </div>
                                  {msg.products.map((product) => (
                                    <Link
                                      key={product._id}
                                      href={`/detail/${product._id}`}
                                      className="block group"
                                    >
                                      <div className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 hover:border-[#6d8044] hover:bg-[#6d8044]/5 transition-all duration-200">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                          <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-xs text-gray-900 truncate">
                                            {product.name}
                                          </div>
                                          <div className="text-xs text-[#6d8044] font-semibold">
                                            {formatPrice(product.price)}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Stok: {product.stock}
                                          </div>
                                        </div>
                                        <ExternalLink
                                          size={12}
                                          className="text-gray-400 group-hover:text-[#6d8044] transition-colors"
                                        />
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                Mengetik...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t bg-white p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik pesan Anda..."
                      rows={1}
                      className="resize-none text-sm bg-gray-50 border-gray-200 focus:border-[#6d8044] focus:ring-[#6d8044] rounded-xl min-h-[40px] max-h-20"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || isLoading}
                      className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                        !message.trim() || isLoading
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#6d8044] text-white hover:bg-[#6d8044]/80 hover:scale-105"
                      }`}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="group p-2 rounded-full transition-all duration-300 hover:scale-120 animate-float"
              aria-label="Open chat"
              style={{
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <div className="relative w-18 h-18 md:w-24 md:h-24">
                <Image
                  src="/images/ai1.png"
                  alt="AI Assistant"
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </button>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}
