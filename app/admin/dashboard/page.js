export const dynamic = "force-dynamic";

async function getData(sheetName) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/${sheetName}?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function DashboardAdmin() {
  const commandes = await getData("COMMANDES")
  const stock = await getData("STOCK")

  // Nettoyage
  const commandesData = commandes?.slice(1) || []
  const stockData = stock?.slice(1) || []

  // Statistiques commandes
  const nbCommandes = commandesData.length
  const totalVentes = commandesData.reduce((sum, c) => sum + Number(c[6] || 0), 0)

  // Statistiques stock
  const totalBouteilles = stockData.reduce((sum, v) => sum + Number(v[6] || 0), 0)
  const totalCartons = stockData.reduce((sum, v) => sum + Number(v[7] || 0), 0)

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>📊 Tableau de bord admin</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          <h2>Nombre de commandes</h2>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{nbCommandes}</p>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          <h2>Total des ventes</h2>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{totalVentes.toLocaleString()} FCFA</p>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          <h2>Stock bouteilles</h2>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{totalBouteilles}</p>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
          <h2>Stock cartons</h2>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{totalCartons}</p>
        </div>
      </div>
    </main>
  )
}
