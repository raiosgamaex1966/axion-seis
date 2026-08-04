import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { PatientService, supabase } from '../services/supabaseClient';

export function Profissional({ onBack, onSair, userRole = "medico" }) {
  const [profAtivo, setProfAtivo] = useState(null);
  const [cargo, setCargo] = useState("medico"); // medico | enfermeiro | tecnico
  const [buscaCodigo, setBuscaCodigo] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [historicoSintomasPaciente, setHistoricoSintomasPaciente] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [unidadeProfissional, setUnidadeProfissional] = useState("");

  // Formulários por perfil (LGPD / RBAC)
  const [obsTecnica, setObsTecnica] = useState("");
  const [acessoriosImobilizacao, setAcessoriosImobilizacao] = useState("Máscara Termoplástica + Colchão Vac-Lok");
  
  const [evolucaoEnfermagem, setEvolucaoEnfermagem] = useState("");
  const [grauRadiodermite, setGrauRadiodermite] = useState("Grau 0 - Sem alterações na pele");
  
  const [condutaMedica, setCondutaMedica] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfilEProfissional();
  }, []);

  const carregarPerfilEProfissional = async () => {
    await PatientService.purgeMockPatients();

    let profLocalizado = null;
    try {
      const logadoStr = localStorage.getItem("axion_profissional_logado");
      if (logadoStr) {
        profLocalizado = JSON.parse(logadoStr);
      }
    } catch (e) {}

    if (!profLocalizado) {
      try {
        const todosProfs = JSON.parse(localStorage.getItem("axion_profissionais") || "{}");
        const listaProfs = Object.values(todosProfs);
        if (listaProfs.length > 0) profLocalizado = listaProfs[0];
      } catch (e) {}
    }

    const hospAtivo = JSON.parse(localStorage.getItem("axion_hospital_ativo") || "null");
    const nomeHospTarget = hospAtivo?.nome || profLocalizado?.hospital_nome;

    if (profLocalizado) {
      setProfAtivo(profLocalizado);
      if (profLocalizado.cargo) setCargo(profLocalizado.cargo);
    }

    setUnidadeProfissional(nomeHospTarget || "");

    const lista = await PatientService.listarPacientes();
    
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

  const selecionarPaciente = (p) => {
    setPacienteSelecionado(p);
    if (p?.codigo) {
      const keyHist = `axion_sintomas_${p.codigo}`;
      const hist = JSON.parse(localStorage.getItem(keyHist) || '[]');
      setHistoricoSintomasPaciente(hist);
    }
  };

  const buscar = async () => {
    if (!buscaCodigo.trim()) return;
    setBuscando(true);
    setStatusMsg("");
    
    const res = await PatientService.loginByCode(buscaCodigo);
    if (res.success && res.perfil) {
      selecionarPaciente(res.perfil);
      setStatusMsg(`✅ Paciente ${res.perfil.nome} localizado!`);
      setBuscando(false);
      return;
    }

    if (supabase) {
      try {
        const { data } = await supabase.from('pacientes').select('*').ilike('nome', `%${buscaCodigo.trim()}%`).limit(1);
        if (data && data.length > 0) {
          selecionarPaciente(data[0]);
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

  // 1. REGISTRO DO TÉCNICO EM RADIOTERAPIA
  const registrarBaixaTecnico = async () => {
    if (!pacienteSelecionado) return;
    setSalvando(true);

    const rawAtual = pacienteSelecionado.sessaoAtual !== undefined ? pacienteSelecionado.sessaoAtual : (pacienteSelecionado.sessao_atual !== undefined ? pacienteSelecionado.sessao_atual : 0);
    const atual = Number.isInteger(parseInt(rawAtual)) ? parseInt(rawAtual) : 0;
    
    const rawTotal = pacienteSelecionado.totalSessoes !== undefined ? pacienteSelecionado.totalSessoes : (pacienteSelecionado.total_sessoes !== undefined ? pacienteSelecionado.total_sessoes : 30);
    const total = Number.isInteger(parseInt(rawTotal)) && parseInt(rawTotal) > 0 ? parseInt(rawTotal) : 30;

    if (atual >= total) {
      setStatusMsg("⚠️ Este paciente já concluiu todas as sessões do tratamento!");
      setSalvando(false);
      return;
    }

    const novaSessao = atual + 1;
    const registro = {
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      tecnico: profAtivo?.nome || profAtivo?.email || "Técnico de Radioterapia",
      sessao: novaSessao,
      acessorios: acessoriosImobilizacao,
      observacao: obsTecnica || "Sessão executada com alinhamento a laser OK e pele preservada."
    };

    const atualizado = await PatientService.adicionarRegistroTecnico(pacienteSelecionado, registro, novaSessao);
    selecionarPaciente(atualizado);
    setObsTecnica("");
    setStatusMsg(`🎉 Sessão #${novaSessao} executada e baixada com sucesso no prontuário!`);
    setSalvando(false);
    carregarPerfilEProfissional();
  };

  // 2. REGISTRO DA EVOLUÇÃO DE ENFERMAGEM
  const registrarEvolucaoEnfermagem = async () => {
    if (!pacienteSelecionado || !evolucaoEnfermagem.trim()) return;
    setSalvando(true);

    const registro = {
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      enfermeiro: profAtivo?.nome || profAtivo?.email || "Enfermeira Oncologia",
      grauRadiodermite,
      evolucao: evolucaoEnfermagem.trim()
    };

    const atualizado = await PatientService.adicionarEvolucaoEnfermagem(pacienteSelecionado, registro);
    selecionarPaciente(atualizado);
    setEvolucaoEnfermagem("");
    setStatusMsg("🩺 Evolução de Enfermagem gravada com sucesso no prontuário!");
    setSalvando(false);
    carregarPerfilEProfissional();
  };

  // 3. REGISTRO DA CONDUTA MÉDICA ONCOLOGIA
  const registrarCondutaMedica = async () => {
    if (!pacienteSelecionado || !condutaMedica.trim()) return;
    setSalvando(true);

    const registro = {
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      medico: profAtivo?.nome || profAtivo?.email || "Dr. Oncologista",
      conduta: condutaMedica.trim()
    };

    const atualizado = await PatientService.adicionarCondutaMedica(pacienteSelecionado, registro);
    selecionarPaciente(atualizado);
    setCondutaMedica("");
    setStatusMsg("👨‍⚕️ Conduta Médica gravada no prontuário multidisciplinar!");
    setSalvando(false);
    carregarPerfilEProfissional();
  };

  const cargoLabel = { medico: "👨‍⚕️ Médico Oncologista", enfermeiro: "🩺 Enfermeiro(a)", tecnico: "⚛️ Técnico Radioterapia" };
  const cargoBadge = { medico: C.purple, enfermeiro: C.pink, tecnico: C.blue };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Clínico com Nome da Unidade e Trava de Perfil LGPD */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${cargoBadge[cargo] || C.blue}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: cargoBadge[cargo] || C.blue, fontWeight: 800, letterSpacing: 1.5 }}>
              PAINEL EXCLUSIVO: {cargoLabel[cargo]?.toUpperCase()}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: cargoBadge[cargo] || C.blue, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

        {/* Emblema Fixo do Perfil Autenticado (RBAC / LGPD) */}
        <div style={{ background: `${cargoBadge[cargo]}18`, border: `1px solid ${cargoBadge[cargo]}55`, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>PROFISSIONAL CONECTADO</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: cargoBadge[cargo] }}>{profAtivo?.nome || profAtivo?.email || "Profissional de Saúde"}</div>
          </div>
          <span style={{ fontSize: 11, background: cargoBadge[cargo], color: C.navy, padding: "4px 10px", borderRadius: 99, fontWeight: 900 }}>
            {cargoLabel[cargo]}
          </span>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* BUSCADOR DE PACIENTES */}
        <div style={{ background: C.navyL, border: `1.5px solid ${cargoBadge[cargo]}33`, borderRadius: 20, padding: "18px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: cargoBadge[cargo], marginBottom: 8 }}>🔍 Localizar Paciente no Prontuário Unificado</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={buscaCodigo} onChange={e => setBuscaCodigo(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') buscar(); }} placeholder="Digite o Código ou Nome..." style={{ flex: 1, background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 13 }} />
            <button onClick={buscar} disabled={buscando} style={{ background: `linear-gradient(135deg,${cargoBadge[cargo]},#29b6f6)`, border: "none", borderRadius: 12, padding: "0 20px", color: C.navy, fontWeight: 900, fontSize: 13 }}>
              {buscando ? "..." : "Buscar"}
            </button>
          </div>
          {statusMsg && <div style={{ fontSize: 12, marginTop: 10, textAlign: "center", color: statusMsg.startsWith('✅') || statusMsg.startsWith('🎉') || statusMsg.startsWith('🩺') || statusMsg.startsWith('👨‍⚕️') ? C.teal : C.pink }}>{statusMsg}</div>}
        </div>

        {/* PRONTUÁRIO MULTIDISCIPLINAR DO PACIENTE SELECIONADO */}
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
              <div><span style={{ color: C.muted }}>Médico Resp:</span> <strong>{pacienteSelecionado.medico || pacienteSelecionado.medico_responsavel || "Dr. Oncologista AXION"}</strong></div>
              <div><span style={{ color: C.muted }}>Hospital:</span> <strong>{pacienteSelecionado.hospital || "Hospital AXION"}</strong></div>
            </div>

            {/* BARRA DE PROGRESSO DE SESSÕES */}
            {(() => {
              const rawA = pacienteSelecionado.sessaoAtual !== undefined ? pacienteSelecionado.sessaoAtual : (pacienteSelecionado.sessao_atual !== undefined ? pacienteSelecionado.sessao_atual : 0);
              const sAtual = Number.isInteger(parseInt(rawA)) ? parseInt(rawA) : 0;
              const rawT = pacienteSelecionado.totalSessoes !== undefined ? pacienteSelecionado.totalSessoes : (pacienteSelecionado.total_sessoes !== undefined ? pacienteSelecionado.total_sessoes : 30);
              const sTotal = Number.isInteger(parseInt(rawT)) && parseInt(rawT) > 0 ? parseInt(rawT) : 30;
              const pct = Math.min(100, Math.round((sAtual / sTotal) * 100));

              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                    <span>Progresso da Radioterapia</span>
                    <span style={{ color: C.teal }}>{sAtual} de {sTotal} Sessões ({pct}%)</span>
                  </div>
                  <div style={{ height: 10, background: C.navyM, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, width: `${pct}%`, transition: "all 0.5s ease" }} />
                  </div>
                </div>
              );
            })()}

            {/* SEÇÃO 1: FICHA TÉCNICA (EXCLUSIVA PARA TÉCNICOS EM RADIOTERAPIA) */}
            {cargo === "tecnico" && (
              <div style={{ background: `linear-gradient(135deg,${C.blue}18,${C.navyM})`, border: `1.5px solid ${C.blue}55`, borderRadius: 18, padding: "18px", marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, marginBottom: 8 }}>⚛️ Ficha Técnica de Aplicação da Sessão</div>
                
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>DISPOSITIVOS DE IMOBILIZAÇÃO / POSICIONAMENTO</label>
                  <input value={acessoriosImobilizacao} onChange={e => setAcessoriosImobilizacao(e.target.value)} style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>OBSERVAÇÃO TÉCNICA DA APLICAÇÃO</label>
                  <input value={obsTecnica} onChange={e => setObsTecnica(e.target.value)} placeholder="Ex: Alinhamento laser 100% OK, sem intercorrências..." style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12 }} />
                </div>

                <button onClick={registrarBaixaTecnico} disabled={salvando} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                  {salvando ? "Salvando..." : `✅ Confirmar Execução & Dar Baixa na Sessão #${(parseInt(pacienteSelecionado.sessaoAtual || pacienteSelecionado.sessao_atual || 0)) + 1}`}
                </button>
              </div>
            )}

            {/* SEÇÃO 2: EVOLUÇÃO DE ENFERMAGEM (EXCLUSIVA PARA ENFERMEIROS) */}
            {cargo === "enfermeiro" && (
              <div style={{ background: `linear-gradient(135deg,${C.pink}18,${C.navyM})`, border: `1.5px solid ${C.pink}55`, borderRadius: 18, padding: "18px", marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.pink, marginBottom: 8 }}>🩺 Evolução de Enfermagem Oncologia</div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: C.pink, fontWeight: 800, display: "block", marginBottom: 4 }}>AVALIAÇÃO DE TOXICIDADE CUTÂNEA (RADIODERMITE)</label>
                  <select value={grauRadiodermite} onChange={e => setGrauRadiodermite(e.target.value)} style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12 }}>
                    <option value="Grau 0 - Sem alterações na pele">Grau 0 - Sem alterações / Pele Íntegra</option>
                    <option value="Grau 1 - Eritema leve ou descamação seca">Grau 1 - Eritema leve / Descamação seca</option>
                    <option value="Grau 2 - Eritema moderado ou descamação úmida focal">Grau 2 - Eritema moderado / Descamação úmida em dobras</option>
                    <option value="Grau 3 - Descamação úmida confluente">Grau 3 - Descamação úmida confluente fora de dobras</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>ANOTAÇÃO DE EVOLUÇÃO DE ENFERMAGEM & CUIDADOS</label>
                  <textarea rows="3" value={evolucaoEnfermagem} onChange={e => setEvolucaoEnfermagem(e.target.value)} placeholder="Digite o registro de enfermagem (sinais vitais, orientações de pele, hidratação...)" style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12 }} />
                </div>

                <button onClick={registrarEvolucaoEnfermagem} disabled={salvando || !evolucaoEnfermagem} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.pink},${C.purple})`, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                  {salvando ? "Salvando..." : "🩺 Registrar Evolução de Enfermagem"}
                </button>
              </div>
            )}

            {/* SEÇÃO 3: CONDUTA MÉDICA (EXCLUSIVA PARA MÉDICOS ONCOLOGISTAS) */}
            {cargo === "medico" && (
              <div style={{ background: `linear-gradient(135deg,${C.purple}18,${C.navyM})`, border: `1.5px solid ${C.purple}55`, borderRadius: 18, padding: "18px", marginBottom: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 8 }}>👨‍⚕️ Registrar Conduta Médica Oncologia</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>PARECER E ORIENTAÇÃO MÉDICA</label>
                  <textarea rows="3" value={condutaMedica} onChange={e => setCondutaMedica(e.target.value)} placeholder="Digite a conduta médica (ajuste de planejamento, prescrições, reavaliação clínica...)" style={{ width: "100%", background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", color: C.text, fontSize: 12 }} />
                </div>

                <button onClick={registrarCondutaMedica} disabled={salvando || !condutaMedica} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                  {salvando ? "Salvando..." : "👨‍⚕️ Gravar Conduta Médica no Prontuário"}
                </button>
              </div>
            )}

            {/* SEÇÃO 4: HISTÓRICO MULTIDISCIPLINAR CONSOLIDADO (VISÍVEL NO PRONTUÁRIO) */}
            <div style={{ background: C.navyM, borderRadius: 18, padding: "16px", marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.gold, marginBottom: 12 }}>📋 Histórico Multidisciplinar Unificado (LGPD / Prontuário)</div>

              {/* DIÁRIO DE SINTOMAS RELATADOS PELO PACIENTE */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.teal, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>📊 DIÁRIO DE SINTOMAS RELATADOS PELO PACIENTE</div>
                {historicoSintomasPaciente.length === 0 ? (
                  <div style={{ fontSize: 11, color: C.muted }}>Nenhum sintoma registrado pelo paciente ainda.</div>
                ) : (
                  historicoSintomasPaciente.map((h, idx) => (
                    <div key={idx} style={{ background: C.navy, border: `1px solid ${C.teal}33`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontSize: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.teal, marginBottom: 4 }}>
                        <span>📊 Sintomas do Dia</span>
                        <span>{h.data} às {h.hora}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, textAlign: "center", fontSize: 10 }}>
                        <span style={{ color: C.orange }}>Fadiga: {h.sintomas?.fadiga}/10</span>
                        <span style={{ color: C.pink }}>Dor: {h.sintomas?.dor}/10</span>
                        <span style={{ color: C.purple }}>Náusea: {h.sintomas?.nausea}/10</span>
                        <span style={{ color: C.gold }}>Apetite: {h.sintomas?.apetite}/10</span>
                        <span style={{ color: C.blue }}>Ansiedade: {h.sintomas?.ansiedade}/10</span>
                        <span style={{ color: C.teal }}>Sono: {h.sintomas?.sono}/10</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Evoluções de Enfermagem */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.pink, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>🩺 EVOLUÇÕES DE ENFERMAGEM</div>
                {(!pacienteSelecionado.historico_enfermagem || pacienteSelecionado.historico_enfermagem.length === 0) ? (
                  <div style={{ fontSize: 11, color: C.muted }}>Nenhum registro de enfermagem gravado ainda.</div>
                ) : (
                  pacienteSelecionado.historico_enfermagem.map((h, idx) => (
                    <div key={idx} style={{ background: C.navy, border: `1px solid ${C.pink}33`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontSize: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.pink, marginBottom: 2 }}>
                        <span>{h.enfermeiro}</span>
                        <span>{h.data} {h.hora}</span>
                      </div>
                      <div style={{ color: C.gold, fontWeight: 700, marginBottom: 4 }}>{h.grauRadiodermite}</div>
                      <div style={{ color: C.text }}>{h.evolucao}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Registros de Aplicação Técnica */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.blue, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>⚛️ FICHA TÉCNICA DE SESSÕES (TÉCNICOS)</div>
                {(!pacienteSelecionado.historico_tecnico || pacienteSelecionado.historico_tecnico.length === 0) ? (
                  <div style={{ fontSize: 11, color: C.muted }}>Nenhuma sessão executada ainda.</div>
                ) : (
                  pacienteSelecionado.historico_tecnico.map((h, idx) => (
                    <div key={idx} style={{ background: C.navy, border: `1px solid ${C.blue}33`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontSize: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.blue, marginBottom: 2 }}>
                        <span>Sessão #{h.sessao} — {h.tecnico}</span>
                        <span>{h.data} {h.hora}</span>
                      </div>
                      <div style={{ color: C.muted, marginBottom: 2 }}>Dispositivos: {h.acessorios}</div>
                      <div style={{ color: C.text }}>{h.observacao}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Condutas Médicas Oncologia */}
              <div>
                <div style={{ fontSize: 11, color: C.purple, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>👨‍⚕️ CONDUTAS E PARECERES MÉDICOS</div>
                {(!pacienteSelecionado.historico_medico || pacienteSelecionado.historico_medico.length === 0) ? (
                  <div style={{ fontSize: 11, color: C.muted }}>Nenhum parecer médico registrado ainda.</div>
                ) : (
                  pacienteSelecionado.historico_medico.map((h, idx) => (
                    <div key={idx} style={{ background: C.navy, border: `1px solid ${C.purple}33`, borderRadius: 12, padding: "10px 12px", marginBottom: 6, fontSize: 11 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: C.purple, marginBottom: 2 }}>
                        <span>{h.medico}</span>
                        <span>{h.data} {h.hora}</span>
                      </div>
                      <div style={{ color: C.text }}>{h.conduta}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
          pacientes.map((p, i) => {
            const rawA = p.sessaoAtual !== undefined ? p.sessaoAtual : (p.sessao_atual !== undefined ? p.sessao_atual : 0);
            const sAtual = Number.isInteger(parseInt(rawA)) ? parseInt(rawA) : 0;
            const rawT = p.totalSessoes !== undefined ? p.totalSessoes : (p.total_sessoes !== undefined ? p.total_sessoes : 30);
            const sTotal = Number.isInteger(parseInt(rawT)) && parseInt(rawT) > 0 ? parseInt(rawT) : 30;

            return (
              <div key={i} onClick={() => selecionarPaciente(p)} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: "16px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nome}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.tipo || p.tipo_tratamento} — {sAtual}/{sTotal} sessões</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: C.teal, fontWeight: 800 }}>{p.codigo}</div>
                    <div style={{ fontSize: 10, color: cargoBadge[cargo] || C.blue, fontWeight: 700 }}>Abrir Prontuário →</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
