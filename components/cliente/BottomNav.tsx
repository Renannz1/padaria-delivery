'use client'

import Link from 'next/link'
import { Home, ReceiptText, User, ShoppingCart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useEffect, useState, useRef } from 'react'
import { formatarMoeda } from '@/lib/utils'
import ModalAutenticacao from './ModalAutenticacao'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const totalItens = useCartStore((s) => s.totalItens())
  const openCartDrawer = useCartStore((s) => s.openCartDrawer)
  const cartDrawerOpen = useCartStore((s) => s.cartDrawerOpen)
  const closeCartDrawer = useCartStore((s) => s.closeCartDrawer)
  
  const isLogado = useAuthStore((s) => s.isLogado())
  const logout = useAuthStore((s) => s.logout)

  const [isMounted, setIsMounted] = useState(false)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [modalAuthAberto, setModalAuthAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPerfilAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  // Ocultar em telas maiores que mobile (md) e também ocultar no painel admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <nav
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderTop: '1px solid #ebebef',
        zIndex: 90,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)', // Para iPhones
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '60px',
        }}
      >
        <Link 
          href="/" 
          onClick={(e) => {
            if (cartDrawerOpen) {
              e.preventDefault()
              closeCartDrawer()
              setTimeout(() => router.push('/'), 100)
            }
          }} 
          style={{ textDecoration: 'none', flex: 1 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: pathname === '/' ? '#18171a' : '#888597',
              gap: '4px',
            }}
          >
            <Home size={22} color={pathname === '/' ? '#18171a' : '#888597'} />
            <span style={{ fontSize: '0.65rem', fontWeight: pathname === '/' ? 700 : 500 }}>
              Cardápio
            </span>
          </div>
        </Link>

        <Link 
          href="/pedidos" 
          onClick={(e) => {
            if (cartDrawerOpen) {
              e.preventDefault()
              closeCartDrawer()
              setTimeout(() => router.push('/pedidos'), 100)
            }
          }} 
          style={{ textDecoration: 'none', flex: 1 }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: pathname === '/pedidos' ? '#18171a' : '#888597',
              gap: '4px',
            }}
          >
            <ReceiptText size={22} color={pathname === '/pedidos' ? '#18171a' : '#888597'} />
            <span style={{ fontSize: '0.65rem', fontWeight: pathname === '/pedidos' ? 700 : 500 }}>
              Pedidos
            </span>
          </div>
        </Link>

        <button
          onClick={cartDrawerOpen ? closeCartDrawer : openCartDrawer}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: cartDrawerOpen ? '#18171a' : '#888597',
            gap: '4px',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <ShoppingCart size={22} color={cartDrawerOpen ? '#18171a' : '#888597'} />
          <span style={{ fontSize: '0.65rem', fontWeight: cartDrawerOpen ? 700 : 500 }}>
            Carrinho
          </span>
          {isMounted && totalItens > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: 'calc(50% - 20px)',
                background: '#18171a',
                color: 'white',
                borderRadius: '0.375rem',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0 4px',
                animation: 'bounce-in 0.3s ease',
              }}
            >
              {totalItens}
            </span>
          )}
        </button>

        <div ref={menuRef} style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => {
              if (cartDrawerOpen) closeCartDrawer()
              if (isLogado) {
                setMenuPerfilAberto(!menuPerfilAberto)
              } else {
                setModalAuthAberto(true)
              }
            }} 
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: pathname === '/perfil' ? '#18171a' : '#888597',
              gap: '4px',
              padding: 0
            }}
          >
            <User size={22} color={pathname === '/perfil' ? '#18171a' : '#888597'} />
            <span style={{ fontSize: '0.65rem', fontWeight: pathname === '/perfil' ? 700 : 500 }}>
              {isMounted ? (isLogado ? 'Perfil' : 'Entrar') : 'Perfil'}
            </span>
          </button>

          {menuPerfilAberto && isLogado && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: '1rem',
              marginBottom: '0.5rem',
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e4e2ea',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 60
            }}>
              <Link 
                href="/perfil" 
                onClick={() => setMenuPerfilAberto(false)}
                style={{ padding: '0.875rem 1rem', textDecoration: 'none', color: '#18171a', fontSize: '0.95rem', borderBottom: '1px solid #e4e2ea', fontWeight: 500 }}
              >
                Editar Perfil
              </Link>
              <button 
                onClick={() => {
                  setMenuPerfilAberto(false)
                  logout()
                  router.push('/')
                }}
                style={{ padding: '0.875rem 1rem', background: 'none', border: 'none', textAlign: 'left', color: '#d32f2f', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
      </nav>

      {modalAuthAberto && (
        <ModalAutenticacao
          aoSucesso={() => setModalAuthAberto(false)}
          aoFechar={() => setModalAuthAberto(false)}
        />
      )}
    </>
  )
}
