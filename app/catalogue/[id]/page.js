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
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchProduit() {
      const rows = await getData()
      if (!rows || rows.length <= 1) return
      const vins = rows.slice(1)
      const found = vins.find(v => v[0] === params.id)
      setProduit(found || null)
      setLoading(false)
    }
    fetchProduit()
  }, [params.id])

  async function confirmOrder() {
    if (!produit) return
    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCommande: `CMD-${Date.now()}`,
          produit: produit[1],
          mode: "bouteille", // ou "carton" selon choix
          quantite,
          total: Number(produit[4]) * quantite, // prix bouteille par défaut
          reduction: produit[9] ? "Promotion appliquée" : "Aucune",
          client,
          telephone,
          zone,
          reception,
          paiement
        })
      })
      const data = await res.json()
      setMessage(data.message)
    } catch {
      setMessage("Erreur lors de l’enregistrement de la commande.")
    }
  }

  if (loading) return <p>Chargement...</p>
  if (!produit) return <p>Produit introuvable.</p>

  return (
    <main style={{ padding: 40, background: "#f5f5f5" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
        
        {produit[12] && (
          <img src={produit[12]} alt={produit[1]} style={{ width: "100%", height: "300px", objectFit: "cover", borderRadius: 8, marginBottom: 20 }} />
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
        <input placeholder="Nom client" value={client} onChange={e => setClient(e.target.value)} style={{ display:"block", margin:"5px 0", padding:8 }} />
        <input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} style={{ display:"block", margin:"5px 0", padding:8 }} />
        <input placeholder="Zone" value={zone} onChange={e => setZone(e.target.value)} style={{ display:"block", margin:"5px 0", padding:8 }} />
        <select value={reception} onChange={e => setReception(e.target.value)} style={{ display:"block", margin:"5px 0", padding:8 }}>
          <option>Boutique</option>
          <option>Livraison</option>
        </select>
        <select value={paiement} onChange={e => setPaiement(e.target.value)} style={{ display:"block", margin:"5px 0", padding:8 }}>
          <option>Non payé</option>
          <option>Mobile Money</option>
          <option>Espèces</option>
        </select>
        <input type="number" min="1" value={quantite} onChange={e => setQuantite(Number(e.target.value
