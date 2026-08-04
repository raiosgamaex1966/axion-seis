import { createClient } from '@supabase/supabase-js';
import { normalizarCodigo } from '../utils/codeGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Serviço de Abstração para Autenticação e Dados de Pacientes / Profissionais
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

  // Salvar ou atualizar dados do perfil do paciente
  async savePatient(perfil) {
    if (supabaseConfigured) {
      try {
        await supabase.from('pacientes').upsert({
          codigo: perfil.codigo,
          nome: perfil.nome,
          idade: parseInt(perfil.idade) || null,
          sexo: perfil.sexo,
          tipo_tratamento: perfil.tipo || perfil.tipo_tratamento,
          medico_responsavel: perfil.medico || perfil.medico_responsavel,
          hospital: perfil.hospital || 'Hospital de Câncer AXION',
          total_sessoes: parseInt(perfil.totalSessoes || perfil.total_sessoes) || 30,
          sessao_atual: parseInt(perfil.sessaoAtual || perfil.sessao_atual) || 0,
        });
      } catch (err) {
        console.warn('Could not save to Supabase, fallback to local:', err);
      }
    }

    // Salvar no LocalStorage sempre para sincronização hibrida
    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    todos[perfil.codigo] = perfil;
    localStorage.setItem('axion_pacientes', JSON.stringify(todos));
    return perfil;
  },

  // Listar pacientes unificando Supabase + LocalStorage (Filtrando registros de teste)
  async listarPacientes() {
    let mapaPacientes = {};

    // 1. Carrega do LocalStorage primeiro
    try {
      const todosLocais = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
      Object.values(todosLocais).forEach(p => {
        if (p.codigo && !['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966'].includes(p.codigo)) {
          mapaPacientes[p.codigo] = p;
        }
      });
    } catch (e) {}

    // 2. Mescla com dados da nuvem do Supabase
    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .order('criado_em', { ascending: false });

        if (data && !error) {
          data.forEach(p => {
            // Ignora os codigos ficticios de testes antigos
            if (p.codigo && !['AX-QHH-5021', 'AX-DAT-3036', 'AX-EXB-8918', 'AX-VUT-5966'].includes(p.codigo)) {
              mapaPacientes[p.codigo] = {
                ...mapaPacientes[p.codigo],
                ...p,
                nome: p.nome,
                codigo: p.codigo,
                tipo: p.tipo_tratamento || p.tipo,
                sessaoAtual: p.sessao_atual,
                totalSessoes: p.total_sessoes
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
