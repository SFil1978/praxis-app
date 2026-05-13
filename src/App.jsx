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

      if (error) {
        setErrorMsg("❌ " + error.message);
      } else {
        setErrorMsg("");
      }
    } catch (e) {
      setErrorMsg("❌ Netzwerkfehler");
    }
  };

  const handleSignup = async () => {
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      await handleLogin();
    }
  };

  const speichern = async () => {
    if (!eintrag.datum || !eintrag.betrag) return;

    const { error } = await supabase.from("buchungen").insert([
      {
        ...eintrag,
        user_id: session.user.id
      }
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

  if (!session) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2 style={{ textAlign: "center" }}>
          {mode === "login" ? "Einloggen" : "Konto erstellen"}
        </h2>

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

        {errorMsg && (
          <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>
        )}

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
          onClick={() => {
            setErrorMsg("");
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "Registrieren" : "Zum Login"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Praxis Cloud Buchhaltung</h1>

      <button style={buttonStyle} onClick={() => supabase.auth.signOut()}>
        Logout
      </button>

      <div style={boxStyle}>
        <input type="date" value={eintrag.datum} onChange={e => setEintrag({ ...eintrag, datum: e.target.value })} style={inputStyle} />
        <input placeholder="Betrag CHF" value={eintrag.betrag} onChange={e => setEintrag({ ...eintrag, betrag: e.target.value })} style={inputStyle} />

        <select value={eintrag.typ} onChange={e => setEintrag({ ...eintrag, typ: e.target.value })} style={inputStyle}>
          <option>Einnahme</option>
          <option>Ausgabe</option>
        </select>

        <button style={buttonStyle} onClick={speichern}>Speichern</button>
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

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginBottom: 8
};

const buttonStyle = {
  padding: 10,
  marginTop: 8,
  width: "100%",
  background: "blue",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const boxStyle = {
  border: "1px solid #ccc",
  padding: 15,
  marginTop: 20
};