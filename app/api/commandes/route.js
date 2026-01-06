import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function parseRows(rows) {
  const [header, ...data] = rows || []
  return data.map((r) => ({
    id: r[0],
    nom: (r[1] || "").trim(),
    categorie: (r[2] || "").trim(),
    gamme: (r[3] || "").trim(),
    prixB: r[4] ? Number(r[4]) : null,
    prixC: r[5] ? Number(r[5]) : null,
    stockB: r[6] ? Number(r[6]) : 0,
    stockC: r[7] ? Number(r[7]) : 0,
    desc: (r[8] || "").trim(),
    promoB: r[9] ? Number(r[9]) : null,
    promoC: r[10] ? Number(r[10]) : null,
    equivalence: (r[11] || "").trim()
  }))
}

const fakeData = [
  { id: "1", nom: "Vin Rouge Démo", categorie: "Rouge", gamme: "Classique", prixB: 5000, prixC: 28000, stockB: 20, stockC: 5, desc: "Rouge fruité de démonstration" },
  { id: "2", nom: "Vin Blanc Démo", categorie: "Blanc", gamme: "Premium", prixB: 7000, prixC: 40000, stockB: 15, stockC: 3, desc: "Blanc sec de démonstration" }
]

function fmtFCFA(n) {
  return n ? `${Number(n).toLocaleString()} FCFA` : "N/A"
}

export async function POST(req) {
  const { question = "" } = await req.json()
  const q = question.toLowerCase().trim()

  let vins = []
  try {
    if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SHEETS_API_KEY) {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
        { cache: "no-store" }
      )
      const data = await res.json()
      vins = parseRows(data?.values || [])
    }
  } catch {
    vins = []
  }
  if (!vins.length) vins = fakeData

  // Quantité
  const qtyMatch = q.match(/(\d+)\s*(bouteilles|cartons?)/)
  if (qtyMatch) {
    const qty = Number(qtyMatch[1])
    const unit = qtyMatch[2].toLowerCase()
    const vinChoisi = vins.find(v => q.includes(v.nom.toLowerCase())) || vins[0]
    let prixUnitaire = unit.includes("bouteille") ? vinChoisi.prixB : vinChoisi.prixC
    let total = prixUnitaire ? prixUnitaire * qty : null

    return NextResponse.json({
      answer: `Commande simulée: ${qty} ${unit} de ${vinChoisi.nom}.\nPrix unitaire: ${fmtFCFA(prixUnitaire)}\nTotal: ${fmtFCFA(total)}\n\nVoulez-vous confirmer cette commande ?`,
      order: {
        idCommande: `CMD-${Date.now()}`,
        client: "Client Démo",
        telephone: "060000000",
        produit: vinChoisi.nom,
        mode: unit,
        quantite: qty,
        total: total,
        reduction: "Aucune",
        reception: "Boutique",
        zone: "Libreville",
        jour: new Date().toLocaleDateString("fr-FR"),
        heure: new Date().toLocaleTimeString("fr-FR"),
        paiement: "Non payé"
      }
    })
  }

  return NextResponse.json({ answer: "Pouvez-vous préciser la catégorie ou un nom de vin ?" })
}
