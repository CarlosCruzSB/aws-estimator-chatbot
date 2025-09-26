"use client";
import { useState, useRef } from "react";

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
      
      // Lógica para procesar la respuesta de n8n
      if (Array.isArray(data)) {
        const total = data.reduce((acc, item) => acc + (item.monthlyCost || 0), 0);
        const tableHtml = `
          <div class="overflow-x-auto mt-2">
            <table class="min-w-full border border-gray-300 rounded-xl shadow-sm text-sm">
              <thead class="bg-green-700 text-white">
                <tr>
                  <th class="border px-3 py-2 text-left">Servicio</th>
                  <th class="border px-3 py-2 text-right">Costo Mensual (USD)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${data
                  .map(
                    (item, idx) => `
                  <tr class="${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-green-50 transition">
                    <td class="px-3 py-2 font-medium text-gray-800">${item.service}</td>
                    <td class="px-3 py-2 text-right font-semibold text-green-700">
                      $${item.monthlyCost ?? "-"}
                    </td>
                  </tr>
                `
                  )
                  .join("")}
                 <tr style="font-weight:bold; background:#fafafa;">
                    <td style="padding:8px; border:1px solid #ddd;">TOTAL</td>
                    <td style="padding:8px; border:1px solid #ddd; text-align:right;">$${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        botReplies.push({ role: "bot", html: tableHtml });

      } else if (data.status === "needs_info") {
        botReplies.push({ role: "bot", text: "Necesito más información para continuar:" });
        if (Array.isArray(data.questions_pending)) {
          data.questions_pending.forEach((q) => {
            q.questions.forEach((qq) =>
              botReplies.push({ role: "bot", text: `❓ ${qq}` })
            );
          });
        }
      } else if (data.reply) {
        botReplies.push({ role: "bot", text: data.reply });
      }

      if (botReplies.length === 0 && !Array.isArray(data)) {
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
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg flex flex-col h-[90vh]">
          {/* Chat log */}
          <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-2">
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
                {msg.html && <div className="mt-2" dangerouslySetInnerHTML={{ __html: msg.html }} />}
              </div>
            ))}
          </div>

          {/* Input + Adjuntar */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
               {/* --- CAMBIO 1: Botón con emoji 📎 --- */}
              <label className="cursor-pointer p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
                📎
                <input
                  type="file"
                  accept=".drawio,.xml"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>

              <input
                type="text"
                placeholder="Escribe tu mensaje o adjunta un archivo..."
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

            {/* Mostrar archivo seleccionado */}
            {file && (
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700">
                <span>📂 {file.name}</span>
                 {/* --- CAMBIO 2: Botón con emoji ❌ --- */}
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


