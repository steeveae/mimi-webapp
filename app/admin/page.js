"use client"

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react"

async function fetchAdmin() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || process.env.GOOGLE_SHEETS_ID}/values/ADMIN?key=${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default function Admin() {
  const [rows, setRows] = useState(null)
  const [id, setId] = useState("")
  const [pwd, setPwd] = useState("")
  const [auth, setAuth] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAdmin().then(setRows).catch(() => setRows([]))
  }, [])

  if (!rows) return <p>Chargement…</p>
  if (!rows.length || rows.length <= 1) return <p>Configuration ADMIN vide.</p>

  const header = rows[0]
  const data = rows.slice(1)
  const idIdx = header.findIndex(h => h.toLowerCase().includes("ident"))
  const pwdIdx = header.findIndex(h => h.toLowerCase().includes("pass"))
  const roleIdx = header.findIndex(h => h.toLowerCase().includes("rôle"))

  function handleLogin() {
    setError("")
    const match = data.find(r => (r[idIdx] || "").trim() === id && (r[pwdIdx] || "").trim() === pwd)
    if (match) {
      setAuth({ id: match[idIdx], role: match[roleIdx] || "admin" })
    } else {
      setAuth(null)
      setError("Identifiant ou mot de passe incorrect.")
    }
  }

  if (auth) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Administration 🔐</h1>
        <p><strong>Connecté:</strong> {auth.id} ({auth.role})</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
          <a href="/catalogue" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, textDecoration: "none" }}>
            <strong>Catalogue</strong>
            <p style={{ margin: 0, color: "#555" }}>Voir les vins</p>
          </a>
          <a href="/commandes" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, textDecoration: "none" }}>
            <strong>Commandes</strong>
            <p style={{ margin: 0, color: "#555" }}>Journal des commandes</p>
          </a>
          <a href="/stats" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, textDecoration: "none" }}>
            <strong>Stats</strong>
            <p style={{ margin: 0, color: "#555" }}>Indicateurs clés</p>
          </a>
          <a href="/avis" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, textDecoration: "none" }}>
            <strong>Avis</strong>
            <p style={{ margin: 0, color: "#555" }}>Retours clients</p>
          </a>
          <a href="/fetes" style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, textDecoration: "none" }}>
            <strong>Fêtes</strong>
            <p style={{ margin: 0, color: "#555" }}>Messages du jour</p>
          </a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ padding: 40, maxWidth: 420 }}>
      <h1>Connexion admin 🔐</h1>
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label><strong>Identifiant</strong></label>
          <input value={id} onChange={(e) => setId(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>
        <div>
          <label><strong>Mot de passe</strong></label>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>
        <button onClick={handleLogin} style={{ padding: "10px 16px" }}>Se connecter</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>
    </main>
  )
}
