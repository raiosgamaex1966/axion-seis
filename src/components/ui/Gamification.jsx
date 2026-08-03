import React, { useState } from 'react';
import { C } from '../../constants/theme';

export function useGameEngine(maxXp = 300) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(4);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [totalDone, setTotalDone] = useState(0);

  const addReward = (earnXp, earnPts) => {
    setPoints(p => p + earnPts);
    setTotalDone(t => t + 1);
    setXp(x => {
      const n = x + earnXp;
      if (n >= maxXp) {
        setLevel(l => l + 1);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2500);
        return n - maxXp;
      }
      return n;
    });
  };

  return { xp, level, points, streak, totalDone, addReward, showLevelUp, pct: Math.min((xp / maxXp) * 100, 100) };
}

export function LevelUpModal({ show, level, color }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ background: `linear-gradient(135deg,${color}33,${color}11)`, border: `3px solid ${color}`, borderRadius: 28, padding: "32px 40px", textAlign: "center", animation: "levelUp 2.5s ease forwards", backdropFilter: "blur(10px)" }}>
        <div style={{ fontSize: 52, marginBottom: 8, animation: "spin 1s ease" }}>🏆</div>
        <div style={{ fontSize: 13, color, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>NÍVEL ACIMA!</div>
        <div style={{ fontSize: 38, fontWeight: 900, color, fontFamily: "'Space Grotesk',sans-serif" }}>Nível {level}</div>
        <div style={{ fontSize: 13, color: C.text, marginTop: 8 }}>Você está evoluindo! Continue! 🌟</div>
      </div>
    </div>
  );
}

export function BoomEffect({ on }) {
  if (!on) return null;
  const particles = ["🎉", "⭐", "✨", "🌟", "💥", "🎊"];
  return (
    <div style={{ position: "fixed", top: "38%", left: "50%", zIndex: 9997, pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", fontSize: 28,
          "--dx": `${(Math.random() - 0.5) * 200}px`,
          "--dy": `${-Math.random() * 180 - 60}px`,
          animation: `confetti ${0.6 + Math.random() * 0.4}s ease forwards`,
          animationDelay: `${i * 0.04}s`
        }}>{p}</div>
      ))}
    </div>
  );
}

export function GameTopBanner({ level, xp, pct, points, streak, color, levelTitle, icon }) {
  return (
    <div style={{ margin: "0 20px 20px", background: `linear-gradient(135deg,${color}20,${color}08)`, border: `2px solid ${color}55`, borderRadius: 22, padding: "16px 18px", boxShadow: `0 8px 32px ${color}18` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${color},${color}bb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 14px ${color}55`, flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ background: `linear-gradient(135deg,${color},${color}aa)`, borderRadius: 99, padding: "2px 12px", fontSize: 11, fontWeight: 900, color: "#fff" }}>
                NÍVEL {level}
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color }}>{levelTitle}</span>
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>{xp}/300 XP para o próximo nível</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color }}>{points} pts</div>
          <div style={{ fontSize: 10, color: "#ff9f43", fontWeight: 700 }}>🔥 {streak} dias seguidos</div>
        </div>
      </div>
      <div style={{ height: 8, background: C.navyM, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}
