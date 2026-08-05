'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  ChefHat,
  Settings,
  UtensilsCrossed,
  Users,
  Megaphone,
  MessageCircle,
} from 'lucide-react'
import { useConfigStore } from '@/store/config-store'
import { useAdminAuthStore } from '@/store/admin-auth-store'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/pedidos', label: 'Pedidos', icon: <ClipboardList size={20} /> },
  { href: '/admin/cardapio', label: 'Cardápio', icon: <UtensilsCrossed size={20} /> },
  { href: '/admin/patrocinadores', label: 'Patrocinadores', icon: <Megaphone size={20} /> },
  { href: '/admin/clientes', label: 'Clientes', icon: <Users size={20} /> },
  { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: <MessageCircle size={20} /> },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const nomeEstabelecimento = useConfigStore((s) => s.nomeEstabelecimento)
  const logout = useAdminAuthStore((s) => s.logout)
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/admin/login')
  }

  return (
    <>
      {/* ── Overlay mobile (só quando aberto) ──────── */}
      {isOpen && (
        <div
          className="lg:hidden"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(2px)',
            animation: 'fade-in 0.2s ease',
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      {/* No mobile: drawer fixo que desliza; no desktop: sticky no fluxo */}
      <aside
        className={`admin-sidebar admin-sidebar-root ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Logo */}
        <div
          className="hidden lg:flex"
          style={{
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0 0.25rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '0.5rem',
              background: 'var(--primaria)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <ChefHat size={20} />
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontWeight: 700,
                fontSize: '1rem',
                color: '#e8d5b0',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {nomeEstabelecimento}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#7c5c2e', margin: 0 }}>
              Painel Admin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map((item) => {
            const ativo = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`admin-nav-${item.href.replace(/\//g, '-').replace(/^-/, '') || 'home'}`}
                className={`admin-sidebar-item ${ativo ? 'ativo' : ''}`}
                onClick={onClose}
              >
                {item.icon}
                <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(200, 134, 10, 0.2)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link
            href="/"
            className="admin-sidebar-item"
            style={{ fontSize: '0.85rem' }}
            onClick={onClose}
          >
            <LogOut size={18} />
            <span>Ver a Loja</span>
          </Link>
          <button
            id="btn-logout-admin"
            className="admin-sidebar-item"
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontSize: '0.85rem', color: '#c04040' }}
          >
            <LogOut size={18} color="#c04040" />
            <span>Sair (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  )
}
