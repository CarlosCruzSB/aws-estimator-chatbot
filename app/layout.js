import "./globals.css";

export const metadata = {
  title: "AWS Estimator",
  description: "Chatbot para estimar costos en AWS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
