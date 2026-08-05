'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'

interface AuthState {
  accessToken: string | null
  clienteId: number | null
  clienteNome: string | null
  clienteWhatsapp: string | null

  // Getters
  isLogado: () => boolean

  // Actions
  login: (whatsapp: string, cpf: string) => Promise<void>
  cadastrar: (nome: string, whatsapp: string, cpf: string) => Promise<void>
  logout: () => Promise<void>
  setToken: (token: string, id: number, nome: string, whatsapp: string) => void
  limpar: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      clienteId: null,
      clienteNome: null,
      clienteWhatsapp: null,

      isLogado: () => !!get().accessToken,

      setToken: (token, id, nome, whatsapp) =>
        set({ accessToken: token, clienteId: id, clienteNome: nome, clienteWhatsapp: whatsapp }),

      login: async (whatsapp, cpf) => {
        const data = await api.loginCliente(whatsapp, cpf)
        set({
          accessToken: data.access,
          clienteId: data.cliente_id ?? null,
          clienteNome: data.nome ?? null,
          clienteWhatsapp: whatsapp,
        })
      },

      cadastrar: async (nome, whatsapp, cpf) => {
        const data = await api.cadastrarCliente({ nome, whatsapp, cpf })
        set({
          accessToken: data.access,
          clienteId: data.cliente_id ?? null,
          clienteNome: nome,
          clienteWhatsapp: whatsapp,
        })
      },

      logout: async () => {
        try {
          await api.logoutCliente()
        } catch {
          // ignora erro no logout
        }
        get().limpar()
      },

      limpar: () =>
        set({
          accessToken: null,
          clienteId: null,
          clienteNome: null,
          clienteWhatsapp: null,
        }),
    }),
    {
      name: 'padaria-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        clienteId: state.clienteId,
        clienteNome: state.clienteNome,
        clienteWhatsapp: state.clienteWhatsapp,
      }),
    }
  )
)
