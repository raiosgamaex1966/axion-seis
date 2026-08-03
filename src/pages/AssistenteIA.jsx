import React, { useState, useRef, useEffect } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';
import { enviarPerguntaIA } from '../services/aiService';

export function AssistenteIA({ onBack }) {
  const [mensagens, setMensagens] = useState([
    { remetente: "ia", texto: "Olá! Sou a IA AXION. Posso te ajudar com dúvidas sobre radioterapia, efeitos colaterais e recomendações de bem-estar. Como posso ajudar você hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, carregando]);

  const enviar = async () => {
    if (!input.trim() || carregando) return;
    const userMsg = input.trim();

    const novasMensagens = [...mensagens, { remetente: "user", texto: userMsg }];
    setMensagens(novasMensagens);
    setInput("");
    setCarregando(true);

    try {
      const respostaIA = await enviarPerguntaIA(mensagens, userMsg);
      setMensagens(prev => [...prev, { remetente: "ia", texto: respostaIA }]);
    } catch (e) {
      setMensagens(prev => [...prev, { remetente: "ia", texto: "Desculpe, tive um problema inesperado ao processar sua pergunta." }]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ paddingBottom: 100, display: "flex", flexDirection: "column", height: "100vh" }}>
      <AreaHeader title="Assistente IA AXION" icon="🤖" color={C.teal} onBack={onBack} />
      
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
        {mensagens.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.remetente === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
            <div style={{
              maxWidth: "85%",
              background: m.remetente === "user" ? `linear-gradient(135deg,${C.teal},${C.blue})` : C.navyL,
              color: m.remetente === "user" ? C.navy : C.text,
              padding: "14px 18px",
              borderRadius: 20,
              fontSize: 13,
              lineHeight: 1.7,
              fontWeight: m.remetente === "user" ? 700 : 400,
              border: m.remetente === "user" ? "none" : `1px solid ${C.teal}33`,
              boxShadow: m.remetente === "user" ? `0 4px 16px ${C.teal}33` : "none",
              whiteSpace: "pre-wrap"
            }}>
              {m.texto}
            </div>
          </div>
        ))}

        {carregando && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <div style={{ background: C.navyL, border: `1px solid ${C.teal}33`, padding: "12px 18px", borderRadius: 20, fontSize: 12, color: C.teal, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ animation: "spin 1s linear infinite" }}>🤖</span>
              <span>AXION IA está pensando na sua resposta...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: "12px 20px 30px", background: C.navyL, borderTop: `1px solid ${C.navyM}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") enviar(); }}
          placeholder="Digite sua pergunta..."
          disabled={carregando}
          style={{ flex: 1, background: C.navyM, border: "none", borderRadius: 14, padding: "12px 16px", color: C.text, fontSize: 14, outline: "none" }}
        />
        <button
          onClick={enviar}
          disabled={carregando || !input.trim()}
          style={{
            background: input.trim() && !carregando ? `linear-gradient(135deg,${C.teal},${C.blue})` : "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 14,
            padding: "12px 20px",
            color: input.trim() && !carregando ? C.navy : C.muted,
            fontWeight: 900,
            cursor: input.trim() && !carregando ? "pointer" : "default"
          }}
        >
          {carregando ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
