export const dynamic = "force-dynamic";

function toStars(note) {
  const n = Math.max(0, Math.min(5, Number(note) || 0))
  return "★".repeat(n) + "☆".repeat(5 - n)
}

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/AVIS?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function Avis() {
  const rows = await getData()
  if (!rows || rows.length <= 1) return <p>Aucun avis client pour l’instant.</p>

  const header = rows[0]
  const data = rows.slice(1)

  // Essaie de trouver l'index de la colonne "Note"
  const noteIdx = header.findIndex(h => h.toLowerCase().includes("note"))
  const clientIdx = header.findIndex(h => h.toLowerCase().includes("nom"))
  const commentIdx = header.findIndex(h => h.toLowerCase().includes("comment"))

  const moyenne =
    data.reduce((acc, r) => acc + (Number(r[noteIdx]) || 0), 0) / data.length

  return (
    <main style={{ padding: 40 }}>
      <h1>Avis des clients ⭐</h1>
      <p><strong>Note moyenne:</strong> {moyenne.toFixed(1)} / 5 ({toStars(moyenne)})</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {data.map((r, i) => {
          const client = r[clientIdx] || "Client"
          const note = r[noteIdx]
          const comment = r[commentIdx] || ""

          return (
            <div key={i} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{client}</p>
              <p style={{ margin: "4px 0", color: "#d4a017" }}>{toStars(note)}</p>
              <p style={{ margin: 0 }}>{comment}</p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
