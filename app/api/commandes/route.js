import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * Onglet COMMANDES (15 colonnes attendues) :
 * 0: ID commande
 * 1: Nom client
 * 2: Téléphone
 * 3: Produit
 * 4: Mode
 * 5: Quantité
 * 6: Total
 * 7: Réduction appliquée
 * 8: Mode de réception
 * 9: Zone
 * 10: Jour
 * 11: Heure
 * 12: Paiement
 * 13: Date commande (système)
 * 14: Heure commande (système)
 */

function nowFR() {
  const d = new Date()
  return {
    jour: d.toLocaleDateString("fr-FR"),
    heure: d.toLocaleTimeString("fr-FR")
  }
}

async function updateStock({ produit, mode, quantite }) {
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/STOCK?key=${API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  const rows = data.values || []

  // Trouver la ligne par Nom du vin (colonne B = index 1)
  const index = rows.findIndex(r => r[1] && r[1].toLowerCase() === (produit || "").toLowerCase())
  if (index === -1) return

  const row = rows[index]
  let stockB = Number(row[6] || 0) // Stock bouteilles
  let stockC = Number(row[7] || 0) // Stock cartons

  if (mode.includes("bouteille")) {
    stockB = Math.max(0, stockB - Number(quantite || 0))
  } else {
    stockC = Math.max(0, stockC - Number(quantite || 0))
  }

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/STOCK!G${index + 1}:H${index + 1}?valueInputOption=USER_ENTERED&key=${API_KEY}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[stockB, stockC]] })
    }
  )

  if (!updateRes.ok) {
    const text = await updateRes.text()
    throw new Error(`Erreur mise à jour stock: ${text}`)
  }
}

export async function POST(req) {
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
  if (!SHEET_ID || !API_KEY) {
    return NextResponse.json({
      success: false,
      message: "Configuration Google Sheets manquante."
    })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ success: false, message: "Payload JSON invalide." })
  }

  const {
    idCommande,
    client,
    telephone,
    produit,
    mode,          // "bouteille" ou "carton"
    quantite,      // nombre
    total,
    reduction,     // "Promotion appliquée" ou "Aucune"
    reception,     // "Boutique" ou "Livraison"
    zone,
    jour,          // optionnel
    heure,         // optionnel
    paiement       // "Non payé", "Mobile Money", "Espèces", etc.
  } = payload || {}

  // Validations minimales
  if (!produit) return NextResponse.json({ success: false, message: "Produit manquant." })
  if (!quantite || Number(quantite) <= 0) return NextResponse.json({ success: false, message: "Quantité invalide." })
  if (total == null || Number(total) < 0) return NextResponse.json({ success: false, message: "Total invalide." })

  const { jour: jourAuto, heure: heureAuto } = nowFR()
  const idAuto = `CMD-${Date.now()}`

  const newRow = [
    idCommande || idAuto,
    client || "Client Démo",
    telephone || "N/A",
    produit,
    mode || "Carton",
    String(quantite),
    String(total),
    reduction || "Aucune",
    reception || "Boutique",
    zone || "Libreville",
    jour || jourAuto,
    heure || heureAuto,
    paiement || "Non payé",
    jourAuto,      // Date commande système
    heureAuto      // Heure commande système
  ]

  try {
    // Append dans COMMANDES
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/COMMANDES:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [newRow] })
      }
    )
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Erreur API Google Sheets (COMMANDES): ${text}`)
    }

    // Mise à jour du stock
    await updateStock({ produit, mode, quantite })

    return NextResponse.json({
      success: true,
      message: "Commande enregistrée et stock mis à jour.",
      idCommande: newRow[0]
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: e.message || "Échec lors de l'enregistrement de la commande."
    })
  }
}
