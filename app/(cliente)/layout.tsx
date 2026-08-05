'use client'

import Header from '@/components/cliente/Header'
import BottomNav from '@/components/cliente/BottomNav'
import CartDrawer from '@/components/cliente/CartDrawer'
import InfoLojaModal from '@/components/cliente/InfoLojaModal'
import { useEffect } from 'react'
import { useCardapioStore } from '@/store/cardapio-store'
import { useConfigStore } from '@/store/config-store'

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const carregarCardapio = useCardapioStore((s) => s.carregarCardapio)
  const carregarConfig = useConfigStore((s) => s.carregarConfig)

  useEffect(() => {
    carregarConfig()
    carregarCardapio()
  }, [])

  return (
    <>
      <Header />

      <div
        className="min-h-[100dvh] md:min-h-[calc(100dvh-64px)]"
        style={{ background: '#f7f7f8', display: 'flex', flexDirection: 'column' }}
      >

        <main style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

      </div>

      <BottomNav />
      <CartDrawer />
      <InfoLojaModal />
    </>
  )
}
