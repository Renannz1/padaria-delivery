'use client'

import { Clock, MapPin } from 'lucide-react'
import { useConfigStore } from '@/store/config-store'
import { useEffect, useState } from 'react'

export default function InfoBanner() {
  const [isMounted, setIsMounted] = useState(false)
  const openInfoModal = useConfigStore((s) => s.openInfoModal)
  const horarioFuncionamento = useConfigStore((s) => s.horarioFuncionamento())
  const enderecoLoja = useConfigStore((s) => s.enderecoLoja)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <button
      onClick={openInfoModal}
      style={{
        width: '100%',
        border: 'none',
        background: '#1c1208',
        color: '#d4d2dc',
        padding: '0.5rem 1rem',
        fontSize: '0.78rem',
        display: 'flex',
        gap: '1.25rem',
        justifyContent: 'center',
        flexWrap: 'wrap' as const,
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Clock size={13} /> {isMounted ? horarioFuncionamento : 'Carregando...'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <MapPin size={13} /> {isMounted ? enderecoLoja : 'Carregando...'}
      </span>
    </button>
  )
}
