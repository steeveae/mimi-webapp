export const dynamic = "force-dynamic";

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default async function ProduitDetail({ params }) {
  const rows = await getData()
  if (!rows || rows.length <= 1) {
    return <p>Produit introuvable.</p>
  }

  const vins = rows.slice(1)
  const produit = vins.find(v => v[0] === params.id)

  if (!produit) {
    return <p>Produit introuvable.</p>
  }

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        
        {/* Image si présente en colonne 13 */}
        {produit[12] && (
          <img 
            src={produit[12]} 
            alt={produit[1]} 
            style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: 8, marginBottom: 20 }} 
          />
        )}

        <h1 style={{ marginBottom: 10, color: "#6b1b1b" }}>{produit[1]}</h1>
        <p><strong>Catégorie :</strong> {produit[2]}</p>
        <p><strong>Gamme :</strong> {produit[3]}</p>
        <p><strong>Prix bouteille :</strong> {produit[4]} FCFA</p>
        <p><strong>Prix carton :</strong> {produit[5]} FCFA</p>

        {produit[9] && <p style={{ color: "red", fontWeight: "bold" }}>🎉 Promo bouteille : {produit[9]} FCFA</p>}
        {produit[10] && <p style={{ color: "red", fontWeight: "bold" }}>🎉 Promo carton : {produit[10]} FCFA</p>}

        <p style={{ fontStyle: "italic", marginTop: 15 }}>{produit[8]}</p>

        <button style={{ 
          marginTop: 20, 
          padding: "12px 20px", 
          background: "#6b1b1b", 
          color: "white", 
          border: "none", 
          borderRadius: 6, 
          cursor: "pointer", 
          fontSize: "16px" 
        }}>
          Commander
        </button>
      </div>
    </main>
  )
}
