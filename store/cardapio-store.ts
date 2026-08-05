'use client'

import { create } from 'zustand'
import { Produto, Categoria } from '@/types'
import { api } from '@/lib/api'

interface CardapioState {
  produtos: Produto[]
  categorias: Categoria[]
  carregando: boolean
  erro: string | null

  carregarCardapio: () => Promise<void>
}

export const useCardapioStore = create<CardapioState>()((set) => ({
  produtos: [],
  categorias: [],
  carregando: false,
  erro: null,

  carregarCardapio: async () => {
    set({ carregando: true, erro: null })
    try {
      const [categorias, produtos] = await Promise.all([
        api.getCategorias(),
        api.getProdutos(),
      ])
      set({ categorias, produtos, carregando: false })
    } catch (e: any) {
      console.error('Erro ao carregar cardápio:', e)
      set({ erro: 'Não foi possível carregar o cardápio.', carregando: false })
    }
  },
}))
