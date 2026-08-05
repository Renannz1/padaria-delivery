'use client'

import { Menu, X, ChefHat } from 'lucide-react'
import { useConfigStore } from '@/store/config-store'

interface AdminTopBarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminTopBar({ isOpen, onToggle }: AdminTopBarProps) {
  const nomeEstabelecimento = useConfigStore((s) => s.nomeEstabelecimento)

  return (
    <header
      className="admin-topbar"
      style={{
        background: 'linear-gradient(90deg, #1c1208 0%, #2d1e0f 100%)',
        borderBottom: '1px solid rgba(200, 134, 10, 0.2)',
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        width: '100%',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '0.5rem',
            background: 'var(--primaria)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}
        >
          <ChefHat size={17} />
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: '#e8d5b0',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {nomeEstabelecimento}
          </p>
          <p style={{ fontSize: '0.65rem', color: '#7c5c2e', margin: 0 }}>Painel Admin</p>
        </div>
      </div>


      {/* Botão hambúrguer */}
      <button
        id="btn-admin-menu-mobile"
        onClick={onToggle}
        style={{
          background: 'rgba(200, 134, 10, 0.15)',
          border: '1px solid rgba(200, 134, 10, 0.25)',
          borderRadius: '0.5rem',
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#e8d5b0',
          transition: 'all 0.2s ease',
        }}
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  )
}
