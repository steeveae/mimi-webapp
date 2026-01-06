import { NextResponse } from "next/server"

// Fonction pour écrire dans Google Sheets via l’API
export async function POST(req) {
  const { client, vin, quantite, total } = await req.json()

  if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SHEETS_API_KEY) {
    return NextResponse.json({ success: false, message: "Configuration Google Sheets manquante." })
  }

  const date = new Date().toLocaleDateString("fr-FR")

  // Prépare la ligne à ajouter
  const newRow = [client, vin, quantite, total, date]

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
