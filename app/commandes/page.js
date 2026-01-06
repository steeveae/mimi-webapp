export const dynamic = "force-dynamic";

function parseDate(d) {
  // Tente de parser YYYY-MM-DD ou DD/MM/YYYY
  if (!d) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d)
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}`)
  return new Date(d)
}

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/COMMANDES?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function Commandes() {
  const rows = await getData()
  if (!rows || rows.length <= 1) return <p>Aucune commande enregistrée pour l’instant.</p>

  const header = rows[0]
  const data = rows.slice(1)

  // Essaie de trouver l'index d'une colonne "Date"
  const dateIdx = header.findIndex(h => h.toLowerCase().includes("date"))
  const sorted = [...data].sort((a, b) => {
    const da = parseDate(a[dateIdx])
    const db = parseDate(b[dateIdx])
    return (db?.getTime() || 0) - (da?.getTime() || 0)
  })

  return (
    <main style={{ padding: 40 }}>
      <h1>Journal des commandes 📦</h1>
      <p><strong>Total commandes:</strong> {data.length}</p>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f7f7f7" }}>
          <tr>{header.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
