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
    stockB: r[6] ? Number(r[6]) : 0,
    desc: (r[8] || "").trim()
  }))
}

// Données fictives si STOCK est vide
const fakeData = [
  { id: "1", nom: "Vin Rouge Démo", categorie: "Rouge", gamme: "Classique", prixB: 5000, stockB: 20, desc: "Rouge fruité de démonstration" },
  { id: "2", nom: "Vin Blanc Démo", categorie: "Blanc", gamme: "Premium", prixB: 7000, stockB: 15, desc: "Blanc sec de démonstration" },
  { id: "3", nom: "Vin Rosé Démo", categorie: "Rosé", gamme: "Classique", prixB: 4500, stockB: 30, desc: "Rosé léger de démonstration" }
]

function fmtFCFA(n) {
  return n ? `${Number(n).toLocaleString()} FCFA` : "N/A"
}

export async function POST(req) {
  const { question = "" } = await req.json()
  const q = question.toLowerCase().trim()

  // Lecture de l’onglet STOCK (si configuré)
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

  // Si pas de données réelles → utiliser les données fictives
  if (!vins.length) vins = fakeData

  // Recherche par nom
  const byName = vins.find(v => v.nom.toLowerCase().includes(q))
  if (byName) {
    return NextResponse.json({
      answer: `${byName.nom} (${byName.categorie}, ${byName.gamme}) — ${fmtFCFA(byName.prixB)} la bouteille. Stock: ${byName.stockB}. ${byName.desc}`
    })
  }

  // Filtres simples par catégorie
  let candidats = vins
  if (q.includes("rouge")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("rouge"))
  if (q.includes("blanc")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("blanc"))
  if (q.includes("rosé") || q.includes("rose")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("ros"))

  if (candidats.length) {
    const list = candidats.map(v => `• ${v.nom} — ${fmtFCFA(v.prixB)} (${v.stockB} en stock)`).join("\n")
    return NextResponse.json({ answer: `Voici quelques options:\n${list}` })
  }

  return NextResponse.json({ answer: "Pouvez-vous préciser la catégorie (rouge, blanc, rosé) ou un nom de vin ?" })
}
