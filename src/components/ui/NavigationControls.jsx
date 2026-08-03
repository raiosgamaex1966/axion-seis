import React from 'react';
import { C } from '../../constants/theme';

export function BackBtn({ onBack }) {
  return (
    <button
      onClick={onBack}
      style={{
        background: C.navyL,
        border: `1px solid ${C.navyM}`,
        borderRadius: 12,
        width: 40,
        height: 40,
        color: C.text,
        fontSize: 18,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      ←
    </button>
  );
}

export function AreaHeader({ title, icon, color, onBack }) {
  return (
    <div style={{ padding: "48px 20px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <BackBtn onBack={onBack} />
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontSize: 19, fontWeight: 900, color, fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
    </div>
  );
}

export function TabBar({ tabs, labels, active, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 4, margin: "0 20px 20px", background: C.navyL, borderRadius: 14, padding: 5, border: `1px solid ${C.navyM}` }}>
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            flex: 1,
            padding: "9px 2px",
            borderRadius: 10,
            border: "none",
            background: active === t ? `${color}22` : "transparent",
            color: active === t ? color : C.muted,
            fontWeight: active === t ? 800 : 600,
            fontSize: 10,
            borderBottom: active === t ? `2px solid ${color}` : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}
