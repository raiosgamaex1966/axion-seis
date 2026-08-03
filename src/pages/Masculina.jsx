import React, { useState } from 'react';
import { C } from '../constants/theme';
import { BackBtn, TabBar } from '../components/ui/NavigationControls';

export function Masculina({ onBack }) {
  const [tab, setTab] = useState("missoes");
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [pts, setPts] = useState(0);
  const [streak, setStreak] = useState(4);
  const [boom, setBoom] = useState(false);
  const [showLvl, setShowLvl] = useState(false);
  const [missions, setMissions] = useState([
    { id: 1, emoji: "💧", text: "Beber 8 copos de água", pts: 15, xv: 25, done: false, cat: "Saúde" },
    { id: 2, emoji: "🏃", text: "Caminhada de 15 minutos", pts: 25, xv: 45, done: false, cat: "Movimento" },
    { id: 3, emoji: "🧘", text: "5 min de respiração profunda", pts: 20, xv: 35, done: false, cat: "Mente" },
    { id: 4, emoji: "🍗", text: "Proteína em todas as refeições", pts: 20, xv: 35, done: false, cat: "Nutrição" },
    { id: 5, emoji: "😴", text: "Dormir pelo menos 7 horas", pts: 25, xv: 40, done: false, cat: "Descanso" },
  ]);

  const levelData = [
    { n: 1, nome: "Iniciante 🌱", cor: "#81c784" },
    { n: 2, nome: "Guerreiro 💪", cor: C.blue },
    { n: 3, nome: "Campeão 🛡️", cor: "#0288d1" },
    { n: 4, nome: "Herói ⚡", cor: C.gold },
    { n: 5, nome: "Lenda 👑", cor: "#ffd166" },
  ];
  const ld = levelData[Math.min(level - 1, 4)];
  const pct = Math.min((xp / 300) * 100, 100);

  const addReward = (earnXp, earnPts) => {
    setPts(p => p + earnPts);
    setXp(x => {
      const n = x + earnXp;
      if (n >= 300) { setLevel(l => l + 1); setShowLvl(true); setTimeout(() => setShowLvl(false), 2800); return n - 300; }
      return n;
    });
  };

  const doneMission = id => {
    const m = missions.find(x => x.id === id);
    if (!m || m.done) return;
    setMissions(p => p.map(x => x.id === id ? { ...x, done: true } : x));
    addReward(m.xv, m.pts);
    setBoom(true); setTimeout(() => setBoom(false), 900);
  };

  return (
    <div style={{ paddingBottom: 100, background: C.navy, minHeight: "100vh" }}>
      {showLvl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div style={{ background: `linear-gradient(135deg,${C.blue}33,${C.blue}11)`, border: `3px solid ${C.blue}`, borderRadius: 28, padding: "36px 44px", textAlign: "center", animation: "rise 0.4s ease" }}>
            <div style={{ fontSize: 54, marginBottom: 10 }}>🎊</div>
            <div style={{ fontSize: 13, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>SUBIU DE NÍVEL!</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.blue, fontFamily: "'Space Grotesk',sans-serif" }}>{ld.nome}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Continue assim, guerreiro! 💙</div>
          </div>
        </div>
      )}
      {boom && <div style={{ position: "fixed", top: "38%", left: "50%", transform: "translateX(-50%)", fontSize: 40, zIndex: 9999, pointerEvents: "none", animation: "rise 0.3s ease" }}>🎉✨⭐</div>}

      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 0", borderBottom: `2px solid ${C.blue}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <BackBtn onBack={onBack} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.blue, fontFamily: "'Space Grotesk',sans-serif" }}>💙 Área Masculina</div>
            <div style={{ fontSize: 10, color: C.muted }}>Sua jornada de cura</div>
          </div>
        </div>

        <div style={{ background: `${C.blue}14`, border: `2px solid ${C.blue}44`, borderRadius: 22, padding: "16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ background: `linear-gradient(135deg,${C.blue},${C.blue}aa)`, borderRadius: 99, padding: "3px 14px", fontSize: 11, fontWeight: 900, color: "#fff" }}>
                  NÍVEL {level}
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.blue }}>{ld.nome}</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{xp}/300 XP para o próximo nível</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>{pts}</div>
              <div style={{ fontSize: 11, color: C.muted }}>pontos totais</div>
              <div style={{ fontSize: 11, color: "#ff9f43", fontWeight: 700, marginTop: 2 }}>🔥 {streak} dias</div>
            </div>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${C.blue},#29b6f6)`, boxShadow: `0 0 10px ${C.blue}80`, transition: "width 0.6s" }} />
          </div>
        </div>
        <TabBar tabs={["missoes"]} labels={["🎯 Missões"]} active={tab} onChange={setTab} color={C.blue} />
      </div>

      {tab === "missoes" && (
        <div style={{ padding: "20px 20px 0" }}>
          {missions.map(m => (
            <div key={m.id} onClick={() => doneMission(m.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", marginBottom: 10, borderRadius: 18, cursor: m.done ? "default" : "pointer", background: m.done ? `${C.blue}14` : "rgba(255,255,255,0.04)", border: `2px solid ${m.done ? C.blue + "66" : "rgba(255,255,255,0.09)"}`, transition: "all 0.25s" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: m.done ? `linear-gradient(135deg,${C.blue},#29b6f6)` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: m.done ? 20 : 24 }}>
                {m.done ? "✓" : m.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.done ? C.muted : C.text, textDecoration: m.done ? "line-through" : "none" }}>{m.text}</div>
                <span style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>{m.cat}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: m.done ? C.muted : C.blue }}>{m.done ? "✓" : `+${m.pts}pts`}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
