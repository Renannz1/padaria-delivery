'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'

export interface HorarioDia {
  abertura: string  // 'HH:MM'
  fechamento: string
  aberto: boolean
}

export interface BairroAtendido {
  id?: string
  cidade: string
  nome: string
  taxa_entrega: number
  ativo: boolean
}

export interface ConfigState {
  nomeEstabelecimento: string
  pedidoMinimo: number
  chavePix: string
  nomeRecebedor: string
  enderecoLoja: string
  whatsappContato: string
  modoAutomatico: boolean
  lojaAbertaManual: boolean

  // Integração Evolution API
  evolutionAtivo: boolean
  evolutionUrl: string
  evolutionApikey: string
  evolutionInstancia: string
  evolutionSaudacaoAtiva: boolean
  evolutionMsgSaudacao: string
  evolutionMsgSaudacaoFechado: string
  evolutionCooldownSaudacaoHoras: number
  msgRecebido: string
  msgPreparando: string
  msgSaiuEntrega: string
  msgRetiradaPronta: string
  msgEntregue: string

  // Horários e locais
  horariosSemana: Record<number, HorarioDia>
  bairrosAtendidos: BairroAtendido[]
  carregando: boolean
  isInfoModalOpen: boolean

  // Computed
  horarioFuncionamento: () => string
  estaAberto: () => boolean

  // Actions
  carregarConfig: () => Promise<void>
  carregarConfigAdmin: () => Promise<void>
  atualizarConfig: (partial: Partial<Omit<ConfigState, 'horarioFuncionamento' | 'estaAberto' | 'atualizarConfig' | 'carregarConfig' | 'carregarConfigAdmin' | 'openInfoModal' | 'closeInfoModal'>>) => void
  openInfoModal: () => void
  closeInfoModal: () => void
}

