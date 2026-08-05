'use client'


import { Store } from 'lucide-react'
import { useConfigStore } from '@/store/config-store'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [isMounted, setIsMounted] = useState(false)
  const openInfoModal = useConfigStore((s) => s.openInfoModal)
  const nomeEstabelecimento = useConfigStore((s) => s.nomeEstabelecimento)
  const enderecoLoja = useConfigStore((s) => s.enderecoLoja)
  const horarioFuncionamento = useConfigStore((s) => s.horarioFuncionamento())
  const whatsappContato = useConfigStore((s) => s.whatsappContato)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <footer className="mt-8 pb-24 md:pb-8" style={{ borderTop: '1px solid #e4e2ea' }} />

  return (
    <footer
      className="mt-8 pb-24 md:pb-8"
      style={{
        paddingTop: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        color: '#888597',
        fontSize: '0.85rem',
        borderTop: '1px solid #e4e2ea',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={openInfoModal}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            fontFamily: 'inherit',
            padding: 0,
            textAlign: 'left'
          }}
        >
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Store size={14} /> {nomeEstabelecimento} — {enderecoLoja} · WhatsApp: {whatsappContato}
          </p>
          <p style={{ margin: '0.25rem 0 0', textAlign: 'left' }}>
            {horarioFuncionamento}
          </p>
        </button>

        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0 }}>
            Sistema desenvolvido por <strong style={{ color: 'var(--text-primario)' }}>Renan</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
