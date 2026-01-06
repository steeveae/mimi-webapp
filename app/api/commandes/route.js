import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req) {
  const {
    idCommande,
    client,
    telephone,
    produit,
    mode,
    quantite,
    total,
    reduction,
    reception,
    zone,
    jour,
    heure,
    paiement
  } = await req.json()

  const date = new Date()
  const dateStr = date.toLocaleDateString("fr-FR")
  const heureStr = date.toLocaleTimeString("fr-FR")

  // Prépare la ligne complète
  const newRow = [
    idCommande || `CMD-${Date.now()}`, // ID auto si non fourni
    client || "Client Démo",
    telephone || "N/A",
    produit || "Produit Démo",
    mode || "Carton",
    quantite || "1",
    total || "0",
    reduction || "Aucune",
    reception || "Boutique",
    zone || "Libreville",
    jour || dateStr,
    heure || heureStr,
    paiement || "Non payé",
    dateStr,
    heureStr
  ]

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/COMMANDES:append?valueInputOption=USER_ENTERED&key=${process.env.GOOGLE_SHEETS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [newRow] })
      }
    )

    if (!res.ok) throw new Error("Erreur API Google Sheets")

    return NextResponse.json({ success: true, message: "Commande enregistrée avec succès." })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message })
  }
}
