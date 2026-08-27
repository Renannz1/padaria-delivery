'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart-store'
import { formatarWhatsapp } from '@/lib/utils'
import { DadosCliente } from '@/types'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import VoltarLink from '@/components/cliente/VoltarLink'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'

export default function PerfilPage() {
  const router = useRouter()
  const dadosCliente = useCartStore((s) => s.dadosCliente)
  const setDadosCliente = useCartStore((s) => s.setDadosCliente)
  const setToken = useAuthStore((s) => s.setToken)

  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  const [mostrarToast, setMostrarToast] = useState(false)
  const [estaMontado, setEstaMontado] = useState(false)
  const estaLogado = useAuthStore((s) => s.isLogado())

  // Carrega os dados do perfil na montagem do componente
  useEffect(() => {
    setEstaMontado(true)

    // Proteção de rota: redireciona para home se não estiver autenticado
    if (!estaLogado) {
      router.push('/')
      return
    }

    async function fetchData() {
      try {
        const perfil = await api.getPerfilCliente()
        setNome(perfil.nome || '')
        setWhatsapp(formatarWhatsapp(perfil.whatsapp || ''))
      } catch (e) {
        console.error('Erro ao carregar dados do perfil:', e)
      }
    }

    fetchData()
  }, [estaLogado, router])

  function validar(): boolean {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Informe seu nome completo'
    if (whatsapp.replace(/\D/g, '').length < 10) errs.whatsapp = 'WhatsApp inválido'

    setErros(errs)
    return Object.keys(errs).length === 0
  }

  async function lidarComSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return

    try {
      if (estaLogado) {
        const dados = {
          nome: nome.trim(),
          whatsapp: whatsapp.replace(/\D/g, ''),
        }
        await api.atualizarPerfilCliente(dados)

        // Atualiza os dados locais do Zustand Auth Store
        const currentState = useAuthStore.getState()
        if (currentState.accessToken) {
          setToken(currentState.accessToken, currentState.clienteId as number, nome.trim(), whatsapp.replace(/\D/g, ''))
        }
      }

      // Atualiza também o store do carrinho
      const novosDados: DadosCliente = {
        ...dadosCliente,
        nome: nome.trim(),
        whatsapp: whatsapp.replace(/\D/g, ''),
        tipoEntrega: dadosCliente?.tipoEntrega || 'entrega',
      }
      setDadosCliente(novosDados)

      setMostrarToast(true)
      setTimeout(() => setMostrarToast(false), 3000)
    } catch (e) {
      console.error('Erro ao salvar perfil:', e)
      setErros({ form: 'Ocorreu um erro ao salvar o perfil. Tente novamente.' })
    }
  }

  if (!estaMontado) return null

  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '1rem',
    padding: '1.25rem',
    border: '1px solid var(--borda)',
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ margin: '0 auto', padding: '1.25rem 1rem 7rem', maxWidth: 768, position: 'relative', animation: 'fade-in 0.3s ease' }}>

        {/* Toast de Confirmação */}
        {mostrarToast && (
          <div className="toast-cliente">
            <CheckCircle size={18} />
            <span>Perfil atualizado com sucesso!</span>
          </div>
        )}

        <VoltarLink />

        <h1
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'var(--text-primario)',
            margin: '0 0 0.25rem',
          }}
        >
          Minha Conta
        </h1>
        <p style={{ color: 'var(--text-secundario)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Gerencie suas informações pessoais.
        </p>

        {erros.form && (
          <div style={{ padding: '0.75rem 1rem', background: '#ffebee', color: 'var(--color-vermelho-erro)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            {erros.form}
          </div>
        )}

        <form onSubmit={lidarComSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ─── DADOS PESSOAIS ─── */}
          <section style={cardStyle}>
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primario)',
                margin: '0 0 1rem',
              }}
            >
              Seus Dados
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                  Nome completo *
                </label>
                <input
                  id="perfil-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="input-campo"
                  style={{ borderColor: erros.nome ? 'var(--color-vermelho-erro)' : undefined, background: 'var(--bg-card)' }}
                />
                {erros.nome && (
                  <p style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {erros.nome}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secundario)', marginBottom: '0.375rem' }}>
                  WhatsApp *
                </label>
                <input
                  id="perfil-whatsapp"
                  type="tel"
                  value={whatsapp}
                  disabled
                  placeholder="Ex: (11) 99999-9999"
                  className="input-campo"
                  style={{ borderColor: erros.whatsapp ? 'var(--color-vermelho-erro)' : undefined, background: 'var(--bg-principal)', color: 'var(--text-terciario)', cursor: 'not-allowed' }}
                />
                {erros.whatsapp && (
                  <p style={{ color: 'var(--color-vermelho-erro)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {erros.whatsapp}
                  </p>
                )}
              </div>
            </div>
          </section>

          <button
            id="btn-salvar-perfil"
            type="submit"
            className="btn-primario"
            style={{
              width: '100%',
              fontSize: '0.95rem',
              padding: '0.875rem 1rem',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Save size={18} /> Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  )
}

