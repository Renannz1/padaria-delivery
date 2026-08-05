'use client'

import Link from 'next/link'
import { ShoppingCart, Store, ReceiptText, User } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useConfigStore } from '@/store/config-store'
import { useAuthStore } from '@/store/auth-store'
import CartDrawer from './CartDrawer'
import ModalAutenticacao from './ModalAutenticacao'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const totalItens = useCartStore((s) => s.totalItens())
  const openCartDrawer = useCartStore((s) => s.openCartDrawer)
  const nomeEstabelecimento = useConfigStore((s) => s.nomeEstabelecimento)
  
  const estaLogado = useAuthStore((s) => s.isLogado())
  const logout = useAuthStore((s) => s.logout)

  const [estaMontado, setEstaMontado] = useState(false)
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false)
  const [modalAuthAberto, setModalAuthAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEstaMontado(true)
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPerfilAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  return (
    <>
      <header
        className="hidden md:block"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(247, 247, 248, 0.93)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--borda)',
          overflow: 'visible',
          transform: 'translateZ(0)', // GPU Layer
          willChange: 'transform',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 1rem',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'visible',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/logo-navbar.png" 
              alt="Logo" 
              style={{
                height: 36,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--text-primario)',
              }}
            >
              {estaMontado ? nomeEstabelecimento : ''}
            </span>
          </Link>

          {/* Navegação Desktop (Pedidos, Perfil, Carrinho) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: 10, paddingRight: 10 }}>
            
            <Link
              href="/pedidos"
              className="link-hover-dark"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--text-primario)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <ReceiptText size={18} />
              <span>Pedidos</span>
            </Link>

            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                className="link-hover-dark"
                onClick={() => {
                  if (estaLogado) {
                    setMenuPerfilAberto(!menuPerfilAberto)
                  } else {
                    setModalAuthAberto(true)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  color: 'var(--text-primario)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: 0,
                }}
              >
                <User size={18} />
                <span>{estaMontado ? (estaLogado ? 'Perfil' : 'Entrar') : 'Perfil'}</span>
              </button>

              {menuPerfilAberto && estaLogado && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid var(--borda)',
                  minWidth: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 60
                }}>
                  <Link 
                    href="/perfil" 
                    onClick={() => setMenuPerfilAberto(false)}
                    style={{ padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--text-primario)', fontSize: '0.9rem', borderBottom: '1px solid var(--borda)' }}
                  >
                    Editar Perfil
                  </Link>
                  <button 
                    onClick={() => {
                      setMenuPerfilAberto(false)
                      logout()
                      router.push('/')
                    }}
                    style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', color: 'var(--color-vermelho-erro)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Botão Carrinho (oculto apenas em lg+ na home, pois lá já tem a sidebar) */}
            <div className={pathname === '/' ? "lg:hidden" : ""} style={{ position: 'relative' }}>
              <button
                id="btn-abrir-carrinho"
                className="btn-elevate"
                onClick={openCartDrawer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--primaria)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.625rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <ShoppingCart size={18} />
                <span>Carrinho</span>
              </button>

              {/* Badge fora do botão, posicionado no wrapper */}
              {estaMontado && totalItens > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: 'var(--text-primario)',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0 4px',
                    lineHeight: 1,
                    animation: 'bounce-in 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {totalItens}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {modalAuthAberto && (
        <ModalAutenticacao
          aoSucesso={() => setModalAuthAberto(false)}
          aoFechar={() => setModalAuthAberto(false)}
        />
      )}
    </>
  )
}
