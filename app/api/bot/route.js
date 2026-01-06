import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Parser adapté à tes colonnes STOCK
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

// Données fictives si STOCK est vide
const fakeData = [
  { id: "1", nom: "Vin Rouge Démo", categorie: "Rouge", gamme: "Classique", prixB: 5000, prixC: 28000, stockB: 20, stockC: 5, desc: "Rouge fruité de démonstration", promoB: 4500, promoC: 25000, equivalence: "1 carton = 6 bouteilles" },
  { id: "2", nom: "Vin Blanc Démo", categorie: "Blanc", gamme: "Premium", prixB: 7000, prixC: 40000, stockB: 15, stockC: 3, desc: "Blanc sec de démonstration", promoB: null, promoC: null, equivalence: "1 carton = 6 bouteilles" },
  { id: "3", nom: "Vin Rosé Démo", categorie: "Rosé", gamme: "Classique", prixB: 4500, prixC: 25000, stockB: 30, stockC: 8, desc: "Rosé léger de démonstration", promoB: 4000, promoC: null, equivalence: "1 carton = 6 bouteilles" }
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

  // Si pas de données réelles → utiliser les données fictives
  if (!vins.length) vins = fakeData

  // Recherche par nom
  const byName = vins.find(v => v.nom.toLowerCase().includes(q))
  if (byName) {
    const prixB = byName.promoB ? `${fmtFCFA(byName.promoB)} (promo)` : fmtFCFA(byName.prixB)
    const prixC = byName.promoC ? `${fmtFCFA(byName.promoC)} (promo)` : fmtFCFA(byName.prixC)

    const answer =
      `${byName.nom} — ${byName.categorie}, ${byName.gamme}\n` +
      `Prix: bouteille ${prixB}${byName.prixC ? `, carton ${prixC}` : ""}\n` +
      `Stock: ${byName.stockB} bouteilles, ${byName.stockC} cartons\n` +
      (byName.desc ? `Description: ${byName.desc}\n` : "") +
      (byName.equivalence ? `Équivalence: ${byName.equivalence}` : "")
    return NextResponse.json({ answer })
  }

  // Filtres simples
  let candidats = vins
  if (q.includes("rouge")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("rouge"))
  if (q.includes("blanc")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("blanc"))
  if (q.includes("rosé") || q.includes("rose")) candidats = candidats.filter(v => v.categorie.toLowerCase().includes("ros"))

  // Budget
  const budgetMatch = q.match(/(\d{3,7})/)
  const budget = budgetMatch ? Number(budgetMatch[1]) : null
  if (budget) {
    const candidatsBudget = vins.filter(v => v.prixB && v.prixB <= budget)
    if (candidatsBudget.length) {
      const list = candidatsBudget.map(v => `• ${v.nom} — ${fmtFCFA(v.prixB)} (${v.stockB} bouteilles en stock)`).join("\n")
      return NextResponse.json({ answer: `Voici nos options à moins de ${fmtFCFA(budget)}:\n${list}` })
    }
  }

  // Quantités
  const qtyMatch = q.match(/(\d+)\s*(bouteilles|cartons?)/)
  if (qtyMatch) {
    const qty = Number(qtyMatch[1])
    const unit = qtyMatch[2].toLowerCase()
    const vinChoisi = vins.find(v => q.includes(v.nom.toLowerCase())) || vins[0]

    if (vinChoisi) {
      let prixUnitaire = unit.includes("bouteille") ? vinChoisi.prixB : vinChoisi.prixC
      let total = prixUnitaire ? prixUnitaire * qty : null
      return NextResponse.json({
       answer: `Commande simulée: ${qty} ${unit} de ${vinChoisi.nom}.\nPrix unitaire: ${fmtFCFA(prixUnitaire)}\nTotal: ${fmtFCFA(total)}\n\nVoulez-vous confirmer cette commande ?`
      })
    }
  }

  // Fallback
  return NextResponse.json({
    answer: "Pouvez-vous préciser la catégorie (rouge, blanc, rosé), un budget (ex: 5000), ou le nom du vin recherché ?"
  })
}
