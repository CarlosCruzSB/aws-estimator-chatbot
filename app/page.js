"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    vida: "",
    tipo: "",
    nombre: "",
    concurrencia: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        "https://segurobolivar-trial.app.n8n.cloud/webhook-test/aws-estimator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) throw new Error("❌ No se pudo conectar con el servidor.");
      setMsg("✅ Datos enviados con éxito 🚀");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="w-1/2 bg-green-900 text-white flex flex-col justify-center items-start px-16">
        <h1 className="text-4xl font-bold mb-4">
          ¡Bienvenido al Estimador AWS!
        </h1>
        <p className="text-lg mb-2">
          Calcula costos de servicios en la nube{" "}
          <span className="text-yellow-400">más fácil</span> y{" "}
          <span className="text-yellow-400">rápido que nunca.</span>
        </p>
        <div className="mt-6">
          <img src="/logo.png" alt="Seguros Bolivar" className="h-20" />
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-1/2 bg-gray-50 flex justify-center items-center">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Completa los datos
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="vida"
              placeholder="Vida del Componente"
              value={form.vida}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              name="tipo"
              placeholder="Tipo de Componente"
              value={form.tipo}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              name="nombre"
              placeholder="Nombre del Componente"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              name="concurrencia"
              placeholder="PROD Concurrencia/mes (±)"
              value={form.concurrencia}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {msg && (
            <p
              className={`mt-4 text-center text-sm ${
                msg.startsWith("✅") ? "text-green-700" : "text-red-600"
              }`}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
