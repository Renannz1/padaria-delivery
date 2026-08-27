'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'

interface AuthState {
  accessToken: string | null
  clienteId: string | number | null
  clienteNome: string | null
  clienteWhatsapp: string | null

  // Getters
  isLogado: () => boolean

  // Actions OTP
  solicitarOtp: (telefone: string) => Promise<any>
  verificarOtp: (telefone: string, codigo: string) => Promise<{ isNewUser: boolean; telefone?: string }>
  completarCadastro: (telefone: string, nome: string) => Promise<void>

  // Actions Legado / Auxiliares
  login: (whatsapp: string) => Promise<void>
  cadastrar: (nome: string, whatsapp: string) => Promise<void>
  logout: () => Promise<void>
  setToken: (token: string, id: string | number, nome: string, whatsapp: string) => void
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

      solicitarOtp: async (telefone: string) => {
        return await api.solicitarOtp(telefone)
      },

      verificarOtp: async (telefone: string, codigo: string) => {
        const data = await api.verificarOtp(telefone, codigo)
        if (data.is_new_user) {
          return { isNewUser: true, telefone: data.telefone || telefone }
        }

        set({
          accessToken: data.access,
          clienteId: data.cliente?.id || data.cliente_id || null,
          clienteNome: data.cliente?.nome || data.nome || null,
          clienteWhatsapp: data.cliente?.whatsapp || telefone,
        })

        return { isNewUser: false }
      },

      completarCadastro: async (telefone: string, nome: string) => {
        const data = await api.completarCadastro(telefone, nome)
        set({
          accessToken: data.access,
          clienteId: data.cliente?.id || data.cliente_id || null,
          clienteNome: data.cliente?.nome || data.nome || nome,
          clienteWhatsapp: data.cliente?.whatsapp || telefone,
        })
      },

      login: async (whatsapp) => {
        const data = await api.loginCliente(whatsapp)
        set({
          accessToken: data.access,
          clienteId: data.cliente_id ?? null,
          clienteNome: data.nome ?? null,
          clienteWhatsapp: whatsapp,
        })
      },

      cadastrar: async (nome, whatsapp) => {
        const data = await api.cadastrarCliente({ nome, whatsapp })
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
