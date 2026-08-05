import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export async function generateMetadata(): Promise<Metadata> {
  let nome = 'Padaria'
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const res = await fetch(`${apiBase}/config/`, { next: { revalidate: 60 } })
    if (res.ok) {
      const data = await res.json()
      if (data.nome_estabelecimento) {
        nome = data.nome_estabelecimento
      }
    }
  } catch (error) {
    // Silently fallback on failure
  }

  return {
    title: `${nome} — Pães e Sabores na sua Porta`,
    description:
      'Peça os melhores pães, salgados, doces e bebidas fresquinhos. Entrega rápida e retirada disponível.',
    keywords: 'padaria, delivery, pão, salgados, doces, entrega, pedidos online',
    authors: [{ name: nome }],
    openGraph: {
      title: nome,
      description: 'Os melhores pães da cidade, direto na sua mesa.',
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
