'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface VoltarLinkProps {
  href?: string
  label?: string
}

export default function VoltarLink({ href = '/', label = 'Voltar ao cardápio' }: VoltarLinkProps) {
  return (
    <Link
      href={href}
      className="voltar-link"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        color: '#888597',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        marginBottom: '1.5rem',
        transition: 'color 0.2s',
      }}
    >
      <ArrowLeft size={16} /> {label}
    </Link>
  )
}
