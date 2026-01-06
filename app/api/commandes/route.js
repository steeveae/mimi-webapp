import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const SHEET_ID = process.env.GOOGLE_SHEETS_ID
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY
    if (!SHEET_ID || !API_KEY) {
      return NextResponse.json({ success: false, message: "Configuration manquante." })
    }

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/COMMANDES?key=${API_KEY}`,
      { cache: "no-store" }
    )
    const data = await res.json()

    return NextResponse.json({ success: true, rows: data.values || [] })
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message })
  }
}
