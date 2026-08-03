-- ============================================================================
-- SCHEMAS DO BANCO DE DADOS SUPABASE PARA AXION SAAS MULTI-TENANT & SEGURANÇA
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de HOSPITAIS / CLÍNICAS (Tenants do SaaS)
CREATE TABLE IF NOT EXISTS public.hospitais_clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(30),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    plano_saas VARCHAR(50) DEFAULT 'Hospitalar Pro',
    max_pacientes INT DEFAULT 500,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de SUPER ADMINS (Dono do SaaS / Robson)
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de PROFISSIONAIS E ADMINS DA UNIDADE HOSPITALAR
CREATE TABLE IF NOT EXISTS public.profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitais_clinicas(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    registro_profissional VARCHAR(50),
    cargo VARCHAR(30) CHECK (cargo IN ('hospital_admin', 'medico', 'enfermeiro', 'tecnico')),
    especialidade VARCHAR(100) DEFAULT 'Radioterapia Oncologia',
    senha_provisoria VARCHAR(100) DEFAULT 'Axion@2026',
    primeiro_acesso BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de PACIENTES
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES public.hospitais_clinicas(id) ON DELETE SET NULL,
    medico_id UUID REFERENCES public.profissionais(id) ON DELETE SET NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    idade INT,
    sexo VARCHAR(20),
    tipo_tratamento VARCHAR(100),
    medico_responsavel VARCHAR(255),
    hospital VARCHAR(255),
    total_sessoes INT DEFAULT 30,
    sessao_atual INT DEFAULT 0,
    xp INT DEFAULT 0,
    nivel INT DEFAULT 1,
    pontos INT DEFAULT 0,
    sequencia_dias INT DEFAULT 1,
    total_tarefas_concluidas INT DEFAULT 0,
    role VARCHAR(20) DEFAULT 'paciente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_codigo ON public.pacientes (UPPER(codigo));

-- 5. Tabela de SESSÕES EXECUTADAS PELO TÉCNICO
CREATE TABLE IF NOT EXISTS public.sessoes_radioterapia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_codigo VARCHAR(20) REFERENCES public.pacientes(codigo) ON DELETE CASCADE,
    tecnico_nome VARCHAR(255),
    numero_sessao INT NOT NULL,
    data_execucao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'Concluída',
    observacao_tecnica TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de SINTOMAS ACOMPANHADOS PELA ENFERMAGEM/MÉDICO
CREATE TABLE IF NOT EXISTS public.sintomas_registrados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_codigo VARCHAR(20) REFERENCES public.pacientes(codigo) ON DELETE CASCADE,
    data_registro DATE DEFAULT CURRENT_DATE,
    nivel_fadiga INT CHECK (nivel_fadiga BETWEEN 0 AND 10),
    nivel_dor INT CHECK (nivel_dor BETWEEN 0 AND 10),
    reacao_cutanea VARCHAR(100),
    humor VARCHAR(50),
    sintomas_selecionados TEXT[],
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de MENSAGENS DO CHAT CLÍNICO
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_codigo VARCHAR(20) REFERENCES public.pacientes(codigo) ON DELETE CASCADE,
    remetente_tipo VARCHAR(20) CHECK (remetente_tipo IN ('paciente', 'profissional', 'sistema')),
    remetente_nome VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.hospitais_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_radioterapia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sintomas_registrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso publico hospitais" ON public.hospitais_clinicas FOR ALL USING (true);
CREATE POLICY "Acesso publico super_admins" ON public.super_admins FOR ALL USING (true);
CREATE POLICY "Acesso publico profissionais" ON public.profissionais FOR ALL USING (true);
CREATE POLICY "Acesso publico pacientes" ON public.pacientes FOR ALL USING (true);
CREATE POLICY "Acesso publico sessoes" ON public.sessoes_radioterapia FOR ALL USING (true);
CREATE POLICY "Acesso publico sintomas" ON public.sintomas_registrados FOR ALL USING (true);
CREATE POLICY "Acesso publico chat" ON public.mensagens_chat FOR ALL USING (true);
