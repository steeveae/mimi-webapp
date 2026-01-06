"use client"
import { useState } from "react"

export default function Bot() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

  async function handleAsk() {
    if (!question.trim()) return
    setLoading(true)
    setAnswer("")
    setPendingOrder(null)
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setAnswer(data.answer || "Pas de réponse disponible.")
      if (data.order) setPendingOrder(data.order)
    } catch {
      setAnswer("Erreur lors de la requête.")
    } finally {
      setLoading(false)
    }
  }

  async function confirmOrder() {
    if (!pendingOrder) return
    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingOrder)
      })
      const data = await res.json()
      alert(data.message)
      setPendingOrder(null)
    } catch {
      alert("Erreur lors de l’enregistrement de la commande.")
    }
  }

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1>Assistant vins 🤖🍷</h1>
      <p>Posez une question (ex: “vin rouge à moins de 5000”, “2 cartons de Château Mimi Rouge”).</p>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Votre question..."
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={handleAsk} disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Analyse..." : "Demander"}
        </button>
      </div>

      <div style={{ marginTop: 20, whiteSpace: "pre-line" }}>
        <strong>Réponse :</strong>
        <p style={{ marginTop: 8 }}>{answer}</p>
      </div>

      {pendingOrder && (
        <button
          onClick={confirmOrder}
          style={{ marginTop: 10, padding: "10px 16px", background: "#4caf50", color: "white" }}
        >
          Confirmer la commande ✅
        </button>
      )}
    </main>
  )
}
