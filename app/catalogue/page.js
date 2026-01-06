export const dynamic = "force-dynamic";

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function Catalogue() {
  const rows = await getData()
  if (!rows || rows.length <= 1) {
    return <p>Le catalogue est vide pour l’instant.</p>
  }

  const headers = rows[0]
  const vins = rows.slice(1)

  return (
    <main style={{ padding: 40 }}>
      <h1>Catalogue des vins 🍷</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        {vins.map((vin, i) => (
          <div key={i} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 20, background: "#fafafa" }}>
            <h2 style={{ marginBottom: 10 }}>{vin[1]}</h2>
            <p><strong>Catégorie :</strong> {vin[2]}</p>
            <p><strong>Gamme :</strong> {vin[3]}</p>
            <p><strong>Prix bouteille :</strong> {vin[4]} FCFA</p>
            <p><strong>Stock :</strong> {vin[6]} bouteilles</p>
          </div>
        ))}
      </div>
    </main>
  )
}