function parsarHora(str: string): { h: number; m: number } {
  const [h, m] = str.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

function totalMinutos(str: string): number {
  const { h, m } = parsarHora(str)
  return h * 60 + m
}

const horariosPadrao: Record<number, HorarioDia> = {
  0: { abertura: '07:00', fechamento: '14:00', aberto: true },
  1: { abertura: '06:00', fechamento: '20:00', aberto: true },
  2: { abertura: '06:00', fechamento: '20:00', aberto: true },
  3: { abertura: '06:00', fechamento: '20:00', aberto: true },
  4: { abertura: '06:00', fechamento: '20:00', aberto: true },
  5: { abertura: '06:00', fechamento: '20:00', aberto: true },
  6: { abertura: '06:00', fechamento: '20:00', aberto: true },
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      nomeEstabelecimento: 'Padaria',
      pedidoMinimo: 15.0,
      chavePix: '',
      nomeRecebedor: '',
      enderecoLoja: '',
      whatsappContato: '',
      modoAutomatico: true,
      lojaAbertaManual: true,

      evolutionAtivo: true,
      evolutionUrl: '',
      evolutionApikey: '',
      evolutionInstancia: '',
      evolutionSaudacaoAtiva: false,
      evolutionMsgSaudacao: 'Olá! Somos a Panificadora Costa. Faça seu pedido online no nosso site: {{link_site}}',
      evolutionMsgSaudacaoFechado: 'Olá! Somos a Panificadora Costa. No momento estamos fechados, mas você pode conferir nosso cardápio no site: {{link_site}}',
      evolutionCooldownSaudacaoHoras: 48,
      msgRecebido: 'recebemos seu pedido e já estamos analisando!',
      msgPreparando: 'seu pedido está sendo preparado com carinho! 🍞',
      msgSaiuEntrega: 'seu pedido está pronto e saiu para entrega! 🚀',
      msgRetiradaPronta: 'seu pedido está pronto e aguardando retirada! 🚀',
      msgEntregue: 'seu pedido foi concluído! Bom apetite! 🎉',

      horariosSemana: horariosPadrao,
      bairrosAtendidos: [],
      carregando: false,
      isInfoModalOpen: false,

      openInfoModal: () => set({ isInfoModalOpen: true }),
      closeInfoModal: () => set({ isInfoModalOpen: false }),

      horarioFuncionamento: () => {
        const { horariosSemana } = get()
        const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        const segASabIguais = [1, 2, 3, 4, 5, 6].every(d =>
          horariosSemana[d]?.aberto === horariosSemana[1]?.aberto &&
          horariosSemana[d]?.abertura === horariosSemana[1]?.abertura &&
          horariosSemana[d]?.fechamento === horariosSemana[1]?.fechamento
        )

        if (segASabIguais) {
          const segSab = horariosSemana[1]?.aberto
            ? `Seg-Sáb: ${horariosSemana[1].abertura}h às ${horariosSemana[1].fechamento}h`
            : 'Seg-Sáb: Fechado'
          const dom = horariosSemana[0]?.aberto
            ? `Dom: ${horariosSemana[0].abertura}h às ${horariosSemana[0].fechamento}h`
            : 'Dom: Fechado'
          return `${segSab} | ${dom}`
        }

        const abertos = Object.entries(horariosSemana)
          .filter(([_, h]) => h.aberto)
          .map(([d, h]) => `${nomesDias[Number(d)]}: ${h.abertura}h-${h.fechamento}h`)

        if (abertos.length === 0) return 'Fechado todos os dias'
        return abertos.slice(0, 3).join(' | ') + (abertos.length > 3 ? '...' : '')
      },

      estaAberto: () => {
        const { modoAutomatico, lojaAbertaManual, horariosSemana } = get()

        if (!modoAutomatico) {
          return lojaAbertaManual
        }

        const agora = new Date()
        const diaSemana = agora.getDay()
        const minAtual = agora.getHours() * 60 + agora.getMinutes()

        const horario = horariosSemana[diaSemana]
        if (!horario || !horario.aberto) return false

        return (
          minAtual >= totalMinutos(horario.abertura) &&
          minAtual < totalMinutos(horario.fechamento)
        )
      },

      carregarConfig: async () => {
        set({ carregando: true })
        try {
          const data = await api.getConfig()

          const novosHorarios = { ...get().horariosSemana }
          if (data.horarios && Array.isArray(data.horarios)) {
            data.horarios.forEach((h: any) => {
              novosHorarios[h.dia_semana] = {
                abertura: h.abertura.substring(0, 5),
                fechamento: h.fechamento.substring(0, 5),
                aberto: h.aberto,
              }
            })
          }

          set({
            nomeEstabelecimento: data.nome_estabelecimento ?? data.nome ?? '',
            pedidoMinimo: data.pedido_minimo !== undefined ? parseFloat(data.pedido_minimo) : 0,
            chavePix: data.chave_pix ?? '',
            nomeRecebedor: data.nome_recebedor_pix ?? '',
            enderecoLoja: data.endereco ?? '',
            whatsappContato: data.whatsapp_contato ?? '',
            modoAutomatico: data.modo_automatico ?? true,
            lojaAbertaManual: data.loja_aberta_manual ?? true,
            
            // Os dados da Evolution API NÃO vêm na rota pública
            // Portanto, não sobrescrevemos eles aqui com default

            horariosSemana: novosHorarios,
            bairrosAtendidos: data.bairros_atendidos ?? [],
            carregando: false,
          })
        } catch {
          // Se der erro de rede, mantém o cache
          set({ carregando: false })
        }
      },

      carregarConfigAdmin: async () => {
        set({ carregando: true })
        try {
          const data = await api.getConfigAdmin()

          const novosHorarios = { ...get().horariosSemana }
          if (data.horarios && Array.isArray(data.horarios)) {
            data.horarios.forEach((h: any) => {
              novosHorarios[h.dia_semana] = {
                abertura: h.abertura.substring(0, 5),
                fechamento: h.fechamento.substring(0, 5),
                aberto: h.aberto,
              }
            })
          }

          set({
            nomeEstabelecimento: data.nome_estabelecimento ?? data.nome ?? '',
            pedidoMinimo: data.pedido_minimo !== undefined ? parseFloat(data.pedido_minimo) : 0,
            chavePix: data.chave_pix ?? '',
            nomeRecebedor: data.nome_recebedor_pix ?? '',
            enderecoLoja: data.endereco ?? '',
            whatsappContato: data.whatsapp_contato ?? '',
            modoAutomatico: data.modo_automatico ?? true,
            lojaAbertaManual: data.loja_aberta_manual ?? true,
            
            evolutionAtivo: data.evolution_ativo ?? true,
            evolutionUrl: data.evolution_url ?? '',
            evolutionApikey: data.evolution_apikey ?? '',
            evolutionInstancia: data.evolution_instancia ?? '',
            evolutionSaudacaoAtiva: data.evolution_saudacao_ativa ?? false,
            evolutionMsgSaudacao: data.evolution_msg_saudacao ?? 'Olá! Somos a Panificadora Costa. Faça seu pedido online no nosso site: {{link_site}}',
            evolutionCooldownSaudacaoHoras: data.evolution_cooldown_saudacao_horas ?? 48,
            msgRecebido: data.msg_recebido ?? 'recebemos seu pedido e já estamos analisando!',
            msgPreparando: data.msg_preparando ?? 'seu pedido está sendo preparado com carinho! 🍞',
            msgSaiuEntrega: data.msg_saiu_entrega ?? 'seu pedido está pronto e saiu para entrega! 🚀',
            msgRetiradaPronta: data.msg_retirada_pronta ?? 'seu pedido está pronto e aguardando retirada! 🚀',
            msgEntregue: data.msg_entregue ?? 'seu pedido foi concluído! Bom apetite! 🎉',

            horariosSemana: novosHorarios,
            bairrosAtendidos: data.bairros_atendidos ?? [],
            carregando: false,
          })
        } catch {
          set({ carregando: false })
        }
      },

      atualizarConfig: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    {
      name: 'padaria-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nomeEstabelecimento: state.nomeEstabelecimento,
        pedidoMinimo: state.pedidoMinimo,
        chavePix: state.chavePix,
        nomeRecebedor: state.nomeRecebedor,
        enderecoLoja: state.enderecoLoja,
        whatsappContato: state.whatsappContato,
        modoAutomatico: state.modoAutomatico,
        lojaAbertaManual: state.lojaAbertaManual,
        
        evolutionAtivo: state.evolutionAtivo,
        evolutionUrl: state.evolutionUrl,
        evolutionApikey: state.evolutionApikey,
        evolutionInstancia: state.evolutionInstancia,
        evolutionSaudacaoAtiva: state.evolutionSaudacaoAtiva,
        evolutionMsgSaudacao: state.evolutionMsgSaudacao,
        evolutionMsgSaudacaoFechado: state.evolutionMsgSaudacaoFechado,
        evolutionCooldownSaudacaoHoras: state.evolutionCooldownSaudacaoHoras,
        msgRecebido: state.msgRecebido,
        msgPreparando: state.msgPreparando,
        msgSaiuEntrega: state.msgSaiuEntrega,
        msgRetiradaPronta: state.msgRetiradaPronta,
        msgEntregue: state.msgEntregue,

        horariosSemana: state.horariosSemana,
        bairrosAtendidos: state.bairrosAtendidos,
      }),
    }
  )
)
