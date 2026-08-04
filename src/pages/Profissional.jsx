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
  const [unidadeProfissional, setUnidadeProfissional] = useState("");

  // Estado da execução de sessão pelo técnico
  const [sessaoExecutada, setSessaoExecutada] = useState(false);
  const [obsTecnica, setObsTecnica] = useState("");

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    // 1. Purga os 4 codigos ficticios de teste (AX-QHH-5021, AX-DAT-3036, AX-EXB-8918, AX-VUT-5966)
    await PatientService.purgeMockPatients();

    // 2. Identifica o hospital vinculado ao profissional ativo
    const hospAtivo = JSON.parse(localStorage.getItem("axion_hospital_ativo") || "null");
    let nomeHospTarget = hospAtivo?.nome;

    if (!nomeHospTarget) {
      try {
        const todosProfs = JSON.parse(localStorage.getItem("axion_profissionais") || "{}");
        const listaProfs = Object.values(todosProfs);
        if (listaProfs.length > 0) {
          nomeHospTarget = listaProfs[0].hospital_nome;
        }
      } catch (e) {}
    }

    setUnidadeProfissional(nomeHospTarget || "");

    // 3. Carrega pacientes reais
    const lista = await PatientService.listarPacientes();
    
    // 4. Isolamento estrito por Unidade Hospitalar (Se a unidade nao tiver pacientes cadastrados, exibe 0)
    if (nomeHospTarget) {
      const filtrados = lista.filter(p => {
        if (hospAtivo?.id && p.hospital_id && String(p.hospital_id) === String(hospAtivo.id)) return true;
        if (p.hospital && nomeHospTarget && p.hospital.toLowerCase().trim() === nomeHospTarget.toLowerCase().trim()) return true;
        return false;
      });
      setPacientes(filtrados);
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
    setStatusMsg("❌ Nenhum paciente localizado com este código ou nome.");
    setBuscando(false);
  };

  const darBaixaSessao = async () => {
    if (!pacienteSelecionado) return;
    const atual = parseInt(pacienteSelecionado.sessaoAtual || pacienteSelecionado.sessao_atual || 0);
    const total = parseInt(pacienteSelecionado.totalSessoes || pacienteSelecionado.total_sessoes || 30);
    
    if (atual >= total) {
      setStatusMsg("⚠️ Este paciente já concluiu todas as sessões do tratamento!");
      return;
    }

    const novaSessao = atual + 1;
    const atualizado = {
      ...pacienteSelecionado,
      sessaoAtual: novaSessao,
      sessao_atual: novaSessao,
      ultimaObsTecnica: obsTecnica || "Sessão realizada normalmente sem intercorrências."
    };

    await PatientService.savePatient(atualizado);
    setPacienteSelecionado(atualizado);
    setSessaoExecutada(true);
    setStatusMsg(`🎉 Sessão #${novaSessao} confirmada e gravada no prontuário!`);
    carregarPacientes();
    setTimeout(() => setSessaoExecutada(false), 4000);
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const limparDadosTestesFicticios = async () => {
    await PatientService.purgeMockPatients();
    setPacientes([]);
    setPacienteSelecionado(null);
    setStatusMsg("🧹 Registros fictícios limpos com sucesso.");
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Clínico com Nome da Unidade */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${C.blue}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 800, letterSpacing: 1.5 }}>PAINEL PROFISSIONAL DA SAÚDE</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: C.blue, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Atendimento Clínico 🏥
            </div>
            {unidadeProfissional && <div style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>{unidadeProfissional}</div>}
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              Sair 🚪
            </button>
          )}
        </div>

        {/* Seletor de Cargo do Profissional */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, background: C.navyM, padding: 4, borderRadius: 14 }}>
          {[
            ["medico", "👨‍⚕️ Oncologista"],
            ["enfermeiro", "🩺 Enfermeiro(a)"],
            ["tecnico", "⚛️ Técnico Radioterapia"]
          ].map(([k, label]) => (
            <button key={k} onClick={() => setCargo(k)} style={{ padding: "8px 2px", borderRadius: 10, border: "none", background: cargo === k ? `${C.blue}22` : "transparent", color: cargo === k ? C.blue : C.muted, fontWeight: cargo === k ? 900 : 600, fontSize: 11, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* BUSCADOR DE PACIENTES */}
        <div style={{ background: C.navyL, border: `1.5px solid ${C.blue}33`, borderRadius: 20, padding: "18px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.blue, marginBottom: 8 }}>🔍 Localizar Paciente por Nome ou Código</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={buscaCodigo} onChange={e => setBuscaCodigo(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') buscar(); }} placeholder="Digite o Código ou Nome..." style={{ flex: 1, background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 13 }} />
            <button onClick={buscar} disabled={buscando} style={{ background: `linear-gradient(135deg,${C.blue},#29b6f6)`, border: "none", borderRadius: 12, padding: "0 20px", color: C.navy, fontWeight: 900, fontSize: 13 }}>
              {buscando ? "..." : "Buscar"}
            </button>
          </div>
          {statusMsg && <div style={{ fontSize: 12, marginTop: 10, textAlign: "center", color: statusMsg.startsWith('✅') || statusMsg.startsWith('🎉') ? C.teal : C.pink }}>{statusMsg}</div>}
        </div>

        {/* PACIENTE SELECIONADO / PRONTUÁRIO CLÍNICO */}
        {pacienteSelecionado ? (
          <div style={{ background: C.navyL, border: `2px solid ${C.teal}`, borderRadius: 24, padding: "24px", marginBottom: 20, animation: "rise 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{pacienteSelecionado.nome}</div>
                <div style={{ fontSize: 12, color: C.teal, fontWeight: 800 }}>Código: {pacienteSelecionado.codigo}</div>
              </div>
              <button onClick={() => setPacienteSelecionado(null)} style={{ background: C.navyM, border: "none", borderRadius: 8, padding: "6px 12px", color: C.muted, fontSize: 11, fontWeight: 700 }}>✕ Fechar Prontuário</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: C.navyM, borderRadius: 16, padding: "14px", marginBottom: 16, fontSize: 12 }}>
              <div><span style={{ color: C.muted }}>Tratamento:</span> <strong>{pacienteSelecionado.tipo || pacienteSelecionado.tipo_tratamento}</strong></div>
              <div><span style={{ color: C.muted }}>Idade / Sexo:</span> <strong>{pacienteSelecionado.idade} anos ({pacienteSelecionado.sexo})</strong></div>
              <div><span style={{ color: C.muted }}>Médico Resp:</span> <strong>{pacienteSelecionado.medico || pacienteSelecionado.medico_responsavel || "Dr. Oncologista"}</strong></div>
              <div><span style={{ color: C.muted }}>Hospital:</span> <strong>{pacienteSelecionado.hospital || "Hospital AXION"}</strong></div>
            </div>

            {/* BARRA DE PROGRESSO DE SESSÕES */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                <span>Progresso da Radioterapia</span>
                <span style={{ color: C.teal }}>{pacienteSelecionado.sessaoAtual || pacienteSelecionado.sessao_atual || 0} de {pacienteSelecionado.totalSessoes || pacienteSelecionado.total_sessoes || 30} Sessões</span>
              </div>
              <div style={{ height: 10, background: C.navyM, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, width: `${Math.min(100, (((pacienteSelecionado.sessaoAtual || pacienteSelecionado.sessao_atual || 0) / (pacienteSelecionado.totalSessoes || pacienteSelecionado.total_sessoes || 30)) * 100))}%`, transition: "all 0.5s ease" }} />
              </div>
            </div>

            {/* AÇÃO DO TÉCNICO DE RADIOTERAPIA: DAR BAIXA NA SESSÃO */}
            {cargo === "tecnico" && (
              <div style={{ background: `linear-gradient(135deg,${C.blue}18,${C.navyM})`, border: `1.5px solid ${C.blue}55`, borderRadius: 18, padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.blue, marginBottom: 8 }}>⚛️ Registrar Execução da Sessão de Radioterapia</div>
                <input value={obsTecnica} onChange={e => setObsTecnica(e.target.value)} placeholder="Observações técnicas (ex: Sem intercorrências, pele íntegra...)" style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12, marginBottom: 10 }} />
                <button onClick={darBaixaSessao} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                  ✅ Confirmar e Dar Baixa na Sessão #{parseInt(pacienteSelecionado.sessaoAtual || pacienteSelecionado.sessao_atual || 0) + 1}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* LISTA DE PACIENTES CADASTRADOS NA UNIDADE */}
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PACIENTES ADMITIDOS NA SUA UNIDADE ({pacientes.length})</div>
        
        {pacientes.length === 0 ? (
          <div style={{ background: C.navyL, borderRadius: 16, padding: "24px", textAlign: "center", border: `1px solid ${C.navyM}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏥</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Nenhum paciente admitido nesta unidade hospitalar ainda</div>
            <div style={{ fontSize: 12, color: C.muted }}>Os pacientes cadastrados pelo Administrador do Hospital aparecerão automaticamente aqui.</div>
          </div>
        ) : (
          pacientes.map((p, i) => (
            <div key={i} onClick={() => setPacienteSelecionado(p)} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: "16px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.tipo || p.tipo_tratamento} — {p.sessao_atual || p.sessaoAtual || 0}/{p.total_sessoes || p.totalSessoes || 30} sessões</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: C.teal, fontWeight: 800 }}>{p.codigo}</div>
                  <div style={{ fontSize: 10, color: C.blue, fontWeight: 700 }}>Abrir Prontuário →</div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Botão Utilitário para Limpar Testes Fictícios */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={limparDadosTestesFicticios} style={{ background: "transparent", border: `1px solid ${C.pink}44`, borderRadius: 10, padding: "8px 16px", color: C.pink, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            🧹 Limpar Registros Fictícios de Teste
          </button>
        </div>
      </div>
    </div>
  );
}
