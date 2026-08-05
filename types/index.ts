// =====================================================
// TIPOS CENTRAIS DO SISTEMA DE PADARIA DELIVERY
// =====================================================

export type CategoriaId = string

export interface Categoria {
  id: string
  nome: string
  ordem?: number
  ativo?: boolean
}

export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  categoriaId: string
  imagem: string | null
  destaque?: boolean
  esgotado?: boolean
  ativo?: boolean
}

// =====================================================
// CARRINHO
// =====================================================

export interface ItemCarrinho {
  produto: Produto
  quantidade: number
}

// =====================================================
// PEDIDO
// =====================================================

export type StatusPedido =
  | 'recebido'
  | 'preparando'
  | 'saiu_entrega'
  | 'entregue'
  | 'retirada_pronta'

export type TipoEntrega = 'entrega' | 'retirada'

export type FormaPagamento = 'pix' | 'cartao' | 'dinheiro'

export interface EnderecoEntrega {
  rua: string
  numero: string
  complemento?: string
  bairro: string
  referencia?: string
}

export interface DadosCliente {
  nome: string
  whatsapp: string
  tipoEntrega: TipoEntrega
  endereco_id?: string
  endereco?: EnderecoEntrega
  observacoes?: string
}

export interface HistoricoPedido {
  status: string
  alteradoEm: string
}

export interface Pedido {
  id: string
  numeroPedido: number
  cliente: DadosCliente
  itens: ItemCarrinho[]
  subtotal: number
  taxaEntrega: number
  total: number
  status: StatusPedido
  formaPagamento: FormaPagamento
  criadoEm: string
  observacoes?: string
  troco_para?: number | null
  historico: HistoricoPedido[]
}

// =====================================================
// AUTH DO CLIENTE
// =====================================================

export interface ClienteAuth {
  id: number
  nome: string
  whatsapp: string
  accessToken: string
  refreshToken?: string
}

// =====================================================
// DASHBOARD / ADMIN
// =====================================================

export interface KpiDashboard {
  titulo: string
  valor: string
  variacao: string
  positivo: boolean
  icone: string
}

export interface ColunasKanban {
  novos: Pedido[]
  preparando: Pedido[]
  concluido: Pedido[]
}

export interface ClienteResumo {
  id: string
  nome: string
  whatsapp: string
  totalPedidos: number
  totalGasto: number
  ultimoPedido: string
}
