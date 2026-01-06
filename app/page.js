export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Les Millésimes de Mimi 🍷</h1>
      <p>Bienvenue dans votre espace de découverte et de commande.</p>

      <a href="/chat" style={{ display: "block", marginTop: 20 }}>
        👉 Accéder à Mimi (Chatbot)
      </a>

      <a href="/catalogue" style={{ display: "block", marginTop: 10 }}>
        👉 Voir le catalogue
      </a>
    </main>
  )
}
