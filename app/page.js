'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hola! Vamos a registrar un componente para estimar costos.' },
    { from: 'bot', text: '¿Cuál es la vida del componente?' }
  ]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');

  const questions = [
    { key: 'vida', text: '¿Cuál es la vida del componente?' },
    { key: 'tipo', text: '¿Cuál es el tipo de componente?' },
    { key: 'nombre', text: '¿Cuál es el nombre del componente?' },
    { key: 'concurrencia', text: '¿Cuál es la PROD concurrencia/mes (±)?' },
    { key: 'costo', text: '¿Cuál es el PROD costo?' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentQuestion = questions[step];
    setAnswers(prev => ({ ...prev, [currentQuestion.key]: input }));
    setMessages(prev => [...prev, { from: 'user', text: input }]);

    setInput('');

    if (step + 1 < questions.length) {
      setStep(step + 1);
      setMessages(prev => [...prev, { from: 'bot', text: questions[step + 1].text }]);
    } else {
      // Último paso → enviar al webhook de n8n
      try {
        const res = await fetch("https://segurobolivar-trial.app.n8n.cloud/webhook-test/aws-estimator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });

        if (res.ok) {
          setMessages(prev => [...prev, { from: 'bot', text: "✅ Información enviada correctamente a n8n!" }]);
        } else {
          setMessages(prev => [...prev, { from: 'bot', text: "⚠️ Error enviando los datos." }]);
        }
      } catch (e) {
        setMessages(prev => [...prev, { from: 'bot', text: "❌ No se pudo conectar con el servidor." }]);
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-4 flex flex-col space-y-4">
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded-lg max-w-[80%] ${msg.from === 'bot' ? 'bg-gray-200 self-start' : 'bg-blue-500 text-white self-end'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            className="flex-1 border rounded-lg p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu respuesta..."
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}