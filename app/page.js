"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 ¡Hola! Soy tu asistente para estimar costos en AWS. Cuéntame qué necesitas." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // agrega mensaje del usuario al chat
    const newUserMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        "https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input_text: newUserMsg.text }),
        }
      );

      if (!res.ok) throw new Error("❌ Error al conectar con el servidor.");
      const data = await res.json();

      // Bot responde según status
      let botReplies = [];

      if (data.status === "needs_info") {
        botReplies.push({
          role: "bot",
          text: "Necesito más información para continuar:",
        });
        (Array.isArray(data.questions_pending) ? data.questions_pending : []).forEach(
          (q) => {
            q.questions.forEach((qq) =>
              botReplies.push({ role: "bot", text: `❓ ${qq}` })
            );
          }
        );
      } else if (data.status === "complete") {
        // feedback técnico
        if (data.feedback) {
          botReplies.push({
            role: "bot",
            text: `💡 Recomendaciones:\n${data.feedback}`,
          });
        }
        // riesgos
        if (data.risks) {
          botReplies.push({
            role: "bot",
            text: `⚠️ Riesgos:\n${data.risks}`,
          });
        }
        // tabla de costos
        if (data.html) {
          botReplies.push({
            role: "bot",
            text: "💰 Aquí tienes la estimación de costos:",
            html: data.html,
          });
        }
      }

      setMessages((prev) => [...prev, ...botReplies]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Hubo un error al procesar tu solicitud." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="w-1/2 bg-green-900 text-white flex flex-col justify-center items-start px-16">
        <h1 className="text-4xl font-bold mb-4">
          ¡Bienvenido al Estimador de costos AWS!
        </h1>
        <p className="text-lg mb-2">
          Calcula costos de servicios en la nube AWS{" "}
          <span className="text-yellow-400">más fácil</span> y{" "}
          <span className="text-yellow-400">rápido que nunca.</span>
        </p>
        <div className="mt-6">
          <img src="/logo.png" alt="Seguros Bolivar" className="h-20" />
        </div>
      </div>

      {/* Panel derecho - Chat */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-between items-center">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md flex flex-col flex-grow">
          {/* Chat log */}
          <div className="flex-grow overflow-y-auto space-y-3 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-xs ${
                  msg.role === "user"
                    ? "bg-green-100 self-end text-green-900 ml-auto"
                    : "bg-gray-100 self-start text-gray-800"
                }`}
              >
                {msg.text &&
                  msg.text.split("\n").map((line, idx) => (
                    <p key={idx} className="mb-1">
                      {line}
                    </p>
                  ))}
                {msg.html && (
                  <div
                    className="mt-2"
                    dangerouslySetInnerHTML={{ __html: msg.html }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
              className="flex-grow px-4 py-2 border rounded-lg"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
