import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <title>Les Millésimes de Mimi</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
