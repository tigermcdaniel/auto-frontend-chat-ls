import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skincare Expert AI - Your Personal Skincare Assistant',
  description: 'Get personalized skincare advice, product recommendations, and routine analysis powered by AI. Expert guidance for all skin types and concerns.',
  generator: 'Skincare Expert AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
