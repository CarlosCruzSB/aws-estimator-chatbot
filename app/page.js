"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    vida: "",
    tipo: "",
    nombre: "",
    concurrencia: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(
        "https://segurobolivar-trial.app.n8n.cloud/webhook/aws-estimator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Error al enviar los datos");
      }

      setSuccess(true);

      // 🔹 Reiniciar el formulario después del envío exitoso
      setFormData({
        vida: "",
        tipo: "",
        nombre: "",
        concurrencia: "",
      });
    } catch (err) {
      setError(err.message || "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Estimador de Costes AWS
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vida del Componente
            </label>
            <input
              type="text"
              name="vida"
              value={formData.vida}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de Componente
            </label>
            <input
              type="text"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Componente
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              PROD Concurrencia/mes (±)
            </label>
            <input
              type="number"
              name="concurrencia"
              value={formData.concurrencia}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>

        {success && (
          <p className="text-green-600 mt-4 text-center">
            ✅ Datos enviados correctamente
          </p>
        )}
        {error && (
          <p className="text-red-600 mt-4 text-center">❌ {error}</p>
        )}
      </div>
    </main>
  );
}
