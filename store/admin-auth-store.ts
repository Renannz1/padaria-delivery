'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'

interface AdminAuthState {
  accessToken: string | null
  adminUsername: string | null

  // Getters
  isLogado: () => boolean

  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      adminUsername: null,

      isLogado: () => !!get().accessToken,

      login: async (username, password) => {
        const data = await api.loginAdmin(username, password)
        set({
          accessToken: data.access,
          adminUsername: username,
        })
      },

      logout: () => {
        set({ accessToken: null, adminUsername: null })
      },
    }),
    {
      name: 'padaria-admin-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        adminUsername: state.adminUsername,
      }),
    }
  )
)
