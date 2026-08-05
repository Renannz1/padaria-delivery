'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useToastStore } from '@/store/toast-store'
import { useConfigStore } from '@/store/config-store'
import { Pedido, StatusPedido } from '@/types'
import { formatarMoeda } from '@/lib/utils'
import {
  Bell,
  ChefHat,
  CheckCircle2,
  Bike,
  Store,
  Clock,
  User,
  Loader2,
  RefreshCw,
  Package,
} from 'lucide-react'
import ModalConfirmacaoMover from '@/components/admin/ModalConfirmacaoMover'
import ModalDetalhesPedido from '@/components/admin/ModalDetalhesPedido'
import { SelectFiltro } from '@/components/admin/SelectFiltro'
type ColunasStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue'

const colunas: {
  id: ColunasStatus
  label: string
  icon: React.ReactNode
  cor: string
  bgCor: string
}[] = [
  { id: 'recebido', label: 'Novos', icon: <Bell size={17} />, cor: '#c05e00', bgCor: '#fff4e5' },
  { id: 'preparando', label: 'Preparando', icon: <ChefHat size={17} />, cor: '#1a56db', bgCor: '#e8f0fe' },
  { id: 'pronto', label: 'Pronto / Em Rota', icon: <Package size={17} />, cor: '#805ad5', bgCor: '#faf5ff' },
  { id: 'entregue', label: 'Entregues', icon: <CheckCircle2 size={17} />, cor: '#1e7e34', bgCor: '#e6f4ea' },
]

function formatarTempo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000 / 60
  if (diff < 1) return 'agora'
  if (diff < 60) return `${Math.floor(diff)}min`
  return `${Math.floor(diff / 60)}h${Math.floor(diff % 60)}min`
}

