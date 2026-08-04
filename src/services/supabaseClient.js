import { createClient } from '@supabase/supabase-js';
import { normalizarCodigo } from '../utils/codeGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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

    // 1. Atualiza e mescla no LocalStorage primeiro para garantia imediata
    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    const existente = todos[perfil.codigo] || {};
    const unificado = {
      ...existente,
      ...perfil,
      codigo: perfil.codigo,
      nome: perfil.nome || existente.nome,
      idade: perfil.idade || existente.idade,
      sexo: perfil.sexo || existente.sexo,
      tipo: perfil.tipo || perfil.tipo_tratamento || existente.tipo,
      hospital: perfil.hospital || existente.hospital,
      hospital_id: perfil.hospital_id || existente.hospital_id,
      medico: perfil.medico || perfil.medico_responsavel || existente.medico,
      totalSessoes: perfil.totalSessoes || perfil.total_sessoes || existente.totalSessoes || 30,
      sessaoAtual: perfil.sessaoAtual !== undefined ? perfil.sessaoAtual : (perfil.sessao_atual !== undefined ? perfil.sessao_atual : (existente.sessaoAtual || 0)),
      historico_enfermagem: perfil.historico_enfermagem || existente.historico_enfermagem || [],
      historico_tecnico: perfil.historico_tecnico || existente.historico_tecnico || [],
      historico_medico: perfil.historico_medico || existente.historico_medico || []
    };

    todos[perfil.codigo] = unificado;
    localStorage.setItem('axion_pacientes', JSON.stringify(todos));

    // 2. Persiste no Supabase em tempo real com tratamento de erro
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
          // Tenta update básico caso upsert com array falhar por schema
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

    const historico = base.historico_enfermagem || [];
    historico.unshift(registroEnfermagem);
    base.historico_enfermagem = historico;

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

    const historico = base.historico_tecnico || [];
    historico.unshift(registroTecnico);
    base.historico_tecnico = historico;
    if (novaSessaoAtual !== undefined) {
      base.sessaoAtual = novaSessaoAtual;
      base.sessao_atual = novaSessaoAtual;
    }

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

    const historico = base.historico_medico || [];
    historico.unshift(registroMedico);
    base.historico_medico = historico;

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

  // Listar pacientes unificando Supabase + LocalStorage (Filtrando registros de teste)
  async listarPacientes() {
    let mapaPacientes = {};

    try {
      const todosLocais = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      Object.values(todosLocais).forEach(p => {
        if (p.codigo && !['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966'].includes(p.codigo)) {
          mapaPacientes[p.codigo] = p;
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
              mapaPacientes[p.codigo] = {
                ...mapaPacientes[p.codigo],
                ...p,
                nome: p.nome,
                codigo: p.codigo,
                tipo: p.tipo_tratamento || p.tipo,
                sessaoAtual: p.sessao_atual,
                totalSessoes: p.total_sessoes,
                sintomas: p.ultimos_sintomas || mapaPacientes[p.codigo]?.sintomas,
                historico_enfermagem: p.historico_enfermagem || mapaPacientes[p.codigo]?.historico_enfermagem || [],
                historico_tecnico: p.historico_tecnico || mapaPacientes[p.codigo]?.historico_tecnico || [],
                historico_medico: p.historico_medico || mapaPacientes[p.codigo]?.historico_medico || []
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
