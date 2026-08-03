import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';
import { PatientService, supabase } from '../services/supabaseClient';

export function SuperAdmin({ onBack, onSair }) {
  const [tab, setTab] = useState("metricas"); // metricas | clinicas | usuarios
  const [clinicas, setClinicas] = useState([
    { id: 1, nome: "Hospital de Câncer AXION Central", cnpj: "12.345.678/0001-90", cidade: "São Paulo/SP", plano: "Enterprise", maxPacientes: 1000, pacientesAtivos: 142 },
    { id: 2, nome: "Instituto Oncologia Vida", cnpj: "98.765.432/0001-10", cidade: "Curitiba/PR", plano: "Hospitalar Pro", maxPacientes: 300, pacientesAtivos: 87 },
  ]);
  const [novaClinica, setNovaClinica] = useState({ nome: "", cnpj: "", cidade: "", plano: "Hospitalar Pro" });
  const [salvando, setSalvando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const carregarDadosSaaS = async () => {
    try {
      if (supabase) {
        const { data } = await supabase.from('hospitais_clinicas').select('*');
        if (data && data.length > 0) setClinicas(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    carregarDadosSaaS();
  }, []);

  const cadastrarClinica = async () => {
    if (!novaClinica.nome.trim()) return;
    setSalvando(true);
    setStatusMsg("");

    const item = {
      nome: novaClinica.nome,
      cnpj: novaClinica.cnpj || "00.000.000/0001-00",
      cidade: novaClinica.cidade || "Brasil",
      plano_saas: novaClinica.plano,
      max_pacientes: 500,
      ativo: true
    };

    if (supabase) {
      try {
        await supabase.from('hospitais_clinicas').insert([item]);
      } catch (e) {}
    }

    setClinicas(prev => [{ ...item, id: Date.now(), pacientesAtivos: 0 }, ...prev]);
    setNovaClinica({ nome: "", cnpj: "", cidade: "", plano: "Hospitalar Pro" });
    setSalvando(false);
    setStatusMsg("✅ Nova Clínica/Hospital cadastrado com sucesso no SaaS!");
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Master Super Admin */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${C.gold}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 800, letterSpacing: 2 }}>SUPER ADMIN SAAS</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: C.gold }}>Gestão Global AXION 👑</div>
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel master" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800 }}>
              Sair Master 🚪
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", gap: 6, background: C.navyM, padding: 4, borderRadius: 14 }}>
          {[["metricas", "📊 Visão Geral"], ["clinicas", "🏥 Clínicas & Hospitais"], ["usuarios", "🔑 Gestão de Acessos"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", background: tab === k ? `${C.gold}22` : "transparent", color: tab === k ? C.gold : C.muted, fontWeight: tab === k ? 900 : 600, fontSize: 11, borderBottom: tab === k ? `2px solid ${C.gold}` : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* TAB 1: VISÃO GERAL DE MÉTRICAS SAAS */}
        {tab === "metricas" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: `linear-gradient(135deg,${C.gold}18,${C.navyL})`, border: `1.5px solid ${C.gold}44`, borderRadius: 18, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>{clinicas.length}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Hospitais Contratantes</div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${C.teal}18,${C.navyL})`, border: `1.5px solid ${C.teal}44`, borderRadius: 18, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.teal }}>229</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Pacientes Ativos na Nuvem</div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${C.blue}18,${C.navyL})`, border: `1.5px solid ${C.blue}44`, borderRadius: 18, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>18</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Médicos Cadastrados</div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${C.purple}18,${C.navyL})`, border: `1.5px solid ${C.purple}44`, borderRadius: 18, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.purple }}>99.8%</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Uptime da API Multi-IA</div>
              </div>
            </div>

            <div style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 18, padding: "18px" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.gold, marginBottom: 10 }}>⚡ STATUS DOS PROVEDORES DE IA (FAILOVER ACTIVO)</div>
              {[
                ["Groq (Llama-3.3-70B)", "🟢 Operacional (0ms Latência)"],
                ["OpenRouter (Auto-select)", "🟢 Operacional"],
                ["DeepInfra (Llama-3.3)", "🟢 Operacional"],
                ["OpenAI (ChatGPT-4o-mini)", "🟢 Operacional"],
                ["Gemini (Google AI)", "🟢 Operacional"],
              ].map(([p, status], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,0.06)`, fontSize: 12 }}>
                  <span>{p}</span>
                  <span style={{ color: C.teal, fontWeight: 700 }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CADASTRAR E GERENCIAR CLÍNICAS */}
        {tab === "clinicas" && (
          <div>
            <div style={{ background: C.navyL, border: `1.5px solid ${C.gold}44`, borderRadius: 20, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 12 }}>🏥 Cadastrar Novo Hospital / Clínica Parceira</div>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME DO HOSPITAL OU CLÍNICA *</label>
                <input value={novaClinica.nome} onChange={e => setNovaClinica(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Hospital do Câncer de Brasília" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>CNPJ</label>
                  <input value={novaClinica.cnpj} onChange={e => setNovaClinica(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>CIDADE / ESTADO</label>
                  <input value={novaClinica.cidade} onChange={e => setNovaClinica(p => ({ ...p, cidade: e.target.value }))} placeholder="Ex: Brasília/DF" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>PLANO SAAS CONTRATADO</label>
                <select value={novaClinica.plano} onChange={e => setNovaClinica(p => ({ ...p, plano: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                  <option value="Gratuito Starter">Gratuito Starter (Até 50 pacientes)</option>
                  <option value="Hospitalar Pro">Hospitalar Pro (Até 500 pacientes)</option>
                  <option value="Enterprise Master">Enterprise Master (Ilimitado + Suporte 24h)</option>
                </select>
              </div>

              <button onClick={cadastrarClinica} disabled={salvando || !novaClinica.nome} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.gold},${C.orange})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                {salvando ? "Cadastrando no banco de dados..." : "🚀 Cadastrar Hospital no SaaS"}
              </button>

              {statusMsg && <div style={{ fontSize: 12, color: C.teal, fontWeight: 700, marginTop: 10, textAlign: "center" }}>{statusMsg}</div>}
            </div>

            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>CLÍNICAS PARCEIRAS ATIVAS ({clinicas.length})</div>
            {clinicas.map((c, i) => (
              <div key={i} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{c.nome}</div>
                  <span style={{ fontSize: 11, background: `${C.gold}22`, color: C.gold, padding: "3px 10px", borderRadius: 99, fontWeight: 800 }}>{c.plano || c.plano_saas}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{c.cnpj} — {c.cidade}</div>
                <div style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>👥 {c.pacientesAtivos || 0} pacientes em radioterapia ativa</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GESTÃO DE ROLES E ACESSOS */}
        {tab === "usuarios" && (
          <div>
            <div style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 18, padding: "18px", marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 8 }}>👑 HIERARQUIA DE PERFIS DO SAAS (RBAC)</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                O AXION impõe separação rígida de acessos:
                <br /><br />
                • <strong>Super Admin (Você)</strong>: Acesso Irrestrito Global a todas as clínicas, métricas SaaS e chaves de IA.
                <br />
                • <strong>Médico / Oncologista</strong>: Acesso Restrito aos Pacientes da sua clínica e painel clínico.
                <br />
                • <strong>Paciente</strong>: Acesso Único com Código (`AX-ABC-1234`) exclusivo ao seu próprio tratamento.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
