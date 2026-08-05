'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  TrendingUp,
  ShoppingBag,
  ChefHat,
  CheckCircle,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { formatarMoeda } from '@/lib/utils'
import { SelectFiltro } from '@/components/admin/SelectFiltro'
import ModalDetalhesPedido from '@/components/admin/ModalDetalhesPedido'
import { BadgeStatusPedido } from '@/components/ui/BadgeStatusPedido'

const icones: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp size={22} />,
  ShoppingBag: <ShoppingBag size={22} />,
  ChefHat: <ChefHat size={22} />,
  CheckCircle: <CheckCircle size={22} />,
}

function formatarTempoRelativo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000 / 60
  if (diff < 1) return 'agora mesmo'
  if (diff < 60) return `há ${Math.floor(diff)} min`
  return `há ${Math.floor(diff / 60)}h`
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [periodo, setPeriodo] = useState('hoje')
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null)

  useEffect(() => {
    let ativo = true
    
    async function carregar(isPolling = false) {
      if (!isPolling) setCarregando(true)
      try {
        const [dashData, pedidosData] = await Promise.all([
          api.getDashboard(periodo),
          api.getPedidosAdmin('', 'hoje'),
        ])
        if (!ativo) return

        // Mapeia os KPIs do backend para o formato do frontend
        const tituloFaturamento = periodo === 'hoje' ? 'Faturamento do Dia' : periodo === 'ontem' ? 'Faturamento de Ontem' : 'Faturamento do Período'
        const tituloPedidos = periodo === 'hoje' ? 'Pedidos Hoje' : periodo === 'ontem' ? 'Pedidos Ontem' : 'Pedidos do Período'
        const labelAnterior = periodo === 'hoje' ? 'ontem' : periodo === 'ontem' ? 'anteontem' : 'anterior'

        const kpisMapeados = [
          {
            titulo: tituloFaturamento,
            valor: formatarMoeda(parseFloat(dashData.faturamento_hoje || 0)),
            variacao: `vs. ${labelAnterior}: ${formatarMoeda(parseFloat(dashData.faturamento_ontem || 0))}`,
            positivo: (dashData.faturamento_hoje || 0) >= (dashData.faturamento_ontem || 0),
            icone: 'TrendingUp',
          },
          {
            titulo: tituloPedidos,
            valor: String(dashData.total_pedidos || 0),
            variacao: `${labelAnterior}: ${dashData.pedidos_ontem || 0}`,
            positivo: (dashData.total_pedidos || 0) >= (dashData.pedidos_ontem || 0),
            icone: 'ShoppingBag',
          },
          {
            titulo: 'Em Preparo',
            valor: String(dashData.em_preparo || 0),
            variacao: `${dashData.em_preparo || 0} pedido(s) em andamento`,
            positivo: true,
            icone: 'ChefHat',
          },
          {
            titulo: 'Concluídos',
            valor: String(dashData.concluidos || 0),
            variacao: `de ${dashData.total_pedidos || 0} pedidos selecionados`,
            positivo: true,
            icone: 'CheckCircle',
          },
        ]

        setKpis(kpisMapeados)
        setPedidos(pedidosData.slice(0, 4))
      } catch (e) {
        console.error('Erro ao carregar dashboard:', e)
      } finally {
        if (!isPolling && ativo) setCarregando(false)
      }
    }
    carregar()
    
    // Polling a cada 10s
    const interval = setInterval(() => carregar(true), 10000)
    
    return () => {
      ativo = false
      clearInterval(interval)
    }
  }, [periodo])

  return (
    <div
      className="animate-fade-in"
      style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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
            Bem-vindo de volta
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primario)',
              margin: '0 0 0.375rem',
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: 'var(--text-secundario)',
              fontSize: '0.875rem',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Clock size={14} />
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {!carregando && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          {/* Filtro de Período */}
          <SelectFiltro
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="tudo">Todo o período</option>
          </SelectFiltro>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────── */}
      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {kpis.map((kpi, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: '1.125rem',
                  padding: '1.25rem',
                  border: '1px solid var(--borda)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                  animation: `fade-in 0.35s ease ${idx * 0.07}s both`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '0.75rem',
                    background: 'rgba(143, 112, 75, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primaria)',
                  }}
                >
                  {icones[kpi.icone]}
                </div>

                <p style={{ color: 'var(--text-terciario)', fontSize: '0.775rem', fontWeight: 500, margin: 0 }}>
                  {kpi.titulo}
                </p>

                <p
                  style={{
                    fontFeatureSettings: '"tnum"',
                    fontSize: '1.55rem',
                    fontWeight: 700,
                    color: 'var(--text-primario)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {kpi.valor}
                </p>

                <p
                  style={{
                    fontSize: '0.75rem',
                    color: kpi.positivo ? 'var(--color-verde-sucesso)' : 'var(--color-vermelho-erro)',
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {kpi.positivo ? '↑' : '↓'} {kpi.variacao}
                </p>
              </div>
            ))}
          </div>

          {/* ── Pedidos Recentes ────────────────────────── */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              border: '1px solid var(--borda)',
              animation: 'fade-in 0.4s ease 0.28s both',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primario)',
                  margin: 0,
                }}
              >
                Pedidos Recentes
              </h2>
              <Link
                href="/admin/pedidos"
                id="link-ver-todos-pedidos"
                className="link-hover-primaria"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--primaria)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'color 0.2s',
                }}
              >
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>

            {pedidos.length === 0 ? (
              <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-terciario)', animation: 'fade-in 0.4s ease' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primario)' }}>Nenhum pedido recente</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Ainda não recebemos novos pedidos hoje.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {pedidos.map((pedido: any, idx: number) => {
                  return (
                    <div
                      key={pedido.id}
                      onClick={() => setPedidoSelecionado(pedido)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.125rem',
                        background: '#fdfaf5',
                        borderRadius: '0.875rem',
                        border: '1px solid #f0e4d0',
                        animation: `fade-in 0.3s ease ${0.3 + idx * 0.06}s both`,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #c8860a, #e6a420)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          flexShrink: 0,
                        }}
                      >
                        <ShoppingBag size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primario)', margin: '0 0 0.125rem', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--primaria)' }}>#{pedido.numeroPedido}</span> · {pedido.cliente.nome}
                        </p>
                        <p style={{ color: 'var(--text-terciario)', margin: 0, fontSize: '0.75rem' }}>
                          {pedido.itens.length}{' '}
                          {pedido.itens.length === 1 ? 'item' : 'itens'} ·{' '}
                          {formatarTempoRelativo(pedido.criadoEm)}
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '0.25rem',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--primaria)', fontSize: '0.9rem' }}>
                          {formatarMoeda(pedido.total)}
                        </span>
                        <BadgeStatusPedido status={pedido.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Modal de Detalhes do Pedido */}
      {pedidoSelecionado && (
        <ModalDetalhesPedido
          pedido={pedidoSelecionado}
          aoFechar={() => setPedidoSelecionado(null)}
          aoMover={async (id, novoStatus) => {
            try {
              await api.moverStatusPedido(id, novoStatus)
              // Recarrega os pedidos recentes se um status for alterado
              const updated = await api.getPedidosAdmin('', 'hoje')
              setPedidos(updated.slice(0, 4))
            } catch (error) {
              console.error('Erro ao atualizar status do pedido', error)
            }
          }}
        />
      )}
    </div>
  )
}
