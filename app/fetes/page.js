export const dynamic = "force-dynamic";

function todayKey() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}` // ex: 25/12
}

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/FÊTES?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function Fetes() {
  const rows = await getData()
  if (!rows || rows.length <= 1) return <p>Aucun message de fête configuré pour l’instant.</p>

  const header = rows[0]
  const data = rows.slice(1)

  const dateIdx = header.findIndex(h => h.toLowerCase().includes("date"))
  const titreIdx = header.findIndex(h => h.toLowerCase().includes("titre"))
  const msgIdx = header.findIndex(h => h.toLowerCase().includes("message"))

  const key = todayKey()
  const duJour = data.find(r => (r[dateIdx] || "").trim() === key)

  return (
    <main style={{ padding: 40 }}>
      <h1>Messages pour les fêtes 🎉</h1>

      {duJour ? (
        <div style={{ border: "2px solid #ffd54f", borderRadius: 10, padding: 16, background: "#fff8e1", marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>{duJour[titreIdx] || "Fête du jour"}</h2>
          <p style={{ margin: 0 }}>{duJour[msgIdx] || ""}</p>
        </div>
      ) : (
        <p>Aucun message spécifique pour aujourd’hui ({key}).</p>
      )}

      <h3>Toutes les fêtes configurées</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f7f7f7" }}>
          <tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
