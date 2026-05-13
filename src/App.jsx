import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wgvzexpwhdyxtwasnvde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
);

export default function PraxisApp() {
  const [session, setSession] = useState(null);
  const [daten, setDaten] = useState([]);

  const [eintrag, setEintrag] = useState({
    datum: "",
    betrag: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const speichern = async () => {
    await supabase.from("buchungen").insert([eintrag]);
  };

  if (!session) {
    return (
      <div>
        <h2>Login</h2>
        <input id="email" placeholder="Email" />
        <input id="password" placeholder="Password" type="password" />

        <button
          onClick={async () => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            await supabase.auth.signInWithPassword({ email, password });
          }}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Praxis App</h1>

      <input
        type="date"
        value={eintrag.datum}
        onChange={(e) => setEintrag({ ...eintrag, datum: e.target.value })}
      />

      <input
        placeholder="Betrag"
        value={eintrag.betrag}
        onChange={(e) => setEintrag({ ...eintrag, betrag: e.target.value })}
      />

      <button onClick={speichern}>Speichern</button>
    </div>
  );
}