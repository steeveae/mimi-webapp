"use client"
import { useState } from "react"

export default function Bot() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleAsk() {
    if (!question.trim()) return
    setLoading(true)
    setAnswer("")
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setAnswer(data.answer || "Pas de réponse disponible.")
    } catch {
      setAnswer("Erreur lors de la requête.")
    } finally {
      setLoading(false)
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
    </main>
  )
}
