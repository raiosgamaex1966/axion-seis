import React, { useEffect } from 'react';
import { C } from '../../constants/theme';

export function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.navy, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, animation: "fadeOut 0.5s ease 1.6s forwards" }}>
      <div style={{ animation: "pulse 1.5s ease infinite", filter: "drop-shadow(0 0 24px rgba(0,201,177,0.5))" }}>
        <svg width="86" height="86" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="8" fill={C.teal} />
          <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.teal} strokeWidth="2" fill="none" opacity="0.9" />
          <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 40 40)" />
          <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.purple} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 40 40)" />
        </svg>
      </div>
      <div style={{ textAlign: "center", animation: "rise 0.6s ease 0.3s both" }}>
        <div style={{ fontSize: 46, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 4, background: `linear-gradient(135deg,${C.teal},${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXION</div>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginTop: 6 }}>RADIOTERAPIA HUMANIZADA</div>
      </div>
      <div style={{ width: 210, height: 3, background: C.navyM, borderRadius: 99, overflow: "hidden", animation: "rise 0.6s ease 0.5s both" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, borderRadius: 99, animation: "barFill 1.3s ease 0.4s forwards", width: 0 }} />
      </div>
    </div>
  );
}

export function Nav({ page, onNav, role = "paciente" }) {
  // Super Admin nao utiliza barra de navegacao inferior pois possui painel master exclusivo
  if (role === "superadmin") {
    return null;
  }

  let items = [];

  if (role === "admin_hospital") {
    items = [
      { id: "admin_hospital", icon: "🏢", label: "Admin Hospital" },
      { id: "profissional", icon: "🏥", label: "Painel Clínico" },
      { id: "ia", icon: "🤖", label: "Assistente IA" }
    ];
  } else if (role === "medico") {
    items = [
      { id: "profissional", icon: "🏥", label: "Painel Clínico" },
      { id: "ia", icon: "🤖", label: "Assistente IA" },
      { id: "direitos", icon: "⚖️", label: "Direitos" }
    ];
  } else {
    // Paciente
    items = [
      { id: "home", icon: "🏠", label: "Início" },
      { id: "paciente", icon: "📊", label: "Meu Perfil" },
      { id: "ia", icon: "🤖", label: "IA AXION" },
      { id: "direitos", icon: "⚖️", label: "Direitos" }
    ];
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.navyL, borderTop: `1px solid ${C.navyM}`, display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 1000, maxWidth: 430, margin: "0 auto" }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{ background: "none", border: "none", color: page === item.id ? C.teal : C.muted, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10, fontWeight: page === item.id ? 800 : 500, transition: "all 0.2s" }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return children;
}
