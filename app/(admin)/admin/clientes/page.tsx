'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatarMoeda } from '@/lib/utils'
import {
  Search,
  Users,
  MessageSquare,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  ShoppingBag,
  Loader2,
  UserX
} from 'lucide-react'

export default function ClientesPage() {
  const [busca, setBusca] = useState('')
  const [clientes, setClientes] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [ordenacao, setOrdenacao] = useState<{ coluna: 'totalPedidos' | 'totalGasto' | 'ultimoPedido', asc: boolean } | null>(null)

  useEffect(() => {
    api.getClientesAdmin()
      .then((data) => setClientes(data))
      .catch((e) => console.error('Erro ao carregar clientes:', e))
      .finally(() => setCarregando(false))
  }, [])

  const [menuAberto, setMenuAberto] = useState<{ id: string, x: number, y: number } | null>(null)

  // Filtragem local simples
  let clientesExibidos = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.whatsapp.includes(busca)
  )

  // Ordenação
  if (ordenacao) {
    clientesExibidos.sort((a, b) => {
      if (ordenacao.coluna === 'ultimoPedido') {
        const vA = a.ultimoPedido ? new Date(a.ultimoPedido).getTime() : 0
        const vB = b.ultimoPedido ? new Date(b.ultimoPedido).getTime() : 0
        return ordenacao.asc ? vA - vB : vB - vA
      }
      const vA = Number(a[ordenacao.coluna]) || 0
      const vB = Number(b[ordenacao.coluna]) || 0
      return ordenacao.asc ? vA - vB : vB - vA
    })
  }

  useEffect(() => {
    function handleClickFora() {
      setMenuAberto(null)
    }
    if (menuAberto) {
      window.addEventListener('click', handleClickFora)
      return () => window.removeEventListener('click', handleClickFora)
    }
  }, [menuAberto])

  function chamarWhatsapp(telefone: string) {
    const limpo = telefone.replace(/\D/g, '')
    window.open(`https://wa.me/55${limpo}`, '_blank')
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <p
            style={{
              color: 'var(--primaria)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              margin: '0 0 0.375rem',
            }}
          >
            Gestão de Relacionamento
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primario)',
              margin: '0 0 0.375rem',
            }}
          >
            Clientes
          </h1>
          <p style={{ color: 'var(--text-secundario)', fontSize: '0.875rem', margin: 0, minHeight: '1.25rem' }}>
            {carregando ? '\u00A0' : `${clientes.length} clientes cadastrados na sua base`}
          </p>
        </div>

      </div>

      {!carregando && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-terciario)',
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '0 1rem 0 2.75rem',
                minHeight: '44px',
                borderRadius: '0.75rem',
                border: '1px solid var(--borda)',
                backgroundColor: 'var(--bg-card)',
                fontSize: '0.9rem',
                color: 'var(--text-primario)',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 134, 10, 0.08)'}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>
        </div>
      )}

      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '1.25rem',
          border: '1px solid var(--borda)',
          overflow: 'hidden',
          animation: 'fade-in 0.4s ease 0.2s both',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#faf6f0', borderBottom: '1px solid var(--borda)' }}>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                  Cliente
                </th>
                <th style={{ width: '180px', padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                  WhatsApp
                </th>
                <th 
                  onClick={() => setOrdenacao(o => ({ coluna: 'totalPedidos', asc: o?.coluna === 'totalPedidos' ? !o.asc : false }))}
                  style={{ width: '120px', padding: '1rem 1.25rem', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secundario)', cursor: 'pointer', userSelect: 'none' }}
                >
                  Pedidos <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4, opacity: ordenacao?.coluna === 'totalPedidos' ? 1 : 0.4 }} />
                </th>
                <th 
                  onClick={() => setOrdenacao(o => ({ coluna: 'totalGasto', asc: o?.coluna === 'totalGasto' ? !o.asc : false }))}
                  style={{ width: '150px', padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secundario)', cursor: 'pointer', userSelect: 'none' }}
                >
                  Gasto Total <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4, opacity: ordenacao?.coluna === 'totalGasto' ? 1 : 0.4 }} />
                </th>
                <th 
                  onClick={() => setOrdenacao(o => ({ coluna: 'ultimoPedido', asc: o?.coluna === 'ultimoPedido' ? !o.asc : false }))}
                  style={{ width: '200px', padding: '1rem 1.25rem', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secundario)', cursor: 'pointer', userSelect: 'none' }}
                >
                  Último Pedido <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 4, opacity: ordenacao?.coluna === 'ultimoPedido' ? 1 : 0.4 }} />
                </th>
                <th style={{ width: '60px', padding: '1rem 1.25rem', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {clientesExibidos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-terciario)', background: 'var(--bg-card)', animation: 'fade-in 0.4s ease' }}>
                    <UserX size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primario)' }}>Nenhum cliente encontrado</p>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Não encontramos nenhum cliente com a busca "{busca}".</p>
                  </td>
                </tr>
              ) : (
                clientesExibidos.map((cliente) => (
                  <tr
                    key={cliente.id}
                    style={{
                      borderBottom: '1px solid var(--borda)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fcf9f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Cliente */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(143, 112, 75, 0.1)',
                            color: 'var(--primaria)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {cliente.nome.charAt(0)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primario)', fontSize: '0.9rem' }}>
                            {cliente.nome}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-terciario)' }}>
                            ID: {cliente.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contato (WhatsApp) */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          chamarWhatsapp(cliente.whatsapp)
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem',
                          color: '#25D366', fontWeight: 600, border: 'none', background: 'transparent',
                          cursor: 'pointer', padding: 0
                        }}
                        title="Abrir WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span style={{ color: 'var(--text-secundario)', fontWeight: 400 }}>{cliente.whatsapp}</span>
                      </button>
                    </td>

                    {/* Total de Pedidos */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f0f5f0', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontWeight: 600, color: '#2e7d32', fontSize: '0.85rem' }}>
                        <ShoppingBag size={13} />
                        {cliente.totalPedidos || 0}
                      </div>
                    </td>

                    {/* Gasto Total */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primario)', fontSize: '0.95rem' }}>
                        {formatarMoeda(cliente.totalGasto)}
                      </span>
                    </td>

                    {/* Último Pedido */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                        <Calendar size={14} />
                        {cliente.ultimoPedido ? new Date(cliente.ultimoPedido).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Nenhum pedido'}
                      </div>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuAberto(
                            menuAberto?.id === cliente.id
                              ? null
                              : { id: cliente.id, x: rect.right, y: rect.bottom }
                          )
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-terciario)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '0.25rem',
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Menu Flutuante Global */}
      {menuAberto && (() => {
        const cliente = clientes.find(c => c.id === menuAberto.id)
        if (!cliente) return null
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuAberto.y + 4,
              left: menuAberto.x - 170, // Offset for the menu width
              background: 'white',
              border: '1px solid var(--borda)',
              borderRadius: '0.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 170,
              overflow: 'hidden',
              animation: 'fade-in 0.15s ease'
            }}
          >
            <button
              onClick={() => { chamarWhatsapp(cliente.whatsapp); setMenuAberto(null) }}
              style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--borda)', fontSize: '0.85rem', color: 'var(--text-primario)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Chamar no WhatsApp
            </button>
            <button
              onClick={() => { alert('Cliente bloqueado.'); setMenuAberto(null) }}
              style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-vermelho-erro)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fcf0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Bloquear Cliente
            </button>
          </div>
        )
      })()}
    </div>
  )
}
