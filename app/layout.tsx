import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'RUMGIP LIVE', description: 'Watch Rumgip Championship live.' }

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body>{children}</body></html>
}
