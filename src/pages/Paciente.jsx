import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import { BackBtn, TabBar } from '../components/ui/NavigationControls';
import { PatientService } from '../services/supabaseClient';

export function Paciente({ onBack, perfil, onSair }) {
  const [tab, setTab] = useState("perfil");
  const [confirmSair, setConfirmSair] = useState(false);
  const [syms, setSyms] = useState({ fadiga: 0, dor: 0, nausea: 0, apetite: 0, ansiedade: 0, sono: 0 });
  const [historicoSintomas, setHistoricoSintomas] = useState([]);
  const [saved, setSaved] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [expandSym, setExpandSym] = useState(null);

  // Correção do Bug do zero falsy (0 || 8 era 8):
  const rawSessao = perfil?.sessaoAtual !== undefined ? perfil.sessaoAtual : (perfil?.sessao_atual !== undefined ? perfil.sessao_atual : 0);
  const sessaoAtual = Number.isInteger(parseInt(rawSessao)) ? parseInt(rawSessao) : 0;
  
  const rawTotal = perfil?.totalSessoes !== undefined ? perfil.totalSessoes : (perfil?.total_sessoes !== undefined ? perfil.total_sessoes : 30);
  const totalSessoes = Number.isInteger(parseInt(rawTotal)) && parseInt(rawTotal) > 0 ? parseInt(rawTotal) : 30;

  const progPct = Math.round((sessaoAtual / totalSessoes) * 100);
  const sessions = Array.from({ length: totalSessoes }, (_, i) => ({
    n: i + 1,
    done: i < sessaoAtual,
    active: i === sessaoAtual
  }));

  useEffect(() => {
    carregarSintomasAnteriores();
  }, [perfil]);

  const carregarSintomasAnteriores = async () => {
    if (perfil?.codigo) {
      const codigo = perfil.codigo;
      const keyHist = `axion_sintomas_${codigo}`;
      const histLocal = JSON.parse(localStorage.getItem(keyHist) || '[]');
      setHistoricoSintomas(histLocal);

      const ultimos = await PatientService.obterSintomas(codigo);
      if (ultimos) {
        setSyms(prev => ({ ...prev, ...ultimos }));
      }
    }
  };

  const symInfo = {
    fadiga: { label: "Fadiga", emoji: "😴", desc: "Sensação de cansaço extremo que não melhora com descanso.", dica: "Descanse quando precisar. Pequenas caminhadas ajudam.", color: C.orange },
    dor: { label: "Dor", emoji: "🩹", desc: "Desconforto ou dor na área irradiada.", dica: "Comunique sempre ao seu médico. Compressas podem aliviar.", color: C.pink },
    nausea: { label: "Náusea", emoji: "🤢", desc: "Sensação de enjoo.", dica: "Coma porções pequenas e frequentes.", color: C.purple },
    apetite: { label: "Apetite Reduzido", emoji: "🍽️", desc: "Diminuição do desejo de comer.", dica: "Prefira alimentos de cheiro suave.", color: C.gold },
    ansiedade: { label: "Ansiedade", emoji: "💭", desc: "Sensação de preocupação ou tensão.", dica: "Respire fundo e pratique meditação.", color: C.blue },
    sono: { label: "Dificuldade de Sono", emoji: "🌙", desc: "Insônia ou sono não reparador.", dica: "Mantenha horários regulares.", color: C.teal },
  };

  const salvarSintomasHoje = async () => {
    if (!perfil?.codigo) return;
    setSalvando(true);
    await PatientService.registrarSintomas(perfil.codigo, syms);
    await carregarSintomasAnteriores();
    setSalvando(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header com os dados reais do paciente */}
      <div style={{ background: `linear-gradient(135deg,${C.navyL},${C.navyM})`, padding: "48px 20px 20px", borderBottom: `1px solid ${C.navyM}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <BackBtn onBack={onBack} />
          <div>
            <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: 1 }}>OLÁ,</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif" }}>{perfil?.nome ? perfil.nome.split(" ")[0] : "Paciente"} 👋</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}44`, borderRadius: 12, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, letterSpacing: 1 }}>CÓDIGO</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1 }}>{perfil?.codigo}</div>
            </div>
            {onSair && (
              <button onClick={() => setConfirmSair(true)} title="Sair da conta" style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C.navyM}`, borderRadius: 12, width: 36, height: 36, color: C.muted, fontSize: 15, flexShrink: 0 }}>🚪</button>
            )}
          </div>
        </div>
        {confirmSair && (
          <div style={{ background: "rgba(255,107,157,0.12)", border: `1.5px solid ${C.pink}66`, borderRadius: 14, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: C.text, flex: 1 }}>Sair desta conta?</span>
            <button onClick={() => setConfirmSair(false)} style={{ background: "transparent", border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 11 }}>Cancelar</button>
            <button onClick={onSair} style={{ background: C.pink, border: "none", borderRadius: 10, padding: "6px 12px", color: "#1a1a1a", fontSize: 11, fontWeight: 800 }}>Sair</button>
          </div>
        )}
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{perfil?.tipo || perfil?.tipo_tratamento || "Radioterapia"} — {perfil?.hospital || "Hospital AXION"}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.teal }}>{sessaoAtual}/{totalSessoes} sessões</span>
          </div>
          <div style={{ height: 6, background: C.navyM, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${progPct}%`, height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{progPct}% do tratamento concluído</div>
        </div>
      </div>

      <TabBar tabs={["perfil", "timeline", "sintomas"]} labels={["Perfil", "Tratamento", "Sintomas"]} active={tab} onChange={setTab} color={C.teal} />

      {tab === "perfil" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ background: C.navyL, borderRadius: 20, padding: "20px", marginBottom: 14, border: `1px solid ${C.teal}30` }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}>{perfil?.nome}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Tratamento: {perfil?.tipo || perfil?.tipo_tratamento}</div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>👨‍⚕️ Médico responsável:</span>
                <span style={{ fontWeight: 700 }}>{perfil?.medico || perfil?.medico_responsavel || "Dr. Oncologista AXION"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>🏥 Hospital / Clínica:</span>
                <span style={{ fontWeight: 700 }}>{perfil?.hospital || "Hospital de Câncer AXION"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.muted }}>📅 Sessão Atual:</span>
                <span style={{ fontWeight: 700, color: C.teal }}>{sessaoAtual} de {totalSessoes} ({progPct}%)</span>
              </div>
            </div>
          </div>

          <div style={{ background: `${C.gold}12`, border: `1.5px solid ${C.gold}44`, borderRadius: 16, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>🔑 SEU CÓDIGO DE ACESSO</div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4, color: C.gold, fontFamily: "'Space Grotesk',sans-serif" }}>{perfil?.codigo}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Forneça este código ao seu médico para acompanhamento em tempo real no painel dele.</div>
          </div>
        </div>
      )}

      {/* ABA TRATAMENTO: CALENDÁRIO DE SESSÕES E SINTOMAS DO DIA */}
      {tab === "timeline" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ background: C.navyL, borderRadius: 18, padding: "16px", marginBottom: 18, border: `1px solid ${C.teal}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted }}>Progresso da Radioterapia</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.teal }}>{sessaoAtual}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> / {totalSessoes} sessões</span></div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: `3px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: C.teal, background: `${C.teal}15` }}>{progPct}%</div>
            </div>
            <div style={{ marginTop: 12, height: 8, background: C.navyM, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${progPct}%`, height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, borderRadius: 99 }} />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, marginBottom: 10 }}>📅 CALENDÁRIO DO TRATAMENTO DE RADIOTERAPIA</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
            {sessions.map(s => {
              const regTec = perfil?.historico_tecnico?.find(h => parseInt(h.sessao) === s.n);

              return (
                <div key={s.n} style={{ background: s.done ? `${C.teal}22` : s.active ? `${C.blue}22` : C.navyL, border: s.done ? `1.5px solid ${C.teal}` : s.active ? `2px solid ${C.blue}` : `1px solid ${C.navyM}`, borderRadius: 12, padding: "10px 4px", textAlign: "center", position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: s.done ? C.teal : s.active ? C.blue : C.muted }}>{s.n}ª Sessão</div>
                  {s.done && <div style={{ fontSize: 12, color: C.teal, fontWeight: 900, marginTop: 2 }}>✓ Concluída</div>}
                  {s.active && <div style={{ fontSize: 9, color: C.blue, fontWeight: 900, marginTop: 2 }}>📍 HOJE</div>}
                  {!s.done && !s.active && <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Agendada</div>}
                  
                  {regTec && (
                    <div title={`Executada em ${regTec.data}`} style={{ marginTop: 4, fontSize: 8, background: C.navy, color: C.teal, padding: "2px 4px", borderRadius: 4, fontWeight: 800 }}>
                      ⚛️ {regTec.data.split('/')[0]}/{regTec.data.split('/')[1]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* HISTÓRICO DE EXAMES E SESSÕES REALIZADAS */}
          {perfil?.historico_tecnico && perfil.historico_tecnico.length > 0 && (
            <div style={{ background: C.navyL, border: `1px solid ${C.blue}44`, borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.blue, marginBottom: 8 }}>⚛️ REGISTRO DE SESSÕES RADIOTERÁPICAS REALIZADAS</div>
              {perfil.historico_tecnico.map((h, i) => (
                <div key={i} style={{ background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 10, padding: "10px", marginBottom: 6, fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.teal, fontWeight: 800, marginBottom: 2 }}>
                    <span>Sessão #{h.sessao}</span>
                    <span>{h.data} às {h.hora}</span>
                  </div>
                  <div style={{ color: C.text }}>Técnico: {h.tecnico}</div>
                  <div style={{ color: C.muted, marginTop: 2 }}>{h.observacao}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA SINTOMAS COM GRAVAÇÃO E HISTÓRICO NO PRONTUÁRIO */}
      {tab === "sintomas" && (
        <div style={{ padding: "0 20px" }}>
          <div style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}30`, borderRadius: 14, padding: "12px 14px", marginBottom: 18, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            📊 Registre como você está se sentindo hoje. Seus registros vão direto para o seu prontuário e são visíveis para seu médico e enfermeira.
          </div>

          {Object.entries(symInfo).map(([k, info]) => (
            <div key={k} style={{ background: C.navyL, borderRadius: 16, padding: "16px", marginBottom: 12, border: `1.5px solid ${expandSym === k ? info.color + "66" : C.navyM}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{info.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{info.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, cursor: "pointer" }} onClick={() => setExpandSym(expandSym === k ? null : k)}>
                      {expandSym === k ? "▲ ocultar" : "▼ o que é isso?"}
                    </div>
                  </div>
                </div>
                <div style={{ background: `${info.color}22`, borderRadius: 99, padding: "4px 12px", fontSize: 13, fontWeight: 900, color: info.color }}>
                  {syms[k]}/10
                </div>
              </div>
              {expandSym === k && (
                <div style={{ background: `${info.color}10`, border: `1px solid ${info.color}33`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7, marginBottom: 8 }}>
                    <strong style={{ color: info.color }}>O que é:</strong> {info.desc}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                    <strong style={{ color: info.color }}>💡 Dica:</strong> {info.dica}
                  </div>
                </div>
              )}
              <input type="range" min="0" max="10" value={syms[k]} onChange={e => { setSyms(s => ({ ...s, [k]: +e.target.value })); setSaved(false); }} style={{ width: "100%", accentColor: info.color }} />
            </div>
          ))}

          <button onClick={salvarSintomasHoje} disabled={salvando} style={{ width: "100%", padding: "14px", borderRadius: 14, border: saved ? `1px solid ${C.teal}` : "none", background: saved ? `${C.teal}18` : `linear-gradient(135deg,${C.teal},${C.blue})`, color: saved ? C.teal : C.navy, fontWeight: 800, fontSize: 14, marginBottom: 20 }}>
            {salvando ? "Salvando..." : saved ? "✓ Sintomas de Hoje Gravados no Prontuário!" : "Registrar Sintomas de Hoje"}
          </button>

          {/* HISTÓRICO DE SINTOMAS DIÁRIOS REGISTRADOS NO PRONTUÁRIO */}
          {historicoSintomas.length > 0 && (
            <div style={{ background: C.navyL, border: `1px solid ${C.teal}44`, borderRadius: 18, padding: "16px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.teal, marginBottom: 12 }}>📅 HISTÓRICO DE SINTOMAS REGISTRADOS NO SEU PRONTUÁRIO</div>
              {historicoSintomas.map((h, idx) => (
                <div key={idx} style={{ background: C.navy, border: `1px solid ${C.navyM}`, borderRadius: 12, padding: "12px", marginBottom: 8, fontSize: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: C.teal, fontWeight: 800, marginBottom: 6 }}>
                    <span>📅 Registro do Dia</span>
                    <span>{h.data} às {h.hora}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center" }}>
                    <div style={{ background: `${C.orange}15`, borderRadius: 8, padding: 4, color: C.orange, fontWeight: 700 }}>Fadiga: {h.sintomas?.fadiga}/10</div>
                    <div style={{ background: `${C.pink}15`, borderRadius: 8, padding: 4, color: C.pink, fontWeight: 700 }}>Dor: {h.sintomas?.dor}/10</div>
                    <div style={{ background: `${C.purple}15`, borderRadius: 8, padding: 4, color: C.purple, fontWeight: 700 }}>Náusea: {h.sintomas?.nausea}/10</div>
                    <div style={{ background: `${C.gold}15`, borderRadius: 8, padding: 4, color: C.gold, fontWeight: 700 }}>Apetite: {h.sintomas?.apetite}/10</div>
                    <div style={{ background: `${C.blue}15`, borderRadius: 8, padding: 4, color: C.blue, fontWeight: 700 }}>Ansiedade: {h.sintomas?.ansiedade}/10</div>
                    <div style={{ background: `${C.teal}15`, borderRadius: 8, padding: 4, color: C.teal, fontWeight: 700 }}>Sono: {h.sintomas?.sono}/10</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
