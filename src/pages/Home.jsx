import React from 'react';
import { C } from '../constants/theme';

export function Home({ onNav, perfil, onSair }) {
  const sexo = (perfil?.sexo || "").toLowerCase();

  // Filtro inteligente de áreas conforme o sexo e tipo de perfil
  const todasAreas = [
    { id: "paciente", label: "Área Paciente", icon: "🧑", color: C.teal, desc: "Seu tratamento & sintomas", publico: "todos" },
    { id: "feminina", label: "Área Feminina", icon: "🌸", color: C.pink, desc: "Mama & acolhimento", publico: "feminino" },
    { id: "masculina", label: "Área Masculina", icon: "💙", color: C.blue, desc: "Próstata & bem-estar", publico: "masculino" },
    { id: "kids", label: "Área Kids", icon: "⭐", color: C.gold, desc: "Heróis do Raio do Bem", publico: "todos" },
    { id: "direitos", label: "Meus Direitos", icon: "⚖️", color: C.green, desc: "Direitos do paciente", publico: "todos" },
    { id: "jogos", label: "Jogos & Diversão", icon: "🎮", color: C.gold, desc: "Para esperar brincando", publico: "todos" }
  ];

  // Filtra as áreas permitidas para o paciente logado
  const areasFiltradas = todasAreas.filter(a => {
    if (a.publico === "todos") return true;
    if (a.publico === "feminino") return sexo.includes("fem") || sexo.includes("mulher") || !sexo;
    if (a.publico === "masculino") return sexo.includes("masc") || sexo.includes("homem") || !sexo;
    return true;
  });

  const primeiroNome = perfil && perfil.nome ? perfil.nome.split(" ")[0] : "";
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "BOM DIA ☀️" : hora < 18 ? "BOA TARDE 🌤️" : "BOA NOITE 🌙";

  return (
    <div style={{ padding: "0 20px 100px" }}>
      {/* Header com Logo e Botão de Sair */}
      <div style={{ padding: "48px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="3" fill={C.teal} />
            <ellipse cx="14" cy="14" rx="12" ry="5" stroke={C.teal} strokeWidth="1.5" fill="none" />
            <ellipse cx="14" cy="14" rx="12" ry="5" stroke={C.teal} strokeWidth="1.5" fill="none" transform="rotate(60 14 14)" />
            <ellipse cx="14" cy="14" rx="12" ry="5" stroke={C.teal} strokeWidth="1.5" fill="none" transform="rotate(120 14 14)" />
          </svg>
          <div>
            <span style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 2, background: `linear-gradient(135deg,${C.teal},${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXION</span>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>RADIOTERAPIA HUMANIZADA</div>
          </div>
        </div>

        {/* Botão de Sair Visível */}
        {onSair && (
          <button onClick={onSair} title="Sair da conta" style={{ background: "rgba(255,107,157,0.12)", border: `1.5px solid ${C.pink}55`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🚪</span>
            <span>Sair</span>
          </button>
        )}
      </div>

      {/* Saudação */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, border: `1px solid ${C.teal}40`, borderRadius: 22, padding: "18px 20px", marginBottom: 18, boxShadow: "0 8px 32px rgba(0,201,177,0.1)" }}>
        <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginBottom: 5 }}>{saudacao}</div>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 5 }}>{primeiroNome ? `Olá, ${primeiroNome}!` : "Você não está sozinho"}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>O AXION apoia cada etapa do seu tratamento com cuidado, informação e gamificação!</div>
      </div>

      {/* Account Info */}
      {perfil && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.navyM}`, borderRadius: 14, padding: "10px 14px", marginBottom: 26 }}>
          <div style={{ fontSize: 11, color: C.muted }}>Código: <strong style={{ color: C.teal, letterSpacing: 1 }}>{perfil.codigo}</strong></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => onNav("paciente")} style={{ background: "none", border: "none", color: C.muted, fontSize: 11, fontWeight: 700, textDecoration: "underline" }}>gerenciar conta →</button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>SELECIONE SUA ÁREA</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {areasFiltradas.map((a, i) => (
          <button key={a.id} onClick={() => onNav(a.id)} style={{
            background: `${a.color}12`, border: `2px solid ${a.color}44`,
            borderRadius: 20, padding: "18px 14px", textAlign: "left",
            animation: `rise 0.4s ease ${i * 0.07}s both`, transition: "all 0.2s",
            boxShadow: `0 4px 18px ${a.color}15`
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: a.color, marginBottom: 2 }}>{a.label}</div>
            <div style={{ fontSize: 10, color: C.muted }}>{a.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
