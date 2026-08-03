import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { PatientService, supabase } from '../services/supabaseClient';

export function SuperAdmin({ onBack, onSair }) {
  const [tab, setTab] = useState("metricas"); // metricas | clinicas | usuarios
  const [clinicas, setClinicas] = useState([
    { id: 1, nome: "Hospital de Câncer AXION Central", cnpj: "12.345.678/0001-90", cidade: "São Paulo/SP", plano_saas: "Enterprise", email_admin: "admin.sp@axion.com.br", senha_provisoria: "AxionSp@2026", maxPacientes: 1000, pacientesAtivos: 142 },
    { id: 2, nome: "Instituto Oncologia Vida", cnpj: "98.765.432/0001-10", cidade: "Curitiba/PR", plano_saas: "Hospitalar Pro", email_admin: "admin.vida@hospital.com", senha_provisoria: "VidaPro@2026", maxPacientes: 300, pacientesAtivos: 87 },
  ]);
  
  const [novaClinica, setNovaClinica] = useState({ 
    nome: "", 
    cnpj: "", 
    cidade: "", 
    plano: "Hospitalar Pro",
    emailAdmin: "",
    senhaProvisoria: "HospAdmin@" + Math.floor(1000 + Math.random() * 9000)
  });
  
  const [clinicaCadastrada, setClinicaCadastrada] = useState(null);
  const [copiadoClinica, setCopiadoClinica] = useState(false);
  const [salvando, setSalvando] = useState(false);

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
    if (!novaClinica.nome.trim() || !novaClinica.emailAdmin.trim()) return;
    setSalvando(true);

    const item = {
      id: Date.now().toString(),
      nome: novaClinica.nome.trim(),
      cnpj: novaClinica.cnpj || "00.000.000/0001-00",
      cidade: novaClinica.cidade || "Brasil",
      plano_saas: novaClinica.plano,
      email_admin: novaClinica.emailAdmin.toLowerCase().trim(),
      senha_provisoria: novaClinica.senhaProvisoria,
      primeiro_acesso: true,
      max_pacientes: 500,
      ativo: true
    };

    if (supabase) {
      try {
        await supabase.from('hospitais_clinicas').insert([item]);
      } catch (e) {}
    }

    // Salva localmente para simulação
    const todosHospitais = JSON.parse(localStorage.getItem('axion_hospitais') || '{}');
    todosHospitais[item.email_admin] = item;
    todosHospitais[item.nome.toLowerCase()] = item;
    localStorage.setItem('axion_hospitais', JSON.stringify(todosHospitais));

    setClinicas(prev => [item, ...prev]);
    setClinicaCadastrada(item);
    setNovaClinica({ 
      nome: "", 
      cnpj: "", 
      cidade: "", 
      plano: "Hospitalar Pro",
      emailAdmin: "",
      senhaProvisoria: "HospAdmin@" + Math.floor(1000 + Math.random() * 9000)
    });
    setSalvando(false);
  };

  const copiarCredenciaisClinica = () => {
    if (!clinicaCadastrada) return;
    const texto = `🏥 *Dados de Acesso do Administrador da Unidade AXION*\n\nUnidade: ${clinicaCadastrada.nome}\n• *E-mail de Login:* ${clinicaCadastrada.email_admin}\n• *Senha Provisória:* ${clinicaCadastrada.senha_provisoria}\n\nNo primeiro acesso, você deverá cadastrar sua nova senha pessoal.`;
    navigator.clipboard.writeText(texto);
    setCopiadoClinica(true);
    setTimeout(() => setCopiadoClinica(false), 3000);
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
            <button key={k} onClick={() => { setTab(k); setClinicaCadastrada(null); }} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", background: tab === k ? `${C.gold}22` : "transparent", color: tab === k ? C.gold : C.muted, fontWeight: tab === k ? 900 : 600, fontSize: 11, borderBottom: tab === k ? `2px solid ${C.gold}` : "none" }}>
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
            </div>
          </div>
        )}

        {/* TAB 2: CADASTRAR E GERENCIAR CLÍNICAS */}
        {tab === "clinicas" && (
          <div>
            {!clinicaCadastrada ? (
              <div style={{ background: C.navyL, border: `1.5px solid ${C.gold}44`, borderRadius: 20, padding: "20px", marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 12 }}>🏥 Cadastrar Novo Hospital & Administrador</div>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME DA UNIDADE HOSPITALAR *</label>
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

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.gold, fontWeight: 800, display: "block", marginBottom: 4 }}>E-MAIL DO ADMINISTRADOR DO HOSPITAL *</label>
                  <input value={novaClinica.emailAdmin} onChange={e => setNovaClinica(p => ({ ...p, emailAdmin: e.target.value }))} placeholder="admin@hospitalbrasilia.com.br" style={{ width: "100%", background: C.navyM, border: `1.5px solid ${C.gold}55`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: C.gold, fontWeight: 800, display: "block", marginBottom: 4 }}>🔑 SENHA PROVISÓRIA DO ADMIN DA UNIDADE</label>
                  <input value={novaClinica.senhaProvisoria} onChange={e => setNovaClinica(p => ({ ...p, senhaProvisoria: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1.5px solid ${C.gold}55`, borderRadius: 12, padding: "10px 14px", color: C.gold, fontSize: 14, fontWeight: 800 }} />
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>O gestor do hospital será obrigado a trocar a senha no 1º acesso.</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>PLANO SAAS CONTRATADO</label>
                  <select value={novaClinica.plano} onChange={e => setNovaClinica(p => ({ ...p, plano: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                    <option value="Gratuito Starter">Gratuito Starter (Até 50 pacientes)</option>
                    <option value="Hospitalar Pro">Hospitalar Pro (Até 500 pacientes)</option>
                    <option value="Enterprise Master">Enterprise Master (Ilimitado + Suporte 24h)</option>
                  </select>
                </div>

                <button onClick={cadastrarClinica} disabled={salvando || !novaClinica.nome || !novaClinica.emailAdmin} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.gold},${C.orange})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                  {salvando ? "Cadastrando..." : "🚀 Cadastrar Hospital & Liberar Acesso Gestor"}
                </button>
              </div>
            ) : (
              <div style={{ background: C.navyL, border: `2px solid ${C.gold}`, borderRadius: 20, padding: "24px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.gold, marginBottom: 4 }}>Hospital & Credenciais Cadastradas!</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Envie os dados de acesso ao Administrador do Hospital. Ele cadastrará a nova senha pessoal no primeiro login.</div>

                <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.gold}44`, borderRadius: 16, padding: "16px", textAlign: "left", marginBottom: 16, fontSize: 12, lineHeight: 1.7 }}>
                  <div><strong>Unidade:</strong> {clinicaCadastrada.nome}</div>
                  <div><strong>Login Admin:</strong> {clinicaCadastrada.email_admin}</div>
                  <div><strong>Senha Provisória:</strong> <span style={{ color: C.gold, fontWeight: 800 }}>{clinicaCadastrada.senha_provisoria}</span></div>
                  <div style={{ color: C.teal, marginTop: 4, fontWeight: 700 }}>🔒 Requer troca de senha no 1º Acesso.</div>
                </div>

                <button onClick={copiarCredenciaisClinica} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.gold}`, background: copiadoClinica ? `${C.gold}22` : "transparent", color: C.gold, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>
                  {copiadoClinica ? "✓ Credenciais Copiadas!" : "📋 Copiar Dados de Acesso do Admin"}
                </button>

                <button onClick={() => setClinicaCadastrada(null)} style={{ background: "transparent", border: `1px solid ${C.muted}`, borderRadius: 12, padding: "10px 20px", color: C.muted, fontWeight: 700, fontSize: 12 }}>
                  ← Cadastrar outro hospital
                </button>
              </div>
            )}

            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>CLÍNICAS PARCEIRAS ATIVAS ({clinicas.length})</div>
            {clinicas.map((c, i) => (
              <div key={i} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{c.nome}</div>
                  <span style={{ fontSize: 11, background: `${C.gold}22`, color: C.gold, padding: "3px 10px", borderRadius: 99, fontWeight: 800 }}>{c.plano_saas || c.plano}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>CNPJ: {c.cnpj} — {c.cidade}</div>
                <div style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>🔑 Admin: {c.email_admin || "admin@hospital.com"}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GESTÃO DE ROLES E ACESSOS */}
        {tab === "usuarios" && (
          <div>
            <div style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 18, padding: "18px" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.gold, marginBottom: 8 }}>👑 HIERARQUIA DE PERFIS DO SAAS (RBAC)</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                O AXION impõe separação rígida de acessos:
                <br /><br />
                • <strong>Super Admin (Robson)</strong>: Gestão de Hospitais Contratantes.
                <br />
                • <strong>Admin da Unidade Hospitalar</strong>: Gestão de Profissionais da Unidade (Médicos, Enfermeiros, Técnicos) e Emissão de Códigos de Pacientes.
                <br />
                • <strong>Profissionais de Saúde</strong>: Prontuário, Prescrição, Triagem e Baixa de Sessões.
                <br />
                • <strong>Paciente</strong>: Acesso Único por Código.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
