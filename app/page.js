"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 ¡Hola! Soy tu asistente para estimar costos en AWS. Cuéntame qué necesitas y te ayudare.",
    },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const newUserMsg = { role: "user", text: input || (file ? `📎 ${file.name}` : "") };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setFile(null);
    setLoading(true);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("input_text", newUserMsg.text);
        formData.append("file", file);

        res = await fetch(
          "https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator",
          { method: "POST", body: formData }
        );
      } else {
        res = await fetch(
          "https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input_text: newUserMsg.text }),
          }
        );
      }

      if (!res.ok) throw new Error("❌ Error al conectar con el servidor.");
      const data = await res.json();
      console.log("📩 Respuesta de n8n:", data);

      let botReplies = [];

      if (data.status === "needs_info") {
        botReplies.push({ role: "bot", text: "Necesito más información para continuar:" });
        if (Array.isArray(data.questions_pending)) {
          data.questions_pending.forEach((q) => {
            q.questions.forEach((qq) =>
              botReplies.push({ role: "bot", text: `❓ ${qq}` })
            );
          });
        }
      }

      if (data.status === "complete") {
        if (Array.isArray(data.feedback) && data.feedback.length > 0) {
          botReplies.push({ role: "bot", list: data.feedback, listType: "feedback" });
        }
        if (Array.isArray(data.risks) && data.risks.length > 0) {
          botReplies.push({ role: "bot", list: data.risks, listType: "risks" });
        }
        if (data.html) {
          botReplies.push({ role: "bot", html: data.html });
        }
      }

      if (data.reply) {
        botReplies.push({ role: "bot", text: data.reply });
      }

      if (botReplies.length === 0) {
        botReplies.push({ role: "bot", text: "⚠️ No se generó respuesta desde el backend." });
      }

      setMessages((prev) => [...prev, ...botReplies]);
    } catch (err) {
      console.error("⚠️ Error en fetch:", err);
      setMessages((prev) => [...prev, { role: "bot", text: "❌ Hubo un error al procesar tu solicitud." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="w-1/2 bg-green-900 text-white flex flex-col justify-center items-start px-16">
        <h1 className="text-4xl font-bold mb-4">¡Bienvenido al Estimador de costos AWS!</h1>
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
                className={`p-3 rounded-lg max-w-xs whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-green-100 self-end text-green-900 ml-auto"
                    : "bg-gray-100 self-start text-gray-800"
                }`}
              >
                {msg.text && <p>{msg.text}</p>}
                {msg.list && (
                  <ul className="list-disc pl-5 space-y-1">
                    {msg.list.map((item, idx) => (
                      <li
                        key={idx}
                        className={
                          msg.listType === "risks" ? "text-red-600" : "text-green-800"
                        }
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {msg.html && (
                  <div className="mt-2" dangerouslySetInnerHTML={{ __html: msg.html }} />
                )}
              </div>
            ))}
          </div>

          {/* Input + File */}
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

            {/* Hidden file input */}
            <input
              type="file"
              accept=".drawio,.xml"
              ref={fileInputRef}
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />

            {/* Clip button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
              title="Adjuntar archivo"
            >
              📎
            </button>

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? "..." : "Enviar"}
            </button>
          </div>

          {/* File name preview */}
          {file && (
            <p className="text-sm text-gray-500 mt-2">
              Archivo seleccionado: <strong>{file.name}</strong>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
