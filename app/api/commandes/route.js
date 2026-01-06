import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

async function updateStock(produit, mode, quantite) {
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

  // Récupérer toutes les lignes de STOCK
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/STOCK?key=${API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  const rows = data.values || []

  // Trouver la ligne correspondant au produit
  const index = rows.findIndex(r => r[1] && r[1].toLowerCase() === produit.toLowerCase())
  if (index === -1) return

  const row = rows[index]
  let stockB = Number(row[6] || 0)
  let stockC = Number(row[7] || 0)

  if (mode.includes("bouteille")) {
    stockB = Math.max(0, stockB - quantite)
  } else {
    stockC = Math.max(0, stockC - quantite)
  }

  // Mise à jour via batchUpdate
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/STOCK!G${index+1}:H${index+1}?valueInputOption=USER_ENTERED&key=${API_KEY}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[stockB, stockC]] })
    }
  )
  if (!updateRes.ok) throw new Error("Erreur mise à jour stock")
}

export async function POST(req) {
  const payload = await req.json()
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
  } = payload

  const date = new Date()
  const dateStr = date.toLocaleDateString("fr-FR")
  const heureStr = date.toLocaleTimeString("fr-FR")

  const newRow = [
    idCommande || `CMD-${Date.now()}`,
    client || "Client Démo",
    telephone || "N/A",
    produit || "Produit Démo",
    mode || "Carton",
    String(quantite || 1),
    String(total || 0),
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
    // Enregistrement dans COMMANDES
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/COMMANDES:append?valueInputOption=USER_ENTERED&key=${process.env.GOOGLE_SHEETS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [newRow] })
      }
    )
    if (!res.ok) throw new Error("Erreur API Google Sheets (COMMANDES)")

    // Mise à jour du stock
    await updateStock(produit, mode, Number(quantite))

    return NextResponse.json({ success: true, message: "Commande enregistrée et stock mis à jour." })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message })
  }
}
