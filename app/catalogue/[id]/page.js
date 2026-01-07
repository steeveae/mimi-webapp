"use client"
import { useState, useEffect } from "react"

export const dynamic = "force-dynamic";

async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`,
    { cache: "no-store" }
  )
  const data = await res.json()
  return data.values
}

export default function ProduitDetail({ params }) {
  const [produit, setProduit] = useState(null)
  const [loading, setLoading] = useState(true)

  // Champs client
  const [client, setClient] = useState("")
  const [telephone, setTelephone] = useState("")
  const [zone, setZone] = useState("")
  const [reception, setReception] = useState("Boutique")
  const [paiement, setPaiement] = useState("Non payé")
  const [quantite, setQuantite] = useState(1)
  const [mode, setMode] = useState("bouteille") // choix bouteille/carton (V11-ready)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchProduit() {
      const rows = await getData()
      if (!rows || rows.length <= 1) {
        setLoading(false)
        return
      }
      const vins = rows.slice(1)
      const found = vins.find(v => v[0] === params.id)
      setProduit(found || null)
      setLoading(false)
    }
    fetchProduit()
  }, [params.id])

  function computeTotal() {
    if (!produit) return 0
    const prixBouteille = Number(produit[4] || 0)
    const prixCarton = Number(produit[5] || 0)
    const promoB = Number(produit[9] || 0)
    const promoC = Number(produit[10] || 0)

    if (mode === "bouteille") {
      const base = promoB > 0 ? promoB : prixBouteille
      return base * quantite
    } else {
      const base = promoC > 0 ? promoC : prixCarton
      return base * quantite
    }
 }
  async function confirmOrder() {
    if (!produit) return
    setSubmitting(true)
    setMessage("")
    try {
      const total = computeTotal()
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCommande: `CMD-${Date.now()}`,
          produit: produit[1],
          mode,               // "bouteille" ou "carton"
          quantite,
          total,
          reduction: (mode === "bouteille" ? produit[9] : produit[10]) ? "Promotion appliquée" : "Aucune",
          client,
          telephone,
          zone,
          reception,
          paiement
        })
      })
      const data = await res.json()
      setMessage(data.message || (data.success ? "Commande enregistrée." : "Échec de commande."))
    } catch {
      setMessage("Erreur lors de l’enregistrement de la commande.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!produit) return <p>Produit introuvable.</p>

  const totalAffiche = computeTotal()

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>

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

        {/* Formulaire client */}
        <h3 style={{ marginTop: 20 }}>Commander 📝</h3>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Mode</span>
          <select value={mode} onChange={e => setMode(e.target.value)} style={{ padding: 8, width: "100%" }}>
            <option value="bouteille">Bouteille</option>
            <option value="carton">Carton</option>
          </select>
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Quantité</span>
          <input type="number" min="1" value={quantite} onChange={e => setQuantite(Number(e.target.value))} style={{ padding: 8, width: "100%" }} />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Nom client</span>
          <input value={client} onChange={e => setClient(e.target.value)} style={{ padding: 8, width: "100%" }} />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Téléphone</span>
          <input value={telephone} onChange={e => setTelephone(e.target.value)} style={{ padding: 8, width: "100%" }} />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Zone</span>
          <input value={zone} onChange={e => setZone(e.target.value)} style={{ padding: 8, width: "100%" }} />
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Réception</span>
          <select value={reception} onChange={e => setReception(e.target.value)} style={{ padding: 8, width: "100%" }}>
            <option>Boutique</option>
            <option>Livraison</option>
          </select>
        </label>

        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", marginBottom: 5 }}>Paiement</span>
          <select value={paiement} onChange={e => setPaiement(e.target.value)} style={{ padding: 8, width: "100%" }}>
            <option>Non payé</option>
            <option>Mobile Money</option>
            <option>Espèces</option>
          </select>
        </label>

        <div style={{ marginTop: 15, fontWeight: "bold" }}>
          Total: {totalAffiche} FCFA
        </div>

        <button
          onClick={confirmOrder}
          disabled={submitting}
          style={{
            marginTop: 15,
            padding: "12px 20px",
            background: submitting ? "#9a6b6b" : "#6b1b1b",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {submitting ? "En cours..." : "Confirmer la commande ✅"}
        </button>

        {message && <p style={{ marginTop: 10, color: "green" }}>{message}</p>}
      </div>
    </main>
  )
}
