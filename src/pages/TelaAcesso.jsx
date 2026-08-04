import React, { useState } from 'react';
import { C } from '../constants/theme';
import { gerarCodigo } from '../utils/codeGenerator';
import { PatientService, supabase } from '../services/supabaseClient';

export function TelaAcesso({ onEntrar, onEntrarSuperAdmin, onEntrarAdminHospital, onEntrarMedico, isSuperAdminRoute = false }) {
  const [perfilAcesso, setPerfilAcesso] = useState(isSuperAdminRoute ? "superadmin" : "paciente"); // paciente | medico | admin_hospital | superadmin
  const [modo, setModo] = useState("inicio"); // inicio | cadastro | login | recuperar | trocar_senha | trocar_senha_admin
  
  // Form Paciente
  const [form, setForm] = useState({ nome: "", idade: "", sexo: "", tipo: "", medico: "", hospital: "", totalSessoes: "", sessaoAtual: "" });
  const [codigoLogin, setCodigoLogin] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [perfilCriado, setPerfilCriado] = useState(null);

  // Form Recuperacao de Codigo
  const [buscaNomeRecuperacao, setBuscaNomeRecuperacao] = useState("");
  const [pacienteRecuperado, setPacienteRecuperado] = useState(null);
  const [buscandoRecuperacao, setBuscandoRecuperacao] = useState(false);
  const [erroRecuperacao, setErroRecuperacao] = useState("");

  // Form Profissional / Admin
  const [credenciais, setCredenciais] = useState({ email: isSuperAdminRoute ? "robsoncordeiro1966@gmail.com" : "", senha: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Form Troca de Senha Obrigatória (Primeiro Acesso)
  const [trocaSenha, setTrocaSenha] = useState({ novaSenha: "", confirmaSenha: "" });
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmaSenha, setMostrarConfirmaSenha] = useState(false);

  const [profPrimeiroAcesso, setProfPrimeiroAcesso] = useState(null);
  const [hospitalPrimeiroAcesso, setHospitalPrimeiroAcesso] = useState(null);

  const iF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const concluirCadastro = async () => {
    if (!form.nome || !form.tipo) return;
    try {
      const codigo = gerarCodigo();
      const perfil = { ...form, codigo, role: "paciente", criadoEm: new Date().toLocaleDateString("pt-BR") };
      await PatientService.savePatient(perfil);
      setPerfilCriado(perfil);
    } catch (e) {
      setErroLogin("Não foi possível salvar seu perfil.");
    }
  };

  const fazerLoginPaciente = async () => {
    if (!codigoLogin.trim()) { setErroLogin("Digite seu código para entrar."); return; }
    const result = await PatientService.loginByCode(codigoLogin);
    if (result.success) {
      onEntrar({ ...result.perfil, role: "paciente" });
      setErroLogin("");
    } else {
      setErroLogin("Código não encontrado. Confira se digitou certo (ex: AX-ABC-1234).");
    }
  };

  const buscarCodigoPerdido = async () => {
    if (!buscaNomeRecuperacao.trim()) return;
    setBuscandoRecuperacao(true);
    setErroRecuperacao("");
    setPacienteRecuperado(null);

    try {
      if (supabase) {
        const { data } = await supabase
          .from('pacientes')
          .select('*')
          .ilike('nome', `%${buscaNomeRecuperacao.trim()}%`)
          .limit(1);

        if (data && data.length > 0) {
          setPacienteRecuperado(data[0]);
          setBuscandoRecuperacao(false);
          return;
        }
      }
    } catch (e) {}

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const chave = Object.keys(todos).find(k => todos[k].nome?.toLowerCase().includes(buscaNomeRecuperacao.toLowerCase()));
    if (chave) {
      setPacienteRecuperado(todos[chave]);
    } else {
      setErroRecuperacao("Nenhum cadastro encontrado com este nome. Solicite à recepção do seu hospital.");
    }
    setBuscandoRecuperacao(false);
  };

  const fazerLoginCorporativo = async () => {
    setErroLogin("");

    if (!credenciais.email.trim()) {
      setErroLogin("Digite seu e-mail ou nome da unidade.");
      return;
    }

    if (!credenciais.senha || credenciais.senha.trim().length === 0) {
      setErroLogin("🔒 A senha de acesso é obrigatória.");
      return;
    }

    const senhaDigitada = credenciais.senha.trim();
    const termo = credenciais.email.toLowerCase().trim();

    // 1. LOGIN DO SUPER ADMIN SAAS (Robson)
    if (perfilAcesso === "superadmin" || isSuperAdminRoute) {
      if (termo !== "robsoncordeiro1966@gmail.com") {
        setErroLogin("❌ E-mail não autorizado para o painel Super Admin Master.");
        return;
      }
      
      if (senhaDigitada !== "Binho2020") {
        setErroLogin("❌ Senha master incorreta para o Super Admin.");
        return;
      }

      onEntrarSuperAdmin();
      return;
    }

    // 2. LOGIN DO ADMIN DA UNIDADE HOSPITALAR
    if (perfilAcesso === "admin_hospital") {
      let hospEncontrado = null;

      if (supabase) {
        try {
          const { data } = await supabase
            .from('hospitais_clinicas')
            .select('*')
            .or(`email_admin.ilike.%${termo}%,nome.ilike.%${termo}%`)
            .limit(1);

          if (data && data.length > 0) hospEncontrado = data[0];
        } catch (e) {}
      }

      if (!hospEncontrado) {
        const todosHospitais = JSON.parse(localStorage.getItem('axion_hospitais') || '{}');
        if (todosHospitais[termo]) hospEncontrado = todosHospitais[termo];
      }

      if (!hospEncontrado) {
        setErroLogin("❌ Unidade ou E-mail do Administrador não encontrado.");
        return;
      }

      // Validação estrita LGPD da senha digitada (Provisória ou Definitiva)
      const senhaCorreta = hospEncontrado.senha_provisoria || hospEncontrado.senha;
      if (senhaCorreta && senhaDigitada !== senhaCorreta) {
        setErroLogin("❌ Senha incorreta. Digite exatamente a senha fornecida pelo Super Admin.");
        return;
      }

      // Se a senha bateu E for o Primeiro Acesso, força a troca de senha
      if (hospEncontrado.primeiro_acesso || hospEncontrado.primeiroAcesso) {
        setHospitalPrimeiroAcesso(hospEncontrado);
        setModo("trocar_senha_admin");
        setErroLogin("");
        return;
      }

      onEntrarAdminHospital(hospEncontrado);
      return;
    }

    // 3. LOGIN DOS PROFISSIONAIS DA SAÚDE (Médicos, Enfermeiros, Técnicos)
    let profEncontrado = null;

    // Busca no Supabase em primeiro lugar
    if (supabase) {
      try {
        const { data } = await supabase.from('profissionais').select('*').ilike('email', termo).limit(1);
        if (data && data.length > 0) profEncontrado = data[0];
      } catch (e) {}
    }

    // Busca no dicionario global axion_profissionais
    if (!profEncontrado) {
      const todosProfs = JSON.parse(localStorage.getItem('axion_profissionais') || '{}');
      if (todosProfs[termo]) profEncontrado = todosProfs[termo];
    }

    // Busca de segurança em chaves locais por hospital
    if (!profEncontrado) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('axion_profissionais_')) {
          try {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            const achei = arr.find(p => p.email && p.email.toLowerCase().trim() === termo);
            if (achei) { profEncontrado = achei; break; }
          } catch (e) {}
        }
      }
    }

    if (!profEncontrado) {
      setErroLogin("❌ E-mail profissional não encontrado no sistema.");
      return;
    }

    // Validação estrita LGPD da senha do profissional (Provisória ou Definitiva)
    const senhaCorretaProf = profEncontrado.senha_provisoria || profEncontrado.senha;
    if (senhaCorretaProf && senhaDigitada !== senhaCorretaProf) {
      setErroLogin("❌ Senha incorreta. Digite exatamente a senha fornecida pelo administrador do hospital.");
      return;
    }

    // Sincroniza a unidade hospitalar vinculada ao profissional
    if (profEncontrado.hospital_nome || profEncontrado.hospital_id) {
      localStorage.setItem("axion_hospital_ativo", JSON.stringify({
        nome: profEncontrado.hospital_nome,
        id: profEncontrado.hospital_id
      }));
    }

    if (profEncontrado.primeiro_acesso || profEncontrado.primeiroAcesso) {
      setProfPrimeiroAcesso(profEncontrado);
      setModo("trocar_senha");
      setErroLogin("");
      return;
    }

    onEntrarMedico({
      nome: profEncontrado?.nome || termo.split("@")[0],
      cargo: profEncontrado?.cargo || "medico",
      hospital: profEncontrado?.hospital_nome,
      hospital_id: profEncontrado?.hospital_id,
      role: "medico"
    });
  };

  const salvarNovaSenhaPrimeiroAcesso = async () => {
    if (!trocaSenha.novaSenha || trocaSenha.novaSenha.length < 6) {
      setErroLogin("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (trocaSenha.novaSenha !== trocaSenha.confirmaSenha) {
      setErroLogin("As senhas não coincidem.");
      return;
    }

    if (modo === "trocar_senha_admin") {
      const hospAtualizado = { ...hospitalPrimeiroAcesso, primeiro_acesso: false, primeiroAcesso: false, senha: trocaSenha.novaSenha, senha_provisoria: null };
      
      if (supabase && hospitalPrimeiroAcesso?.id) {
        try {
          await supabase.from('hospitais_clinicas').update({
            primeiro_acesso: false,
            senha_provisoria: null,
            senha: trocaSenha.novaSenha
          }).eq('id', hospitalPrimeiroAcesso.id);
        } catch (e) {}
      }

      const todosHospitais = JSON.parse(localStorage.getItem('axion_hospitais') || '{}');
      if (hospitalPrimeiroAcesso?.email_admin) {
        todosHospitais[hospitalPrimeiroAcesso.email_admin] = hospAtualizado;
        localStorage.setItem('axion_hospitais', JSON.stringify(todosHospitais));
      }

      onEntrarAdminHospital(hospAtualizado);
      return;
    }

    const profAtualizado = { ...profPrimeiroAcesso, primeiro_acesso: false, primeiroAcesso: false, senha: trocaSenha.novaSenha, senha_provisoria: null };

    if (supabase && profPrimeiroAcesso?.email) {
      try {
        await supabase.from('profissionais').update({
          primeiro_acesso: false,
          senha_provisoria: null,
          senha: trocaSenha.novaSenha
        }).eq('email', profPrimeiroAcesso.email);
      } catch (e) {}
    }

    const todosProfs = JSON.parse(localStorage.getItem('axion_profissionais') || '{}');
    if (profPrimeiroAcesso?.email) {
      todosProfs[profPrimeiroAcesso.email.toLowerCase().trim()] = profAtualizado;
      localStorage.setItem('axion_profissionais', JSON.stringify(todosProfs));
    }

    if (profPrimeiroAcesso?.hospital_nome || profPrimeiroAcesso?.hospital_id) {
      localStorage.setItem("axion_hospital_ativo", JSON.stringify({
        nome: profPrimeiroAcesso.hospital_nome,
        id: profPrimeiroAcesso.hospital_id
      }));
    }

    onEntrarMedico({
      nome: profPrimeiroAcesso?.nome || "Profissional",
      cargo: profPrimeiroAcesso?.cargo || "medico",
      hospital: profPrimeiroAcesso?.hospital_nome,
      hospital_id: profPrimeiroAcesso?.hospital_id,
      role: "medico"
    });
  };

  if (perfilCriado) return <TelaCodigoGerado perfil={perfilCriado} onContinuar={() => onEntrar(perfilCriado)} />;

  const inputStyle = { width: "100%", background: C.navyM, border: `1.5px solid ${C.navyM}`, borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: "'Nunito',sans-serif" };
  const labelStyle = { fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 5, display: "block", letterSpacing: 1 };

  // Se for a Rota /superadmin, exibe a tela de login exclusiva do Super Admin
  if (isSuperAdminRoute) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 20, animation: "rise 0.5s ease both" }}>
          <div style={{ animation: "pulse 2s ease infinite", filter: "drop-shadow(0 0 24px rgba(255,215,0,0.5))", marginBottom: 10 }}>
            <svg width="64" height="64" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="8" fill={C.gold} />
              <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.gold} strokeWidth="2" fill="none" opacity="0.9" />
              <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 40 40)" />
              <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.purple} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 40 40)" />
            </svg>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 3, background: `linear-gradient(135deg,${C.gold},${C.orange})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXION</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginTop: 2, fontWeight: 800 }}>PAINEL MASTER DE ADMINISTRADOR</div>
        </div>

        <div style={{ background: C.navyL, border: `1.5px solid ${C.gold}66`, borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 380, animation: "rise 0.4s ease both" }}>
          <div style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.gold }}>Super Admin Master SaaS 👑</div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 18 }}>Acesso Restrito ao Gestor Global</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ ...labelStyle, color: C.gold }}>E-MAIL MASTER DE ADMINISTRADOR *</label>
            <input value={credenciais.email} onChange={e => setCredenciais(p => ({ ...p, email: e.target.value }))} placeholder="robsoncordeiro1966@gmail.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ ...labelStyle, color: C.gold }}>SENHA MASTER DE ACESSO *</label>
            <div style={{ position: "relative" }}>
              <input type={mostrarSenha ? "text" : "password"} value={credenciais.senha} onChange={e => setCredenciais(p => ({ ...p, senha: e.target.value }))} placeholder="Digite sua senha master" style={{ ...inputStyle, paddingRight: 40 }} />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginBottom: 10, textAlign: "center" }}>{erroLogin}</div>}

          <button onClick={fazerLoginCorporativo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.gold},${C.orange})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
            👑 Entrar como Robson (Super Admin) →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 20px" }}>
      {/* Logotipo Limpo */}
      <div style={{ textAlign: "center", marginBottom: 24, animation: "rise 0.5s ease both" }}>
        <div style={{ animation: "pulse 2s ease infinite", filter: "drop-shadow(0 0 24px rgba(0,201,177,0.5))", marginBottom: 10 }}>
          <svg width="64" height="64" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="8" fill={C.teal} />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.teal} strokeWidth="2" fill="none" opacity="0.9" />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(60 40 40)" />
            <ellipse cx="40" cy="40" rx="35" ry="14" stroke={C.purple} strokeWidth="1.5" fill="none" opacity="0.6" transform="rotate(120 40 40)" />
          </svg>
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 3, background: `linear-gradient(135deg,${C.teal},${C.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AXION</div>
        <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 2 }}>RADIOTERAPIA HUMANIZADA</div>
      </div>

      {/* Seletor Público de Perfis (Sem a aba Super Admin) */}
      <div style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: 3, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, width: "100%", maxWidth: 380, marginBottom: 16 }}>
        {[
          ["paciente", "🧑 Paciente"],
          ["medico", "🏥 Profissional Saúde"],
          ["admin_hospital", "🏢 Admin Hospital"]
        ].map(([p, label]) => (
          <button key={p} onClick={() => { setPerfilAcesso(p); setModo("inicio"); setErroLogin(""); }} style={{ padding: "10px 2px", borderRadius: 10, border: "none", background: perfilAcesso === p ? (p === "admin_hospital" ? `${C.purple}22` : p === "medico" ? `${C.blue}22` : `${C.teal}22`) : "transparent", color: perfilAcesso === p ? (p === "admin_hospital" ? C.purple : p === "medico" ? C.blue : C.teal) : C.muted, fontWeight: perfilAcesso === p ? 900 : 600, fontSize: 11, transition: "all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* PACIENTE */}
      {perfilAcesso === "paciente" && (
        <div style={{ background: C.navyL, border: `1px solid ${C.teal}30`, borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 380, animation: "rise 0.4s ease both" }}>
          {modo === "inicio" && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 6 }}>Área do Paciente 👋</div>
              <div style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.7, marginBottom: 22 }}>Acesse com seu código único ou crie seu perfil.</div>
              <button onClick={() => setModo("login")} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 14, marginBottom: 12 }}>
                🔑 Entrar com meu Código Único
              </button>
              <button onClick={() => setModo("cadastro")} style={{ width: "100%", padding: "14px", borderRadius: 14, border: `1.5px solid ${C.teal}55`, background: "transparent", color: C.teal, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                ✨ Criar meu perfil
              </button>

              <button onClick={() => { setModo("recuperar"); setPacienteRecuperado(null); setErroRecuperacao(""); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 11, fontWeight: 700, width: "100%", textDecoration: "underline", textAlign: "center", marginTop: 4 }}>
                ❓ Esqueci meu código de acesso
              </button>
            </div>
          )}

          {modo === "login" && (
            <div>
              <button onClick={() => setModo("inicio")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, marginBottom: 14 }}>← Voltar</button>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>🔑 Digite seu Código AXION</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Informe o código fornecido pelo seu hospital para acessar suas informações.</div>
              <label style={labelStyle}>CÓDIGO ÚNICO DO PACIENTE</label>
              <input value={codigoLogin} onChange={e => setCodigoLogin(e.target.value)} onKeyDown={e => { if (e.key === "Enter") fazerLoginPaciente(); }} placeholder="Ex: AX-ABC-1234" autoFocus style={{ ...inputStyle, letterSpacing: 2, fontSize: 16, textAlign: "center", textTransform: "uppercase" }} />
              {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginTop: 8, textAlign: "center" }}>{erroLogin}</div>}
              <button onClick={fazerLoginPaciente} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 15, marginTop: 18 }}>
                Entrar →
              </button>
            </div>
          )}

          {modo === "recuperar" && (
            <div>
              <button onClick={() => setModo("inicio")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, marginBottom: 14 }}>← Voltar</button>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>🔍 Recuperar meu Código</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>Digite o seu nome completo como cadastrado no hospital para localizar seu código.</div>

              <label style={labelStyle}>SEU NOME COMPLETO *</label>
              <input value={buscaNomeRecuperacao} onChange={e => setBuscaNomeRecuperacao(e.target.value)} onKeyDown={e => { if (e.key === "Enter") buscarCodigoPerdido(); }} placeholder="Ex: Robson Cordeiro" style={inputStyle} />

              <button onClick={buscarCodigoPerdido} disabled={buscandoRecuperacao} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 900, fontSize: 13, marginTop: 14, marginBottom: 14 }}>
                {buscandoRecuperacao ? "Buscando no banco..." : "🔍 Localizar meu Código"}
              </button>

              {erroRecuperacao && <div style={{ fontSize: 12, color: C.pink, textAlign: "center", marginBottom: 12, lineHeight: 1.6 }}>{erroRecuperacao}</div>}

              {pacienteRecuperado && (
                <div style={{ background: `${C.teal}18`, border: `2px solid ${C.teal}`, borderRadius: 16, padding: "16px", textAlign: "center", animation: "rise 0.3s ease" }}>
                  <div style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>CÓDIGO LOCALIZADO PARA {pacienteRecuperado.nome.toUpperCase()}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.teal, letterSpacing: 3, margin: "8px 0", fontFamily: "'Space Grotesk',sans-serif" }}>{pacienteRecuperado.codigo}</div>
                  <button onClick={() => { onEntrar({ ...pacienteRecuperado, role: "paciente" }); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: C.teal, color: C.navy, fontWeight: 900, fontSize: 13 }}>
                    Entrar Agora com este Código →
                  </button>
                </div>
              )}
            </div>
          )}

          {modo === "cadastro" && (
            <div>
              <button onClick={() => setModo("inicio")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, marginBottom: 14 }}>← Voltar</button>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Criar meu perfil ✨</div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>NOME COMPLETO *</label>
                <input value={form.nome} onChange={e => iF("nome", e.target.value)} placeholder="Como você se chama?" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>TIPO DE TRATAMENTO *</label>
                <input value={form.tipo} onChange={e => iF("tipo", e.target.value)} placeholder="Ex: Mama, Próstata, Pulmão..." style={inputStyle} />
              </div>
              <button onClick={concluirCadastro} disabled={!form.nome || !form.tipo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: form.nome && form.tipo ? `linear-gradient(135deg,${C.teal},${C.blue})` : "rgba(255,255,255,0.1)", color: form.nome && form.tipo ? C.navy : C.muted, fontWeight: 900, fontSize: 14 }}>
                🎉 Gerar meu Código Único
              </button>
            </div>
          )}
        </div>
      )}

      {/* PROFISSIONAL DA UNIDADE */}
      {perfilAcesso === "medico" && (
        <div style={{ background: C.navyL, border: `1px solid ${C.blue}44`, borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 380, animation: "rise 0.4s ease both" }}>
          {modo !== "trocar_senha" ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.blue }}>Profissional da Unidade 🏥</div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 18 }}>Médicos, Enfermeiros e Técnicos em Radioterapia.</div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>E-MAIL PROFISSIONAL *</label>
                <input value={credenciais.email} onChange={e => setCredenciais(p => ({ ...p, email: e.target.value }))} placeholder="prof@hospital.com" style={inputStyle} />
              </div>

              {/* Campo Senha com Olhinho Toggle */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>SENHA DE ACESSO *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarSenha ? "text" : "password"} value={credenciais.senha} onChange={e => setCredenciais(p => ({ ...p, senha: e.target.value }))} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginBottom: 10, textAlign: "center" }}>{erroLogin}</div>}

              <button onClick={fazerLoginCorporativo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.blue},#29b6f6)`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                Entrar no Painel Clínico →
              </button>
            </div>
          ) : (
            <div style={{ animation: "rise 0.4s ease" }}>
              <div style={{ fontSize: 24, textAlign: "center", marginBottom: 6 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 900, textAlign: "center", color: C.gold, marginBottom: 4 }}>Primeiro Acesso Detectado</div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
                Olá <strong>{profPrimeiroAcesso?.nome}</strong>. Por motivos de segurança, cadastre sua nova senha pessoal antes de continuar.
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ ...labelStyle, color: C.gold }}>CADASTRAR NOVA SENHA *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarNovaSenha ? "text" : "password"} value={trocaSenha.novaSenha} onChange={e => setTrocaSenha(p => ({ ...p, novaSenha: e.target.value }))} placeholder="Mínimo 6 caracteres" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarNovaSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, color: C.gold }}>CONFIRMAR NOVA SENHA *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarConfirmaSenha ? "text" : "password"} value={trocaSenha.confirmaSenha} onChange={e => setTrocaSenha(p => ({ ...p, confirmaSenha: e.target.value }))} placeholder="Repita a nova senha" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarConfirmaSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{erroLogin}</div>}

              <button onClick={salvarNovaSenhaPrimeiroAcesso} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.gold},${C.orange})`, color: C.navy, fontWeight: 900, fontSize: 14 }}>
                🔒 Salvar Nova Senha & Acessar Sistema
              </button>
            </div>
          )}
        </div>
      )}

      {/* ADMIN DA UNIDADE HOSPITALAR */}
      {perfilAcesso === "admin_hospital" && (
        <div style={{ background: C.navyL, border: `1.5px solid ${C.purple}55`, borderRadius: 24, padding: "24px 20px", width: "100%", maxWidth: 380, animation: "rise 0.4s ease both" }}>
          {modo !== "trocar_senha_admin" ? (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, textAlign: "center", marginBottom: 4, color: C.purple }}>Admin da Unidade Hospitalar 🏢</div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginBottom: 18 }}>Gestão da equipe médica e código de pacientes.</div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>NOME DA UNIDADE OU E-MAIL DO ADMIN *</label>
                <input value={credenciais.email} onChange={e => setCredenciais(p => ({ ...p, email: e.target.value }))} placeholder="Ex: Hospital Doutor Luiz Sampa" style={inputStyle} />
              </div>

              {/* Campo Senha com Olhinho Toggle */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>SENHA PROVISÓRIA / ACESSO *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarSenha ? "text" : "password"} value={credenciais.senha} onChange={e => setCredenciais(p => ({ ...p, senha: e.target.value }))} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginBottom: 10, textAlign: "center" }}>{erroLogin}</div>}

              <button onClick={fazerLoginCorporativo} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                🏢 Entrar como Admin do Hospital →
              </button>
            </div>
          ) : (
            /* MODAL OBRIGATÓRIO DE TROCA DE SENHA DO ADMIN DO HOSPITAL */
            <div style={{ animation: "rise 0.4s ease" }}>
              <div style={{ fontSize: 24, textAlign: "center", marginBottom: 6 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 900, textAlign: "center", color: C.purple, marginBottom: 4 }}>Primeiro Acesso do Gestor</div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>
                Bem-vindo ao AXION, Gestor da Unidade <strong>{hospitalPrimeiroAcesso?.nome}</strong>. Cadastre sua nova senha pessoal antes de acessar.
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ ...labelStyle, color: C.purple }}>CADASTRAR NOVA SENHA DO GESTOR *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarNovaSenha ? "text" : "password"} value={trocaSenha.novaSenha} onChange={e => setTrocaSenha(p => ({ ...p, novaSenha: e.target.value }))} placeholder="Mínimo 6 caracteres" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarNovaSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ ...labelStyle, color: C.purple }}>CONFIRMAR NOVA SENHA *</label>
                <div style={{ position: "relative" }}>
                  <input type={mostrarConfirmaSenha ? "text" : "password"} value={trocaSenha.confirmaSenha} onChange={e => setTrocaSenha(p => ({ ...p, confirmaSenha: e.target.value }))} placeholder="Repita a nova senha" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button type="button" onClick={() => setMostrarConfirmaSenha(!mostrarConfirmaSenha)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.7 }}>
                    {mostrarConfirmaSenha ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {erroLogin && <div style={{ color: C.pink, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{erroLogin}</div>}

              <button onClick={salvarNovaSenhaPrimeiroAcesso} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.blue})`, color: "#fff", fontWeight: 900, fontSize: 14 }}>
                🔒 Salvar Nova Senha & Acessar Painel Hospitalar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TelaCodigoGerado({ perfil, onContinuar }) {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(perfil.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px" }}>
      <div style={{ background: C.navyL, border: `2px solid ${C.teal}55`, borderRadius: 24, padding: "32px 24px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Perfil criado, {perfil.nome.split(" ")[0]}!</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>Guarde ou copie seu código para entrar novamente no sistema a qualquer momento.</div>

        <div style={{ background: `${C.teal}18`, border: `2px solid ${C.teal}`, borderRadius: 18, padding: "18px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.teal, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>SEU CÓDIGO ÚNICO AXION</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, fontFamily: "'Space Grotesk',sans-serif", color: C.teal }}>{perfil.codigo}</div>
        </div>

        <button onClick={copiarCodigo} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid ${C.teal}`, background: copiado ? `${C.teal}22` : "transparent", color: C.teal, fontWeight: 800, fontSize: 13, marginBottom: 14 }}>
          {copiado ? "✓ Código Copiado para a Área de Transferência!" : "📋 Copiar Código de Acesso"}
        </button>

        <button onClick={onContinuar} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.teal},${C.blue})`, color: C.navy, fontWeight: 800, fontSize: 15 }}>
          Entrar no AXION →
        </button>
      </div>
    </div>
  );
}
