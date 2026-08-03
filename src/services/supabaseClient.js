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

  // Salvar ou atualizar dados do perfil
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
          hospital: perfil.hospital,
          total_sessoes: parseInt(perfil.totalSessoes || perfil.total_sessoes) || 30,
          sessao_atual: parseInt(perfil.sessaoAtual || perfil.sessao_atual) || 0,
        });
      } catch (err) {
        console.warn('Could not save to Supabase, fallback to local:', err);
      }
    }

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    todos[perfil.codigo] = perfil;
    localStorage.setItem('axion_pacientes', JSON.stringify(todos));
    return perfil;
  },

  // Listar pacientes para o painel profissional
  async listarPacientes() {
    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .order('atualizado_em', { ascending: false });

        if (data && !error && data.length > 0) return data;
      } catch (e) {}
    }

    const todos = JSON.parse(localStorage.getItem('axion_pacientes') || '{}');
    return Object.values(todos);
  },

  // Registrar diário de sintomas
  async registrarSintomas(codigo, { fadiga, dor, nausea, apetite, ansiedade, sono, observacoes }) {
    if (supabaseConfigured) {
      try {
        await supabase.from('sintomas_registrados').insert({
          paciente_codigo: codigo,
          nivel_fadiga: fadiga,
          nivel_dor: dor,
          humor: ansiedade > 5 ? 'Ansioso' : 'Confiante',
          observacoes: observacoes || `Sintomas registrados pelo paciente (Fadiga ${fadiga}/10, Dor ${dor}/10)`
        });
      } catch (e) {
        console.warn('Sintomas Supabase insert failed:', e);
      }
    }

    const key = `axion_sintomas_${codigo}`;
    const existentes = JSON.parse(localStorage.getItem(key) || '[]');
    existentes.unshift({ data: new Date().toLocaleDateString('pt-BR'), fadiga, dor, nausea, apetite, ansiedade, sono, observacoes });
    localStorage.setItem(key, JSON.stringify(existentes));
  },

  // Buscar mensagens do chat médico-paciente
  async getMensagensChat(codigo) {
    if (supabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('mensagens_chat')
          .select('*')
          .eq('paciente_codigo', codigo)
          .order('criado_em', { ascending: true });

        if (data && !error) return data;
      } catch (e) {}
    }

    const key = `axion_chat_${codigo}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // Enviar mensagem no chat médico-paciente
  async enviarMensagemChat(codigo, remetenteTipo, remetenteNome, mensagem) {
    if (supabaseConfigured) {
      try {
        const { data } = await supabase.from('mensagens_chat').insert({
          paciente_codigo: codigo,
          remetente_tipo: remetenteTipo,
          remetente_nome: remetenteNome,
          mensagem: mensagem
        }).select();

        if (data) return data[0];
      } catch (e) {}
    }

    const key = `axion_chat_${codigo}`;
    const existentes = JSON.parse(localStorage.getItem(key) || '[]');
    const nova = { id: Date.now(), paciente_codigo: codigo, remetente_tipo: remetenteTipo, remetente_nome: remetenteNome, mensagem, criado_em: new Date().toISOString() };
    existentes.push(nova);
    localStorage.setItem(key, JSON.stringify(existentes));
    return nova;
  }
};