// ── Card do Kanban ──────────────────────────────────
function PedidoKanbanCard({
  pedido,
  coluna,
  onSolicitarMover,
  onVerDetalhes,
  isDragging,
  onDragStart,
}: {
  pedido: Pedido
  coluna: ColunasStatus
  onSolicitarMover: (id: string, novoStatus: ColunasStatus) => void
  onVerDetalhes: (pedido: Pedido) => void
  isDragging: boolean
  onDragStart: () => void
}) {
  // Distingue click de drag: se o mouse se moveu, não abre o modal
  const dragMovedRef = useRef(false)

  const proximoStatus: Record<ColunasStatus, ColunasStatus | null> = {
    recebido: 'preparando',
    preparando: 'pronto',
    pronto: 'entregue',
    entregue: null,
  }

  const proximoLabel: Record<ColunasStatus, string> = {
    recebido: 'Iniciar Preparo',
    preparando: 'Marcar como Pronto',
    pronto: 'Marcar como Entregue',
    entregue: '',
  }

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => {
        dragMovedRef.current = true
        e.dataTransfer.setData('pedidoId', pedido.id)
        e.dataTransfer.setData('colunaOrigem', coluna)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={() => {
        // Reseta após soltar — dá tempo do onClick não disparar
        setTimeout(() => { dragMovedRef.current = false }, 0)
      }}
      onClick={() => {
        if (!dragMovedRef.current) onVerDetalhes(pedido)
      }}
      style={{
        padding: '1rem',
        cursor: 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 800, color: 'var(--primaria)', fontSize: '0.85rem' }}>
          #{pedido.numeroPedido}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-terciario)', fontSize: '0.72rem', background: '#f7f7f8', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
          <Clock size={11} />
          {formatarTempo(pedido.criadoEm)}
        </div>
      </div>

      {/* Cliente */}
      <p style={{ fontWeight: 700, color: 'var(--text-primario)', margin: '0 0 0.375rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <User size={13} color="var(--text-terciario)" />
        {pedido.cliente.nome}
      </p>

      {/* Tipo de entrega */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secundario)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {pedido.cliente.tipoEntrega === 'entrega' ? (
          <><Bike size={13} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Delivery — {pedido.cliente.endereco?.bairro}</span></>
        ) : (
          <><Store size={13} style={{ flexShrink: 0 }} /> Retirada na loja</>
        )}
      </div>

      {/* Itens resumo */}
      <div style={{ fontSize: '0.775rem', color: 'var(--text-terciario)', margin: '0 0 0.875rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {pedido.itens.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}
      </div>

      {/* Total e Botão */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--borda)' }}>
        <span style={{ fontWeight: 800, color: 'var(--primaria)', fontSize: '1rem' }}>
          {formatarMoeda(pedido.total)}
        </span>
        <button
          style={{ 
            fontSize: '0.72rem', 
            fontWeight: 600, 
            color: 'var(--text-primario)', 
            background: '#f4f4f5', 
            border: 'none',
            padding: '0.35rem 0.625rem', 
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e4e4e7'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f4f4f5'}
          onClick={(e) => {
            // O click do card já cuida de abrir o modal,
            // mas colocar isso como botão dá o aspecto semântico correto.
          }}
        >
          Ver detalhes
        </button>
      </div>
    </div>
  )
}

// ── Coluna do Kanban ─────────────────────────────────
function ColunaKanban({
  coluna,
  pedidos,
  draggingId,
  onSolicitarMover,
  onVerDetalhes,
  onDragStart,
  onDrop,
}: {
  coluna: (typeof colunas)[0]
  pedidos: Pedido[]
  draggingId: string | null
  onSolicitarMover: (id: string, novoStatus: ColunasStatus) => void
  onVerDetalhes: (pedido: Pedido) => void
  onDragStart: (id: string) => void
  onDrop: (novoStatus: ColunasStatus) => void
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      id={`kanban-coluna-${coluna.id}`}
      className="kanban-coluna"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const pedidoId = e.dataTransfer.getData('pedidoId')
        const origem = e.dataTransfer.getData('colunaOrigem') as ColunasStatus
        if (pedidoId && origem !== coluna.id) {
          onDrop(coluna.id)
        }
      }}
      style={{
        padding: '0.875rem',
        outline: dragOver ? `2px dashed ${coluna.cor}` : '2px dashed transparent',
        outlineOffset: -2,
        transition: 'outline 0.15s ease, background 0.15s ease',
        background: dragOver ? `${coluna.bgCor}` : undefined,
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.875rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '0.5rem',
              background: coluna.bgCor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: coluna.cor,
            }}
          >
            {coluna.icon}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primario)', fontSize: '0.9rem' }}>
            {coluna.label}
          </span>
        </div>
        <span
          style={{
            background: coluna.cor,
            color: 'white',
            borderRadius: '999px',
            minWidth: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0 6px',
          }}
        >
          {pedidos.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {pedidos.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-terciario)',
              fontSize: '0.8rem',
              border: '2px dashed var(--borda)',
              borderRadius: '0.75rem',
            }}
          >
            <p style={{ margin: 0 }}>
              {dragOver ? '↓ Soltar aqui' : 'Nenhum pedido aqui'}
            </p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoKanbanCard
              key={pedido.id}
              pedido={pedido}
              coluna={coluna.id}
              onSolicitarMover={onSolicitarMover}
              onVerDetalhes={onVerDetalhes}
              isDragging={draggingId === pedido.id}
              onDragStart={() => onDragStart(pedido.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────
export default function PedidosKanbanPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [periodo, setPeriodo] = useState('hoje')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [pedidoDetalhes, setPedidoDetalhes] = useState<Pedido | null>(null)
  const [pendente, setPendente] = useState<{
    pedidoId: string
    novoStatus: ColunasStatus
  } | null>(null)
  const [movendo, setMovendo] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  const buscarPedidos = useCallback(async () => {
    try {
      const data = await api.getPedidosAdmin('', periodo)
      setPedidos(data as Pedido[])
    } catch (e) {
      console.error('Erro ao buscar pedidos:', e)
    } finally {
      setCarregando(false)
    }
  }, [periodo])

  useEffect(() => {
    buscarPedidos()
    // Polling de 10s
    const interval = setInterval(buscarPedidos, 10000)
    return () => clearInterval(interval)
  }, [buscarPedidos])

  // Pedido sendo movido (para o modal)
  const pedidoPendente = pendente ? pedidos.find((p) => p.id === pendente.pedidoId) : null

  function solicitarMover(id: string, novoStatus: ColunasStatus) {
    setPendente({ pedidoId: id, novoStatus })
  }

  async function confirmarMover(enviarWhatsapp: boolean) {
    if (!pendente) return
    setMovendo(true)
    
    const { pedidoId, novoStatus } = pendente

    try {
      let statusEnvio = novoStatus as string
      if (novoStatus === 'pronto') {
        const p = pedidos.find(x => x.id === pedidoId)
        statusEnvio = p?.cliente.tipoEntrega === 'retirada' ? 'retirada_pronta' : 'saiu_entrega'
      }

      // Executa no servidor
      await api.moverStatusPedido(pedidoId, statusEnvio, enviarWhatsapp)
      
      // Handle fallback manual se a uazapi estiver desligada
      if (enviarWhatsapp && !useConfigStore.getState().evolutionAtivo) {
        const config = useConfigStore.getState()
        const p = pedidos.find(x => x.id === pedidoId)
        if (p) {
          let msgTemplate = ''
          if (statusEnvio === 'recebido') msgTemplate = config.msgRecebido
          else if (statusEnvio === 'preparando') msgTemplate = config.msgPreparando
          else if (statusEnvio === 'saiu_entrega') msgTemplate = config.msgSaiuEntrega
          else if (statusEnvio === 'retirada_pronta') msgTemplate = config.msgRetiradaPronta
          else if (statusEnvio === 'entregue') msgTemplate = config.msgEntregue

          if (msgTemplate) {
            const msgTexto = `Olá, ${p.cliente.nome}! 👋\n${config.nomeEstabelecimento}: ${msgTemplate}\n\nPedido: #${p.numeroPedido}`
            const numeroLimpo = p.cliente.whatsapp.replace(/\D/g, '')
            let numeroBr = numeroLimpo
            if (numeroBr.length <= 11) numeroBr = `55${numeroBr}`
            const url = `https://wa.me/${numeroBr}?text=${encodeURIComponent(msgTexto)}`
            window.open(url, '_blank')
          }
        }
      }

      // Resposta real no frontend
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedidoId ? { ...p, status: statusEnvio as StatusPedido } : p
        )
      )
      addToast('Status do pedido atualizado!', 'success')
      setPendente(null)
      setDraggingId(null)
    } catch (e: any) {
      console.error('Erro ao mover pedido:', e)
      addToast('Erro ao atualizar o status do pedido.', 'error')
      buscarPedidos()
    } finally {
      setMovendo(false)
    }
  }

  function cancelarMover() {
    setPendente(null)
    setDraggingId(null)
  }

  // Drop de drag externo à coluna
  function handleDrop(novoStatus: ColunasStatus) {
    if (draggingId) {
      solicitarMover(draggingId, novoStatus)
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem)' }}>
      {/* Header */}
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
            Operação em tempo real
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primario)',
              margin: '0 0 0.375rem',
            }}
          >
            Gestão de Pedidos
          </h1>
          <p style={{ color: 'var(--text-secundario)', fontSize: '0.875rem', margin: 0, minHeight: '1.25rem' }}>
            {carregando ? '\u00A0' : `${pedidos.length} pedidos · Arraste ou clique para mover entre colunas`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      {!carregando && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'flex-end' }}>
          <SelectFiltro
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ minHeight: 44, minWidth: '160px' }}
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="tudo">Todo o período</option>
          </SelectFiltro>
          <button
            onClick={buscarPedidos}
            className="btn-secundario"
            style={{ minHeight: 44 }}
          >
            <RefreshCw size={18} /> Atualizar
          </button>
        </div>
      )}

      {carregando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primaria)' }} />
        </div>
      ) : (
        <>
          {/* Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
        onDragEnd={() => setDraggingId(null)}
      >
        {colunas.map((col, colIdx) => {
          const pedidosColuna = pedidos.filter((p) => {
            if (col.id === 'pronto') {
              return p.status === 'saiu_entrega' || p.status === 'retirada_pronta'
            }
            if (col.id === 'entregue') {
              return p.status === 'entregue'
            }
            return p.status === col.id
          })

          return (
            <div
              key={col.id}
              style={{ animation: `fade-in 0.35s ease ${colIdx * 0.08}s both` }}
            >
              <ColunaKanban
                coluna={col}
                pedidos={pedidosColuna}
                draggingId={draggingId}
                onSolicitarMover={solicitarMover}
                onVerDetalhes={(p) => setPedidoDetalhes(p)}
                onDragStart={(id) => setDraggingId(id)}
                onDrop={handleDrop}
              />
            </div>
          )
        })}
      </div>
      </>
      )}

      {/* Modal de detalhes do pedido */}
      {pedidoDetalhes && (
        <ModalDetalhesPedido
          pedido={pedidoDetalhes}
          aoFechar={() => setPedidoDetalhes(null)}
          aoMover={(id: string, novoStatus: any) => {
            setPedidoDetalhes(null)
            solicitarMover(id, novoStatus)
          }}
        />
      )}

      {/* Modal de confirmação de status */}
      {pendente && pedidoPendente && (
        <ModalConfirmacaoMover
          pedido={pedidoPendente}
          novoStatus={pendente.novoStatus}
          onConfirmar={confirmarMover}
          onCancelar={cancelarMover}
        />
      )}
    </div>
  )
}
