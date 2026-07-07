import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"menu" | "test" | "result">("menu");
  const [testName, setTestName] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = () => {
    setMode("menu");
    setInput("");
    setTestName(null);
    setQuestionIndex(0);
    setAnswers([]);
    setQuestions([]);
    setMessages([
      {
        id: 1,
        text: "Bonjour! Je suis Testicrousti 🧠. Je suis ici pour t'aider à mieux te connaître à travers des tests de personnalité. Quel type de test aimerais-tu faire?",
        isBot: true,
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newUserMsg: Message = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      if (mode === "menu") {
        await handleTestSelection(userMessage);
      } else if (mode === "test") {
        await handleTestAnswer(userMessage);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Oups, j'ai eu un souci. Réessaie!",
          isBot: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleTestSelection = async (message: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          step: "generate_test",
        }),
      });
      const data = await res.json();

      setTestName(message);
      setQuestions(data.questions);
      setAnswers([]);
      setQuestionIndex(0);
      setMode("test");

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `Parfait! Je vais te poser 7 questions pour "${message}". Voici la première:\n\n${data.questions[0].text}`,
          isBot: true,
          options: data.questions[0].options,
        },
      ]);
    } catch (error) {
      console.error("Erreur lors de la génération du test:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Désolé, je n'ai pas pu créer ce test. Peux-tu essayer un autre type?",
          isBot: true,
        },
      ]);
    }

    setLoading(false);
  };

  const handleTestAnswer = async (message: string) => {
    const answer = message.toUpperCase();
    if (!["A", "B", "C", "D"].includes(answer)) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Réponds par A, B, C ou D stp!",
          isBot: true,
        },
      ]);
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (newAnswers.length === 7) {
      // Test terminé, générer le profil
      setMode("result");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_name: testName,
            questions: questions,
            answers: newAnswers,
            step: "generate_profile",
          }),
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: data.profile,
            isBot: true,
          },
          {
            id: prev.length + 2,
            text: "Veux-tu faire un autre test?",
            isBot: true,
          },
        ]);
      } catch (error) {
        console.error("Erreur lors de la génération du profil:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Oups, j'ai eu un problème en générant ton profil. Réessaie!",
            isBot: true,
          },
        ]);
      }
      setLoading(false);
    } else {
      // Question suivante
      const nextQuestion = questions[newAnswers.length];
      setQuestionIndex(newAnswers.length);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: `${nextQuestion.text}`,
          isBot: true,
          options: nextQuestion.options,
        },
      ]);
    }
  };

  const handleOptionClick = (option: string) => {
    setInput(option);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#e8ede5'}}>
      <style>{`
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div className="w-full max-w-2xl h-screen md:h-auto md:max-h-[700px] rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{backgroundColor: '#f1f5f0', border: '3px solid #8b9e85'}}>

        {/* En-tête */}
        <div className="p-5" style={{backgroundColor: '#8b9e85', background: 'linear-gradient(135deg, #8b9e85 0%, #7a8c78 100%)'}}>
          <div className="flex items-center gap-4">
            <div className="text-4xl w-16 h-16 flex items-center justify-center" title="Feuille de test">
              🍃
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white" style={{letterSpacing: '0.5px'}}>Testicrousti</h1>
              <p className="text-sm" style={{color: '#dde5db'}}>Découvre-toi mieux</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{backgroundColor: '#eef2ec'}}>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg text-sm leading-relaxed"
                  style={{
                    backgroundColor: msg.isBot ? '#d8e4d3' : '#a8b89f',
                    color: msg.isBot ? '#3d4a38' : '#f5f5f2',
                    borderLeft: msg.isBot ? '4px solid #8b9e85' : 'none',
                    borderRight: !msg.isBot ? '4px solid #8b9e85' : 'none',
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>

              {/* Options A/B/C/D */}
              {msg.isBot && msg.options && mode === "test" && (
                <div className="flex justify-start mt-3 gap-2 flex-wrap">
                  {msg.options.map((option, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(letters[idx])}
                        disabled={loading}
                        className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: '#a8b89f',
                          color: '#f5f5f2',
                          border: '2px solid #8b9e85',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#96a98f')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a8b89f')}
                      >
                        {letters[idx]}: {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg text-sm" style={{backgroundColor: '#d4c5bb', color: '#4a3f38'}}>
                <p>Testicrousti réfléchit...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barre de chat */}
        <div className="p-4 flex gap-2" style={{backgroundColor: '#f1f5f0', borderTop: '3px solid #8b9e85'}}>
          {mode === "test" ? (
            <>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="A, B, C ou D"
                className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none transition-all text-center font-semibold"
                style={{
                  backgroundColor: '#f1f5f0',
                  border: '2px solid #8b9e85',
                  color: '#3d4a38',
                }}
                maxLength={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!['A', 'B', 'C', 'D'].includes(input) || loading}
                className="px-5 py-3 font-semibold rounded-lg transition-all text-white"
                style={{
                  backgroundColor: '#8b9e85',
                  opacity: !['A', 'B', 'C', 'D'].includes(input) || loading ? 0.6 : 1,
                  cursor: !['A', 'B', 'C', 'D'].includes(input) || loading ? 'not-allowed' : 'pointer',
                }}
              >
                Envoyer
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Décris le test que tu veux faire..."
                className="flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                style={{
                  backgroundColor: '#f1f5f0',
                  border: '2px solid #8b9e85',
                  color: '#3d4a38',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                className="px-5 py-3 font-semibold rounded-lg transition-all text-white"
                style={{
                  backgroundColor: '#7a8f7d',
                  opacity: !input.trim() || loading ? 0.6 : 1,
                  cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                }}
              >
                Envoyer
              </button>
            </>
          )}
          {mode !== "menu" && (
            <button
              onClick={startChat}
              className="px-4 py-3 font-semibold rounded-lg transition-all text-white"
              style={{
                backgroundColor: '#a09f96',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8f8e84')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#a09f96')}
            >
              Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
