"use client";
import { useState } from "react";

export default function Home() {
  const [vidaComponente, setVidaComponente] = useState("");
  const [tipoComponente, setTipoComponente] = useState("");
  const [nombreComponente, setNombreComponente] = useState("");
  const [prodConcurrencia, setProdConcurrencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const response = await fetch(
        "https://segurobolivar-trial.app.n8n.cloud/webhook-test/aws-estimator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vidaComponente,
            tipoComponente,
            nombreComponente,
            prodConcurrencia,
          }),
        }
      );

      if (!response.ok) throw new Error("Error en la petición");

      setMensaje("✅ Datos enviados correctamente. Revisa el Excel.");
    } catch (error) {
      setMensaje("❌ No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Panel izquierdo estilo Bolívar */}
      <div className="bg-[#006b5e] flex flex-col justify-center items-center text-white p-10">
        <h1 className="text-4xl font-bold mb-4">¡Bienvenido!</h1>
        <p className="text-xl">
          Estimador de costos AWS <br />
          más fácil y rápido que nunca 🚀
        </p>
      </div>

      {/* Panel derecho con tarjeta */}
      <div className="flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Completa los datos
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Vida del Componente"
              value={vidaComponente}
              onChange={(e) => setVidaComponente(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              placeholder="Tipo de Componente"
              value={tipoComponente}
              onChange={(e) => setTipoComponente(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              placeholder="Nombre del Componente"
              value={nombreComponente}
              onChange={(e) => setNombreComponente(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="number"
              placeholder="PROD Concurrencia/mes (±)"
              value={prodConcurrencia}
              onChange={(e) => setProdConcurrencia(e.target.value)}
              className="w-full border p-3 rounded-lg"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffb81c] hover:bg-[#e0a418] text-black font-bold py-3 rounded-lg"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {mensaje && (
            <p className="mt-4 text-center text-gray-700">{mensaje}</p>
          )}
        </div>
      </div>
    </div>
  );
}
