import React, { useState } from 'react';
import { C } from '../constants/theme';
import { BackBtn } from '../components/ui/NavigationControls';
import { HeroRaio, HeroEscudo, HeroEstrela, HeroDoutor } from '../components/ui/HeroIcons';

export function Kids({ onBack }) {
  const [stars, setStars] = useState(7);
  const [xp, setXp] = useState(60);
  const [level, setLevel] = useState(1);
  const [heroSel, setHeroSel] = useState("raio");

  const [missions, setMissions] = useState([
    { id: 1, emoji: "💧", text: "Tomei muita água hoje!", s: 3, done: false },
    { id: 2, emoji: "⚡", text: "Fui na sessão de radioterapia!", s: 5, done: true },
    { id: 3, emoji: "🍎", text: "Comi uma fruta gostosa!", s: 3, done: false },
    { id: 4, emoji: "😄", text: "Dei um sorriso hoje!", s: 4, done: false },
  ]);

  const completeMission = (id) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, done: true } : m));
    setStars(s => s + 3);
    setXp(x => x + 20);
  };

  return (
    <div style={{ paddingBottom: 100, background: C.navy, minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 16px", borderBottom: `2px solid ${C.gold}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <BackBtn onBack={onBack} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.gold, fontFamily: "'Space Grotesk',sans-serif" }}>⭐ AXION Kids</div>
            <div style={{ fontSize: 10, color: C.muted }}>Heróis do Raio do Bem</div>
          </div>
          <div style={{ marginLeft: "auto", background: `${C.gold}22`, border: `1px solid ${C.gold}66`, borderRadius: 14, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>⭐</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: C.gold }}>{stars}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Personagem Interativo */}
        <div style={{ background: `linear-gradient(135deg,${C.gold}15,${C.navyL})`, border: `2px solid ${C.gold}44`, borderRadius: 24, padding: "20px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            {heroSel === "raio" && <HeroRaio expressao="feliz" size={160} />}
            {heroSel === "escudo" && <HeroEscudo expressao="feliz" size={160} />}
            {heroSel === "estrela" && <HeroEstrela expressao="feliz" size={160} />}
            {heroSel === "doutor" && <HeroDoutor expressao="feliz" size={160} />}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.gold }}>Escolha seu Super Amigo:</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
            {["raio", "escudo", "estrela", "doutor"].map(h => (
              <button key={h} onClick={() => setHeroSel(h)} style={{ padding: "8px 14px", borderRadius: 12, border: `2px solid ${heroSel === h ? C.gold : C.navyM}`, background: heroSel === h ? `${C.gold}22` : "transparent", color: heroSel === h ? C.gold : C.muted, fontWeight: 800, textTransform: "capitalize" }}>
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Missões Diárias */}
        <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 12 }}>MISSÕES DOS HERÓIS 🎯</div>
        {missions.map(m => (
          <div key={m.id} onClick={() => !m.done && completeMission(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, background: m.done ? `${C.gold}14` : C.navyL, border: `1.5px solid ${m.done ? C.gold : C.navyM}`, borderRadius: 16, padding: "14px", marginBottom: 10, cursor: m.done ? "default" : "pointer" }}>
            <span style={{ fontSize: 24 }}>{m.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textDecoration: m.done ? "line-through" : "none" }}>{m.text}</div>
              <div style={{ fontSize: 10, color: C.gold, marginTop: 2 }}>+3 estrelas ⭐</div>
            </div>
            {m.done && <span style={{ color: C.gold, fontWeight: 900 }}>✓ Concluído!</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
