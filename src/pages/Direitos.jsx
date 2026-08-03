import React from 'react';
import { C } from '../constants/theme';
import { AreaHeader } from '../components/ui/NavigationControls';

export function Direitos({ onBack }) {
  const direitos = [
    { titulo: "Saque do FGTS e PIS/PASEP", desc: "O paciente com diagnóstico de câncer tem direito ao saque integral do FGTS e PIS/PASEP em qualquer fase do tratamento." },
    { titulo: "Isenção do Imposto de Renda", desc: "Aposentados e pensionistas diagnosticados com neoplasia maligna são isentos do Imposto de Renda sobre os rendimentos da aposentadoria." },
    { titulo: "Passe Livre / Gratuidade no Transporte", desc: "Direito a transporte público gratuito para deslocamento até os locais de tratamento e consultas médicas." },
    { titulo: "Auxílio-Doença / BPC (LOAS)", desc: "Incapacitado temporariamente para o trabalho, o segurado tem direito ao benefício mensal pago pelo INSS." },
    { titulo: "Isenção de IPVA e IPI na compra de veículo", desc: "Direito à compra de veículo zero km com isenção de impostos caso haja limitação motora resultante do tratamento." },
  ];

  return (
    <div style={{ paddingBottom: 100 }}>
      <AreaHeader title="Meus Direitos" icon="⚖️" color={C.green} onBack={onBack} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: `${C.green}15`, border: `1px solid ${C.green}44`, borderRadius: 18, padding: "16px", marginBottom: 18, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          ⚖️ Guia de direitos garantidos pela legislação brasileira para pacientes em tratamento oncológico.
        </div>
        {direitos.map((d, i) => (
          <div key={i} style={{ background: C.navyL, border: `1px solid ${C.navyM}`, borderRadius: 16, padding: "16px", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.green, marginBottom: 6 }}>{d.titulo}</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{d.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
