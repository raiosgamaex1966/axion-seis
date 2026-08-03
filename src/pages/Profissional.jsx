import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';
import { PatientService, supabase } from '../services/supabaseClient';

export function Profissional({ onBack, onSair, userRole = "medico" }) {
  const [cargo, setCargo] = useState("medico"); // medico | enfermeiro | tecnico
  const [tab, setTab] = useState("painel");
  const [buscaCodigo, setBuscaCodigo] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Estado da execução de sessão pelo técnico
  const [sessaoExecutada, setSessaoExecutada] = useState(false);
  const [obsTecnica, setObsTecnica] = useState("");

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    const lista = await PatientService.listarPacientes();
    if (lista && lista.length > 0) {
      setPacientes(lista);
    } else {
      setPacientes([]);
    }
  };

  const buscar = async () => {
    if (!buscaCodigo.trim()) return;
    setBuscando(true);
    setStatusMsg("");
    
    // Primeiro tenta pelo Código
    const res = await PatientService.loginByCode(buscaCodigo);
    if (res.success && res.perfil) {
      setPacienteSelecionado(res.perfil);
      setStatusMsg(`✅ Paciente ${res.perfil.nome} localizado!`);
      setBuscando(false);
      return;
    }

    // Se não encontrou pelo Código, busca por Nome no Supabase
    if (supabase) {
      try {
        const { data } = await supabase.from('pacientes').select('*').ilike('nome', `%${buscaCodigo.trim()}%`).limit(1);
        if (data && data.length > 0) {
          setPacienteSelecionado(data[0]);
          setStatusMsg(`✅ Paciente ${data[0].nome} localizado pelo nome!`);
          setBuscando(false);
          return;
        }
      } catch (e) {}
    }

    setPacienteSelecionado(null);
    setStatusMsg("❌ Nenhum paciente encontrado com este código ou nome.");
    setBuscando(false);
  };

  const copiarCodigoPaciente = () => {
    if (!pacienteSelecionado) return;
    navigator.clipboard.writeText(pacienteSelecionado.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  // Função do Técnico em Radioterapia para confirmar sessão
  const darBaixaSessao = async () => {
    if (!pacienteSelecionado) return;
    const novaSessao = (pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual || 0) + 1;
    const perfilAtualizado = { ...pacienteSelecionado, sessao_atual: novaSessao, sessaoAtual: novaSessao };
    
    await PatientService.savePatient(perfilAtualizado);
    setPacienteSelecionado(perfilAtualizado);
    setSessaoExecutada(true);

    if (supabase) {
      try {
        await supabase.from('sessoes_radioterapia').insert({
          paciente_codigo: perfilAtualizado.codigo,
          tecnico_nome: "Técnico em Radioterapia",
          numero_sessao: novaSessao,
          observacao_tecnica: obsTecnica || "Sessão executada com alinhamento padrão."
        });
      } catch (e) {}
    }
  };

  const cargoColors = { medico: C.purple, enfermeiro: C.pink, tecnico: C.blue };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header do Painel Profissional */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${cargoColors[cargo]}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: 11, color: cargoColors[cargo], fontWeight: 800, letterSpacing: 2 }}>PAINEL PROFISSIONAL DA SAÚDE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>Atendimento Clínico 🏥</div>
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800 }}>
              Sair 🚪
            </button>
          )}
        </div>

        {/* Seletor de Cargo Clínico */}
        <div style={{ display: "flex", gap: 6, background: C.navyM, padding: 4, borderRadius: 14 }}>
          {[["medico", "👨‍⚕️ Oncologista"], ["enfermeiro", "🩺 Enfermeiro(a)"], ["tecnico", "⚛️ Técnico Radioterapia"]].map(([c, label]) => (
            <button key={c} onClick={() => setCargo(c)} style={{ flex: 1, padding: "8px 2px", borderRadius: 10, border: "none", background: cargo === c ? `${cargoColors[c]}22` : "transparent", color: cargo === c ? cargoColors[c] : C.muted, fontWeight: cargo === c ? 900 : 600, fontSize: 11, borderBottom: cargo === c ? `2px solid ${cargoColors[c]}` : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* BUSCA DE PACIENTE POR NOME OU CÓDIGO */}
        <div style={{ background: C.navyL, border: `1.5px solid ${cargoColors[cargo]}44`, borderRadius: 20, padding: "18px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: cargoColors[cargo], marginBottom: 8 }}>🔍 Localizar Paciente por Nome ou Código</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={buscaCodigo} onChange={e => setBuscaCodigo(e.target.value)} onKeyDown={e => { if (e.key === "Enter") buscar(); }} placeholder="Digite o Código ou Nome..." style={{ flex: 1, background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
            <button onClick={buscar} disabled={buscando} style={{ background: cargoColors[cargo], border: "none", borderRadius: 12, padding: "10px 18px", color: C.navy, fontWeight: 900, fontSize: 13 }}>
              {buscando ? "..." : "Buscar"}
            </button>
          </div>
          {statusMsg && <div style={{ fontSize: 12, marginTop: 10, textAlign: "center", color: statusMsg.includes("✅") ? C.teal : C.pink }}>{statusMsg}</div>}
        </div>

        {/* DETALHES DO PACIENTE SELECIONADO */}
        {pacienteSelecionado && (
          <div style={{ background: C.navyL, border: `2px solid ${C.teal}`, borderRadius: 20, padding: "20px", marginBottom: 20, animation: "rise 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{pacienteSelecionado.nome}</div>
                <div style={{ fontSize: 12, color: C.teal, fontWeight: 800 }}>Código: {pacienteSelecionado.codigo}</div>
              </div>
              <button onClick={copiarCodigoPaciente} style={{ background: `${C.teal}22`, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "6px 12px", color: C.teal, fontSize: 11, fontWeight: 800 }}>
                {copiado ? "✓ Copiado" : "📋 Copiar Código"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, color: C.muted, background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: 14, marginBottom: 16 }}>
              <div>Tratamento: <strong style={{ color: C.text }}>{pacienteSelecionado.tipo_tratamento || pacienteSelecionado.tipo || "Radioterapia"}</strong></div>
              <div>Sessões: <strong style={{ color: C.teal }}>{pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual || 0} de {pacienteSelecionado.total_sessoes || pacienteSelecionado.totalSessoes || 30}</strong></div>
            </div>

            {/* AÇÃO DO TÉCNICO EM RADIOTERAPIA */}
            {cargo === "tecnico" && (
              <div style={{ background: `${C.blue}15`, border: `1.5px solid ${C.blue}44`, borderRadius: 16, padding: "16px", marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.blue, marginBottom: 8 }}>⚛️ Baixa de Sessão de Radioterapia</div>
                <input value={obsTecnica} onChange={e => setObsTecnica(e.target.value)} placeholder="Observação técnica (ex: mesa 45°, dose OK)..." style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12, marginBottom: 12 }} />
                
                {sessaoExecutada ? (
                  <div style={{ background: `${C.teal}22`, color: C.teal, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, textAlign: "center" }}>
                    ✓ Sessão #{pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual} registrada com sucesso!
                  </div>
                ) : (
                  <button onClick={darBaixaSessao} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.blue},#29b6f6)`, color: C.navy, fontWeight: 900, fontSize: 13 }}>
                    ⚡ Confirmar & Baixar Sessão #{ (pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual || 0) + 1 }
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* LISTA GERAL DE PACIENTES */}
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>TODOS OS PACIENTES CADASTRADOS ({pacientes.length})</div>
        {pacientes.length === 0 ? (
          <div style={{ background: C.navyL, borderRadius: 16, padding: "20px", textAlign: "center", color: C.muted, fontSize: 13 }}>
            Nenhum paciente cadastrado para atendimento ainda.
          </div>
        ) : (
          pacientes.map((p, i) => (
            <div key={i} onClick={() => { setPacienteSelecionado(p); setSessaoExecutada(false); }} style={{ background: C.navyL, border: `1px solid ${pacienteSelecionado?.codigo === p.codigo ? C.teal : C.navyM}`, borderRadius: 16, padding: "14px", marginBottom: 10, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.tipo_tratamento || p.tipo || "Radioterapia"} — {p.sessao_atual || p.sessaoAtual || 0}/{p.total_sessoes || p.totalSessoes || 30} sessões</div>
                </div>
                <span style={{ fontSize: 11, color: C.teal, fontWeight: 800, letterSpacing: 1 }}>{p.codigo}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
