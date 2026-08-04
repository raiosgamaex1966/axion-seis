import React, { useState } from 'react';
import { C } from '../constants/theme';

export function LandingPage({ onEntrarSistema, onIrSuperAdmin }) {
  const [planoSelecionado, setPlanoSelecionado] = useState("pro");

  return (
    <div style={{ background: C.navy, color: C.text, minHeight: "100vh", fontFamily: "'Nunito',sans-serif" }}>
      {/* 1. NAVBAR / HEADER INSTITUCIONAL */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10, 17, 30, 0.85)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.navyM}`, padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="34" height="34" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="8" fill={C.teal} />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.teal} strokeWidth="2" fill="none" opacity="0.9" />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 40 40)" />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.purple} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 40 40)" />
          </svg>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 2, background: `linear-gradient(135deg,${C.teal},${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXION</div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>RADIOTERAPIA HUMANIZADA</div>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a href="#plataforma" style={{ color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Plataforma</a>
          <a href="#recursos" style={{ color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Recursos</a>
          <a href="#planos" style={{ color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Planos SaaS</a>
          
          <button onClick={onEntrarSistema} style={{
            background: `linear-gradient(135deg,${C.teal},${C.blue})`,
            border: "none", borderRadius: 12, padding: "10px 18px",
            color: C.navy, fontWeight: 900, fontSize: 13, cursor: "pointer",
            boxShadow: `0 4px 16px ${C.teal}33`, transition: "all 0.2s"
          }}>
            🔑 Entrar no Sistema →
          </button>
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.teal}18`, border: `1px solid ${C.teal}44`, borderRadius: 99, padding: "6px 16px", marginBottom: 24, fontSize: 12, color: C.teal, fontWeight: 800 }}>
          <span>✨ Plataforma SaaS & PWA de Oncologia</span>
          <span>•</span>
          <span>Android, iOS & Web</span>
        </div>

        <h1 style={{ fontSize: 46, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.25, marginBottom: 20, background: `linear-gradient(135deg,#ffffff,${C.teal})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Transforme a Radioterapia com<br />Inteligência, Cuidado e Humanização
        </h1>

        <p style={{ fontSize: 18, color: C.muted, maxWidth: 760, margin: "0 auto 36px", lineHeight: 1.7 }}>
          O ecossistema completo que conecta Administradores de Hospitais, Médicos Oncologistas, Enfermeiros, Técnicos em Radioterapia e Pacientes em uma única jornada humanizada e segura.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 60 }}>
          <button onClick={onEntrarSistema} style={{ background: `linear-gradient(135deg,${C.teal},${C.blue})`, border: "none", borderRadius: 14, padding: "16px 32px", color: C.navy, fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: `0 8px 30px ${C.teal}44` }}>
            🚀 Acessar Plataforma AXION
          </button>

          <a href="#recursos" style={{ background: C.navyL, border: `1.5px solid ${C.navyM}`, borderRadius: 14, padding: "16px 28px", color: C.text, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            📖 Ver Como Funciona
          </a>
        </div>

        {/* MOCKUP INTERATIVO DE CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, textAlign: "left" }}>
          <div style={{ background: C.navyL, border: `1.5px solid ${C.teal}44`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🧑</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.teal, marginBottom: 4 }}>App do Paciente</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Acesso por Código Único, diário de sintomas humanizado, gamificação e IA acolhedora 24/7.</div>
          </div>

          <div style={{ background: C.navyL, border: `1.5px solid ${C.purple}44`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏢</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.purple, marginBottom: 4 }}>Admin da Unidade</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Onboarding de profissionais com senhas provisórias e envio imediato via WhatsApp Web.</div>
          </div>

          <div style={{ background: C.navyL, border: `1.5px solid ${C.blue}44`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏥</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.blue, marginBottom: 4 }}>Equipe Clínica</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Prontuário, confirmação e baixa de sessão de radioterapia com 1 toque no celular ou tablet.</div>
          </div>

          <div style={{ background: C.navyL, border: `1.5px solid ${C.gold}44`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👑</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, marginBottom: 4 }}>Super Admin SaaS</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>Gestão multi-tenant global de contratos, faturamento exato por hospital e métricas da nuvem.</div>
          </div>
        </div>
      </section>

      {/* 3. RECURSOS EM DESTAQUE (ECOSSISTEMA) */}
      <section id="recursos" style={{ padding: "60px 24px", background: C.navyL, borderTop: `1px solid ${C.navyM}`, borderBottom: `1px solid ${C.navyM}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>TECNOLOGIA & HUMANIZAÇÃO</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>Por que hospitais e clínicas escolhem o AXION?</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 20, padding: "24px" }}>
              <div style={{ fontSize: 24, color: C.teal, marginBottom: 12 }}>🔒 Segurança LGPD & Primeiro Acesso</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                Todas as credenciais de administradores e médicos são geradas com senhas provisórias. O sistema exige a troca obrigatória de senha no primeiro login, garantindo total conformidade legal.
              </p>
            </div>

            <div style={{ background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 20, padding: "24px" }}>
              <div style={{ fontSize: 24, color: C.blue, marginBottom: 12 }}>💬 Compartilhamento com 1 Clique</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                Envio direto de credenciais e cartões de código único de pacientes para o WhatsApp Web do gestor ou paciente sem complicações.
              </p>
            </div>

            <div style={{ background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 20, padding: "24px" }}>
              <div style={{ fontSize: 24, color: C.purple, marginBottom: 12 }}>🤖 IA Empática com Fallback Multi-Provedor</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
                Assistente de Inteligência Artificial treinado para responder dúvidas do tratamento com acolhimento 24 horas, respaldado por motor de alta disponibilidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLANOS SAAS CONTRATANTES */}
      <section id="planos" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>PLANOS PARA INSTITUIÇÕES DE SAÚDE</div>
          <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>Escolha o plano ideal para seu Hospital ou Clínica</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* Plano 1 */}
          <div style={{ background: C.navyL, border: `1.5px solid ${C.navyM}`, borderRadius: 24, padding: "30px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Gratuito Starter</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Para pequenas unidades em teste</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.teal, marginBottom: 20 }}>R$ 0 <span style={{ fontSize: 13, color: C.muted }}>/mês</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px", fontSize: 13, color: C.muted, lineHeight: 2 }}>
              <li>✓ Até 50 pacientes ativos</li>
              <li>✓ 1 Administrador de Unidade</li>
              <li>✓ Painel Clínico completo</li>
              <li>✓ Suporte via e-mail</li>
            </ul>
            <button onClick={onEntrarSistema} style={{ marginTop: "auto", background: C.navyM, border: "none", borderRadius: 12, padding: "12px", color: C.text, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Começar Agora
            </button>
          </div>

          {/* Plano 2 Destaque */}
          <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, border: `2px solid ${C.gold}`, borderRadius: 24, padding: "30px 24px", display: "flex", flexDirection: "column", boxShadow: `0 8px 32px ${C.gold}22` }}>
            <div style={{ display: "inline-block", background: C.gold, color: C.navy, fontSize: 10, fontWeight: 900, padding: "3px 10px", borderRadius: 99, alignSelf: "flex-start", marginBottom: 10 }}>MAIS POPULAR</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.gold, marginBottom: 4 }}>Hospitalar Pro</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Para centros oncológicos e hospitais</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.gold, marginBottom: 20 }}>Sob Consulta <span style={{ fontSize: 13, color: C.muted }}>/por leito</span></div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px", fontSize: 13, color: C.text, lineHeight: 2 }}>
              <li>✓ Até 500 pacientes ativos</li>
              <li>✓ Equipe médica ilimitada</li>
              <li>✓ WhatsApp Web integrado</li>
              <li>✓ Suporte prioritário 24/7</li>
            </ul>
            <button onClick={onEntrarSistema} style={{ marginTop: "auto", background: `linear-gradient(135deg,${C.gold},${C.orange})`, border: "none", borderRadius: 12, padding: "14px", color: C.navy, fontWeight: 900, fontSize: 14, cursor: "pointer" }}>
              🚀 Contratar Hospitalar Pro
            </button>
          </div>

          {/* Plano 3 */}
          <div style={{ background: C.navyL, border: `1.5px solid ${C.navyM}`, borderRadius: 24, padding: "30px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>Enterprise Master</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Para redes hospitalares e secretarias</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: C.purple, marginBottom: 20 }}>Personalizado</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px", fontSize: 13, color: C.muted, lineHeight: 2 }}>
              <li>✓ Pacientes ilimitados</li>
              <li>✓ Múltiplas unidades hospitalares</li>
              <li>✓ Servidor dedicado & SLA de 99.9%</li>
              <li>✓ Gerente de conta exclusivo</li>
            </ul>
            <button onClick={onEntrarSistema} style={{ marginTop: "auto", background: C.navyM, border: "none", borderRadius: 12, padding: "12px", color: C.text, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Falar com Consultor
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.navyM}`, padding: "40px 24px", background: "rgba(0,0,0,0.3)", textAlign: "center", fontSize: 12, color: C.muted }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.teal }}>AXION RADIOTERAPIA</div>
        </div>
        <p style={{ maxWidth: 600, margin: "0 auto 16px", lineHeight: 1.6 }}>
          AXION® Plataforma de Apoio ao Tratamento Radioterápico. Este aplicativo tem caráter de acompanhamento, educação e acolhimento. As orientações não substituem a consulta com seu médico oncologista.
        </p>
        <div>© 2026 AXION. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
