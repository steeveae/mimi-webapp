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
    <main style={{ padding: 40 }}>
      <h1>Assistant vins 🤖🍷</h1>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ex: vin rouge pas cher"
        style={{ padding: 10, width: "70%" }}
      />
      <button onClick={handleAsk} disabled={loading} style={{ marginLeft: 10, padding: 10 }}>
        {loading ? "Analyse..." : "Demander"}
      </button>
      <div style={{ marginTop: 20 }}>
        <strong>Réponse :</strong>
        <p>{answer}</p>
      </div>
    </main>
  )
}
