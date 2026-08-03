import React, { useState } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';

export function Jogos({ onBack }) {
  const [pontos, setPontos] = useState(0);
  const [baloes, setBaloes] = useState([
    { id: 1, color: C.teal, popped: false },
    { id: 2, color: C.pink, popped: false },
    { id: 3, color: C.blue, popped: false },
    { id: 4, color: C.gold, popped: false },
    { id: 5, color: C.purple, popped: false },
    { id: 6, color: C.green, popped: false },
  ]);

  const popBaloon = (id) => {
    setBaloes(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setPontos(p => p + 10);
  };

  const resetGame = () => {
    setBaloes(prev => prev.map(b => ({ ...b, popped: false })));
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <AreaHeader title="Jogos & Relaxamento" icon="🎮" color={C.gold} onBack={onBack} />
      
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: C.navyL, border: `1px solid ${C.gold}44`, borderRadius: 20, padding: "20px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.gold, marginBottom: 4 }}>🎈 Estoure os Balões da Calma</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Toque nos balões para relaxar enquanto espera pela sessão.</div>
          
          <div style={{ fontSize: 24, fontWeight: 900, color: C.gold, marginBottom: 16 }}>Pontuação: {pontos}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            {baloes.map(b => (
              <button key={b.id} onClick={() => !b.popped && popBaloon(b.id)} style={{ height: 90, borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", background: b.popped ? "transparent" : b.color, border: b.popped ? "2px dashed rgba(255,255,255,0.1)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, transition: "all 0.2s" }}>
                {b.popped ? "💥" : "🎈"}
              </button>
            ))}
          </div>

          <button onClick={resetGame} style={{ background: `linear-gradient(135deg,${C.gold},${C.orange})`, border: "none", borderRadius: 12, padding: "10px 20px", color: C.navy, fontWeight: 800 }}>
            🔄 Recarregar Balões
          </button>
        </div>
      </div>
    </div>
  );
}
