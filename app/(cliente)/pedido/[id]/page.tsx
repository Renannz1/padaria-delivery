'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { StatusPedido } from '@/types'
import { formatarMoeda } from '@/lib/utils'
import {
  ClipboardCheck,
  ChefHat,
  Bike,
  CheckCircle,
  Package,
  MessageCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import VoltarLink from '@/components/cliente/VoltarLink'
import PatrocinadorCard from '@/components/cliente/PatrocinadorCard'

const statusOrdem: StatusPedido[] = ['recebido', 'preparando', 'saiu_entrega', 'entregue']

const statusInfo: Record<string, { label: string; descricao: string; icon: React.ReactNode }> = {
  recebido: {
    label: 'Pedido Recebido',
    descricao: 'Seu pedido foi recebido e confirmado!',
    icon: <ClipboardCheck size={24} />,
  },
  preparando: {
    label: 'Em Preparo',
    descricao: 'Nossa equipe está preparando seu pedido com carinho.',
    icon: <ChefHat size={24} />,
  },
  saiu_entrega: {
    label: 'Saiu para Entrega',
    descricao: 'Seu pedido está a caminho! Fique de olho.',
    icon: <Bike size={24} />,
  },
  entregue: {
    label: 'Entregue!',
    descricao: 'Pedido entregue. Bom apetite!',
    icon: <CheckCircle size={24} />,
  },
  retirada_pronta: {
    label: 'Pronto para Retirada',
    descricao: 'Seu pedido está pronto! Pode vir retirar.',
    icon: <Package size={24} />,
  },
}

export default function PedidoPage() {
  const params = useParams<{ id: string }>()
  const [pedido, setPedido] = useState<any | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState(false)
  const [patrocinadorRandom, setPatrocinadorRandom] = useState<any | null>(null)

  const buscarPedido = useCallback(async () => {
    try {
      const data = await api.getPedido(params.id)
      setPedido(data)
      setErro(null)
    } catch {
      setErro('Não foi possível carregar o pedido.')
    } finally {
      setCarregando(false)
    }
  }, [params.id])

  useEffect(() => {
    setMounted(true)
    buscarPedido()
    
    // Busca 1 patrocinador aleatório para exibir (apenas os que tem imagem quadrada)
    api.getPatrocinadores().then(res => {
      const comQuadrada = res?.filter((p: any) => p.imagem_quadrada) || []
      if (comQuadrada.length > 0) {
        const randomIndex = Math.floor(Math.random() * comQuadrada.length)
        setPatrocinadorRandom(comQuadrada[randomIndex])
      }
    }).catch(console.error)

    // Polling a cada 5 segundos para atualizar o status
    const interval = setInterval(buscarPedido, 5000)
    return () => clearInterval(interval)
  }, [buscarPedido])

  if (!mounted || carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#c8860a' }} />
      </div>
    )
  }

  if (erro || !pedido) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertCircle size={48} color="#c62828" />
        </div>
        <h2 style={{ color: '#1c1208', margin: '0 0 0.5rem' }}>Pedido não encontrado</h2>
        <p style={{ color: '#888597' }}>{erro || 'Verifique o número do pedido e tente novamente.'}</p>
        <VoltarLink />
      </div>
    )
  }

  let statusAtual: StatusPedido = pedido.status
  const isRetirada = pedido.cliente?.tipoEntrega === 'retirada'

  if (isRetirada && statusAtual === 'entregue') {
    statusAtual = 'retirada_pronta'
  }

  const ordemEfetiva = isRetirada 
    ? ['recebido', 'preparando', 'retirada_pronta'] as StatusPedido[] 
    : statusOrdem
  const idxAtual = ordemEfetiva.indexOf(statusAtual)
  
  const info = { ...(statusInfo[statusAtual] ?? statusInfo['recebido']) }
  
  // Para evitar que ele use o ícone padrão de checkmark, forçamos o ícone de pacote
  if (isRetirada && statusAtual === 'retirada_pronta') {
    info.icon = <Package size={24} />
  }

  const pedidoFinalizado = statusAtual === 'entregue' || statusAtual === 'retirada_pronta'

  function formatarTempo(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    border: '1px solid var(--borda)',
    marginBottom: '1.5rem',
  }

  const whatsappLoja = pedido.cliente?.whatsapp?.replace(/\D/g, '') ?? ''

  return (
    <div style={{ width: '100%', padding: '2rem 1.25rem 6rem', maxWidth: 600, margin: '0 auto', animation: 'fade-in 0.3s ease' }}>
      <VoltarLink />

      {/* Header do Pedido */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c1208, #322514)',
          borderRadius: '1rem',
          padding: '2rem 1.5rem',
          color: 'white',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: '#d9c4a0', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Pedido #{pedido.numeroPedido}
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '0 0 0.75rem',
              color: 'white',
              lineHeight: 1.2
            }}
          >
            {info.label}
          </h1>
          <p style={{ color: '#e8d5b0', fontSize: '1rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {info.descricao}
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#b89470', margin: '0 0 0.25rem' }}>Cliente</p>
              <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, fontWeight: 500 }}>{pedido.cliente.nome}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#b89470', margin: '0 0 0.25rem' }}>Total</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--primaria)', margin: 0, fontWeight: 700 }}>{formatarMoeda(pedido.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracker de Status */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1c1208', margin: '0 0 2rem' }}>
          Acompanhamento
        </h2>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', position: 'relative' }}>
          {ordemEfetiva.map((st, idx) => {
            const isAtivo = idx === idxAtual
            const isConcluido = idx < idxAtual
            const stepInfo = statusInfo[st]

            return (
              <div
                key={st}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Linha conectora esquerda */}
                {idx > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 24,
                      right: '50%',
                      height: 3,
                      background: idx <= idxAtual ? '#2e7d32' : '#f0e4d0',
                      transition: 'background 0.5s ease',
                      zIndex: 0
                    }}
                  />
                )}
                {/* Linha conectora direita */}
                {idx < ordemEfetiva.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 24,
                      left: '50%',
                      height: 3,
                      background: idx < idxAtual ? '#2e7d32' : '#f0e4d0',
                      transition: 'background 0.5s ease',
                      zIndex: 0
                    }}
                  />
                )}

                {/* Ícone */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    background: idx <= idxAtual ? '#2e7d32' : 'white',
                    color: idx <= idxAtual ? 'white' : '#b89470',
                    border: idx <= idxAtual ? 'none' : '2px solid #f0e4d0',
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: !pedidoFinalizado && isAtivo ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {stepInfo.icon}
                </div>

                {/* Label */}
                <p
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: isAtivo ? 700 : 500,
                    color: idx <= idxAtual ? '#2e7d32' : '#888597',
                    textAlign: 'center',
                    margin: '0.75rem 0 0',
                    lineHeight: 1.3,
                    padding: '0 4px',
                    transition: 'color 0.5s ease',
                  }}
                >
                  {stepInfo.label}
                </p>
                {/* Horário */}
                {idx <= idxAtual && (
                  <p style={{ fontSize: '0.7rem', color: '#888597', margin: '0.25rem 0 0', textAlign: 'center' }}>
                    {st === 'recebido'
                      ? formatarTempo(pedido.criadoEm)
                      : (() => {
                          const h = pedido.historico?.find((h: any) => h.status === st)
                          return h ? formatarTempo(h.alteradoEm) : ''
                        })()}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {!pedidoFinalizado && (
          <div
            style={{
              background: '#fdfaf5',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ animation: 'pulse-dourado 1.5s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--primaria)' }} />
            <span style={{ fontSize: '0.85rem', color: '#9a7050', fontWeight: 500 }}>
              Atualizando automaticamente
            </span>
          </div>
        )}
      </div>

      {/* Contato Suporte (movido para logo abaixo do acompanhamento) */}
      <a
        href={`https://wa.me/55${whatsappLoja}?text=Olá! Estou acompanhando meu pedido %23${pedido.numeroPedido}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', marginBottom: '1.5rem' }}
      >
        <button
          id="btn-whatsapp-suporte"
          className="btn-elevate"
          style={{
            width: '100%',
            padding: '1.125rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#25D366',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.05rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <MessageCircle size={22} /> Falar com o Estabelecimento
        </button>
      </a>

      {/* Detalhes do Pedido */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setDetalhesAbertos(!detalhesAbertos)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fdfaf5',
            border: 'none',
            padding: '1.25rem 1.5rem',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#1c1208',
          }}
        >
          Detalhes do Pedido
          {detalhesAbertos ? <ChevronUp size={20} color="#1c1208" /> : <ChevronDown size={20} color="#1c1208" />}
        </button>

        {detalhesAbertos && (
          <div style={{ padding: '1.5rem', animation: 'fade-in 0.2s ease', borderTop: '1px solid #f0e4d0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1208', margin: '0 0 1.25rem' }}>Itens do Pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pedido.itens.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, paddingRight: '0.5rem' }}>
                    <span style={{ color: '#1c1208', fontSize: '0.95rem', fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                      {item.produto.nome}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#a09d96', fontWeight: 500, flexShrink: 0, marginTop: '2px' }}>
                      {item.quantidade}x
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#1c1208', fontSize: '0.95rem', flexShrink: 0, marginTop: '2px' }}>
                    {formatarMoeda(item.produto.preco * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed #d9c4a0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555260', fontSize: '0.9rem' }}>
                 <span>Subtotal</span>
                 <span>{formatarMoeda(pedido.subtotal)}</span>
               </div>
               {pedido.cliente.tipoEntrega === 'entrega' && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555260', fontSize: '0.9rem' }}>
                   <span>Taxa de Entrega</span>
                   <span>{formatarMoeda(pedido.taxaEntrega)}</span>
                 </div>
               )}
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: '#1c1208', marginTop: '0.5rem' }}>
                 <span>Total</span>
                 <span style={{ color: '#2e7d32' }}>{formatarMoeda(pedido.total)}</span>
               </div>
            </div>
          </div>
        )}
      </div>
      {patrocinadorRandom && (
        <div style={{ marginBottom: '1.5rem', animation: 'fade-in 0.4s ease' }}>
          <PatrocinadorCard patrocinador={patrocinadorRandom} />
        </div>
      )}

    </div>
  )
}
