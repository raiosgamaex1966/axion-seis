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
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginTop: 6 }}>PLATAFORMA SAAS MULTI-TENANT</div>
      </div>
      <div style={{ width: 210, height: 3, background: C.navyM, borderRadius: 99, overflow: "hidden", animation: "rise 0.6s ease 0.5s both" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, borderRadius: 99, animation: "barFill 1.3s ease 0.4s forwards", width: 0 }} />
      </div>
    </div>
  );
}

export function Nav({ page, onNav, role = "paciente" }) {
  let items = [];

  if (role === "superadmin") {
    items = [
      { id: "superadmin", icon: "👑", label: "Painel SaaS" },
      { id: "admin_hospital", icon: "🏢", label: "Visão Hospital" },
      { id: "profissional", icon: "🏥", label: "Visão Clínica" },
    ];
  } else if (role === "admin_hospital") {
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

  const roleColors = { superadmin: C.gold, admin_hospital: C.purple, medico: C.blue, paciente: C.teal };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, width: "100%", maxWidth: 430, margin: "0 auto", background: C.navyL, borderTop: `1px solid ${C.navyM}`, display: "flex", padding: "8px 0 14px", zIndex: 100, backdropFilter: "blur(20px)" }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" }}>
          <div style={{
            fontSize: 20,
            filter: page === item.id ? "none" : "grayscale(80%) opacity(0.45)",
            transition: "filter 0.2s"
          }}>{item.icon}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: page === item.id ? (roleColors[role] || C.teal) : C.muted, transition: "color 0.2s" }}>{item.label}</div>
        </button>
      ))}
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { temErro: false }; }
  static getDerivedStateFromError() { return { temErro: true }; }
  componentDidCatch(erro, info) { console.error("AXION - erro capturado:", erro, info); }
  render() {
    if (this.state.temErro) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center", background: C.navy, color: C.text }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>😕</div>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Ops, algo deu errado</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>Tivemos um problema inesperado. Seus dados salvos neste aparelho não foram apagados. Tente recarregar a página.</div>
          <button onClick={() => window.location.reload()} style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 800, fontSize: 14 }}>
            🔄 Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
