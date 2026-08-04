import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';
import { gerarCodigo } from '../utils/codeGenerator';
import { PatientService, supabase } from '../services/supabaseClient';

export function AdminHospital({ onBack, onSair, hospital }) {
  const [tab, setTab] = useState("equipe"); // equipe | lista_pacientes | cadastrar_prof | cadastrar_paciente

  const nomeHospital = (hospital?.nome && !hospital.nome.includes("@"))
    ? hospital.nome
    : (hospital?.nome_unidade || "Hospital Sampa D'or");

  // Profissionais da Unidade
  const [equipe, setEquipe] = useState([]);

  // Pacientes da Unidade
  const [pacientesUnidade, setPacientesUnidade] = useState([]);

  // Form Profissional
  const [novoProf, setNovoProf] = useState({ nome: "", email: "", registro: "", cargo: "medico", especialidade: "", senhaProvisoria: "123456789" });
  const [profCadastrado, setProfCadastrado] = useState(null);
  const [copiadoProf, setCopiadoProf] = useState(false);

  // Form Paciente
  const [novoPac, setNovoPac] = useState({ nome: "", idade: "", sexo: "Masculino", tipo: "Próstata", medico: "Dr. Oncologista", totalSessoes: 30 });
  const [pacienteGerado, setPacienteGerado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregarEquipeUnidade();
    carregarPacientesUnidade();
  }, [hospital]);

  const carregarEquipeUnidade = async () => {
    let lista = [];

    if (supabase && hospital?.id) {
      try {
        const { data } = await supabase
          .from('profissionais')
          .select('*')
          .eq('hospital_id', hospital.id);

        if (data && data.length > 0) lista = data;
      } catch (e) {}
    }

    const todosGlobais = JSON.parse(localStorage.getItem('axion_profissionais') || '{}');
    const locais = Object.values(todosGlobais).filter(p => p.hospital_nome === nomeHospital || p.hospital_id === hospital?.id);

    const padrao = PatientService.listarProfissionaisPadrao(nomeHospital);

    // Mescla unificada sem duplicados
    const mapa = {};
    padrao.forEach(p => { if (p && p.email) mapa[p.email.toLowerCase()] = p; });
    locais.forEach(p => { if (p && p.email) mapa[p.email.toLowerCase()] = p; });
    lista.forEach(p => { if (p && p.email) mapa[p.email.toLowerCase()] = p; });

    setEquipe(Object.values(mapa));
  };

  const carregarPacientesUnidade = async () => {
    const todos = await PatientService.listarPacientes();
    
    // Filtro ESTRITO: Exibe APENAS pacientes cadastrados estritamente para esta unidade hospitalar
    const filtrados = todos.filter(p => {
      if (hospital?.id && p.hospital_id && String(p.hospital_id) === String(hospital.id)) return true;
      if (p.hospital && nomeHospital && p.hospital.toLowerCase().trim() === nomeHospital.toLowerCase().trim()) return true;
      return false;
    });

    setPacientesUnidade(filtrados);
  };

  const cadastrarProfissional = async () => {
    if (!novoProf.nome || !novoProf.email) return;

    const emailLimpo = novoProf.email.toLowerCase().trim();

    const prof = {
      id: Date.now().toString(),
      hospital_id: hospital?.id || null,
      hospital_nome: nomeHospital,
      nome: novoProf.nome.trim(),
      email: emailLimpo,
      registro_profissional: novoProf.registro,
      cargo: novoProf.cargo,
      especialidade: novoProf.especialidade || "Radioterapia Oncologia",
      senha_provisoria: novoProf.senhaProvisoria || "123456789",
      senha: novoProf.senhaProvisoria || "123456789",
      primeiro_acesso: false,
      ativo: true
    };

    if (supabase) {
      try {
        await supabase.from('profissionais').upsert([prof]);
      } catch (e) {}
    }

    const todosProfs = JSON.parse(localStorage.getItem('axion_profissionais') || '{}');
    todosProfs[emailLimpo] = prof;
    localStorage.setItem('axion_profissionais', JSON.stringify(todosProfs));

    setProfCadastrado(prof);
    carregarEquipeUnidade();
  };

  const cadastrarPacienteNaUnidade = async () => {
    if (!novoPac.nome || !novoPac.tipo) return;
    const codigo = gerarCodigo();
    const pac = {
      codigo,
      hospital_id: hospital?.id || null,
      hospital: nomeHospital,
      nome: novoPac.nome,
      idade: parseInt(novoPac.idade) || 50,
      sexo: novoPac.sexo,
      tipo: novoPac.tipo,
      tipo_tratamento: novoPac.tipo,
      medico: novoPac.medico,
      medico_responsavel: novoPac.medico,
      totalSessoes: parseInt(novoPac.totalSessoes) || 30,
      total_sessoes: parseInt(novoPac.totalSessoes) || 30,
      sessaoAtual: 0,
      sessao_atual: 0,
      role: "paciente"
    };

    await PatientService.savePatient(pac);
    setPacienteGerado(pac);
    carregarPacientesUnidade();
  };

  const copiarAcessoProf = () => {
    const txt = `🏥 Credenciais de Acesso AXION\n\nOlá ${profCadastrado.nome},\nSeu acesso foi liberado como ${profCadastrado.cargo.toUpperCase()} na unidade ${nomeHospital}.\n\n* E-mail: ${profCadastrado.email}\n* Senha de Acesso: ${profCadastrado.senha_provisoria}\n\nAcesse: https://axion-seis.vercel.app`;
    navigator.clipboard.writeText(txt);
    setCopiadoProf(true);
    setTimeout(() => setCopiadoProf(false), 3000);
  };

  const copiarAcessoPac = () => {
    const txt = `🏥 Código de Acompanhamento AXION\n\nOlá ${pacienteGerado.nome},\nSeu cadastro no tratamento de Radioterapia (${pacienteGerado.tipo}) foi realizado com sucesso!\n\n* Código de Acesso: ${pacienteGerado.codigo}\n\nAcesse: https://axion-seis.vercel.app`;
    navigator.clipboard.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const cargoBadge = {
    medico: { label: "Médico Oncologista", bg: C.purple, emoji: "👨‍⚕️" },
    enfermeiro: { label: "Enfermeiro(a)", bg: C.pink, emoji: "🩺" },
    tecnico: { label: "Técnico em Radioterapia", bg: C.blue, emoji: "⚛️" }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Clínico com Nome da Unidade */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${C.purple}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: 11, color: C.purple, fontWeight: 800, letterSpacing: 1.5 }}>ADMIN DA UNIDADE</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: C.purple }}>{nomeHospital} 🏥</div>
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              Sair 🚪
            </button>
          )}
        </div>

        {/* Abas de Navegação Interna do Admin */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "rgba(0,0,0,0.2)", padding: 4, borderRadius: 14 }}>
          <button onClick={() => setTab("equipe")} style={{ background: tab === "equipe" || tab === "cadastrar_prof" ? C.purple : "transparent", color: tab === "equipe" || tab === "cadastrar_prof" ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 800 }}>
            👥 Equipe ({equipe.length})
          </button>
          <button onClick={() => setTab("lista_pacientes")} style={{ background: tab === "lista_pacientes" || tab === "cadastrar_paciente" ? C.purple : "transparent", color: tab === "lista_pacientes" || tab === "cadastrar_paciente" ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 800 }}>
            📜 Pacientes ({pacientesUnidade.length})
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <button onClick={() => { setTab("cadastrar_prof"); setProfCadastrado(null); }} style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}55`, color: C.purple, borderRadius: 10, padding: "8px", fontSize: 11, fontWeight: 800 }}>
            + Profissional
          </button>
          <button onClick={() => { setTab("cadastrar_paciente"); setPacienteGerado(null); }} style={{ background: `${C.teal}22`, border: `1px solid ${C.teal}55`, color: C.teal, borderRadius: 10, padding: "8px", fontSize: 11, fontWeight: 800 }}>
            + Admitir Paciente
          </button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* ABA 1: LISTA DA EQUIPE DA UNIDADE */}
        {tab === "equipe" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              PROFISSIONAIS CADASTRADOS EM {nomeHospital.toUpperCase()} ({equipe.length})
            </div>

            {equipe.length === 0 ? (
              <div style={{ background: C.navyL, borderRadius: 20, padding: "32px 20px", textAlign: "center", border: `1px solid ${C.navyM}` }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👨‍⚕️</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Nenhum profissional cadastrado ainda</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>Clique no botão "+ Profissional" acima para cadastrar médicos, enfermeiros e técnicos desta unidade.</div>
                <button onClick={() => { setTab("cadastrar_prof"); setProfCadastrado(null); }} style={{ background: `linear-gradient(135deg,${C.purple},${C.blue})`, border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 800, fontSize: 13 }}>
                  + Cadastrar Primeiro Profissional
                </button>
              </div>
            ) : (
              equipe.map((p, idx) => {
                const infoCargo = cargoBadge[p.cargo] || cargoBadge.medico;
                return (
                  <div key={idx} style={{ background: C.navyL, border: `1px solid ${infoCargo.bg}33`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900 }}>{p.nome}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>Registro: {p.registro_profissional || "Ativo"} — {p.email}</div>
                      </div>
                      <span style={{ background: `${infoCargo.bg}22`, color: infoCargo.bg, border: `1px solid ${infoCargo.bg}55`, borderRadius: 99, padding: "4px 10px", fontSize: 10, fontWeight: 800 }}>
                        {infoCargo.emoji} {infoCargo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ABA 2: CADASTRAR NOVO PROFISSIONAL */}
        {tab === "cadastrar_prof" && (
          <div style={{ background: C.navyL, border: `1.5px solid ${C.purple}55`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.purple, marginBottom: 4 }}>+ Cadastrar Profissional de Saúde</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Libere o acesso para Médicos, Enfermeiros e Técnicos nesta unidade.</div>

            {!profCadastrado ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME COMPLETO *</label>
                  <input value={novoProf.nome} onChange={e => setNovoProf(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Dr. Roberto Silva" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>E-MAIL PROFISSIONAL DE ACESSO *</label>
                  <input value={novoProf.email} onChange={e => setNovoProf(p => ({ ...p, email: e.target.value }))} placeholder="exemplo@hospital.com" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>CARGO / FUNÇÃO NA CLÍNICA *</label>
                  <select value={novoProf.cargo} onChange={e => setNovoProf(p => ({ ...p, cargo: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }}>
                    <option value="medico">👨‍⚕️ Médico Oncologista</option>
                    <option value="enfermeiro">🩺 Enfermeiro(a) Oncologia</option>
                    <option value="tecnico">⚛️ Técnico em Radioterapia</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>REGISTRO PROFISSIONAL (CRM / COREN / CRTR)</label>
                  <input value={novoProf.registro} onChange={e => setNovoProf(p => ({ ...p, registro: e.target.value }))} placeholder="Ex: CRM 12345-SP" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <button onClick={cadastrarProfissional} disabled={!novoProf.nome || !novoProf.email} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: novoProf.nome && novoProf.email ? `linear-gradient(135deg,${C.purple},${C.blue})` : C.navyM, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                  🎉 Cadastrar Profissional & Gerar Acesso
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", animation: "rise 0.3s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.teal, marginBottom: 4 }}>Profissional Cadastrado!</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Copie e envie as credenciais abaixo para o profissional.</div>

                <div style={{ background: C.navyM, borderRadius: 14, padding: "16px", marginBottom: 16, textAlign: "left", fontSize: 12, lineHeight: 1.8 }}>
                  <div><strong>Profissional:</strong> {profCadastrado.nome}</div>
                  <div><strong>Cargo:</strong> {cargoBadge[profCadastrado.cargo]?.label}</div>
                  <div><strong>E-mail:</strong> {profCadastrado.email}</div>
                  <div><strong>Senha de Acesso:</strong> <span style={{ color: C.gold, fontWeight: 900 }}>{profCadastrado.senha_provisoria}</span></div>
                </div>

                <button onClick={copiarAcessoProf} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.purple}`, background: copiadoProf ? `${C.purple}22` : "transparent", color: C.purple, fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
                  {copiadoProf ? "✓ Credenciais Copiadas!" : "📋 Copiar Dados para Enviar via WhatsApp"}
                </button>

                <button onClick={() => setTab("equipe")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.navyM, color: C.text, fontWeight: 800, fontSize: 13 }}>
                  Voltar para Lista de Equipe →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: LISTA DE PACIENTES DA UNIDADE */}
        {tab === "lista_pacientes" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              PACIENTES ADMITIDOS NA UNIDADE ({pacientesUnidade.length})
            </div>

            {pacientesUnidade.length === 0 ? (
              <div style={{ background: C.navyL, borderRadius: 20, padding: "32px 20px", textAlign: "center", border: `1px solid ${C.navyM}` }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📜</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Nenhum paciente admitido ainda</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>Clique no botão "+ Admitir Paciente" acima para cadastrar o primeiro paciente desta unidade.</div>
                <button onClick={() => { setTab("cadastrar_paciente"); setPacienteGerado(null); }} style={{ background: `linear-gradient(135deg,${C.teal},${C.blue})`, border: "none", borderRadius: 12, padding: "12px 24px", color: C.navy, fontWeight: 900, fontSize: 13 }}>
                  + Admitir Primeiro Paciente
                </button>
              </div>
            ) : (
              pacientesUnidade.map((p, idx) => (
                <div key={idx} style={{ background: C.navyL, border: `1px solid ${C.teal}33`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{p.nome}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{p.tipo || p.tipo_tratamento} — {p.sessao_atual || p.sessaoAtual || 0}/{p.total_sessoes || p.totalSessoes || 30} sessões</div>
                    </div>
                    <div style={{ background: `${C.teal}22`, color: C.teal, border: `1px solid ${C.teal}55`, borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>
                      {p.codigo}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ABA 4: ADMITIR PACIENTE */}
        {tab === "cadastrar_paciente" && (
          <div style={{ background: C.navyL, border: `1.5px solid ${C.teal}55`, borderRadius: 20, padding: "20px" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.teal, marginBottom: 4 }}>+ Admitir Novo Paciente na Unidade</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Gere o Código de Acesso único para o paciente acompanhar o tratamento.</div>

            {!pacienteGerado ? (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME COMPLETO DO PACIENTE *</label>
                  <input value={novoPac.nome} onChange={e => setNovoPac(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Roberto de Jesus Vasconcelos" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>IDADE</label>
                    <input type="number" value={novoPac.idade} onChange={e => setNovoPac(p => ({ ...p, idade: e.target.value }))} placeholder="Ex: 62" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>SEXO BIOLÓGICO</label>
                    <select value={novoPac.sexo} onChange={e => setNovoPac(p => ({ ...p, sexo: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }}>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>TIPO DE TRATAMENTO / CID *</label>
                  <input value={novoPac.tipo} onChange={e => setNovoPac(p => ({ ...p, tipo: e.target.value }))} placeholder="Ex: Pulmão, Próstata, Mama..." style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>TOTAL DE SESSÕES PLANEJADAS</label>
                  <input type="number" value={novoPac.totalSessoes} onChange={e => setNovoPac(p => ({ ...p, totalSessoes: e.target.value }))} placeholder="30" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", color: C.text, fontSize: 13 }} />
                </div>

                <button onClick={cadastrarPacienteNaUnidade} disabled={!novoPac.nome || !novoPac.tipo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: novoPac.nome && novoPac.tipo ? `linear-gradient(135deg,${C.teal},${C.blue})` : C.navyM, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                  🎉 Admitir Paciente & Gerar Código AXION
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", animation: "rise 0.3s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.teal, marginBottom: 4 }}>Paciente Admitido!</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Código Único gerado para acompanhamento do tratamento.</div>

                <div style={{ background: `${C.teal}18`, border: `2px solid ${C.teal}`, borderRadius: 18, padding: "18px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>CÓDIGO ÚNICO AXION</div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: C.teal, fontFamily: "'Space Grotesk',sans-serif" }}>{pacienteGerado.codigo}</div>
                </div>

                <button onClick={copiarAcessoPac} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.teal}`, background: copiado ? `${C.teal}22` : "transparent", color: C.teal, fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
                  {copiado ? "✓ Código Copiado!" : "📋 Copiar Código para Enviar ao Paciente"}
                </button>

                <button onClick={() => setTab("lista_pacientes")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.navyM, color: C.text, fontWeight: 800, fontSize: 13 }}>
                  Ver Lista de Pacientes →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
