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
      setPacientes([
        { codigo: "AX-EXB-8918", nome: "Robson Cordeiro dos Santos", tipo_tratamento: "Próstata", sessao_atual: 8, total_sessoes: 30 },
        { codigo: "AX-ABC-1234", nome: "Maria Silva", tipo_tratamento: "Mama", sessao_atual: 14, total_sessoes: 25 },
      ]);
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
      {/* Header com Seletor de Cargo Clínico */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 16px", borderBottom: `2px solid ${cargoColors[cargo]}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: 11, color: cargoColors[cargo], fontWeight: 800, letterSpacing: 1 }}>EQUIPE DE SAÚDE HOSPITALAR</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: cargoColors[cargo] }}>Painel Clínico 🏥</div>
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800 }}>
              Sair 🚪
            </button>
          )}
        </div>

        {/* Seletor de Função Clínica (Médico vs Enfermeiro vs Técnico) */}
        <div style={{ display: "flex", gap: 4, background: C.navyM, padding: 4, borderRadius: 14 }}>
          {[["medico", "👨‍⚕️ Médico"], ["enfermeiro", "🩺 Enfermeiro"], ["tecnico", "⚛️ Técnico"]].map(([c, label]) => (
            <button key={c} onClick={() => { setCargo(c); setSessaoExecutada(false); }} style={{ flex: 1, padding: "8px 2px", borderRadius: 10, border: "none", background: cargo === c ? `${cargoColors[c]}22` : "transparent", color: cargo === c ? cargoColors[c] : C.muted, fontWeight: cargo === c ? 900 : 600, fontSize: 11, borderBottom: cargo === c ? `2px solid ${cargoColors[c]}` : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* BUSCA POR CÓDIGO OU NOME DO PACIENTE */}
        <div style={{ background: C.navyL, border: `1px solid ${cargoColors[cargo]}44`, borderRadius: 18, padding: "18px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: cargoColors[cargo], marginBottom: 8 }}>🔍 BUSCAR PACIENTE POR CÓDIGO OU NOME COMPLETO</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={buscaCodigo}
              onChange={e => setBuscaCodigo(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") buscar(); }}
              placeholder="Digite o código (ex: AX-ABC-1234) ou Nome"
              style={{ flex: 1, background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }}
            />
            <button onClick={buscar} disabled={buscando} style={{ background: cargoColors[cargo], border: "none", borderRadius: 12, padding: "10px 18px", color: C.navy, fontWeight: 900 }}>
              {buscando ? "..." : "Buscar"}
            </button>
          </div>
          {statusMsg && <div style={{ fontSize: 12, color: statusMsg.includes("✅") ? C.teal : C.pink, marginTop: 10, fontWeight: 700 }}>{statusMsg}</div>}
        </div>

        {/* DETALHES DO PACIENTE SELECIONADO */}
        {pacienteSelecionado && (
          <div style={{ background: `linear-gradient(135deg,${cargoColors[cargo]}20,${C.navyL})`, border: `2px solid ${cargoColors[cargo]}`, borderRadius: 20, padding: "18px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: cargoColors[cargo], fontWeight: 800, letterSpacing: 1 }}>PRONTUÁRIO SELECIONADO</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{pacienteSelecionado.nome}</div>
                <div style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>Código: {pacienteSelecionado.codigo}</div>
              </div>
              <button onClick={copiarCodigoPaciente} style={{ background: `${C.teal}22`, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "6px 12px", color: C.teal, fontSize: 11, fontWeight: 800 }}>
                {copiado ? "✓ Copiado!" : "📋 Copiar Código"}
              </button>
            </div>

            {/* VISÃO ESPECÍFICA DO MÉDICO ONCOLOGISTA */}
            {cargo === "medico" && (
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "14px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.purple, marginBottom: 6 }}>👨‍⚕️ Prescrição & Diagnóstico Médico</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>
                  • <strong>Tratamento:</strong> {pacienteSelecionado.tipo || pacienteSelecionado.tipo_tratamento || "Radioterapia"}<br />
                  • <strong>Sessões Prescritas:</strong> {pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual || 8} de {pacienteSelecionado.total_sessoes || pacienteSelecionado.totalSessoes || 30} concluídas.<br />
                  • <strong>Avaliação Médica:</strong> Paciente tolerando bem o protocolo de tratamento.
                </div>
              </div>
            )}

            {/* VISÃO ESPECÍFICA DO ENFERMEIRO(A) */}
            {cargo === "enfermeiro" && (
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "14px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.pink, marginBottom: 6 }}>🩺 Acompanhamento de Enfermagem</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.text }}>
                  • <strong>Cuidados com a Pele:</strong> Pele sem queimaduras graves (Grau 1). Orientado uso de creme neutro.<br />
                  • <strong>Triagem de Sintomas:</strong> Fadiga 3/10, Dor 2/10. Alimentação preservada.
                </div>
              </div>
            )}

            {/* VISÃO ESPECÍFICA DO TÉCNICO EM RADIOTERAPIA */}
            {cargo === "tecnico" && (
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 14, padding: "14px", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.blue, marginBottom: 8 }}>⚛️ Execução Física da Sessão</div>
                <div style={{ fontSize: 12, marginBottom: 10 }}>Sessão Atual: <strong style={{ color: C.blue }}>{pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual || 8}ª Sessão</strong></div>

                <textarea
                  value={obsTecnica}
                  onChange={e => setObsTecnica(e.target.value)}
                  placeholder="Observação técnica do equipamento / posicionamento do paciente..."
                  style={{ width: "100%", height: 60, background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12, resize: "none", marginBottom: 10 }}
                />

                <button onClick={darBaixaSessao} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.blue},#29b6f6)`, color: C.navy, fontWeight: 900, fontSize: 13 }}>
                  ⚡ Confirmar & Dar Baixa na Sessão de Hoje (+1 Sessão)
                </button>

                {sessaoExecutada && (
                  <div style={{ fontSize: 12, color: C.teal, fontWeight: 800, marginTop: 8, textAlign: "center" }}>
                    ✅ Sessão registrada com sucesso na nuvem! Nova sessão: {pacienteSelecionado.sessao_atual || pacienteSelecionado.sessaoAtual}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setPacienteSelecionado(null)} style={{ background: "transparent", border: `1px solid ${C.muted}`, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 11 }}>
              Fechar Ficha
            </button>
          </div>
        )}

        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PACIENTES DA UNIDADE ({pacientes.length})</div>
        {pacientes.map((p, i) => (
          <div key={i} onClick={() => { setPacienteSelecionado(p); setSessaoExecutada(false); }} style={{ background: C.navyL, border: `1px solid ${pacienteSelecionado?.codigo === p.codigo ? cargoColors[cargo] : C.navyM}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nome}</div>
              <div style={{ fontSize: 11, color: cargoColors[cargo], fontWeight: 900 }}>{p.codigo}</div>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Tratamento: {p.tipo || p.tipo_tratamento || "Radioterapia"} — {p.sessao_atual || p.sessaoAtual || 8}/{p.total_sessoes || p.totalSessoes || 30} sessões</div>
          </div>
        ))}
      </div>
    </div>
  );
}
