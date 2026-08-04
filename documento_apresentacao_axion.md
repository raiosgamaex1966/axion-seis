# 🏥 AXION - Sistema Integrado de Radioterapia Humanizada
### *Documento de Apresentação Institucional e Funcional*

---

## 📌 Visão Geral da Plataforma

O **AXION** é uma plataforma tecnológica de ponta desenvolvida para otimizar o fluxo de atendimento em clínicas e unidades hospitalares de **Radioterapia Oncologia**. 

O sistema integra, em ambiente único e altamente seguro, a gestão administrativa da unidade, a atuação da equipe multidisciplinar de saúde e o acompanhamento contínuo do paciente, em rigorosa conformidade com a **Lei Geral de Proteção de Dados (LGPD)** e as normas regulamentares dos conselhos de saúde (**CFM, COFEN e CRTR**).

---

## 🏢 Módulo 1: Gestão da Unidade Hospitalar (Painel Administrativo)

O **Módulo Administrativo** é o centro de controle da unidade hospitalar. Projetado para proporcionar máxima eficiência operacional sem comprometer o sigilo médico dos pacientes.

### ⚙️ Funcionalidades do Administrador:
1. **Admissão de Pacientes & Geração de Código Único**:
   - Cadastra os novos pacientes admitidos na unidade para o tratamento de radioterapia;
   - Gera um **Código de Acesso Único Individual** (ex: `AX-NAE-5602`), dispensando senhas complexas e facilitando o acesso do paciente.
2. **Gestão do Corpo Clínico e Assistencial**:
   - Cadastra e gerencia as permissões dos profissionais de saúde da unidade (Médicos Oncologistas, Enfermeiros e Técnicos em Radioterapia);
   - Emite credenciais de acesso individuais e permite o envio de instruções de entrada diretamente via mensagem aos profissionais.
3. **Controle Operacional & Faturamento**:
   - Acompanha em tempo real o volume de pacientes ativos na unidade e o total de sessões executadas, facilitando a prestação de contas com convênios e planos de saúde.
4. **Segurança Jurídica & LGPD**:
   - Em estrito respeito à LGPD e ao segredo profissional, o perfil administrativo gerencia fluxos operacionais e faturamento **sem ter acesso ao conteúdo clínico dos prontuários e evoluções de enfermagem**.

---

## 🏥 Módulo 2: Corpo Clínico & Prontuário Multidisciplinar Unificado

O **Módulo Clínico** organiza a assistência ao paciente dividindo o acesso por papéis profissionais com níveis de permissão específicos (**RBAC - Control de Acesso Baseado na Função**):

```
📋 PRONTUÁRIO MULTIDISCIPLINAR UNIFICADO (AXION)
├── ⚛️ TÉCNICO EM RADIOTERAPIA ── Baixa de Sessões & Ficha Técnica de Imobilização
├── 🩺 ENFERMEIRO(A) ONCOLOGIA ── Evolução de Enfermagem & Avaliação de Radiodermite
└── 👨‍⚕️ MÉDICO ONCOLOGISTA     ── Visão Consolidada em Linha do Tempo & Parecer Clínico
```

### 1. ⚛️ Painel do Técnico em Radioterapia:
- **Ficha Técnica de Aplicação da Sessão**: Registra os acessórios e dispositivos de imobilização utilizados (máscaras termoplásticas, colchões a vácuo, alinhamento a laser);
- **Baixa em Tempo Real**: Dá a baixa oficial da sessão realizada no dia (ex: Sessão #1 de 30), atualizando automaticamente o progresso do tratamento no sistema;
- **Observações da Aplicação**: Registra intercorrências técnicas do acelerador linear ou posicionamento.

### 2. 🩺 Painel do Enfermeiro(a) Oncologista:
- **Avaliação de Toxicidade Cutânea**: Classifica o nível de radiodermite do paciente (Grau 0 ao Grau 3) para intervenção precoce;
- **Anotação de Evolução de Enfermagem**: Registra aferição de sinais vitais, orientações de higiene, curativos e hidratação;
- **Validação de Sintomas**: Acompanha as queixas diárias enviadas pelo paciente.

### 3. 👨‍⚕️ Painel do Médico Oncologista / Radioterapeuta:
- **Visão Integrada em Linha do Tempo**: Visualiza em uma única tela toda a história do paciente durante o tratamento:
  - 📊 *O diário de sintomas relatado pelo paciente*;
  - 🩺 *As evoluções de enfermagem gravadas*;
  - ⚛️ *O histórico de sessões executadas pelos técnicos*.
- **Registro de Conduta Médica**: Campo exclusivo para inserção de condutas clínicas, orientações radioterápicas e prescrições.

---

## 📱 Módulo 3: Aplicativo do Paciente & Principais Benefícios

O **Aplicativo do Paciente** foi desenhado com foco na **humanização e usabilidade**, reduzindo a ansiedade durante todo o ciclo do tratamento.

```
🧑 APLICATIVO DO PACIENTE (AXION PWA)
├── 🔑 Acesso Simplificado por Código Único
├── 📊 Progresso em Tempo Real (% Concluído)
├── 📅 Calendário Interativo de 30 Sessões
├── 📝 Diário Diário de Sintomas (0 a 10)
└── 🤖 Assistente Virtual & Direitos do Paciente
```

### 🌟 Benefícios Diretos para o Paciente:

1. **Acesso Simples e Sem Burocracia**:
   - O paciente acessa todas as suas informações apenas digitando seu **Código Único AXION**, sem necessidade de lembrar senhas difíceis.
2. **Calendário Interativo de Tratamento**:
   - Visualiza os cartões com as **30 sessões planejadas**;
   - Identifica facilmente quais sessões já foram **concluídas com a data da aplicação** (`✓ Concluída`), a sessão agendada para **hoje** (`📍 HOJE`) e as próximas sessões.
3. **Diário Diário de Sintomas**:
   - Avalia de forma simples e intuitiva (nota de 0 a 10) os 6 principais indicadores de bem-estar: **Fadiga, Dor, Náusea, Apetite, Ansiedade e Sono**;
   - Os dados registrados caem **instantaneamente no prontuário da equipe de saúde**, permitindo suporte preventivo.
4. **IA Assistente de Orientação & Direitos**:
   - Tira dúvidas frequentes sobre o tratamento e fornece informações claras sobre os **Direitos Legais do Paciente Oncológico** (isenções, transporte, prioridades).
5. **Tecnologia Mobile PWA (Instalação Direta no Celular)**:
   - Pode ser adicionado como **aplicativo na tela inicial** de qualquer celular (Android ou iPhone) com um único clique, oferecendo inicialização rápida e funcionamento offline.

---

## 🏆 Resumo dos Impactos e Valor Agregado

| Pilar | Benefício Entregue pelo AXION |
| :--- | :--- |
| **Para a Gestão Hospitalar** | Controle preciso do fluxo de pacientes, auditoria simplificada e segurança jurídica total na separação entre faturamento e prontuário clínico (LGPD). |
| **Para a Equipe de Saúde** | Fim da comunicação fragmentada; linha do tempo unificada integrando Médicos, Enfermeiros e Técnicos em uma só ferramenta. |
| **Para o Paciente** | Acolhimento, transparência no progresso do tratamento e canal direto para relatar seus sintomas à equipe médica. |
