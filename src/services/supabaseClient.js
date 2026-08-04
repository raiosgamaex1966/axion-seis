import { createClient } from '@supabase/supabase-js';
import { normalizarCodigo } from '../utils/codeGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Credenciais Pre-Cadastradas de Fallback para Garantia Global (Sampa D'or)
const CONTAS_PADRAO_SAMPA = {
  "luizsampa@gmail.com": {
    id: "hosp_sampa_dor",
    nome: "Hospital Sampa D'or",
    email_admin: "luizsampa@gmail.com",
    senha: "123456789",
    senha_provisoria: "123456789",
    primeiro_acesso: false,
    role: "admin_hospital"
  },
  "chicocesar@gmail.com": {
    id: "prof_chico_cesar",
    nome: "Dr. Chico César",
    email: "chicocesar@gmail.com",
    cargo: "medico",
    registro_profissional: "CRM 52345",
    hospital_nome: "Hospital Sampa D'or",
    senha: "123456789",
    senha_provisoria: "123456789",
    primeiro_acesso: false,
    role: "medico"
  },
  "patriciamello@gmail.com": {
    id: "prof_patricia_mello",
    nome: "Patrícia Mello",
    email: "patriciamello@gmail.com",
    cargo: "enfermeiro",
    registro_profissional: "COREN 56789",
    hospital_nome: "Hospital Sampa D'or",
    senha: "123456789",
    senha_provisoria: "123456789",
    primeiro_acesso: false,
    role: "medico"
  },
  "ricardopinto@gmail.com": {
    id: "prof_ricardo_pinto",
    nome: "Ricardo Pinto",
    email: "ricardopinto@gmail.com",
    cargo: "tecnico",
    registro_profissional: "CRTR 0477",
    hospital_nome: "Hospital Sampa D'or",
    senha: "123456789",
    senha_provisoria: "123456789",
    primeiro_acesso: false,
    role: "medico"
  }
};

