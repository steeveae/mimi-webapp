import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * Onglet COMMANDES (ligne d'en-tête attendue) :
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
 * 13: Date commande
 * 14: Heure commande
 */

function nowFR() {
  const d = new Date()
  return {
    jour: d.toLocaleDateString("fr-FR"),
    heure: d.toLocaleTimeString("fr-FR")
  }
}

export async function POST(req) {
  // Vérification configuration
  const SHEET_ID = process.env.GOOGLE_SHEETS_ID
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
  if (!SHEET_ID || !API_KEY) {
    return NextResponse.json({
      success: false,
      message: "Configuration Google Sheets manquante (GOOGLE_SHEETS_ID ou GOOGLE_SHEETS_API_KEY)."
    })
  }

  // Récupération du payload
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
    mode,          // "bouteilles" ou "carton/cartons"
    quantite,      // nombre
    total,
    reduction,     // "Promotion appliquée" ou "Aucune"
    reception,     // "Boutique" ou "Livraison"
    zone,
    jour,          // optionnel (sinon auto)
    heure,         // optionnel (sinon auto)
    paiement       // "Non payé", "Mobile Money", "Espèces", etc.
  } = payload || {}

  // Valeurs par défaut sûres
  const { jour: jourAuto, heure: heureAuto } = nowFR()
  const idAuto = `CMD-${Date.now()}`

  // Sanity check minimal
  if (!produit) {
    return NextResponse.json({ success: false, message: "Produit manquant dans la commande." })
  }
  if (!quantite || Number(quantite) <= 0) {
    return NextResponse.json({ success: false, message: "Quantité invalide." })
  }
  if (total == null || Number(total) < 0) {
    return NextResponse.json({ success: false, message: "Total invalide." })
  }

  // Construction de la ligne à écrire (15 colonnes)
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
    jourAuto,      // Date commande (système)
    heureAuto      // Heure commande (système)
  ]

  try {
    // Append dans l'onglet COMMANDES
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
      throw new Error(`Erreur API Google Sheets: ${text}`)
    }

    return NextResponse.json({
      success: true,
      message: "Commande enregistrée avec succès.",
      idCommande: newRow[0]
    })
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: e.message || "Échec lors de l'enregistrement de la commande."
    })
  }
}
