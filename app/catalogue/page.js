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

  const vins = rows.slice(1)

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>🍷 Catalogue Premium</h1>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
        gap: 25 
      }}>
        {vins.map((vin, i) => (
          <div key={i} style={{ 
            border: "1px solid #ddd", 
            borderRadius: 12, 
            padding: 20, 
            background: "white", 
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
          }}>
            {/* Image si présente en colonne 13 */}
            {vin[12] && (
              <img 
                src={vin[12]} 
                alt={vin[1]} 
                style={{ 
                  width: "100%", 
                  height: "200px", 
                  objectFit: "cover", 
                  borderRadius: 8, 
                  marginBottom: 10 
                }} 
              />
            )}

            {/* Nom du vin */}
            <h2 style={{ marginBottom: 10, color: "#6b1b1b" }}>{vin[1]}</h2>

            {/* Catégorie et gamme */}
            <p><strong>Catégorie :</strong> {vin[2]}</p>
            <p><strong>Gamme :</strong> {vin[3]}</p>

            {/* Prix bouteille et carton */}
            <p><strong>Prix bouteille :</strong> {vin[4]} FCFA</p>
            <p><strong>Prix carton :</strong> {vin[5]} FCFA</p>

            {/* Promos */}
            {vin[9] && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                🎉 Promo bouteille : {vin[9]} FCFA
              </p>
            )}
            {vin[10] && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                🎉 Promo carton : {vin[10]} FCFA
              </p>
            )}

            {/* Description */}
            <p style={{ fontStyle: "italic", marginTop: 10 }}>{vin[8]}</p>

            {/* Bouton d'action */}
            <button style={{ 
              marginTop: 15, 
              padding: "10px 16px", 
              background: "#6b1b1b", 
              color: "white", 
              border: "none", 
              borderRadius: 6, 
              cursor: "pointer" 
            }}>
              Commander
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
