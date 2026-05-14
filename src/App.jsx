import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wgvzexpwhdyxtwasnvde.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndnpleHB3aGR5eHR3YXNudmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjU3NDUsImV4cCI6MjA5NDI0MTc0NX0.T0qme7QG1hwXijozmxZwMZ4H3ZDZtom7WR5Zfl_c2vg"
);

export default function PraxisApp() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [eintrag, setEintrag] = useState({
    datum: "",
    betrag: "",
    typ: "Einnahme",
    kategorie: "",
    zahlungsart: "",
    leistung: "",
    debitor: "",
    kreditor: ""
  });

  const [daten, setDaten] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const ladeDaten = async () => {
    if (!session) return;
    const { data } = await supabase
      .from("buchungen")
      .select("*")
      .eq("user_id", session.user.id)
      .order("datum", { ascending: false });

    setDaten(data || []);
  };

  useEffect(() => {
    if (session) ladeDaten();
  }, [session]);

  const speichern = async () => {
    if (!eintrag.datum || !eintrag.betrag) return;

    await supabase.from("buchungen").insert([
      { ...eintrag, user_id: session.user.id }
    ]);

    ladeDaten();
    setEintrag({
      datum: "",
      betrag: "",
      typ: "Einnahme",
      kategorie: "",
      zahlungsart: "",
      leistung: "",
      debitor: "",
      kreditor: ""
    });
  };

  const einnahmen = daten
    .filter(d => d.typ === "Einnahme")
    .reduce((sum, d) => sum + parseFloat(d.betrag || 0), 0);

  const ausgaben = daten
    .filter(d => d.typ === "Ausgabe")
    .reduce((sum, d) => sum + parseFloat(d.betrag || 0), 0);

  const gewinn = einnahmen - ausgaben;

  if (!session) {
    return (
      <div style={containerStyle}>
        <img src="/logo.png" style={logoLarge} alt="Logo" />

        <h2>{mode === "login" ? "Einloggen" : "Registrieren"}</h2>

        <input style={inputStyle} placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} />

        {mode === "login" ? (
          <button style={buttonStyle} onClick={() => supabase.auth.signInWithPassword({ email, password })}>
            Einloggen
          </button>
        ) : (
          <button style={buttonStyle} onClick={() => supabase.auth.signUp({ email, password })}>
            Konto erstellen
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>

      <img src="/logo.png" style={logoSmall} alt="Logo" />
      <h1>Einnahmen-Ausgaben</h1>

      {/* Dashboard */}
      <div style={dashboardStyle}>
        <div style={cardStyle}>Einnahmen<br /><strong>{einnahmen.toFixed(2)} CHF</strong></div>
        <div style={cardStyle}>Ausgaben<br /><strong>{ausgaben.toFixed(2)} CHF</strong></div>
        <div style={cardStyle}>Gewinn<br /><strong>{gewinn.toFixed(2)} CHF</strong></div>
      </div>

      {/* Formular */}
      <div style={boxStyle}>
        <h3>Neue Buchung</h3>

        <input style={inputStyleModern} placeholder="Datum (YYYY-MM-DD)" value={eintrag.datum} onChange={e => setEintrag({ ...eintrag, datum: e.target.value })} />
