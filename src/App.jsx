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

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <img src="/logo.png" style={logoSmall} alt="Logo" />

  <button
    style={{
      padding: "8px 12px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: 6,
      fontSize: 14
    }}
    onClick={() => supabase.auth.signOut()}
  >
    Logout
  </button>
</div>

<h1 style={titleStyle}>Einnahmen-Ausgaben</h1>
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
        <input style={inputStyleModern} placeholder="Betrag CHF" value={eintrag.betrag} onChange={e => setEintrag({ ...eintrag, betrag: e.target.value })} />

        <select style={inputStyleModern} value={eintrag.typ} onChange={e => setEintrag({ ...eintrag, typ: e.target.value })}>
          <option>Einnahme</option>
          <option>Ausgabe</option>
        </select>

        <select style={inputStyleModern} value={eintrag.kategorie} onChange={e => setEintrag({ ...eintrag, kategorie: e.target.value })}>
          <option>Kategorie wählen</option>
          <option>Administration</option>
          <option>Miete</option>
          <option>Material</option>
          <option>Marketing</option>
        </select>

        <select style={inputStyleModern} value={eintrag.zahlungsart} onChange={e => setEintrag({ ...eintrag, zahlungsart: e.target.value })}>
          <option>Zahlungsart wählen</option>
          <option>Bar</option>
          <option>Twint</option>
          <option>Rechnung</option>
        </select>

<select
  style={inputStyleModern}
  value={eintrag.leistung}
  onChange={e => setEintrag({ ...eintrag, leistung: e.target.value })}
>
  <option>Leistung wählen</option>
  <option>Kennenlern-Sitzung</option>
  <option>Hypnose</option>
  <option>ChiroTrance Hypnose</option>
</select>

<input
  style={inputStyleModern}
  placeholder="Debitor"
  value={eintrag.debitor}
  onChange={e => setEintrag({ ...eintrag, debitor: e.target.value })}
/>

<input
  style={inputStyleModern}
  placeholder="Kreditor"
  value={eintrag.kreditor}
  onChange={e => setEintrag({ ...eintrag, kreditor: e.target.value })}
/>

        <button style={buttonStyle} onClick={speichern}>✅ Speichern</button>
      </div>

      {/* Tabelle */}
      <div style={boxStyle}>
        <h3>Alle Buchungen</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", tableLayout: "fixed" }}>
            <tbody>
              {daten.map((d, i) => (
                <tr key={i}>
                  <td style={{ wordBreak: "break-word" }}>{d.datum}</td>
                  <td>{d.betrag}</td>
                  <td>{d.typ}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: "auto",
  padding: 15
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  boxSizing: "border-box"
};

const inputStyleModern = {
  width: "100%",
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: 12,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8
};

const boxStyle = {
  border: "1px solid #eee",
  padding: 15,
  marginTop: 20,
  borderRadius: 10
};

const dashboardStyle = {
  display: "flex",
  gap: 10
};

const cardStyle = {
  flex: 1,
  padding: 10,
  background: "#f1f5f9",
  borderRadius: 8
};

const logoLarge = {
  width: 120
};

const logoSmall = {
  width: 80
};

const titleStyle = {
  fontSize: "clamp(20px, 4vw, 28px)",
  margin: "10px 0 20px"
};
