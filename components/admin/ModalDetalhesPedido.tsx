'use client'

import { X, MapPin, Phone, Bike, Store, Receipt, Clock, MessageCircle, ChevronRight, Package, History, User, ClipboardList } from 'lucide-react'
import { Pedido } from '@/types'
import { formatarMoeda } from '@/lib/utils'

import { CONFIGURACAO_STATUS, StatusPedido } from '@/components/ui/BadgeStatusPedido'

type ColunasStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue'

const formaPagamentoLabel: Record<string, string> = {
  pix:     'Pix',
  cartao:  'Cartão',
  dinheiro:'Dinheiro',
}

const proximoStatusMap: Partial<Record<string, ColunasStatus>> = {
  recebido:  'preparando',
  preparando:'pronto',
  saiu_entrega: 'entregue',
  retirada_pronta: 'entregue',
}

const proximoLabel: Partial<Record<string, string>> = {
  recebido:  'Iniciar Preparo',
  preparando:'Marcar como Pronto',
  saiu_entrega: 'Marcar como Entregue',
  retirada_pronta: 'Marcar como Entregue',
}

interface Propriedades {
  pedido: Pedido
  aoFechar: () => void
  aoMover: (id: string, novoStatus: ColunasStatus) => void
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.775rem', color: 'var(--text-terciario)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primario)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p style={{
      margin: '0 0 0.5rem',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: 'var(--text-terciario)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
    }}>
      {icon}
      {children}
    </p>
  )
}

export default function ModalDetalhesPedido({ pedido, aoFechar, aoMover }: Propriedades) {
  const proximoStatus = proximoStatusMap[pedido.status]
  const temProximo = !!proximoStatus

  function abrirWhatsApp() {
    const numero = pedido.cliente.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/55${numero}`, '_blank')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28,18,8,0.6)',
        backdropFilter: 'blur(4px)',
        animation: 'modal-backdrop-fade 0.2s ease',
      }}
      onClick={aoFechar}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--borda)',
          overflow: 'hidden', // Evita que o scroll quebre os cantos arredondados
          animation: 'modal-content-show 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.125rem 1.25rem',
            borderBottom: '1px solid var(--borda)',
            flexShrink: 0,
            background: 'white',
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primario)' }}>
            Pedido #{pedido.numeroPedido}
          </h3>
          <button
            onClick={aoFechar}
            className="btn-fechar-hover"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-terciario)',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ 
          padding: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          overflowY: 'auto', // Scroll apenas no corpo do modal
          flex: 1 
        }}>

          {/* Dados do cliente */}
          <section
            style={{
              background: '#fdfaf5',
              border: '1px solid #f0e4d0',
              borderRadius: '0.875rem',
              padding: '0.875rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-terciario)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={12} /> Dados do cliente
              </p>
              {/* Botão WhatsApp — abre o chat sem mensagem montada */}
              <button
                onClick={abrirWhatsApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(37,211,102,0.1)',
                  border: '1.5px solid rgba(37,211,102,0.4)',
                  borderRadius: '0.5rem',
                  padding: '0.25rem 0.625rem',
                  color: '#1a7a3a',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <MessageCircle size={12} color="#25D366" />
                WhatsApp
              </button>
            </div>

            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-primario)' }}>
              {pedido.cliente.nome}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-secundario)' }}>
              <Phone size={13} color="var(--primaria)" />
              {pedido.cliente.whatsapp}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-secundario)' }}>
              {pedido.cliente.tipoEntrega === 'entrega' ? (
                <><Bike size={13} color="var(--primaria)" /><span>Delivery</span></>
              ) : (
                <><Store size={13} color="var(--primaria)" /><span>Retirada na loja</span></>
              )}
            </div>
            {pedido.cliente.tipoEntrega === 'entrega' && pedido.cliente.endereco && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-secundario)', marginTop: '0.125rem' }}>
                <MapPin size={13} color="var(--primaria)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  {pedido.cliente.endereco.rua}, {pedido.cliente.endereco.numero}
                  {pedido.cliente.endereco.complemento ? ` — ${pedido.cliente.endereco.complemento}` : ''},{' '}
                  {pedido.cliente.endereco.bairro}
                  {pedido.cliente.endereco.referencia && (
                    <> · <em style={{ color: 'var(--text-terciario)' }}>{pedido.cliente.endereco.referencia}</em></>
                  )}
                </span>
              </div>
            )}
          </section>

          {/* Itens do pedido */}
          <section style={{ border: '1px solid var(--borda)', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <SectionLabel icon={<Package size={12} />}>Itens</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pedido.itens.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: idx < pedido.itens.length - 1 ? '0.625rem' : 0,
                    borderBottom: idx < pedido.itens.length - 1 ? '1px solid var(--borda)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span
                      style={{
                        background: '#b89470',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.375rem',
                      }}
                    >
                      {item.quantidade}x
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primario)', fontWeight: 500 }}>
                      {item.produto.nome}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primario)',
                    }}
                  >
                    {formatarMoeda(item.produto.preco * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Observações */}
          {pedido.observacoes && (
            <section
              style={{
                background: '#fffbea',
                border: '1px solid #f0e060',
                borderRadius: '0.875rem',
                padding: '0.875rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: '#6b5800',
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ClipboardList size={12} /> Observações
              </p>
              <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.82rem' }}>{pedido.observacoes}</p>
            </section>
          )}

          {/* Resumo financeiro */}
          <section style={{ border: '1px solid var(--borda)', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <SectionLabel icon={<Receipt size={12} />}>Resumo financeiro</SectionLabel>
            <InfoRow label="Subtotal" value={formatarMoeda(pedido.subtotal)} />
            <InfoRow label="Taxa de entrega" value={pedido.taxaEntrega > 0 ? formatarMoeda(pedido.taxaEntrega) : 'Grátis'} />
            <InfoRow label="Pagamento" value={formaPagamentoLabel[pedido.formaPagamento] ?? pedido.formaPagamento} />
            {pedido.formaPagamento === 'dinheiro' && pedido.troco_para && (
              <InfoRow label="Troco para" value={formatarMoeda(pedido.troco_para)} />
            )}
            <div style={{ borderTop: '1px solid var(--borda)', marginTop: '0.25rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primario)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primaria)' }}>{formatarMoeda(pedido.total)}</span>
            </div>
          </section>

          {/* Histórico de status */}
          {pedido.historico && pedido.historico.length > 0 && (
            <section style={{ border: '1px solid var(--borda)', borderRadius: '0.875rem', padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <SectionLabel icon={<History size={12} />}>Histórico</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {pedido.historico.map((h, idx) => {
                  const config = CONFIGURACAO_STATUS[h.status as StatusPedido] || CONFIGURACAO_STATUS.recebido
                  const label = config.rotulo
                  const data = new Date(h.alteradoEm)
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.825rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primario)' }}>
                        {label}
                      </span>
                      <span style={{ color: 'var(--text-terciario)' }}>
                        {data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}


          {/* Botão mover status */}
          {temProximo && proximoStatus && (
            <button
              id={`btn-mover-modal-${pedido.id}`}
              onClick={() => {
                aoMover(pedido.id, proximoStatus)
                aoFechar()
              }}
              className="btn-primario"
              style={{ width: '100%', fontSize: '0.9rem', minHeight: 44 }}
            >
              {proximoLabel[pedido.status]} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
