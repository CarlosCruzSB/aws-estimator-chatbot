"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 ¡Hola! Soy tu asistente para estimar costos en AWS. Cuéntame qué necesitas." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: input })
      });

      const data = await response.json();

      // 🔹 Adaptado para N8N: usa "reply" o "text"
      const botReply = data.reply || data.text || "⚠️ No se generó respuesta.";

      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Hubo un error al procesar tu solicitud." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.role === "assistant" ? "bg-gray-200 self-start" : "bg-blue-500 text-white self-end"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
