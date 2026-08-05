'use client'

import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { Pedido } from '@/types'
import { useConfigStore } from '@/store/config-store'

type ColunasStatus = 'recebido' | 'preparando' | 'pronto' | 'entregue'

const colunaLabel: Record<ColunasStatus, string> = {
  recebido: 'Novos',
  preparando: 'Preparando',
  pronto: 'Pronto / Em Rota',
  entregue: 'Concluídos',
}

const mensagemWhatsApp: Record<ColunasStatus, string> = {
  recebido: 'recebemos seu pedido e já estamos analisando!',
  preparando: 'seu pedido está sendo preparado com carinho! 🍞',
  pronto: 'seu pedido está pronto! 🚀',
  entregue: 'seu pedido foi concluído! Bom apetite! 🎉',
}

interface ModalConfirmacaoMoverProps {
  pedido: Pedido
  novoStatus: ColunasStatus
  onConfirmar: (enviarWhatsapp: boolean) => void
  onCancelar: () => void
}

export default function ModalConfirmacaoMover({
  pedido,
  novoStatus,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoMoverProps) {
  const [enviarWhats, setEnviarWhats] = useState(true)
  const whatsapp = useConfigStore((s) => s.whatsappContato)
  const nomeLoja = useConfigStore((s) => s.nomeEstabelecimento)
  const evolutionAtivo = useConfigStore((s) => s.evolutionAtivo)

  function confirmar() {
    onConfirmar(novoStatus === 'entregue' ? false : enviarWhats)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(28,18,8,0.6)',
        backdropFilter: 'blur(4px)',
        animation: 'modal-backdrop-fade 0.2s ease',
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: 420,
          border: '1px solid var(--borda)',
          animation: 'modal-content-show 0.25s ease',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.125rem 1.25rem',
            borderBottom: '1px solid var(--borda)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primario)',
            }}
          >
            Mover pedido
          </h3>
          <button
            onClick={onCancelar}
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

        {/* Body */}
        <div style={{ padding: '1.25rem' }}>
          {/* Info do pedido */}
          <div
            style={{
              background: '#fdfaf5',
              border: '1px solid #f0e4d0',
              borderRadius: '0.875rem',
              padding: '0.875rem 1rem',
              marginBottom: '1.25rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-terciario)' }}>
              Pedido
            </p>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 700, color: 'var(--text-primario)' }}>
              #{pedido.numeroPedido} — {pedido.cliente.nome}
            </p>
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.825rem', color: 'var(--text-secundario)' }}>
              Mover para:{' '}
              <strong style={{ color: 'var(--primaria)' }}>{colunaLabel[novoStatus]}</strong>
            </p>
          </div>

          {/* Checkbox WhatsApp */}
          {novoStatus !== 'entregue' && (
            <label
              htmlFor="check-whatsapp"
              style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.875rem',
              borderRadius: '0.75rem',
              border: `1.5px solid ${enviarWhats ? '#25D366' : 'var(--borda)'}`,
              background: enviarWhats ? 'rgba(37, 211, 102, 0.05)' : 'white',
              transition: 'all 0.2s ease',
              marginBottom: '1.25rem',
            }}
          >
            <input
              id="check-whatsapp"
              type="checkbox"
              checked={enviarWhats}
              onChange={(e) => setEnviarWhats(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#25D366', marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: enviarWhats ? '#1a7a3a' : 'var(--text-primario)',
                }}
              >
                <MessageCircle size={16} color={enviarWhats ? '#25D366' : 'var(--text-terciario)'} />
                Notificar cliente via WhatsApp
              </div>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.775rem',
                  color: 'var(--text-terciario)',
                  lineHeight: 1.4,
                }}
              >
                {evolutionAtivo ? (
                  <>
                    Enviará uma mensagem <strong>automática e silenciosa</strong> para{' '}
                    <strong>{pedido.cliente.whatsapp}</strong>
                  </>
                ) : (
                  <>
                    Abrirá o WhatsApp Web com uma mensagem para{' '}
                    <strong>{pedido.cliente.whatsapp}</strong>
                  </>
                )}
              </p>
            </div>
          </label>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onCancelar}
              className="btn-secundario"
              style={{ flex: 1, fontSize: '0.875rem', minHeight: 42 }}
            >
              Cancelar
            </button>
            <button
              id={`btn-confirmar-mover-${pedido.id}`}
              onClick={confirmar}
              className="btn-primario"
              style={{ flex: 1, fontSize: '0.875rem', minHeight: 42 }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
