"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { MessageCircle, X } from "lucide-react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    setChatHistory([
      `AI: Halo ${userName}! Saya AgroMarFeed AI, Silahkan tanyakan sesuatu jika butuh bantuan!`,
    ]);
  }, [userName]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChatHistory((prev) => [...prev, `You: ${userMsg}`]);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: userMsg }),
      });

      const data = await res.json();
      const aiReply =
        data.choices?.[0]?.message?.content || "AI tidak dapat merespons.";
      setChatHistory((prev) => [...prev, `AI: ${aiReply}`]);
    } catch (err) {
      setChatHistory((prev) => [...prev, "AI: Gagal menghubungi server."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 rounded-2xl shadow-xl border bg-[#6d8044] text-black">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Tutup chat"
            className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition"
          >
            <X size={20} />
          </button>

          <CardContent className="pt-6 pb-4 px-4 flex flex-col gap-3">
            <div className="text-base font-semibold text-white">AgroMarFeed AI</div>

            <div className="h-48 overflow-y-auto rounded border px-2 py-1 text-sm bg-gray-100 text-black">
              {chatHistory.length === 0 ? (
                <div className="italic text-xs text-center mt-16 text-black/40">
                  Loading...
                </div>
              ) : (
                <>
                  {chatHistory.map((msg, i) => {
                    const isUser = msg.startsWith("You:");
                    return (
                      <div
                        key={i}
                        className={`mb-2 whitespace-pre-wrap ${isUser ? "text-black" : "text-[#6d8044]"
                          }`}
                      >
                        {msg}
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="italic text-xs text-black/40">AI is typing...</div>
                  )}
                </>
              )}
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pertanyaanmu..."
              rows={2}
              className="resize-none text-black bg-white border"
            />

            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className={`px-6 py-3 rounded-full text-black bg-[#f7ab31] hover:bg-[#f7ab31]/80 transition ${(!message.trim() || isLoading) ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? "Loading..." : "Kirim"}
            </button>

          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full shadow-lg border hover:scale-105 transition bg-white"
          aria-label="Open chat"
        >
          <MessageCircle size={20} className="text-black" />
        </button>

      )}
    </div>
  );
}
