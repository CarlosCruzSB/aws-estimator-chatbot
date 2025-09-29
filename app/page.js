"use client";

import { useState } from "react";
import { Paperclip, X } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 ¡Hola! Soy tu asistente para estimar costos en AWS. Cuéntame qué necesitas.",
    },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() && !file) return;

    const newUserMsg = {
      role: "user",
      text: input || (file ? `📎 ${file.name}` : ""),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      let body;
      let headers = {};

      if (file) {
        // 🔹 Enviar archivo + texto como multipart/form-data
        body = new FormData();
        body.append("file", file);
        if (input.trim()) body.append("input_text", input);
      } else {
        // 🔹 Solo texto
        body = JSON.stringify({ input_text: newUserMsg.text });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(
        "https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator",
        {
          method: "POST",
          headers,
          body,
        }
      );

      if (!res.ok) throw new Error("❌ Error al conectar con el servidor.");
      const data = await res.json();
      console.log("📩 Respuesta de n8n:", data);

      let botReplies = [];

      // 🔹 Caso: falta información
      if (data.status === "needs_info") {
        botReplies.push({
          role: "bot",
          text: "Necesito más información para continuar:",
        });

        if (Array.isArray(data.questions_pending)) {
          data.questions_pending.forEach((q) => {
            q.questions.forEach((qq) =>
              botReplies.push({ role: "bot", text: `❓ ${qq}` })
            );
          });
        }
      }

      // 🔹 Caso: ya está completo
      if (data.status === "complete") {
        if (Array.isArray(data.feedback) && data.feedback.length > 0) {
          botReplies.push({
            role: "bot",
            list: data.feedback,
            listType: "feedback",
          });
        }
        if (Array.isArray(data.risks) && data.risks.length > 0) {
          botReplies.push({
            role: "bot",
            list: data.risks,
            listType: "risks",
          });
        }
        if (data.html) {
          botReplies.push({
            role: "bot",
            html: data.html,
          });
        }
      }

      // 🔹 Fallback: respuesta directa
      if (data.reply) {
        botReplies.push({
          role: "bot",
          text: data.reply,
        });
      }

      if (botReplies.length === 0) {
        botReplies.push({
          role: "bot",
          text: "⚠️ No se generó respuesta desde el backend.",
        });
      }

      setMessages((prev) => [...prev, ...botReplies]);
    } catch (err) {
      console.error("⚠️ Error en fetch:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Hubo un error al procesar tu solicitud." },
      ]);
    } finally {
      setLoading(false);
      setFile(null); // limpiar archivo después de enviar
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
                          msg.listType === "risks"
                            ? "text-red-600"
                            : "text-green-800"
                        }
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

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
            {/* Botón adjuntar archivo */}
            <label className="cursor-pointer p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
              <Paperclip className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                accept=".drawio,.xml"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {/* Nombre del archivo seleccionado */}
            {file && (
              <div className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                <span>{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

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



