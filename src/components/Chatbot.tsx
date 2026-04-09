import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { Send, Bot, User, BrainCircuit, Zap } from "lucide-react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "model";
  text: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "سلام! من دستیار هوشمند شما برای بهینه‌سازی شبکه و تحلیل کدهای پایتون هستم. چطور می‌توانم کمک کنم؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const modelName = useThinking
        ? "gemini-3.1-pro-preview"
        : "gemini-3.1-flash-lite-preview";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "You are a Network Optimization Expert and Python Developer helping a user with their Connectivity Intelligence Suite.",
              },
            ],
          },
          ...messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: "user", parts: [{ text: userMsg }] },
        ],
        config: useThinking
          ? {
              thinkingConfig: { thinking: true },
            }
          : undefined,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", text: response.text || "No response generated." },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Network AI Assistant</h2>
        </div>
        <button
          onClick={() => setUseThinking(!useThinking)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            useThinking
              ? "bg-purple-100 text-purple-700 border border-purple-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
          title={
            useThinking ? "High Thinking Mode (Pro)" : "Fast Mode (Flash Lite)"
          }
        >
          {useThinking ? <BrainCircuit size={14} /> : <Zap size={14} />}
          {useThinking ? "Deep Thinking" : "Fast Response"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none prose-p:leading-relaxed">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about the code or network optimization..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-blue-600 disabled:text-gray-400 p-1"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
