'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopBar from '@/components/admin/AdminTopBar'
import AdminToasts from '@/components/admin/AdminToasts'
import { useState, useEffect } from 'react'
import { useAdminAuthStore } from '@/store/admin-auth-store'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isLogado = useAdminAuthStore((s) => s.isLogado())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const isLoginPage = pathname === '/admin/login'
    if (!isLogado && !isLoginPage) {
      router.replace('/admin/login')
    }
  }, [mounted, isLogado, pathname, router])

  if (!mounted) {
    return null
  }

  const isLoginPage = pathname === '/admin/login'

  // Evita o flicker de mostrar a tela do admin antes de redirecionar
  if (!isLogado && !isLoginPage) {
    return null
  }

  // Página de login não usa o layout do admin
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-principal)' }}>
      {/* Sidebar — sempre visível no desktop, drawer no mobile */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Coluna direita */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="admin-main-col"
      >
        {/* Topbar apenas no mobile */}
        <AdminTopBar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <AdminToasts />
    </div>
  )
}
