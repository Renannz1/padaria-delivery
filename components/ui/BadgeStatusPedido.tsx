import { Clock, CheckCircle, Package, X } from 'lucide-react'

export type StatusPedido = 'recebido' | 'preparando' | 'saiu_entrega' | 'entregue' | 'retirada_pronta' | 'cancelado'

export const CONFIGURACAO_STATUS: Record<StatusPedido, { rotulo: string; corTexto: string; corFundo: string; icone: React.ReactNode }> = {
  recebido: { rotulo: 'Novo', corTexto: '#c05e00', corFundo: '#fff4e5', icone: <Package size={14} /> },
  preparando: { rotulo: 'Preparando', corTexto: '#1a56db', corFundo: '#e8f0fe', icone: <Clock size={14} /> },
  saiu_entrega: { rotulo: 'Saiu p/ Entrega', corTexto: '#6d28d9', corFundo: '#ede9fe', icone: <Clock size={14} /> },
  entregue: { rotulo: 'Entregue', corTexto: '#1e7e34', corFundo: '#e6f4ea', icone: <CheckCircle size={14} /> },
  retirada_pronta: { rotulo: 'Pronto p/ Retirada', corTexto: '#f57c00', corFundo: '#fff3e0', icone: <CheckCircle size={14} /> },
  cancelado: { rotulo: 'Cancelado', corTexto: '#c62828', corFundo: '#fdecea', icone: <X size={14} /> }
}

interface PropriedadesBadge {
  status: string
}

export function BadgeStatusPedido({ status }: PropriedadesBadge) {
  const statusValido = (Object.keys(CONFIGURACAO_STATUS).includes(status) ? status : 'recebido') as StatusPedido
  const config = CONFIGURACAO_STATUS[statusValido]

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      background: config.corFundo,
      padding: '0.25rem 0.5rem',
      borderRadius: '999px',
    }}>
      <span style={{ color: config.corTexto, display: 'flex' }}>{config.icone}</span>
      <span style={{ color: config.corTexto, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
        {config.rotulo}
      </span>
    </div>
  )
}
