export const dynamic = "force-dynamic"

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
            {rows[0].map((col, i) => <th key={i}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
