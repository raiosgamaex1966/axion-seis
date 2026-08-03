import React, { useState, useEffect } from 'react';
import { C } from './constants/theme';
import { Splash, Nav, ErrorBoundary } from './components/ui/AppShellComponents';
import { Home } from './pages/Home';
import { TelaAcesso } from './pages/TelaAcesso';
import { Paciente } from './pages/Paciente';
import { Feminina } from './pages/Feminina';
import { Masculina } from './pages/Masculina';
import { Kids } from './pages/Kids';
import { Profissional } from './pages/Profissional';
import { Direitos } from './pages/Direitos';
import { AssistenteIA } from './pages/AssistenteIA';
import { Jogos } from './pages/Jogos';
import { SuperAdmin } from './pages/SuperAdmin';
import { AdminHospital } from './pages/AdminHospital';

export function App() {
  const [splash, setSplash] = useState(true);
  const [page, setPage] = useState("home");
  const [perfil, setPerfil] = useState(null);
  const [role, setRole] = useState(null); // 'paciente' | 'medico' | 'admin_hospital' | 'superadmin'
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    try {
      const sessaoRole = localStorage.getItem("axion_role_ativa");
      const codigoSessao = localStorage.getItem("axion_sessao_ativa");

      if (sessaoRole === "superadmin") {
        setRole("superadmin");
        setPage("superadmin");
      } else if (sessaoRole === "admin_hospital") {
        setRole("admin_hospital");
        setPage("admin_hospital");
      } else if (sessaoRole === "medico") {
        setRole("medico");
        setPage("profissional");
      } else if (codigoSessao) {
        const todos = JSON.parse(localStorage.getItem("axion_pacientes") || "{}");
        if (todos[codigoSessao]) {
          setPerfil(todos[codigoSessao]);
          setRole("paciente");
        }
      }
    } catch (e) {}
    setPronto(true);
  }, []);

  const entrarPaciente = (p) => {
    setPerfil(p);
    setRole("paciente");
    try {
      localStorage.setItem("axion_sessao_ativa", p.codigo);
      localStorage.setItem("axion_role_ativa", "paciente");
    } catch (e) {}
    setPage("home");
  };

  const entrarMedico = (medicoData) => {
    setPerfil(medicoData);
    setRole("medico");
    try {
      localStorage.setItem("axion_role_ativa", "medico");
    } catch (e) {}
    setPage("profissional");
  };

  const entrarAdminHospital = () => {
    setRole("admin_hospital");
    try {
      localStorage.setItem("axion_role_ativa", "admin_hospital");
    } catch (e) {}
    setPage("admin_hospital");
  };

  const entrarSuperAdmin = () => {
    setRole("superadmin");
    try {
      localStorage.setItem("axion_role_ativa", "superadmin");
    } catch (e) {}
    setPage("superadmin");
  };

  const sair = () => {
    try {
      localStorage.removeItem("axion_sessao_ativa");
      localStorage.removeItem("axion_role_ativa");
    } catch (e) {}
    setPerfil(null);
    setRole(null);
    setPage("home");
  };

  const screens = {
    home: <Home onNav={setPage} perfil={perfil} onSair={sair} />,
    paciente: <Paciente onBack={() => setPage("home")} perfil={perfil} onSair={sair} />,
    feminina: <Feminina onBack={() => setPage("home")} />,
    masculina: <Masculina onBack={() => setPage("home")} />,
    kids: <Kids onBack={() => setPage("home")} />,
    profissional: <Profissional onBack={() => setPage("home")} onSair={sair} userRole={role} />,
    direitos: <Direitos onBack={() => setPage("home")} />,
    jogos: <Jogos onBack={() => setPage("home")} />,
    ia: <AssistenteIA onBack={() => setPage("home")} />,
    admin_hospital: <AdminHospital onBack={() => setPage("home")} onSair={sair} />,
    superadmin: <SuperAdmin onBack={() => setPage("home")} onSair={sair} />,
  };

  const mostrarLogin = pronto && !splash && !role;

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", background: C.navy, color: C.text, minHeight: "100vh" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 20% 20%,rgba(0,201,177,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(79,195,247,0.07) 0%,transparent 50%)" }} />
        {splash && <Splash onDone={() => setSplash(false)} />}
        
        {mostrarLogin && (
          <TelaAcesso
            onEntrar={entrarPaciente}
            onEntrarMedico={entrarMedico}
            onEntrarAdminHospital={entrarAdminHospital}
            onEntrarSuperAdmin={entrarSuperAdmin}
          />
        )}

        {pronto && !splash && role && (
          <>
            <div style={{ maxWidth: 430, margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 70 }}>
              {screens[page] || screens.home}
            </div>
            <Nav page={page} onNav={setPage} role={role} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