// Serviço de Abstração para Autenticação e Dados de Pacientes / Profissionais / Sintomas / Prontuário Multidisciplinar
export const PatientService = {
  // Purga registros fictícios de testes do Supabase e LocalStorage
  async purgeMockPatients() {
    if (supabaseConfigured) {
      try {
        await supabase.from('pacientes').delete().in('codigo', ['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966']);
      } catch (e) {}
    }
    localStorage.removeItem('axion_pacientes');
  },

  // Retorna a conta de fallback se cadastrada
  obterContaPadrao(email) {
    if (!email) return null;
    const termo = email.toLowerCase().trim();
    return CONTAS_PADRAO_SAMPA[termo] || null;
  },

  // Login pelo código único
  async loginByCode(codigoInput) {
    const alvo = normalizarCodigo(codigoInput);
    
    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .ilike('codigo', `%${codigoInput.trim()}%`)
          .single();

        if (data && !error) return { success: true, perfil: data };
      } catch (err) {
        console.warn('Supabase login fallback:', err);
      }
    }

    // Fallback LocalStorage
    try {
      const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      const chaveEncontrada = Object.keys(todos).find(k => normalizarCodigo(k) === alvo);
      const p = chaveEncontrada ? todos[chaveEncontrada] : null;
      if (p) return { success: true, perfil: p };
    } catch (e) {}

    return { success: false, error: 'Código não encontrado.' };
  },

  // Salvar ou atualizar dados do perfil do paciente com mesclagem segura
  async savePatient(perfil) {
    if (!perfil || !perfil.codigo) return perfil;

    const codigo = perfil.codigo;

    // 1. Carrega histórico existente do LocalStorage
    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const existente = todos[codigo] || {};

    const histEnfLocal = JSON.parse(localStorage.getItem(`axion_enfermagem_${codigo}`) || '[]');
    const histTecLocal = JSON.parse(localStorage.getItem(`axion_tecnico_${codigo}`) || '[]');
    const histMedLocal = JSON.parse(localStorage.getItem(`axion_medico_${codigo}`) || '[]');

    const historicoEnfermagem = perfil.historico_enfermagem || existente.historico_enfermagem || histEnfLocal;
    const historicoTecnico = perfil.historico_tecnico || existente.historico_tecnico || histTecLocal;
    const historicoMedico = perfil.historico_medico || existente.historico_medico || histMedLocal;

    const unificado = {
      ...existente,
      ...perfil,
      codigo: codigo,
      nome: perfil.nome || existente.nome,
      idade: perfil.idade || existente.idade,
      sexo: perfil.sexo || existente.sexo,
      tipo: perfil.tipo || perfil.tipo_tratamento || existente.tipo,
      hospital: perfil.hospital || existente.hospital,
      hospital_id: perfil.hospital_id || existente.hospital_id,
      medico: perfil.medico || perfil.medico_responsavel || existente.medico,
      totalSessoes: perfil.totalSessoes || perfil.total_sessoes || existente.totalSessoes || 30,
      sessaoAtual: perfil.sessaoAtual !== undefined ? perfil.sessaoAtual : (perfil.sessao_atual !== undefined ? perfil.sessao_atual : (existente.sessaoAtual || 0)),
      historico_enfermagem: historicoEnfermagem,
      historico_tecnico: historicoTecnico,
      historico_medico: historicoMedico
    };

    localStorage.setItem(`axion_enfermagem_${codigo}`, JSON.stringify(historicoEnfermagem));
    localStorage.setItem(`axion_tecnico_${codigo}`, JSON.stringify(historicoTecnico));
    localStorage.setItem(`axion_medico_${codigo}`, JSON.stringify(historicoMedico));

    todos[codigo] = unificado;
    localStorage.setItem('axion_pacientes', JSON.stringify(todos));

    // 2. Persiste no Supabase em tempo real
    if (supabaseConfigured) {
      try {
        await supabase.from('pacientes').upsert([{
          codigo: unificado.codigo,
          nome: unificado.nome,
          idade: parseInt(unificado.idade) || null,
          sexo: unificado.sexo,
          tipo_tratamento: unificado.tipo,
          medico_responsavel: unificado.medico,
          hospital: unificado.hospital,
          hospital_id: unificado.hospital_id,
          total_sessoes: parseInt(unificado.totalSessoes) || 30,
          sessao_atual: parseInt(unificado.sessaoAtual) || 0,
          historico_enfermagem: unificado.historico_enfermagem,
          historico_tecnico: unificado.historico_tecnico,
          historico_medico: unificado.historico_medico
        }], { onConflict: 'codigo' });
      } catch (err) {
        try {
          await supabase.from('pacientes').update({
            nome: unificado.nome,
            sessao_atual: parseInt(unificado.sessaoAtual) || 0
          }).eq('codigo', unificado.codigo);
        } catch (e2) {}
      }
    }

    return unificado;
  },

  // Adicionar Evolução de Enfermagem
  async adicionarEvolucaoEnfermagem(pacienteOuCodigo, registroEnfermagem) {
    let paciente = typeof pacienteOuCodigo === 'object' ? pacienteOuCodigo : null;
    const codigo = paciente?.codigo || pacienteOuCodigo;

    if (!codigo) return null;

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const base = paciente || todos[codigo] || { codigo };

    const histEnfLocal = JSON.parse(localStorage.getItem(`axion_enfermagem_${codigo}`) || '[]');
    const historico = base.historico_enfermagem || histEnfLocal || [];
    
    historico.unshift(registroEnfermagem);
    base.historico_enfermagem = historico;

    localStorage.setItem(`axion_enfermagem_${codigo}`, JSON.stringify(historico));

    const salvo = await this.savePatient(base);
    return salvo;
  },

  // Adicionar Registro Técnico de Aplicação
  async adicionarRegistroTecnico(pacienteOuCodigo, registroTecnico, novaSessaoAtual) {
    let paciente = typeof pacienteOuCodigo === 'object' ? pacienteOuCodigo : null;
    const codigo = paciente?.codigo || pacienteOuCodigo;

    if (!codigo) return null;

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const base = paciente || todos[codigo] || { codigo };

    const histTecLocal = JSON.parse(localStorage.getItem(`axion_tecnico_${codigo}`) || '[]');
    const historico = base.historico_tecnico || histTecLocal || [];
    
    historico.unshift(registroTecnico);
    base.historico_tecnico = historico;
    if (novaSessaoAtual !== undefined) {
      base.sessaoAtual = novaSessaoAtual;
      base.sessao_atual = novaSessaoAtual;
    }

    localStorage.setItem(`axion_tecnico_${codigo}`, JSON.stringify(historico));

    const salvo = await this.savePatient(base);
    return salvo;
  },

  // Adicionar Conduta Médica Oncologia
  async adicionarCondutaMedica(pacienteOuCodigo, registroMedico) {
    let paciente = typeof pacienteOuCodigo === 'object' ? pacienteOuCodigo : null;
    const codigo = paciente?.codigo || pacienteOuCodigo;

    if (!codigo) return null;

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const base = paciente || todos[codigo] || { codigo };

    const histMedLocal = JSON.parse(localStorage.getItem(`axion_medico_${codigo}`) || '[]');
    const historico = base.historico_medico || histMedLocal || [];

    historico.unshift(registroMedico);
    base.historico_medico = historico;

    localStorage.setItem(`axion_medico_${codigo}`, JSON.stringify(historico));

    const salvo = await this.savePatient(base);
    return salvo;
  },

  // Registrar Sintomas Diários no Supabase + LocalStorage
  async registrarSintomas(codigo, sintomasObj) {
    if (!codigo) return false;

    if (supabaseConfigured) {
      try {
        await supabase.from('sintomas_pacientes').insert([{
          paciente_codigo: codigo,
          sintomas: sintomasObj,
          criado_em: new Date().toISOString()
        }]);
      } catch (e) {
        try {
          await supabase.from('pacientes').update({
            ultimos_sintomas: sintomasObj
          }).eq('codigo', codigo);
        } catch (err) {}
      }
    }

    try {
      const keyHist = `axion_sintomas_${codigo}`;
      const historico = JSON.parse(localStorage.getItem(keyHist) || '[]');
      historico.unshift({
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR'),
        sintomas: sintomasObj
      });
      localStorage.setItem(keyHist, JSON.stringify(historico));

      const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      if (todos[codigo]) {
        todos[codigo].sintomas = sintomasObj;
        localStorage.setItem('axion_pacientes', JSON.stringify(todos));
      }
    } catch (e) {}

    return true;
  },

  // Obter Sintomas Salvos do Paciente
  async obterSintomas(codigo) {
    if (!codigo) return null;

    try {
      const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      if (todos[codigo] && todos[codigo].sintomas) {
        return todos[codigo].sintomas;
      }
      const keyHist = `axion_sintomas_${codigo}`;
      const historico = JSON.parse(localStorage.getItem(keyHist) || '[]');
      if (historico.length > 0) return historico[0].sintomas;
    } catch (e) {}

    if (supabaseConfigured) {
      try {
        const { data } = await supabase
          .from('sintomas_pacientes')
          .select('sintomas')
          .eq('paciente_codigo', codigo)
          .order('criado_em', { ascending: false })
          .limit(1);

        if (data && data.length > 0) return data[0].sintomas;
      } catch (e) {}
    }

    return null;
  },

  // Listar pacientes unificando Supabase + LocalStorage (Sem perda de historicos)
  async listarPacientes() {
    let mapaPacientes = {};

    try {
      const todosLocais = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      Object.values(todosLocais).forEach(p => {
        if (p.codigo && !['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966'].includes(p.codigo)) {
          const codigo = p.codigo;
          const histEnfLocal = JSON.parse(localStorage.getItem(`axion_enfermagem_${codigo}`) || '[]');
          const histTecLocal = JSON.parse(localStorage.getItem(`axion_tecnico_${codigo}`) || '[]');
          const histMedLocal = JSON.parse(localStorage.getItem(`axion_medico_${codigo}`) || '[]');

          mapaPacientes[codigo] = {
            ...p,
            historico_enfermagem: p.historico_enfermagem || histEnfLocal,
            historico_tecnico: p.historico_tecnico || histTecLocal,
            historico_medico: p.historico_medico || histMedLocal
          };
        }
      });
    } catch (e) {}

    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .order('criado_em', { ascending: false });

        if (data && !error) {
          data.forEach(p => {
            if (p.codigo && !['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966'].includes(p.codigo)) {
              const codigo = p.codigo;
              const localObj = mapaPacientes[codigo] || {};
              const histEnfLocal = JSON.parse(localStorage.getItem(`axion_enfermagem_${codigo}`) || '[]');
              const histTecLocal = JSON.parse(localStorage.getItem(`axion_tecnico_${codigo}`) || '[]');
              const histMedLocal = JSON.parse(localStorage.getItem(`axion_medico_${codigo}`) || '[]');

              const histEnf = (Array.isArray(p.historico_enfermagem) && p.historico_enfermagem.length > 0)
                ? p.historico_enfermagem
                : (Array.isArray(localObj.historico_enfermagem) && localObj.historico_enfermagem.length > 0 ? localObj.historico_enfermagem : histEnfLocal);

              const histTec = (Array.isArray(p.historico_tecnico) && p.historico_tecnico.length > 0)
                ? p.historico_tecnico
                : (Array.isArray(localObj.historico_tecnico) && localObj.historico_tecnico.length > 0 ? localObj.historico_tecnico : histTecLocal);

              const histMed = (Array.isArray(p.historico_medico) && p.historico_medico.length > 0)
                ? p.historico_medico
                : (Array.isArray(localObj.historico_medico) && localObj.historico_medico.length > 0 ? localObj.historico_medico : histMedLocal);

              mapaPacientes[codigo] = {
                ...localObj,
                ...p,
                nome: p.nome || localObj.nome,
                codigo: p.codigo,
                tipo: p.tipo_tratamento || p.tipo || localObj.tipo,
                sessaoAtual: p.sessao_atual !== undefined ? p.sessao_atual : localObj.sessaoAtual,
                totalSessoes: p.total_sessoes !== undefined ? p.total_sessoes : localObj.totalSessoes,
                historico_enfermagem: histEnf,
                historico_tecnico: histTec,
                historico_medico: histMed
              };
            }
          });
        }
      } catch (err) {
        console.warn('Supabase paciente list fallback:', err);
      }
    }

    return Object.values(mapaPacientes);
  }
};
