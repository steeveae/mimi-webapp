"use client"
import { useEffect, useState } from "react"

export default function Commandes() {
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommandes() {
      try {
        const res = await fetch("/api/commandes")
        const data = await res.json()
        setCommandes(data.rows || [])
      } catch {
        setCommandes([])
      } finally {
        setLoading(false)
      }
    }
    fetchCommandes()
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>📋 Liste des commandes</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : commandes.length === 0 ? (
        <p>Aucune commande trouvée.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Produit</th>
              <th>Mode</th>
              <th>Quantité</th>
              <th>Total</th>
              <th>Réduction</th>
              <th>Réception</th>
              <th>Zone</th>
              <th>Jour</th>
              <th>Heure</th>
              <th>Paiement</th>
              <th>Date commande</th>
              <th>Heure commande</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((c, i) => (
              <tr key={i}>
                {c.map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
