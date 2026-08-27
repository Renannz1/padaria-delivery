'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { formatarMoeda } from '@/lib/utils'
import VoltarLink from '@/components/cliente/VoltarLink'
import { BadgeStatusPedido } from '@/components/ui/BadgeStatusPedido'

export default function PedidosPage() {
  const ultimoPedidoId = useCartStore((s) => s.ultimoPedidoId)
  const estaLogado = useAuthStore((s) => s.isLogado())
  const [estaMontado, setEstaMontado] = useState(false)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  const buscarPedidos = useCallback(async () => {
    if (!estaLogado) {
      setCarregando(false)
      // Se não estiver logado mas tiver um pedido recente, mostra só ele
      if (ultimoPedidoId) {
        try {
          const p = await api.getPedido(ultimoPedidoId)
          setPedidos([p])
        } catch {
          setPedidos([])
        }
      }
      return
    }
    try {
      // Tenta buscar pedidos do cliente autenticado
      const data = await api.getPedidosCliente()
      setPedidos(data)
    } catch {
      // Fallback: se não houver endpoint de listagem, mostra só o último pedido
      if (ultimoPedidoId) {
        try {
          const p = await api.getPedido(ultimoPedidoId)
          setPedidos([p])
        } catch {
          setPedidos([])
        }
      } else {
        setPedidos([])
      }
    } finally {
      setCarregando(false)
    }
  }, [estaLogado, ultimoPedidoId])

  useEffect(() => {
    setEstaMontado(true)
    buscarPedidos()
  }, [buscarPedidos])

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1rem 1.25rem',
    border: '1px solid var(--borda)',
    marginBottom: '0.875rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.875rem'
  }

  if (!estaMontado) return null

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ margin: '0 auto', padding: '1.25rem 1rem 7rem', maxWidth: 768, animation: 'fade-in 0.3s ease' }}>
        <VoltarLink />

        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primario)', margin: '0 0 0.25rem' }}>
          Meus Pedidos
        </h1>
        <p style={{ color: 'var(--text-secundario)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Acompanhe o status dos seus pedidos
        </p>

        {carregando ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#c8860a' }} />
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center', maxWidth: 420, margin: '0 auto', animation: 'fade-in 0.4s ease' }}>
            <div style={{ padding: '0.875rem', background: 'var(--bg-card)', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem', border: '1px solid var(--borda)' }}>
              <ShoppingBag size={28} color="#888597" />
            </div>
            <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-primario)', fontSize: '1.15rem', fontWeight: 700 }}>
              Nenhum pedido encontrado
            </h2>
            <p style={{ color: 'var(--text-secundario)', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.4 }}>
              Seus pedidos aparecerão aqui após você finalizar uma compra.
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button className="btn-primario" style={{ width: '100%', maxWidth: 260, margin: '0 auto', fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}>
                Explorar Cardápio <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pedidos.map((pedido) => {
              return (
                <div key={pedido.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primario)', margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                        Pedido #{pedido.numeroPedido ?? pedido.id.toString().slice(-6).toUpperCase()}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secundario)', margin: 0 }}>
                        {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')} às {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {pedido.itens?.length ? ` • ${pedido.itens.length} ${pedido.itens.length === 1 ? 'item' : 'itens'}` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--borda)', paddingTop: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primario)', fontSize: '1rem' }}>
                      {formatarMoeda(pedido.total)}
                    </span>
                    <Link href={`/pedido/${pedido.id}`} style={{ textDecoration: 'none' }}>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--primaria)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Acompanhar <ChevronRight size={15} />
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
