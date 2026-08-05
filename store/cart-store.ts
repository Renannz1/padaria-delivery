'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ItemCarrinho, Produto, DadosCliente, FormaPagamento } from '@/types'
import { api } from '@/lib/api'

interface CartState {
  itens: ItemCarrinho[]
  dadosCliente: DadosCliente | null
  formaPagamento: FormaPagamento | null
  trocoInfo: string
  ultimoPedidoId: string | null
  cartDrawerOpen: boolean

  // Getters computados
  totalItens: () => number
  subtotal: () => number
  taxaEntrega: (bairrosAtendidos: {nome: string, taxa_entrega: number, ativo: boolean}[]) => number
  total: (bairrosAtendidos: {nome: string, taxa_entrega: number, ativo: boolean}[]) => number

  // Actions
  adicionarItem: (produto: Produto) => void
  removerItem: (produtoId: string) => void
  diminuirQuantidade: (produtoId: string) => void
  limparCarrinho: () => void
  setDadosCliente: (dados: DadosCliente) => void
  setFormaPagamento: (forma: FormaPagamento, troco?: string) => void
  finalizarPedido: (token: string) => Promise<string>
  openCartDrawer: () => void
  closeCartDrawer: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      itens: [],
      dadosCliente: null,
      formaPagamento: null,
      trocoInfo: '',
      ultimoPedidoId: null,
      cartDrawerOpen: false,

      totalItens: () => get().itens.reduce((acc, item) => acc + item.quantidade, 0),

      subtotal: () =>
        get().itens.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0),

      taxaEntrega: (bairrosAtendidos) => {
        const dados = get().dadosCliente
        if (!dados || dados.tipoEntrega === 'retirada') return 0
        
        // Determina o bairro do cliente
        const bairroCliente = dados.endereco?.bairro || ''
        if (!bairroCliente) return 0

        const bairroEncontrado = bairrosAtendidos.find(
          b => b.nome.toLowerCase() === bairroCliente.toLowerCase() && b.ativo
        )

        return bairroEncontrado ? Number(bairroEncontrado.taxa_entrega) : 0
      },

      total: (bairrosAtendidos) => get().subtotal() + get().taxaEntrega(bairrosAtendidos),

      adicionarItem: (produto: Produto) => {
        set((state) => {
          const itemExistente = state.itens.find((i) => i.produto.id === produto.id)
          if (itemExistente) {
            return {
              itens: state.itens.map((i) =>
                i.produto.id === produto.id
                  ? { ...i, quantidade: i.quantidade + 1 }
                  : i
              ),
            }
          }
          return {
            itens: [...state.itens, { produto, quantidade: 1 }],
          }
        })
      },

      removerItem: (produtoId: string) => {
        set((state) => ({
          itens: state.itens.filter((i) => i.produto.id !== produtoId),
        }))
      },

      diminuirQuantidade: (produtoId: string) => {
        set((state) => {
          const item = state.itens.find((i) => i.produto.id === produtoId)
          if (!item) return state
          if (item.quantidade <= 1) {
            return { itens: state.itens.filter((i) => i.produto.id !== produtoId) }
          }
          return {
            itens: state.itens.map((i) =>
              i.produto.id === produtoId
                ? { ...i, quantidade: i.quantidade - 1 }
                : i
            ),
          }
        })
      },

      limparCarrinho: () => set({ itens: [], dadosCliente: null }),

      setDadosCliente: (dados: DadosCliente) => set({ dadosCliente: dados }),

      setFormaPagamento: (forma: FormaPagamento, troco?: string) =>
        set({ formaPagamento: forma, trocoInfo: troco ?? '' }),

      finalizarPedido: async (token: string) => {
        const state = get()
        const dados = state.dadosCliente!

        const payload: any = {
          itens: state.itens.map((item) => ({
            produto_id: item.produto.id,
            quantidade: item.quantidade,
          })),
          tipo_entrega: dados.tipoEntrega,
          forma_pagamento: state.formaPagamento,
          observacoes: dados.observacoes ?? '',
          troco_para: state.formaPagamento === 'dinheiro'
            ? (parseFloat(state.trocoInfo.replace(/[^\d,]/g, '').replace(',', '.')) || null)
            : null,
        }

        if (dados.tipoEntrega === 'entrega') {
          if (dados.endereco_id) {
            payload.endereco_id = dados.endereco_id
          } else if (dados.endereco) {
            payload.endereco = {
              rua: dados.endereco.rua,
              numero: dados.endereco.numero,
              complemento: dados.endereco.complemento ?? '',
              bairro: dados.endereco.bairro,
              referencia: dados.endereco.referencia ?? '',
            }
          }
        }

        const pedido = await api.criarPedido(payload, token)
        const numeroPedido = pedido.numeroPedido ?? pedido.id
        set({
          ultimoPedidoId: pedido.id,
          itens: [],
          dadosCliente: null,
          formaPagamento: null,
          trocoInfo: '',
          cartDrawerOpen: false,
        })
        return String(numeroPedido)
      },

      openCartDrawer: () => set({ cartDrawerOpen: true }),
      closeCartDrawer: () => set({ cartDrawerOpen: false }),
    }),
    {
      name: 'padaria-cart-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        itens: state.itens,
        dadosCliente: state.dadosCliente,
        formaPagamento: state.formaPagamento,
        trocoInfo: state.trocoInfo,
      }),
    }
  )
)
