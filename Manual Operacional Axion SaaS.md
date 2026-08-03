# 📖 Manual Operacional - AXION SaaS Multi-Tenant

> **Plataforma SaaS de Radioterapia Humanizada com Inteligência Artificial Multi-Provedor**  
> *Versão: 2.0 (Pronto para PWA & Mobile)*

---

## 📋 Sumário
1. [Visão Geral e Arquitetura](#-1-visão-geral-e-arquitetura)
2. [Estratégia PWA (Progressive Web App)](#-2-estratégia-pwa-progressive-web-app)
3. [Hierarquia dos 4 Perfis de Acesso (RBAC)](#-3-hierarquia-dos-4-perfis-de-acesso-rbac)
   - [👑 3.1. Super Admin SaaS (Robson)](#--31-super-admin-saas-robson)
   - [🏢 3.2. Admin da Unidade Hospitalar](#--32-admin-da-unidade-hospitalar)
   - [🏥 3.3. Profissionais de Saúde (Médico, Enfermeiro, Técnico)](#--33-profissionais-de-saúde)
   - [🧑 3.4. Paciente (Adulto & Kids)](#--34-paciente)
4. [Mecanismos de Segurança e Credenciais](#-4-mecanismos-de-segurança-e-credenciais)
5. [Sistema de Inteligência Artificial Multi-Provedor](#-5-sistema-de-inteligência-artificial-multi-provedor)
6. [Guia de Execução e Deploy](#-6-guia-de-execução-e-deploy)

---

## 🚀 1. Visão Geral e Arquitetura

O **AXION** é uma plataforma SaaS B2B2C desenvolvida para apoiar hospitais, clínicas oncológicas, equipes multidisciplinares de saúde e pacientes em tratamento radioterápico.

O sistema integra:
- **Painel Clínico Multidisciplinar**: Ferramentas específicas para Médicos Oncologistas, Enfermeiros e Técnicos em Radioterapia.
- **Acompanhamento do Paciente**: Diário de sintomas diários, gamificação (missões e pontos), assistente de IA humanizado e área infantil (AXION Kids).
- **Infraestrutura em Nuvem**: Banco de dados PostgreSQL no **Supabase** com isolamento por tenant (Row Level Security - RLS).

---

## 📱 2. Estratégia PWA (Progressive Web App)

Antes de publicar o aplicativo nas lojas oficiais (Google Play Store e Apple App Store), o AXION opera nativamente como um **PWA (Progressive Web App)**.

```
       [ NAVEGADOR WEB / MOBILE ]
                  │
   ┌──────────────┴──────────────┐
   ▼                             ▼
📱 ANDROID (Chrome)            🍎 iOS / IPHONE (Safari)
"Adicionar à Tela de Início"   "Adicionar à Tela de Início"
   │                             │
   └──────────────┬──────────────┘
                  ▼
   [ ÍCONE AXION NA TELA INICIAL DO CELULAR ]
```

### 🌟 Vantagens do PWA:
1. **Instalação em 1 Clique**: No Android (Chrome) ou iPhone (Safari), basta clicar em **"Adicionar à Tela de Início"**. O ícone do AXION é criado na tela principal do celular rodando em tela cheia (*standalone*).
2. **Sem Burocracia de Lojas**: Funciona imediatamente sem necessidade de pagar taxas anuais de desenvolvedor nem aguardar dias por aprovações das lojas.
3. **Atualização Instantânea**: Qualquer melhoria ou correção aplicada no servidor fica disponível na hora para todos os usuários.
4. **Compatibilidade com Lojas Futuras**: O projeto possui a estrutura **Ionic Capacitor** (`capacitor.config.json`) pronta para quando você decidir gerar os arquivos `.apk` (Android) e `.ipa` (iOS) para publicação nas lojas.

---

## 🏛️ 3. Hierarquia dos 4 Perfis de Acesso (RBAC)

O AXION impõe uma divisão rígida de segurança onde cada usuário acessa exclusivamente as funcionalidades necessárias ao seu papel.

---

### 👑 3.1. Super Admin SaaS (Robson)

- **Acesso**: E-mail master `robsoncordeiro1966@gmail.com`.
- **Tela**: [SuperAdmin.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/SuperAdmin.jsx)
- **Atribuições**:
  1. **Dashboard SaaS Global**: Acompanha o total de hospitais contratantes, número de pacientes ativos na nuvem e o status de latência das 5 IAs.
  2. **Cadastro de Hospitais / Clínicas**: Cadastra novos hospitais contratantes no SaaS (Nome, CNPJ, Cidade, Estado e Plano: *Gratuito Starter*, *Hospitalar Pro*, *Enterprise Master*).
  3. **Atribuição do Gestor**: Associa o e-mail do Administrador da Unidade Hospitalar que gerenciará aquele hospital.

---

### 🏢 3.2. Admin da Unidade Hospitalar

- **Acesso**: E-mail corporativo do gestor da clínica/hospital.
- **Tela**: [AdminHospital.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/AdminHospital.jsx)
- **Atribuições**:
  1. **Cadastrar Equipe da Unidade**: Cadastra os Médicos Oncologistas (CRM), Enfermeiros (COREN) e Técnicos em Radioterapia (CRTR).
  2. **Gerar Senhas Provisórias**: Define uma senha temporária (ex: `Axion@8912`) e clica em **`📋 Copiar Credenciais`** para enviar via WhatsApp/E-mail ao profissional.
  3. **Admitir Pacientes**: Cadastra o paciente e clica em **`🎟️ Salvar e Emitir Cartão`**, entregando o **Código Único (`AX-ABC-1234`)**.

---

### 🏥 3.3. Profissionais de Saúde

- **Acesso**: E-mail profissional + Senha cadastrada.
- **Tela**: [Profissional.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/Profissional.jsx)
- **Ferramentas por Cargo**:

| Cargo | Ícone | Funcionalidades no Painel Clínico |
| :--- | :---: | :--- |
| **Médico Oncologista** | 👨‍⚕️ | Prescrição de sessões, análise do gráfico de sintomas graves, avaliação médica e chat direto com o paciente. |
| **Enfermeiro(a)** | 🩺 | Triagem de reações cutâneas da pele irradiada, controle de fadiga/dor e envio de recomendações de autocuidado. |
| **Técnico em Radioterapia** | ⚛️ | Localização do paciente no acelerador linear, digitação de nota técnica e **baixa física na sessão diária (+1 Sessão)**. |

---

### 🧑 3.4. Paciente (Adulto & Kids)

- **Acesso**: Exclusivo via Código Único (`AX-ABC-1234`).
- **Telas**: [Paciente.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/Paciente.jsx), [AssistenteIA.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/AssistenteIA.jsx), [Kids.jsx](file:///c:/Users/Robson/Downloads/Projeto%20Axion%20Seis/src/pages/Kids.jsx)
- **Atribuições**:
  1. **Diário de Sintomas**: Registra notas diárias de fadiga, dor, náusea e apetite (sincronizados na hora no Supabase).
  2. **Tratamento**: Acompanha a porcentagem e as sessões concluídas pela equipe médica.
  3. **IA AXION**: Tira dúvidas clínicas de forma humanizada e acolhedora.

---

## 🔒 4. Mecanismos de Segurança e Credenciais

### 🔒 Troca Obrigatória de Senha no 1º Acesso
Quando o profissional faz o primeiro login usando a senha provisória enviada pelo Admin do Hospital, o AXION **bloqueia automaticamente o painel** e exige o cadastramento de uma nova senha pessoal definitiva.

### ❓ Recuperação de Código do Paciente
Se o paciente esquecer seu código:
- **No próprio App**: Na tela de login, clica em **`❓ Esqueci meu código`**, digita o Nome Completo e o AXION localiza e exibe o código na tela.
- **Pela Recepção**: O médico ou recepcionista busca o paciente pelo nome no painel clínico e clica em **`📋 Copiar Código`**.

---

## 🤖 5. Sistema de Inteligência Artificial Multi-Provedor

O AXION conta com uma arquitetura de **Failover Cascata em 5 Níveis**. Se um provedor de IA falhar ou ficar sem saldo, o sistema aciona automaticamente o próximo em milissegundos:

```
[ Groq (Llama-3.3-70B) ] ──▶ [ OpenRouter (Auto) ] ──▶ [ DeepInfra (Llama-3.3) ] ──▶ [ OpenAI (ChatGPT-4o) ] ──▶ [ Gemini (Google AI) ]
```

---

## 💻 6. Guia de Execução e Deploy

### Rodar Localmente:
```bash
npm run dev
```
Acesse no navegador em: `http://localhost:3000`

### Gerar Bundle para Produção Web / PWA:
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`, prontos para serem hospedados na Vercel, Netlify ou servidor da clínica.
