async function getData() {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/STOCK?key=${process.env.GOOGLE_SHEETS_API_KEY}`
  )
  const data = await res.json()
  return data.values
}

export default async function Catalogue() {
  const rows = await getData()

  return (
    <main style={{ padding: 40 }}>
      <h1>Catalogue des vins 🍇</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du vin</th>
            <th>Catégorie</th>
            <th>Gamme</th>
            <th>Prix bouteille</th>
            <th>Prix carton</th>
            <th>Stock bouteilles</th>
            <th>Stock cartons</th>
            <th>Description</th>
            <th>Prix promo bouteille</th>
            <th>Prix promo carton</th>
            <th>Équivalence prix</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
