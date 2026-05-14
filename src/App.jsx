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

  const handleLogin = async () => {
    setErrorMsg("⏳ Login läuft...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) setErrorMsg("❌ " + error.message);
      else setErrorMsg("");
    } catch {
      setErrorMsg("❌ Netzwerkfehler");
    }
  };

  const handleSignup = async () => {
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) setErrorMsg(error.message);
    else await handleLogin();
  };

  const speichern = async () => {
    if (!eintrag.datum || !eintrag.betrag) return;

    const { error } = await supabase.from("buchungen").insert([
      { ...eintrag, user_id: session.user.id }
    ]);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

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

  const gesamt = daten.reduce((sum, d) => {
    return d.typ === "Einnahme"
      ? sum + parseFloat(d.betrag || 0)
      : sum - parseFloat(d.betrag || 0);
  }, 0);
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

      {/* 🔥 LOGO MIT APP LOOK */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 20
      }}>
        <div style={{
          padding: 10,
          borderRadius: 16,
          background: "#f1f5f9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <img src="/logo.png" style={logoLarge} alt="Logo" />
        </div>
      </div>

      <h2>{mode === "login" ? "Einloggen" : "Konto erstellen"}</h2>

      <input
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      {errorMsg && <div style={errorStyle}>{errorMsg}</div>}

      {mode === "login" ? (
        <button style={buttonStyle} onClick={handleLogin}>
          🔐 Einloggen
        </button>
      ) : (
        <button
          style={{ ...buttonStyle, background: "green" }}
          onClick={handleSignup}
        >
          🆕 Konto erstellen
        </button>
      )}

      <button
        style={{ ...buttonStyle, background: "gray" }}
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Registrieren" : "Zum Login"}
      </button>

    </div>
  );
}


  return (
    <div style={containerStyle}>
      <img src="/logo.png" style={logoSmall} alt="Logo" />

      
	<h1>Einnahmen-Ausgaben</h1>

	<div style={dashboardStyle}>
	  <div style={cardStyle}>
	    <div>Einnahmen</div>
	    <strong>{einnahmen.toFixed(2)} CHF</strong>
	  </div>

	  <div style={cardStyle}>
	    <div>Ausgaben</div>
	    <strong>{ausgaben.toFixed(2)} CHF</strong>
	  </div>

	  <div style={cardStyle}>
	    <div>Gewinn</div>
	    <strong>{gewinn.toFixed(2)} CHF</strong>
	  </div>
	</div>

      <button style={buttonStyle} onClick={() => supabase.auth.signOut()}>Logout</button>

      <div style={boxStyle}>
        <h3>Neue Buchung</h3>

<div style={{ marginTop: 10 }}>
  <strong>Grunddaten</strong>
</div>


<input
  type="text"
  placeholder="Datum (YYYY-MM-DD)"
  value={eintrag.datum}
  onChange={e => setEintrag({ ...eintrag, datum: e.target.value })}
  style={inputStyleModern}
/>

        <input placeholder="Betrag CHF" value={eintrag.betrag} onChange={e => setEintrag({ ...eintrag, betrag: e.target.value })} style={inputStyleModern} />

        <select value={eintrag.typ} onChange={e => setEintrag({ ...eintrag, typ: e.target.value })} style={inputStyleModern}>
          <option>Einnahme</option>
          <option>Ausgabe</option>
        </select>


<select
  value={eintrag.kategorie}
  onChange={e => setEintrag({ ...eintrag, kategorie: e.target.value })}
  style={inputStyleModern}
>
  <option value="">Kategorie wählen</option>
  <option>Administration</option>
  <option>Miete</option>
  <option>Material</option>
  <option>Marketing</option>
  <option>Therapie</option>
</select>
        

<select
  value={eintrag.zahlungsart}
  onChange={e => setEintrag({ ...eintrag, zahlungsart: e.target.value })}
  style={inputStyleModern}
>
  <option value="">Zahlungsart wählen</option>
  <option>Bar</option>
  <option>Twint</option>
  <option>Rechnung</option>
</select>


<select
  value={eintrag.leistung}
  onChange={e => setEintrag({ ...eintrag, leistung: e.target.value })}
  style={inputStyleModern}
>
  <option value="">Leistung wählen</option>
  <option>Kennenlern-Sitzung</option>
  <option>Hypnose</option>
  <option>ChiroTrance Hypnose</option>
</select>


        <input placeholder="Debitor" value={eintrag.debitor} onChange={e => setEintrag({ ...eintrag, debitor: e.target.value })} style={inputStyleModern} />
        <input placeholder="Kreditor" value={eintrag.kreditor} onChange={e => setEintrag({ ...eintrag, kreditor: e.target.value })} style={inputStyleModern} />

        <button style={buttonStyle} onClick={speichern}>✅ Speichern</button>
      </div>

      <div style={boxStyle}>
        <h3>Saldo: {gesamt.toFixed(2)} CHF</h3>

        <table style={{ width: "100%" }}>
          <tbody>
            {daten.map((d, i) => (
              <tr key={i}>
                <td>{d.datum}</td>
                <td>{d.betrag}</td>
                <td>{d.typ}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: "100%",
  width: "100%",
  margin: "auto",
  padding: 15,
  textAlign: "center",
  boxSizing: "border-box"
};

const logoLarge = {
  width: "65%",
  maxWidth: 180,
  marginBottom: 10
};

const logoSmall = {
  width: "50%",
  maxWidth: 160,
  marginBottom: 10
};

const inputStyle = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  fontSize: 16,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box"
};

const inputStyleModern = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 16,
  boxSizing: "border-box"

  backgroundColor: "#fff",

  WebkitAppearance: "none",   // ✅ wichtig für iPhone
  display: "block"

};

const buttonStyle = {
  width: "100%",
  padding: 14,
  marginTop: 10,
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontSize: 16,
  fontWeight: "bold"
};

const errorStyle = {
  color: "red",
  marginBottom: 12,
  fontSize: 14
};

const boxStyle = {
  border: "1px solid #eee",
  padding: 15,
  marginTop: 20,
  borderRadius: 12,
  background: "#fafafa"
};
const dashboardStyle = {
  display: "flex",
  gap: 10,
  justifyContent: "space-between",
  marginTop: 10,
  flexWrap: "wrap"
};

const cardStyle = {
  flex: 1,
  minWidth: "30%",
  padding: 12,
  borderRadius: 10,
  background: "#f1f5f9",
  textAlign: "center",
  fontSize: 14
};