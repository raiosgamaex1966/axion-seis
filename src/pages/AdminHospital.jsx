import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';
import { gerarCodigo } from '../utils/codeGenerator';
import { PatientService, supabase } from '../services/supabaseClient';

export function AdminHospital({ onBack, onSair, hospital }) {
  const [tab, setTab] = useState("equipe"); // equipe | lista_pacientes | cadastrar_prof | cadastrar_paciente

  const nomeHospital = hospital?.nome || hospital?.email_admin || "Sua Unidade Hospitalar";

  // Profissionais da Unidade (Inicia Vazio para nao misturar dados ficticios)
  const [equipe, setEquipe] = useState([]);

  // Pacientes da Unidade (Inicia Vazio para nao misturar dados ficticios)
  const [pacientesUnidade, setPacientesUnidade] = useState([]);

  // Form Profissional
  const [novoProf, setNovoProf] = useState({ nome: "", email: "", registro: "", cargo: "medico", especialidade: "", senhaProvisoria: "Axion@" + Math.floor(1000 + Math.random() * 9000) });
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

    if (lista.length === 0) {
      const todosProfs = JSON.parse(localStorage.getItem(`axion_profissionais_${hospital?.id || nomeHospital}`) || '[]');
      lista = todosProfs;
    }

    setEquipe(lista);
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

    const prof = {
      id: Date.now().toString(),
      hospital_id: hospital?.id || null,
      hospital_nome: nomeHospital,
      nome: novoProf.nome.trim(),
      email: novoProf.email.toLowerCase().trim(),
      registro_profissional: novoProf.registro,
      cargo: novoProf.cargo,
      especialidade: novoProf.especialidade || "Radioterapia Oncologia",
      senha_provisoria: novoProf.senhaProvisoria,
      primeiro_acesso: true,
      ativo: true
    };

    if (supabase) {
      try {
        await supabase.from('profissionais').upsert([prof]);
      } catch (e) {}
    }

    const key = `axion_profissionais_${hospital?.id || nomeHospital}`;
    const existentes = JSON.parse(localStorage.getItem(key) || '[]');
    existentes.unshift(prof);
    localStorage.setItem(key, JSON.stringify(existentes));

    setEquipe(prev => [prof, ...prev]);
    setProfCadastrado(prof);
    setNovoProf({ nome: "", email: "", registro: "", cargo: "medico", especialidade: "", senhaProvisoria: "Axion@" + Math.floor(1000 + Math.random() * 9000) });
  };

  const gerarTextoCredenciaisProf = () => {
    if (!profCadastrado) return "";
    return `🏥 *Credenciais de Acesso AXION*\n\nOlá ${profCadastrado.nome},\nSeu acesso foi liberado como ${profCadastrado.cargo.toUpperCase()} na unidade ${nomeHospital}.\n\n• *E-mail:* ${profCadastrado.email}\n• *Senha Provisória:* ${profCadastrado.senha_provisoria}\n\n⚠️ *Segurança:* No seu primeiro acesso, o sistema exigirá o cadastramento da sua nova senha pessoal.`;
  };

  const copiarCredenciaisProf = () => {
    const texto = gerarTextoCredenciaisProf();
    navigator.clipboard.writeText(texto);
    setCopiadoProf(true);
    setTimeout(() => setCopiadoProf(false), 3000);
  };

  const abrirWhatsAppWebProf = () => {
    const texto = gerarTextoCredenciaisProf();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
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

  const copiarCodigoPaciente = (codigo) => {
    const cod = codigo || pacienteGerado?.codigo;
    if (!cod) return;
    navigator.clipboard.writeText(cod);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const abrirWhatsAppWebPaciente = (pac) => {
    const p = pac || pacienteGerado;
    if (!p) return;
    const texto = `🎟️ *Seu Cartão de Acesso AXION*\n\nOlá ${p.nome},\nSeu cadastro no AXION foi realizado na unidade ${nomeHospital}.\n\n• *Seu Código Único:* ${p.codigo}\n\nBaixe ou acesse o aplicativo e digite este código para acompanhar seu tratamento!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const cargoLabel = { medico: "👨‍⚕️ Médico Oncologista", enfermeiro: "🩺 Enfermeiro(a)", tecnico: "⚛️ Técnico em Radioterapia" };
  const cargoBadge = { medico: C.purple, enfermeiro: C.pink, tecnico: C.blue };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header Admin com Nome Exato da Unidade Hospitalar */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `2px solid ${C.purple}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 12, width: 40, height: 40, color: C.text, fontSize: 18, flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.purple, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>ADMIN DA UNIDADE</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: C.purple, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {nomeHospital} 🏥
            </div>
          </div>
          {onSair && (
            <button onClick={onSair} title="Sair do painel" style={{ marginLeft: "auto", background: "rgba(255,107,157,0.15)", border: `1px solid ${C.pink}`, borderRadius: 12, padding: "8px 14px", color: C.pink, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
              Sair 🚪
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: C.navyM, padding: 4, borderRadius: 14 }}>
          {[
            ["equipe", `👥 Equipe (${equipe.length})`],
            ["lista_pacientes", `📋 Pacientes (${pacientesUnidade.length})`],
            ["cadastrar_prof", "＋ Profissional"],
            ["cadastrar_paciente", "＋ Admitir Paciente"]
          ].map(([k, label]) => (
            <button key={k} onClick={() => { setTab(k); setProfCadastrado(null); carregarPacientesUnidade(); carregarEquipeUnidade(); }} style={{ padding: "9px 2px", borderRadius: 10, border: "none", background: tab === k ? `${C.purple}22` : "transparent", color: tab === k ? C.purple : C.muted, fontWeight: tab === k ? 900 : 600, fontSize: 11, borderBottom: tab === k ? `2px solid ${C.purple}` : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* TAB 1: EQUIPE DA UNIDADE */}
        {tab === "equipe" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PROFISSIONAIS CADASTRADOS EM {nomeHospital.toUpperCase()} ({equipe.length})</div>
            
            {equipe.length === 0 ? (
              <div style={{ background: C.navyL, borderRadius: 16, padding: "24px", textAlign: "center", border: `1px solid ${C.navyM}` }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍⚕️</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Nenhum profissional cadastrado ainda</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Clique no botão "＋ Profissional" acima para cadastrar médicos, enfermeiros e técnicos desta unidade.</div>
                <button onClick={() => setTab("cadastrar_prof")} style={{ background: C.purple, border: "none", borderRadius: 12, padding: "10px 20px", color: C.navy, fontWeight: 900, fontSize: 12 }}>
                  ＋ Cadastrar Primeiro Profissional
                </button>
              </div>
            ) : (
              equipe.map((p, i) => (
                <div key={i} style={{ background: C.navyL, border: `1.5px solid ${cargoBadge[p.cargo] || C.navyM}44`, borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{p.nome}</div>
                    <span style={{ fontSize: 10, background: `${cargoBadge[p.cargo] || C.purple}22`, color: cargoBadge[p.cargo] || C.purple, padding: "3px 10px", borderRadius: 99, fontWeight: 800 }}>
                      {cargoLabel[p.cargo] || p.cargo}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Registro: {p.registro || p.registro_profissional || "CRM/COREN"} — {p.email}</div>
                  {p.senha_provisoria && <div style={{ fontSize: 10, color: C.gold, fontWeight: 700 }}>🔑 Senha Provisória: {p.senha_provisoria} (Troca no 1º Acesso)</div>}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB LISTA DE PACIENTES DA UNIDADE */}
        {tab === "lista_pacientes" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>PACIENTES ADMITIDOS EM {nomeHospital.toUpperCase()} ({pacientesUnidade.length})</div>
            
            {pacientesUnidade.length === 0 ? (
              <div style={{ background: C.navyL, borderRadius: 16, padding: "24px", textAlign: "center", border: `1px solid ${C.navyM}` }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎟️</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>Nenhum paciente admitido nesta unidade ainda</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Clique em "＋ Admitir Paciente" para emitir o primeiro cartão de acesso.</div>
                <button onClick={() => setTab("cadastrar_paciente")} style={{ background: C.teal, border: "none", borderRadius: 12, padding: "10px 20px", color: C.navy, fontWeight: 900, fontSize: 12 }}>
                  🎟️ Admitir Primeiro Paciente
                </button>
              </div>
            ) : (
              pacientesUnidade.map((p, i) => (
                <div key={i} style={{ background: C.navyL, border: `1px solid ${C.teal}33`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900 }}>{p.nome}</div>
                      <div style={{ fontSize: 12, color: C.teal, fontWeight: 800 }}>Código: {p.codigo}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => copiarCodigoPaciente(p.codigo)} title="Copiar Código" style={{ background: `${C.teal}22`, border: `1.5px solid ${C.teal}`, borderRadius: 8, padding: "6px 10px", color: C.teal, fontSize: 11, fontWeight: 800 }}>
                        📋 Copiar
                      </button>
                      <button onClick={() => abrirWhatsAppWebPaciente(p)} title="Enviar WhatsApp" style={{ background: "#25D366", border: "none", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 11, fontWeight: 800 }}>
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    Tratamento: {p.tipo || p.tipo_tratamento || "Radioterapia"} — {p.sessao_atual || p.sessaoAtual || 0}/{p.total_sessoes || p.totalSessoes || 30} sessões
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: CADASTRO DE MÉDICOS, ENFERMEIROS E TÉCNICOS */}
        {tab === "cadastrar_prof" && (
          <div>
            {!profCadastrado ? (
              <div style={{ background: C.navyL, border: `1.5px solid ${C.purple}44`, borderRadius: 20, padding: "20px" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.purple, marginBottom: 12 }}>➕ Cadastrar Profissional em {nomeHospital}</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>CARGO DO PROFISSIONAL *</label>
                  <select value={novoProf.cargo} onChange={e => setNovoProf(p => ({ ...p, cargo: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                    <option value="medico">👨‍⚕️ Médico Oncologista</option>
                    <option value="enfermeiro">🩺 Enfermeiro(a) Oncologia</option>
                    <option value="tecnico">⚛️ Técnico em Radioterapia</option>
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME COMPLETO *</label>
                  <input value={novoProf.nome} onChange={e => setNovoProf(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Dr. Roberto Silva" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>E-MAIL PROFISSIONAL (LOGIN) *</label>
                  <input value={novoProf.email} onChange={e => setNovoProf(p => ({ ...p, email: e.target.value }))} placeholder="medico@hospital.com" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>REGISTRO PROFISSIONAL (CRM / COREN / CRTR)</label>
                  <input value={novoProf.registro} onChange={e => setNovoProf(p => ({ ...p, registro: e.target.value }))} placeholder="Ex: CRM 12345/SP" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: C.gold, fontWeight: 800, display: "block", marginBottom: 4 }}>🔑 SENHA PROVISÓRIA GERADA</label>
                  <input value={novoProf.senhaProvisoria} onChange={e => setNovoProf(p => ({ ...p, senhaProvisoria: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1.5px solid ${C.gold}55`, borderRadius: 12, padding: "10px 14px", color: C.gold, fontSize: 14, fontWeight: 800 }} />
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>O profissional será obrigado a trocar a senha no 1º acesso.</div>
                </div>

                <button onClick={cadastrarProfissional} disabled={!novoProf.nome || !novoProf.email} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                  ➕ Cadastrar Profissional e Gerar Credenciais
                </button>
              </div>
            ) : (
              <div style={{ background: C.navyL, border: `2px solid ${C.purple}`, borderRadius: 20, padding: "24px", textAlign: "center", animation: "rise 0.3s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.purple, marginBottom: 4 }}>Credenciais Geradas para {profCadastrado.nome}!</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Envie os dados de acesso abaixo para o profissional:</div>

                <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.purple}44`, borderRadius: 16, padding: "16px", textAlign: "left", marginBottom: 16, fontSize: 12, lineHeight: 1.7 }}>
                  <div><strong>Unidade:</strong> {nomeHospital}</div>
                  <div><strong>Cargo:</strong> {profCadastrado.cargo.toUpperCase()}</div>
                  <div><strong>E-mail:</strong> {profCadastrado.email}</div>
                  <div><strong>Senha Provisória:</strong> <span style={{ color: C.gold, fontWeight: 800 }}>{profCadastrado.senha_provisoria}</span></div>
                  <div style={{ color: C.teal, marginTop: 4, fontWeight: 700 }}>🔒 Status: Requer Troca Obrigatória de Senha no 1º Acesso.</div>
                </div>

                <button onClick={copiarCredenciaisProf} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.purple}`, background: copiadoProf ? `${C.purple}22` : "transparent", color: C.purple, fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
                  {copiadoProf ? "✓ Credenciais Copiadas!" : "📋 Copiar Dados de Acesso"}
                </button>

                <button onClick={abrirWhatsAppWebProf} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontWeight: 900, fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span>💬 Enviar via WhatsApp / Web WhatsApp</span>
                </button>

                <button onClick={() => setProfCadastrado(null)} style={{ background: "transparent", border: `1px solid ${C.muted}`, borderRadius: 12, padding: "10px 20px", color: C.muted, fontWeight: 700, fontSize: 12 }}>
                  ← Cadastrar outro profissional
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMITIR PACIENTE E EMITIR CÓDIGO */}
        {tab === "cadastrar_paciente" && (
          <div>
            {!pacienteGerado ? (
              <div style={{ background: C.navyL, border: `1.5px solid ${C.teal}44`, borderRadius: 20, padding: "20px" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.teal, marginBottom: 12 }}>🎟️ Admitir Paciente em {nomeHospital}</div>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>NOME COMPLETO DO PACIENTE *</label>
                  <input value={novoPac.nome} onChange={e => setNovoPac(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Carlos Eduardo Silva" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>IDADE</label>
                    <input type="number" value={novoPac.idade} onChange={e => setNovoPac(p => ({ ...p, idade: e.target.value }))} placeholder="55" style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>SEXO</label>
                    <select value={novoPac.sexo} onChange={e => setNovoPac(p => ({ ...p, sexo: e.target.value }))} style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }}>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: "block", marginBottom: 4 }}>TIPO DE TRATAMENTO RADIOTERÁPICO *</label>
                  <input value={novoPac.tipo} onChange={e => setNovoPac(p => ({ ...p, tipo: e.target.value }))} placeholder="Ex: Mama, Próstata, Pulmão..." style={{ width: "100%", background: C.navyM, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 13 }} />
                </div>

                <button onClick={cadastrarPacienteNaUnidade} disabled={!novoPac.nome || !novoPac.tipo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                  🎟️ Salvar e Emitir Cartão de Acesso
                </button>
              </div>
            ) : (
              <div style={{ background: C.navyL, border: `2px solid ${C.teal}`, borderRadius: 20, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🎫</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.teal, marginBottom: 4 }}>Código Gerado para {pacienteGerado.nome}!</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>Copie ou envie o código de acesso abaixo:</div>

                <div style={{ background: `${C.teal}18`, border: `2px solid ${C.teal}`, borderRadius: 16, padding: "16px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>CÓDIGO ÚNICO DO PACIENTE</div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: C.teal }}>{pacienteGerado.codigo}</div>
                </div>

                <button onClick={() => copiarCodigoPaciente()} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.teal}`, background: copiado ? `${C.teal}22` : "transparent", color: C.teal, fontWeight: 800, fontSize: 13, marginBottom: 10 }}>
                  {copiado ? "✓ Código Copiado!" : "📋 Copiar Código do Paciente"}
                </button>

                <button onClick={() => abrirWhatsAppWebPaciente()} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontWeight: 900, fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span>💬 Enviar Cartão via WhatsApp / Web WhatsApp</span>
                </button>

                <button onClick={() => setPacienteGerado(null)} style={{ background: "transparent", border: `1px solid ${C.muted}`, borderRadius: 12, padding: "10px 20px", color: C.muted, fontWeight: 700, fontSize: 12 }}>
                  ← Cadastrar outro paciente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
