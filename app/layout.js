export const metadata = {
  title: "AWS Estimator Chatbot",
  description: "Chatbot para estimar costos de AWS y llenar Excel automáticamente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
