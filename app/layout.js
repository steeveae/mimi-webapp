export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <title>Les Millésimes de Mimi</title>
      </head>
      <body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
