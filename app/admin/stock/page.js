export const dynamic = "force-dynamic";

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function StockAdmin() {
  const rows = await getData()
  if (!rows || rows.length <= 1) {
    return <p>Aucun stock enregistré pour l’instant.</p>
  }

  const headers = rows[0]
  const vins = rows.slice(1)

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>📦 Suivi du stock</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#6b1b1b", color: "white" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: 10, border: "1px solid #ddd", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vins.map((vin, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
              {vin.map((c, j) => (
                <td key={j} style={{ padding: 10, border: "1px solid #ddd" }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
