// SERVIÇO MULTI-PROVEDOR DE IA COM CASCATA DE FALLBACK AUTOMÁTICO
// Provedores configurados: OpenRouter, OpenAI, DeepInfra, Groq e Gemini

const SYSTEM_PROMPT = `Você é a IA AXION, um assistente virtual altamente empático, acolhedor e especializado em apoiar pacientes em tratamento de radioterapia e oncologia no Brasil.

Diretrizes de resposta:
1. Tom de voz: Carinhoso, esperançoso, calmo, claro e humanizado.
2. Objetivo: Tirar dúvidas sobre o tratamento de radioterapia, cuidados com a pele, alimentação leve, controle de ansiedade, rotina de sessões e bem-estar geral.
3. Segurança Médica: Suas orientações são estritamente educativas e de acolhimento. Sempre lembre com carinho que o médico oncologista e a equipe de enfermagem devem ser consultados para diagnósticos ou alterações de medicação.
4. Tamanho da resposta: Respostas diretas, bem formatadas e fáceis de ler em telas de celular (2 a 4 parágrafos curtos).`;

// Função utilitária para capturar chaves de API tanto do padrão VITE_ quanto dos nomes simples
function getApiKey(viteKeyName, simpleAliasName) {
  const v = import.meta.env[viteKeyName] || import.meta.env[simpleAliasName] || "";
  return v ? v.trim() : "";
}

function getProvedores() {
  return [
    {
      nome: "Groq",
      key: getApiKey("VITE_GROQ_API_KEY", "groq"),
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      headers: (key) => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }),
      body: (messages) => ({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 600
      }),
      parseResponse: (data) => data.choices[0]?.message?.content
    },
    {
      nome: "OpenRouter",
      key: getApiKey("VITE_OPENROUTER_API_KEY", "Openrouter"),
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      headers: (key) => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://axion-radioterapia.local",
        "X-Title": "AXION Radioterapia"
      }),
      body: (messages) => ({
        model: "openrouter/auto",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 600
      }),
      parseResponse: (data) => data.choices[0]?.message?.content
    },
    {
      nome: "DeepInfra",
      key: getApiKey("VITE_DEEPINFRA_API_KEY", "deepInfra"),
      endpoint: "https://api.deepinfra.com/v1/openai/chat/completions",
      headers: (key) => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }),
      body: (messages) => ({
        model: "meta-llama/Llama-3.3-70B-Instruct",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 600
      }),
      parseResponse: (data) => data.choices[0]?.message?.content
    },
    {
      nome: "OpenAI (ChatGPT)",
      key: getApiKey("VITE_OPENAI_API_KEY", "OpenAi"),
      endpoint: "https://api.openai.com/v1/chat/completions",
      headers: (key) => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }),
      body: (messages) => ({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 600
      }),
      parseResponse: (data) => data.choices[0]?.message?.content
    },
    {
      nome: "Gemini (Google)",
      key: getApiKey("VITE_GEMINI_API_KEY", "gemini"),
      endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      headers: (key) => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      }),
      body: (messages) => ({
        model: "gemini-1.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 600
      }),
      parseResponse: (data) => data.choices[0]?.message?.content
    }
  ];
}

export async function enviarPerguntaIA(mensagensAnteriores, novaPergunta) {
  const provedores = getProvedores();
  const provedoresDisponiveis = provedores.filter(p => p.key && p.key !== "" && !p.key.includes("sua_chave"));

  if (provedoresDisponiveis.length === 0) {
    return (
      "Olá! Sou a IA AXION. 🤖✨\n\n" +
      "Nenhuma chave de IA foi detectada no momento. " +
      "Para ativar minhas respostas em tempo real, insira pelo menos uma das chaves no arquivo `.env`!"
    );
  }

  const historicoFormatado = mensagensAnteriores.map(m => ({
    role: m.remetente === "user" ? "user" : "assistant",
    content: m.texto
  }));

  const messagesPayload = [...historicoFormatado, { role: "user", content: novaPergunta }];

  let errosAcumulados = [];

  // Cascata de Fallback: Tenta um provedor por vez
  for (const prov of provedoresDisponiveis) {
    console.log(`🤖 Tentando IA via ${prov.nome}...`);
    try {
      const response = await fetch(prov.endpoint, {
        method: "POST",
        headers: prov.headers(prov.key),
        body: JSON.stringify(prov.body(messagesPayload))
      });

      if (response.ok) {
        const data = await response.json();
        const texto = prov.parseResponse(data);
        if (texto) {
          console.log(`✅ Resposta gerada com sucesso via ${prov.nome}!`);
          return texto;
        }
      }

      const errText = await response.text().catch(() => "");
      console.warn(`⚠️ Falha no provedor ${prov.nome} (${response.status}): ${errText.slice(0, 80)}... Tentando próximo provedor...`);
      errosAcumulados.push(`${prov.nome} (Status ${response.status})`);
    } catch (err) {
      console.warn(`⚠️ Erro de conexão com ${prov.nome}:`, err);
      errosAcumulados.push(`${prov.nome} (Erro de conexão)`);
    }
  }

  return (
    `Ops! Não foi possível obter resposta no momento.\n\n` +
    `Tentamos os seguintes provedores configurados, mas eles apresentaram falha/limite:\n` +
    `• ${errosAcumulados.join("\n• ")}\n\n` +
    `Por favor, verifique se os saldos estão ativos.`
  );
}
