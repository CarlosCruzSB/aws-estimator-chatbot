// app/layout.js
import "./globals.css";

export const metadata = {
  title: "AWS Estimator Chatbot",
  description: "Chatbot para estimación de costos en AWS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body className="bg-gray-100 text-gray-900 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">💬 AWS Estimator Chatbot</h1>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
