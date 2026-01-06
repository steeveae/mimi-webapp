export const dynamic = "force-dynamic";

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STATS?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function Stats() {
  const rows = await getData()
  if (!rows || rows.length <= 1) return <p>Aucune statistique disponible pour l’instant.</p>

  const header = rows[0]
  const data = rows.slice(1)

  const ventesIdx = header.findIndex(h => h.toLowerCase().includes("ventes"))
  const montantIdx = header.findIndex(h => h.toLowerCase().includes("montant"))
  const categorieIdx = header.findIndex(h => h.toLowerCase().includes("cat"))

  const totalVentes = data.reduce((acc, r) => acc + (Number(r[ventesIdx]) || 0), 0)
  const totalMontant = data.reduce((acc, r) => acc + (Number(r[montantIdx]) || 0), 0)

  // Meilleure catégorie par montant
  const byCat = {}
  data.forEach(r => {
    const cat = r[categorieIdx] || "N/A"
    const m = Number(r[montantIdx]) || 0
    byCat[cat] = (byCat[cat] || 0) + m
  })
  const bestCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

  return (
    <main style={{ padding: 40 }}>
      <h1>Statistiques 📊</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Total ventes</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{totalVentes}</p>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Chiffre d’affaires</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{totalMontant.toLocaleString()} FCFA</p>
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Catégorie leader</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{bestCat}</p>
        </div>
      </div>

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
