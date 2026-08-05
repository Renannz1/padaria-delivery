'use client'

import { useCartStore } from '@/store/cart-store'
import { useEffect, useState, useRef } from 'react'
import CartContent from './CartContent'
import { usePathname } from 'next/navigation'

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const pathname = usePathname()
  const open = useCartStore((s) => s.cartDrawerOpen)
  const onClose = useCartStore((s) => s.closeCartDrawer)
  const openCartDrawer = useCartStore((s) => s.openCartDrawer)
  const totalItens = useCartStore((s) => s.totalItens())

  const [dragY, setDragY] = useState(0)
  const startYRef = useRef(0)
  const draggingRef = useRef(false)

  // O "peek" acontece quando está fechado, tem itens e estamos na Home
  const isHome = pathname === '/'
  const shouldPeek = !open && totalItens > 0 && isHome

  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Travar scroll quando aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Reset do drag ao abrir/fechar
  useEffect(() => {
    if (!open) {
      setTimeout(() => setDragY(0), 300)
    }
  }, [open])

  // Lidar com o botão de voltar do celular (Browser Back Button)
  useEffect(() => {
    if (open) {
      // Adiciona um estado falso no histórico
      window.history.pushState({ cartDrawer: true }, '')
      
      const handlePopState = () => {
        // Usuário apertou o botão voltar do celular
        onClose()
      }
      
      window.addEventListener('popstate', handlePopState)
      
      return () => {
        window.removeEventListener('popstate', handlePopState)
        // Se o carrinho foi fechado por outro meio (overlay, botão), o estado ainda estará lá
        // Então precisamos voltar 1 no histórico para limpar
        if (window.history.state?.cartDrawer) {
          window.history.back()
        }
      }
    }
  }, [open, onClose])

  function handleTouchStart(e: React.TouchEvent) {
    if (window.innerWidth >= 768) return // Só no mobile
    startYRef.current = e.touches[0].clientY
    draggingRef.current = true
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!draggingRef.current) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startYRef.current
    if (deltaY > 0) {
      setDragY(deltaY)
    }
  }

  function handleTouchEnd() {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (dragY > 100) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  if (!mounted) return null

  const peekClass = shouldPeek 
    ? 'translate-y-[calc(100%-58px)] md:translate-y-0 md:translate-x-full' 
    : 'translate-y-[calc(100%+40px)] md:translate-y-0 md:translate-x-full'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed top-0 left-0 right-0 bottom-[60px] md:bottom-0"
        style={{
          background: 'rgba(28, 18, 8, 0.45)',
          zIndex: 80,
          backdropFilter: 'blur(2px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Gaveta */}
      <div
        id="cart-drawer"
        className={`fixed flex flex-col bg-white transition-transform duration-300
          bottom-[60px] left-0 w-full h-[75vh] rounded-t-[1.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.15)]
          md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-[400px] md:h-full md:rounded-none md:shadow-2xl
          ${open ? 'z-[85] translate-y-0 md:translate-x-0' : `z-[30] ${peekClass}`}
        `}
        style={{
          transitionTimingFunction: dragY > 0 ? 'linear' : 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: dragY > 0 ? '0s' : '300ms',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          overflow: 'hidden',
        }}
      >
        {shouldPeek && (
          <div 
            className="absolute top-0 left-0 w-full h-[58px] z-50 cursor-pointer"
            onClick={openCartDrawer} 
          />
        )}

        {/* Puxador Mobile (Drag handle) */}
        <div 
          className="md:hidden w-full flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing bg-white relative z-40"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1.5 rounded-full" style={{ background: '#e4e2ea' }} />
        </div>

        <CartContent onClose={onClose} isSidebar={true} isPeek={shouldPeek} />
      </div>
    </>
  )
}
